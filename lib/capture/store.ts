import { AppError } from "@/lib/errors/AppError";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import type { SourceUploadResult } from "@/lib/storage/sourceUpload";

export type CaptureSessionState =
  | "pending"
  | "uploading"
  | "ready"
  | "cancelled";

export type CaptureSessionRecord = {
  gameId: string;
  captureTokenHash: string;
  statusTokenHash: string;
  status: CaptureSessionState;
  imagePath: string | null;
  imageUrl: string | null;
  uploadStartedAt: string | null;
  readyAt: string | null;
  expiresAt: string;
  createdAt: string;
};

export type CreateCaptureRecord = Pick<
  CaptureSessionRecord,
  "gameId" | "captureTokenHash" | "statusTokenHash" | "expiresAt" | "createdAt"
>;

export interface CaptureSessionStore {
  create(input: CreateCaptureRecord): Promise<CaptureSessionRecord>;
  findByCaptureHash(hash: string): Promise<CaptureSessionRecord | undefined>;
  findByStatusHash(hash: string): Promise<CaptureSessionRecord | undefined>;
  claimUpload(
    captureHash: string,
    now: string,
    staleBefore: string,
  ): Promise<CaptureSessionRecord | undefined>;
  completeUpload(
    captureHash: string,
    upload: SourceUploadResult,
    readyAt: string,
  ): Promise<CaptureSessionRecord | undefined>;
  releaseUpload(captureHash: string): Promise<void>;
  cancelByStatusHash(statusHash: string): Promise<boolean>;
  pruneExpiredBefore(cutoff: string): Promise<void>;
}

type CaptureSessionRow = {
  game_id: string;
  capture_token_hash: string;
  status_token_hash: string;
  status: CaptureSessionState;
  image_path: string | null;
  image_url: string | null;
  upload_started_at: string | null;
  ready_at: string | null;
  expires_at: string;
  created_at: string;
};

