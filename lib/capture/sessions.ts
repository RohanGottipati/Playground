import { createHash, randomBytes, randomUUID } from "crypto";
import { AppError } from "@/lib/errors/AppError";
import type { SourceUploadResult } from "@/lib/storage/sourceUpload";
import { captureSessionStore, type CaptureSessionRecord } from "./store";

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const SESSION_TTL_MS = 10 * 60_000;
const STALE_UPLOAD_MS = 2 * 60_000;
const RETENTION_MS = 24 * 60 * 60_000;

export type NewCaptureSession = {
  captureToken: string;
  statusToken: string;
  expiresAt: string;
};

export type DesktopCaptureStatus =
  | { status: "pending" }
  | { status: "expired" }
  | { status: "cancelled" }
  | { status: "ready"; upload: SourceUploadResult };

export type PhoneCaptureAvailability =
  | "pending"
  | "expired"
  | "used"
  | "invalid";

function createToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isCaptureToken(value: string): boolean {
  return TOKEN_PATTERN.test(value);
}

export function hashCaptureToken(value: string): string {
  return createHash("sha256").update(value).digest("base64url");
}

function requireToken(value: string): string {
  if (!isCaptureToken(value)) throw new AppError("CAPTURE_NOT_FOUND", "invalid token");
  return hashCaptureToken(value);
}

export async function createCaptureSession(
  now = new Date(),
): Promise<NewCaptureSession> {
  const store = captureSessionStore();
  const captureToken = createToken();
  const statusToken = createToken();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

  await store.pruneExpiredBefore(
    new Date(now.getTime() - RETENTION_MS).toISOString(),
  );
  await store.create({
    gameId: randomUUID(),
    captureTokenHash: hashCaptureToken(captureToken),
    statusTokenHash: hashCaptureToken(statusToken),
    expiresAt,
    createdAt: now.toISOString(),
  });

  return { captureToken, statusToken, expiresAt };
}

export async function phoneCaptureAvailability(
  token: string,
  now = new Date(),
): Promise<PhoneCaptureAvailability> {
  if (!isCaptureToken(token)) return "invalid";
  const session = await captureSessionStore().findByCaptureHash(
    hashCaptureToken(token),
  );
  if (!session || session.status === "cancelled") return "invalid";
  if (session.status === "ready" || session.status === "uploading") return "used";
  if (session.expiresAt <= now.toISOString()) return "expired";
  return "pending";
}

export async function claimCaptureUpload(
  token: string,
  now = new Date(),
): Promise<CaptureSessionRecord> {
  const captureHash = requireToken(token);
  const claimed = await captureSessionStore().claimUpload(
    captureHash,
    now.toISOString(),
    new Date(now.getTime() - STALE_UPLOAD_MS).toISOString(),
  );
  if (claimed) return claimed;

  const existing = await captureSessionStore().findByCaptureHash(captureHash);
  if (!existing || existing.status === "cancelled") {
    throw new AppError("CAPTURE_NOT_FOUND", "capture session not found");
  }
  if (existing.expiresAt <= now.toISOString()) {
    throw new AppError("CAPTURE_EXPIRED", "capture session expired");
  }
  throw new AppError("CAPTURE_USED", `capture session is ${existing.status}`);
}

export async function completeCaptureUpload(
  token: string,
  upload: SourceUploadResult,
  now = new Date(),
): Promise<void> {
  const completed = await captureSessionStore().completeUpload(
    requireToken(token),
    upload,
    now.toISOString(),
  );
  if (!completed) {
    throw new AppError("CAPTURE_NOT_FOUND", "capture session disappeared");
  }
}

export async function releaseCaptureUpload(token: string): Promise<void> {
  if (!isCaptureToken(token)) return;
  await captureSessionStore().releaseUpload(hashCaptureToken(token));
}

export async function desktopCaptureStatus(
  statusToken: string,
  now = new Date(),
): Promise<DesktopCaptureStatus> {
  const session = await captureSessionStore().findByStatusHash(
    requireToken(statusToken),
  );
  if (!session) throw new AppError("CAPTURE_NOT_FOUND", "status token not found");
  if (session.status === "cancelled") return { status: "cancelled" };
  if (session.status === "ready") {
    if (!session.imagePath || !session.imageUrl) {
      throw new AppError("DATABASE_ERROR", "ready capture has no image");
    }
    return {
      status: "ready",
      upload: {
        gameId: session.gameId,
        imagePath: session.imagePath,
        imageUrl: session.imageUrl,
      },
    };
  }
  if (session.expiresAt <= now.toISOString()) return { status: "expired" };
  return { status: "pending" };
}

export async function cancelCaptureSession(statusToken: string): Promise<void> {
  const cancelled = await captureSessionStore().cancelByStatusHash(
    requireToken(statusToken),
  );
  if (!cancelled) throw new AppError("CAPTURE_NOT_FOUND", "status token not found");
}
