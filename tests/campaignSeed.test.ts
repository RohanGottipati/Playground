import { describe, expect, it } from "vitest";
import {
  buildCampaignSeedGames,
  campaignGameId,
} from "@/game/templates/campaignSeed";
import { TEMPLATE_IDS } from "@/game/templates";

describe("campaign seed rows", () => {
  const start = new Date("2026-08-09T00:00:00.000Z");

  it("builds the full stable, published campaign order", () => {
    const games = buildCampaignSeedGames({ publishedAtStart: start });
    expect(games).toHaveLength(23);
    expect(games.map((game) => game.template)).toEqual(TEMPLATE_IDS);
    expect(new Set(games.map((game) => game.id)).size).toBe(23);
    expect(new Set(games.map((game) => game.slug)).size).toBe(23);
    for (const game of games) {
      expect(game.id).toBe(campaignGameId(game.template));
      expect(game.sourceImageUrl).toBe(
        `/template-previews/${game.template}.svg`,
      );
      expect(game.gameSpec.slug).toBe(game.slug);
      expect(game.gameSpec.mode).toBeDefined();
    }
  });

  it("preserves existing public identity across refreshes", () => {
    const first = buildCampaignSeedGames({ publishedAtStart: start });
    const existing = first.map((game) => ({
      id: game.id,
      slug: `kept-${game.template}`,
      publishedAt: game.publishedAt,
    }));
    const refreshed = buildCampaignSeedGames({
      existing,
      reservedSlugs: new Set(existing.map((game) => game.slug)),
      publishedAtStart: new Date("2030-01-01T00:00:00.000Z"),
    });

    expect(refreshed.map((game) => game.slug)).toEqual(
      existing.map((game) => game.slug),
    );
    expect(refreshed.map((game) => game.publishedAt)).toEqual(
      existing.map((game) => game.publishedAt),
    );
  });

  it("uses a deterministic template suffix when a title slug is reserved", () => {
    const baseline = buildCampaignSeedGames({ publishedAtStart: start });
    const reserved = new Set([baseline[0].slug]);
    const games = buildCampaignSeedGames({
      reservedSlugs: reserved,
      publishedAtStart: start,
    });
    expect(games[0].slug).toBe(`${baseline[0].slug}-${baseline[0].template}`);
  });
});
