import { randomUUID } from "crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { generateLevel } from "@/game/generation/generateLevel";
import { MemoryRepository, resetMemoryState, sortSummaries } from "@/lib/db/memory";
import type { GameSummary } from "@/lib/db/types";
import { slugifyTitle, generateUniqueSlug } from "@/lib/utils/slug";
import { discoveryForObject } from "@/lib/discovery/mechanicDiscovery";
import { deskScene } from "./fixtures/scenes";

const spec = generateLevel(deskScene, { imageUrl: "https://example.test/a.jpg" });

async function draft(db: MemoryRepository) {
  const id = randomUUID();
  return db.saveDraftGame({
    id,
    title: spec.title,
    sourceImagePath: `memory://${id}`,
    sourceImageUrl: `/api/images/${id}`,
    sceneAnalysis: deskScene,
    gameSpec: spec,
    generationLatencyMs: 1200,
    generationAttemptCount: 1,
    generationStatus: "ai",
  });
}

describe("MemoryRepository", () => {
  beforeEach(() => resetMemoryState());

  it("publishes a draft and exposes it in the arcade", async () => {
    const db = new MemoryRepository();
    const record = await draft(db);
    expect((await db.listGames({ sort: "newest", limit: 10, offset: 0 })).length).toBe(0);

    const published = await db.publishGame({
      id: record.id,
      title: "Desk Dash",
      creatorName: "Tester",
      slug: "desk-dash",
    });
    expect(published.status).toBe("published");

    const games = await db.listGames({ sort: "newest", limit: 10, offset: 0 });
    expect(games).toHaveLength(1);
    expect(games[0].slug).toBe("desk-dash");
    const stored = await db.getGameBySlug("desk-dash");
    expect(stored).toBeDefined();
    expect(stored?.gameSpec.visualVersion).toBe(1);
    expect(stored?.gameSpec.entities.every((entity) => entity.visual?.kind)).toBe(true);
    expect(
      stored?.gameSpec.entities.every((entity) => entity.visual?.componentId),
    ).toBe(true);
  });

  it("aggregates sessions into leaderboard and stats", async () => {
    const db = new MemoryRepository();
    const record = await draft(db);
    await db.publishGame({
      id: record.id,
      title: "Desk Dash",
      creatorName: "Tester",
      slug: "desk-dash-2",
    });

    const fast = await db.createSession({
      gameId: record.id,
      anonymousSessionId: "player-one",
    });
    const slow = await db.createSession({
      gameId: record.id,
      anonymousSessionId: "player-two",
    });
    await db.updateSession(fast.id, { completed: true, durationMs: 9000, deathCount: 1 });
    await db.updateSession(slow.id, { completed: true, durationMs: 21000, deathCount: 4 });

    const leaderboard = await db.getLeaderboard(record.id);
    expect(leaderboard.plays).toBe(2);
    expect(leaderboard.fastestMs).toBe(9000);
    expect(leaderboard.entries[0].rank).toBe(1);
    expect(leaderboard.completionRate).toBe(1);

    const stats = await db.getStats();
    expect(stats.publishedGames).toBe(1);
    expect(stats.gamesPlayed).toBe(2);
    expect(stats.totalDeaths).toBe(5);
  });

  it("toggles likes per anonymous session", async () => {
    const db = new MemoryRepository();
    const record = await draft(db);
    expect(await db.toggleLike(record.id, "abc")).toBe(1);
    expect(await db.toggleLike(record.id, "abc")).toBe(0);
    expect(await db.toggleLike(record.id, "def")).toBe(1);
  });

  it("registers a mechanic discovery only once", async () => {
    const db = new MemoryRepository();
    const record = await draft(db);
    const first = await db.registerMechanicDiscoveries(record.id, [
      { label: "Umbrella", mechanic: "gliding" },
    ]);
    const second = await db.registerMechanicDiscoveries(record.id, [
      { label: "umbrella ", mechanic: "gliding" },
    ]);
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(0);
  });

  it("returns recently stored template ids in generation hints", async () => {
    const db = new MemoryRepository();
    const record = await draft(db);
    await db.saveDraftGame({
      id: record.id,
      title: record.title,
      sourceImagePath: record.sourceImagePath,
      sourceImageUrl: record.sourceImageUrl,
      sceneAnalysis: record.sceneAnalysis,
      gameSpec: { ...record.gameSpec, templateId: "pantry" },
      generationLatencyMs: record.generationLatencyMs ?? 0,
      generationAttemptCount: record.generationAttemptCount,
      generationStatus: record.generationStatus,
    });

    expect((await db.getGenerationHints()).recentTemplates).toEqual([
      "pantry",
    ]);
  });
});

describe("campaign sort", () => {
  const summary = (
    slug: string,
    difficulty: number,
    publishedAt: string,
  ): GameSummary =>
    ({ slug, difficulty, publishedAt } as GameSummary);

  it("orders gentlest first so the arcade ramps up as it scrolls", () => {
    const sorted = sortSummaries(
      [
        summary("brutal", 5, "2026-01-01"),
        summary("gentle", 1, "2026-01-02"),
        summary("tricky", 3, "2026-01-03"),
      ],
      "campaign",
    );
    expect(sorted.map((entry) => entry.slug)).toEqual([
      "gentle",
      "tricky",
      "brutal",
    ]);
  });

  it("breaks ties stably so reseeding never reshuffles the campaign", () => {
    const sorted = sortSummaries(
      [
        summary("zebra", 2, "2026-01-01"),
        summary("apple", 2, "2026-01-01"),
        summary("early", 2, "2025-12-31"),
      ],
      "campaign",
    );
    expect(sorted.map((entry) => entry.slug)).toEqual([
      "early",
      "apple",
      "zebra",
    ]);
  });
});

describe("slugs", () => {
  it("slugifies titles", () => {
    expect(slugifyTitle("Desk Dash!! 2")).toBe("desk-dash-2");
    expect(slugifyTitle("   ")).not.toHaveLength(0);
  });

  it("avoids collisions", async () => {
    const taken = new Set(["desk-dash"]);
    const slug = await generateUniqueSlug("Desk Dash", async (candidate) =>
      taken.has(candidate),
    );
    expect(slug).not.toBe("desk-dash");
    expect(slug.startsWith("desk-dash")).toBe(true);
  });
});

describe("mechanic discovery vocabulary", () => {
  it("maps known objects to controlled mechanic names", () => {
    expect(discoveryForObject("Umbrella", "static_platform")).toBe("gliding");
    expect(discoveryForObject("random thing", "bounce_pad")).toBe("bouncing");
  });
});
