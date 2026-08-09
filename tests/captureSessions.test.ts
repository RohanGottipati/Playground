import { afterEach, beforeEach, describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  cancelCaptureSession,
  claimCaptureUpload,
  completeCaptureUpload,
  createCaptureSession,
  desktopCaptureStatus,
  hashCaptureToken,
  phoneCaptureAvailability,
} from "@/lib/capture/sessions";
import {
  MemoryCaptureSessionStore,
  resetCaptureSessionStore,
  setCaptureSessionStoreForTests,
} from "@/lib/capture/store";
import { resetRateLimits } from "@/lib/utils/rateLimit";
import { POST as createSessionRoute } from "@/app/api/capture-sessions/route";
import { GET as captureStatusRoute } from "@/app/api/capture-sessions/status/route";
import { POST as phoneUploadRoute } from "@/app/api/capture-sessions/[token]/upload/route";

const NOW = new Date("2026-08-09T12:00:00.000Z");

describe("phone capture sessions", () => {
  // The upload pipeline picks Supabase Storage vs. the in-process store based
  // on these vars. Clearing them keeps this suite hermetic (and off real
  // Supabase Storage) whether or not the environment it runs in — a
  // developer's shell, CI, or a Vercel build with real project env vars —
  // happens to have Supabase configured.
  const supabaseEnvKeys = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
  let savedSupabaseEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    savedSupabaseEnv = Object.fromEntries(
      supabaseEnvKeys.map((key) => [key, process.env[key]]),
    );
    for (const key of supabaseEnvKeys) delete process.env[key];

    resetCaptureSessionStore();
    setCaptureSessionStoreForTests(new MemoryCaptureSessionStore());
    resetRateLimits();
  });

  afterEach(() => {
    resetCaptureSessionStore();
    for (const key of supabaseEnvKeys) {
      const value = savedSupabaseEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("stores hashes only and returns an upload to the laptop owner", async () => {
    const session = await createCaptureSession(NOW);
    expect(session.captureToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(session.statusToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(session.captureToken).not.toBe(session.statusToken);

    const store = new MemoryCaptureSessionStore();
    const stored = await store.findByCaptureHash(
      hashCaptureToken(session.captureToken),
    );
    expect(stored).toBeDefined();
    expect(JSON.stringify(stored)).not.toContain(session.captureToken);
    expect(JSON.stringify(stored)).not.toContain(session.statusToken);
    expect(await desktopCaptureStatus(session.statusToken, NOW)).toEqual({
      status: "pending",
    });

    const claimed = await claimCaptureUpload(
      session.captureToken,
      new Date(NOW.getTime() + 1000),
    );
    const upload = {
      gameId: claimed.gameId,
      imagePath: `memory://${claimed.gameId}/original.jpg`,
      imageUrl: `/api/images/${claimed.gameId}`,
    };
    await completeCaptureUpload(
      session.captureToken,
      upload,
      new Date(NOW.getTime() + 2000),
    );

    expect(
      await desktopCaptureStatus(
        session.statusToken,
        new Date(NOW.getTime() + 3000),
      ),
    ).toEqual({ status: "ready", upload });
    expect(await phoneCaptureAvailability(session.captureToken)).toBe("used");
    await expect(
      claimCaptureUpload(session.captureToken, new Date(NOW.getTime() + 4000)),
    ).rejects.toMatchObject({
      code: "CAPTURE_USED",
    });
  });

  it("expires, cancels, and reclaims stale uploads safely", async () => {
    const expired = await createCaptureSession(NOW);
    expect(
      await phoneCaptureAvailability(
        expired.captureToken,
        new Date(NOW.getTime() + 11 * 60_000),
      ),
    ).toBe("expired");
    expect(
      await desktopCaptureStatus(
        expired.statusToken,
        new Date(NOW.getTime() + 11 * 60_000),
      ),
    ).toEqual({ status: "expired" });

    const cancelled = await createCaptureSession(NOW);
    await cancelCaptureSession(cancelled.statusToken);
    expect(await phoneCaptureAvailability(cancelled.captureToken, NOW)).toBe(
      "invalid",
    );
    expect(await desktopCaptureStatus(cancelled.statusToken, NOW)).toEqual({
      status: "cancelled",
    });

    const stale = await createCaptureSession(NOW);
    await claimCaptureUpload(stale.captureToken, new Date(NOW.getTime() + 1000));
    await expect(
      claimCaptureUpload(stale.captureToken, new Date(NOW.getTime() + 60_000)),
    ).rejects.toMatchObject({ code: "CAPTURE_USED" });
    await expect(
      claimCaptureUpload(stale.captureToken, new Date(NOW.getTime() + 4 * 60_000)),
    ).resolves.toBeDefined();
  });

  it("completes the create, phone upload, and status API handoff", async () => {
    const createResponse = await createSessionRoute(
      new Request("http://localhost/api/capture-sessions", { method: "POST" }),
    );
    expect(createResponse.status).toBe(201);
    expect(createResponse.headers.get("cache-control")).toBe("no-store");
    const created = (await createResponse.json()) as {
      capturePath: string;
      statusToken: string;
      expiresAt: string;
    };
    const token = created.capturePath.split("/").at(-1)!;

    const pendingResponse = await captureStatusRoute(
      new Request("http://localhost/api/capture-sessions/status", {
        headers: { Authorization: `Bearer ${created.statusToken}` },
      }),
    );
    expect(await pendingResponse.json()).toEqual({ status: "pending" });

    const bytes = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 3,
        background: { r: 220, g: 120, b: 40 },
      },
    })
      .jpeg()
      .toBuffer();
    const form = new FormData();
    form.append(
      "file",
      new File([Uint8Array.from(bytes)], "phone.jpg", { type: "image/jpeg" }),
    );
    const uploadResponse = await phoneUploadRoute(
      new Request(`http://localhost/api/capture-sessions/${token}/upload`, {
        method: "POST",
        body: form,
      }),
      { params: Promise.resolve({ token }) },
    );
    expect(uploadResponse.status).toBe(200);
    expect(await uploadResponse.json()).toEqual({ sent: true });

    const readyResponse = await captureStatusRoute(
      new Request("http://localhost/api/capture-sessions/status", {
        headers: { Authorization: `Bearer ${created.statusToken}` },
      }),
    );
    const ready = (await readyResponse.json()) as {
      status: string;
      upload: { gameId: string; imagePath: string; imageUrl: string };
    };
    expect(ready.status).toBe("ready");
    expect(ready.upload.gameId).toMatch(/^[0-9a-f-]{36}$/);
    expect(ready.upload.imageUrl).toBe(`/api/images/${ready.upload.gameId}`);

    const secondUpload = await phoneUploadRoute(
      new Request(`http://localhost/api/capture-sessions/${token}/upload`, {
        method: "POST",
        body: form,
      }),
      { params: Promise.resolve({ token }) },
    );
    expect(secondUpload.status).toBe(409);
  });

  it("does not reveal whether a malformed status token exists", async () => {
    const response = await captureStatusRoute(
      new Request("http://localhost/api/capture-sessions/status", {
        headers: { Authorization: "Bearer short" },
      }),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