function toRecord(row: CaptureSessionRow): CaptureSessionRecord {
  return {
    gameId: row.game_id,
    captureTokenHash: row.capture_token_hash,
    statusTokenHash: row.status_token_hash,
    status: row.status,
    imagePath: row.image_path,
    imageUrl: row.image_url,
    uploadStartedAt: row.upload_started_at,
    readyAt: row.ready_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

function databaseFailure(operation: string, message: string): never {
  throw new AppError("DATABASE_ERROR", `${operation}: ${message}`);
}

class SupabaseCaptureSessionStore implements CaptureSessionStore {
  private get client() {
    return supabaseAdmin();
  }

  async create(input: CreateCaptureRecord): Promise<CaptureSessionRecord> {
    const { data, error } = await this.client
      .from("capture_sessions")
      .insert({
        game_id: input.gameId,
        capture_token_hash: input.captureTokenHash,
        status_token_hash: input.statusTokenHash,
        status: "pending",
        expires_at: input.expiresAt,
        created_at: input.createdAt,
      })
      .select("*")
      .single();
    if (error || !data) databaseFailure("createCaptureSession", error?.message ?? "no row");
    return toRecord(data as CaptureSessionRow);
  }

  async findByCaptureHash(hash: string): Promise<CaptureSessionRecord | undefined> {
    const { data, error } = await this.client
      .from("capture_sessions")
      .select("*")
      .eq("capture_token_hash", hash)
      .maybeSingle();
    if (error) databaseFailure("findCaptureSession", error.message);
    return data ? toRecord(data as CaptureSessionRow) : undefined;
  }

  async findByStatusHash(hash: string): Promise<CaptureSessionRecord | undefined> {
    const { data, error } = await this.client
      .from("capture_sessions")
      .select("*")
      .eq("status_token_hash", hash)
      .maybeSingle();
    if (error) databaseFailure("findCaptureStatus", error.message);
    return data ? toRecord(data as CaptureSessionRow) : undefined;
  }

  async claimUpload(
    captureHash: string,
    now: string,
    staleBefore: string,
  ): Promise<CaptureSessionRecord | undefined> {
    const claim = (status: "pending" | "uploading") => {
      let query = this.client
        .from("capture_sessions")
        .update({ status: "uploading", upload_started_at: now })
        .eq("capture_token_hash", captureHash)
        .eq("status", status)
        .gt("expires_at", now);
      if (status === "uploading") {
        query = query.lt("upload_started_at", staleBefore);
      }
      return query.select("*").maybeSingle();
    };

    const pending = await claim("pending");
    if (pending.error) databaseFailure("claimCaptureUpload", pending.error.message);
    if (pending.data) return toRecord(pending.data as CaptureSessionRow);

    const stale = await claim("uploading");
    if (stale.error) databaseFailure("reclaimCaptureUpload", stale.error.message);
    return stale.data ? toRecord(stale.data as CaptureSessionRow) : undefined;
  }

  async completeUpload(
    captureHash: string,
    upload: SourceUploadResult,
    readyAt: string,
  ): Promise<CaptureSessionRecord | undefined> {
    const { data, error } = await this.client
      .from("capture_sessions")
      .update({
        status: "ready",
        image_path: upload.imagePath,
        image_url: upload.imageUrl,
        ready_at: readyAt,
      })
      .eq("capture_token_hash", captureHash)
      .eq("status", "uploading")
      .select("*")
      .maybeSingle();
    if (error) databaseFailure("completeCaptureUpload", error.message);
    return data ? toRecord(data as CaptureSessionRow) : undefined;
  }

  async releaseUpload(captureHash: string): Promise<void> {
    const { error } = await this.client
      .from("capture_sessions")
      .update({ status: "pending", upload_started_at: null })
      .eq("capture_token_hash", captureHash)
      .eq("status", "uploading");
    if (error) databaseFailure("releaseCaptureUpload", error.message);
  }

  async cancelByStatusHash(statusHash: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("capture_sessions")
      .update({ status: "cancelled" })
      .eq("status_token_hash", statusHash)
      .neq("status", "cancelled")
      .select("game_id")
      .maybeSingle();
    if (error) databaseFailure("cancelCaptureSession", error.message);
    return Boolean(data);
  }

  async pruneExpiredBefore(cutoff: string): Promise<void> {
    const { error } = await this.client
      .from("capture_sessions")
      .delete()
      .lt("expires_at", cutoff);
    if (error) databaseFailure("pruneCaptureSessions", error.message);
  }
}

const memoryCaptureState = globalThis as unknown as {
  __playgroundCaptureSessions?: Map<string, CaptureSessionRecord>;
};

function memorySessions(): Map<string, CaptureSessionRecord> {
  if (!memoryCaptureState.__playgroundCaptureSessions) {
    memoryCaptureState.__playgroundCaptureSessions = new Map();
  }
  return memoryCaptureState.__playgroundCaptureSessions;
}

export class MemoryCaptureSessionStore implements CaptureSessionStore {
  async create(input: CreateCaptureRecord): Promise<CaptureSessionRecord> {
    const record: CaptureSessionRecord = {
      ...input,
      status: "pending",
      imagePath: null,
      imageUrl: null,
      uploadStartedAt: null,
      readyAt: null,
    };
    memorySessions().set(record.captureTokenHash, record);
    return record;
  }

  async findByCaptureHash(hash: string): Promise<CaptureSessionRecord | undefined> {
    return memorySessions().get(hash);
  }

  async findByStatusHash(hash: string): Promise<CaptureSessionRecord | undefined> {
    return [...memorySessions().values()].find(
      (session) => session.statusTokenHash === hash,
    );
  }

  async claimUpload(
    captureHash: string,
    now: string,
    staleBefore: string,
  ): Promise<CaptureSessionRecord | undefined> {
    const session = memorySessions().get(captureHash);
    if (!session || session.expiresAt <= now) return undefined;
    const stale =
      session.status === "uploading" &&
      session.uploadStartedAt != null &&
      session.uploadStartedAt < staleBefore;
    if (session.status !== "pending" && !stale) return undefined;
    const claimed = { ...session, status: "uploading" as const, uploadStartedAt: now };
    memorySessions().set(captureHash, claimed);
    return claimed;
  }

  async completeUpload(
    captureHash: string,
    upload: SourceUploadResult,
    readyAt: string,
  ): Promise<CaptureSessionRecord | undefined> {
    const session = memorySessions().get(captureHash);
    if (!session || session.status !== "uploading") return undefined;
    const ready: CaptureSessionRecord = {
      ...session,
      status: "ready",
      imagePath: upload.imagePath,
      imageUrl: upload.imageUrl,
      readyAt,
    };
    memorySessions().set(captureHash, ready);
    return ready;
  }

  async releaseUpload(captureHash: string): Promise<void> {
    const session = memorySessions().get(captureHash);
    if (!session || session.status !== "uploading") return;
    memorySessions().set(captureHash, {
      ...session,
      status: "pending",
      uploadStartedAt: null,
    });
  }

  async cancelByStatusHash(statusHash: string): Promise<boolean> {
    const session = await this.findByStatusHash(statusHash);
    if (!session || session.status === "cancelled") return false;
    memorySessions().set(session.captureTokenHash, {
      ...session,
      status: "cancelled",
    });
    return true;
  }

  async pruneExpiredBefore(cutoff: string): Promise<void> {
    for (const [hash, session] of memorySessions()) {
      if (session.expiresAt < cutoff) memorySessions().delete(hash);
    }
  }
}

let cachedStore: CaptureSessionStore | null = null;

export function captureSessionStore(): CaptureSessionStore {
  if (!cachedStore) {
    cachedStore = isSupabaseConfigured()
      ? new SupabaseCaptureSessionStore()
      : new MemoryCaptureSessionStore();
  }
  return cachedStore;
}

export function resetCaptureSessionStore(): void {
  cachedStore = null;
  memoryCaptureState.__playgroundCaptureSessions = undefined;
}

/** Injects an isolated store for route/service tests. */
export function setCaptureSessionStoreForTests(store: CaptureSessionStore): void {
  cachedStore = store;
}
