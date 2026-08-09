import { describe, expect, it } from "vitest";
import { randomUUID } from "crypto";
import { EventRequestSchema } from "@/lib/analytics/eventSchemas";
import { checkRateLimit, resetRateLimits } from "@/lib/utils/rateLimit";
import { sanitizeCreatorName, sanitizeTitle } from "@/lib/utils/sanitize";

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
