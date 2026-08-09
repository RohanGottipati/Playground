import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "crypto";
import { GET as getTelemetry, POST as postEvent } from "@/app/api/events/route";
import { generateLevel } from "@/game/generation/generateLevel";
import {
  EventRequestSchema,
  TelemetryQuerySchema,
} from "@/lib/analytics/eventSchemas";
import { resetRepository } from "@/lib/db";
import { MemoryRepository, resetMemoryState } from "@/lib/db/memory";
import { platformCity } from "@/lib/geo/platformCity";
import { checkRateLimit, resetRateLimits } from "@/lib/utils/rateLimit";
import { sanitizeCreatorName, sanitizeTitle } from "@/lib/utils/sanitize";
import { deskScene } from "./fixtures/scenes";

describe("EventRequestSchema", () => {
  it("accepts a well-formed event", () => {
    const result = EventRequestSchema.safeParse({
      gameId: randomUUID(),
      eventType: "game_completed",
      run: { elapsedMs: 12000, deaths: 2, collectibles: 1 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts shooter target_destroyed events", () => {
    const result = EventRequestSchema.safeParse({
      gameId: randomUUID(),
      eventType: "target_destroyed",
      payload: { remaining: 2 },
    });
    expect(result.success).toBe(true);
  });

  it("uses canonical gameplay events for spatial telemetry", () => {
    const gameId = randomUUID();
    expect(
      EventRequestSchema.safeParse({
        gameId,
        eventType: "player_died",
        payload: { x: 120, y: 440, elapsedMs: 9000 },
      }).success,
    ).toBe(true);
    expect(EventRequestSchema.safeParse({ gameId, eventType: "death" }).success).toBe(false);
    expect(EventRequestSchema.safeParse({ gameId, eventType: "clear" }).success).toBe(false);
  });

  it("rejects unknown event types", () => {
    const result = EventRequestSchema.safeParse({
      gameId: randomUUID(),
      eventType: "player_teleported",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-uuid game ids and absurd timings", () => {
    expect(
      EventRequestSchema.safeParse({ gameId: "abc", eventType: "game_started" }).success,
    ).toBe(false);
    expect(
      EventRequestSchema.safeParse({
        gameId: randomUUID(),
        eventType: "game_completed",
        run: { elapsedMs: -1 },
      }).success,
    ).toBe(false);
  });
});

describe("telemetry query and platform location", () => {
  it("requires a UUID game scope", () => {
    expect(TelemetryQuerySchema.safeParse({ gameId: randomUUID() }).success).toBe(true);
    expect(TelemetryQuerySchema.safeParse({ gameId: "all-games" }).success).toBe(false);
  });

  it("decodes and sanitizes the deployment city header", () => {
    expect(
      platformCity(new Request("http://localhost", {
        headers: { "x-vercel-ip-city": "Montr%C3%A9al%0A" },
      })),
    ).toBe("Montréal");
    expect(platformCity(new Request("http://localhost"))).toBeNull();
  });
});

describe("telemetry API", () => {
  const envKeys = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
  let savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    savedEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
    for (const key of envKeys) delete process.env[key];
    resetRepository();
    resetMemoryState();
    resetRateLimits();
  });

  afterEach(() => {
    resetRepository();
    resetMemoryState();
    for (const key of envKeys) {
      const value = savedEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  async function createGame(published: boolean) {
    const db = new MemoryRepository();
    const gameId = randomUUID();
    const spec = generateLevel(deskScene, { imageUrl: "https://example.test/telemetry.jpg" });
    await db.saveDraftGame({
      id: gameId,
      title: spec.title,
      sourceImagePath: `memory://${gameId}`,
      sourceImageUrl: `/api/images/${gameId}`,
      sceneAnalysis: deskScene,
      gameSpec: spec,
      generationLatencyMs: 100,
      generationAttemptCount: 1,
      generationStatus: "ai",
    });
    if (published) {
      await db.publishGame({
        id: gameId,
        title: "Telemetry Test",
        creatorName: "Tester",
        slug: "telemetry-test",
      });
    }
    return gameId;
  }

  it("rejects invalid and unpublished game scopes", async () => {
    expect((await getTelemetry(new Request("http://localhost/api/events?gameId=nope"))).status)
      .toBe(422);
    const draftId = await createGame(false);
    expect((await getTelemetry(
      new Request(`http://localhost/api/events?gameId=${draftId}`),
    )).status).toBe(404);
  });

  it("enriches one canonical event and returns real scoped telemetry", async () => {
    const gameId = await createGame(true);
    const recorded = await postEvent(new Request("http://localhost/api/events", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-vercel-ip-city": "Toronto",
      },
      body: JSON.stringify({
        gameId,
        eventType: "player_died",
        payload: { x: 321, y: 654, elapsedMs: 1200 },
      }),
    }));
    expect(recorded.status).toBe(200);

    const response = await getTelemetry(
      new Request(`http://localhost/api/events?gameId=${gameId}`),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      gameId,
      fatalityCount: 1,
      activeSessions: 0,
      deathPoints: [{ x: 321, y: 654 }],
      recentEvents: [{ eventType: "player_died", city: "Toronto" }],
    });
  });
});

describe("rate limiting", () => {
  it("throws once the window limit is exceeded", () => {
    resetRateLimits();
    const rule = { limit: 2, windowMs: 60_000 };
    checkRateLimit("test-key", rule);
    checkRateLimit("test-key", rule);
    expect(() => checkRateLimit("test-key", rule)).toThrow();
  });
});

describe("sanitizers", () => {
  it("trims and falls back", () => {
    expect(sanitizeTitle("  ", "Fallback")).toBe("Fallback");
    expect(sanitizeCreatorName(undefined)).toBe("Anonymous");
    expect(sanitizeTitle("Hello\u0000 World")).toBe("Hello World");
  });
});
