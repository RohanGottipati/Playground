import { describe, expect, it } from "vitest";
import { MIN_GROUND_HAZARD_GAP } from "@/game/constants";
import { generateLevel } from "@/game/generation/generateLevel";
import { EMPTY_HINTS, type GenerationHints } from "@/game/generation/hints";
import { normalizeObjects } from "@/game/generation/normalizeObjects";
import { createRng } from "@/game/generation/rng";
import { isCollectibleReachable } from "@/game/generation/routeSafety";
import { isSpecSafe } from "@/game/generation/runtimeSafety";
import { selectGameMode } from "@/game/generation/selectMode";
import { generateTitle } from "@/game/generation/title";
import { computeReachability } from "@/game/generation/validateReachability";
import { winConditionFor } from "@/game/generation/winCondition";
import type { GameMode } from "@/game/types";
import { containsBrandName, scrubBrandNames } from "@/lib/utils/genericName";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import { deskScene } from "./fixtures/scenes";

const IMAGE_URL = "https://example.test/seeded.jpg";

describe("scrubBrandNames", () => {
  it("rewrites product names into generic nouns", () => {
    expect(scrubBrandNames("Coca-Cola can")).toBe("soda can");
    expect(scrubBrandNames("iPhone 15 Pro")).toBe("phone");
    expect(scrubBrandNames("Sharpie")).toBe("marker");
  });

  it("collapses duplicated words a replacement creates", () => {
    expect(scrubBrandNames("LEGO brick")).toBe("toy brick");
    expect(scrubBrandNames("Nike sneaker")).toBe("sneaker");
  });

  it("leaves plain object labels untouched", () => {
    for (const label of ["notebook", "mug", "pencil", "scissors", "eraser"]) {
      expect(scrubBrandNames(label)).toBe(label);
    }
  });

  it("reports whether scrubbing changed anything", () => {
    expect(containsBrandName("Coca-Cola can")).toBe(true);
    expect(containsBrandName("soda can")).toBe(false);
  });
});

describe("generateTitle", () => {
  const objects = normalizeObjects(deskScene);

  it("is deterministic per seed and varies across seeds", () => {
    const first = generateTitle(createRng(7), "classic", objects, undefined, []);
    const again = generateTitle(createRng(7), "classic", objects, undefined, []);
    expect(again).toBe(first);

    const titles = new Set(
      Array.from({ length: 12 }, (_, seed) =>
        generateTitle(createRng(seed + 1), "classic", objects, undefined, []),
      ),
    );
    expect(titles.size).toBeGreaterThan(1);
  });

  it("skips recently used titles", () => {
    const first = generateTitle(createRng(7), "rush", objects, undefined, []);
    const second = generateTitle(createRng(7), "rush", objects, undefined, [first]);
    expect(second).not.toBe(first);
  });

  it("never contains brand names, even from branded labels", () => {
    const branded: SceneAnalysis = {
      ...deskScene,
      objects: [
        {
          ...deskScene.objects[0],
          label: "coca-cola can",
        },
        ...deskScene.objects.slice(1),
      ],
    };
    const brandedObjects = normalizeObjects(branded);
    for (let seed = 1; seed <= 10; seed += 1) {
      for (const mode of ["classic", "shooter", "skyfall", "rush"] as const) {
        const title = generateTitle(createRng(seed), mode, brandedObjects, undefined, []);
        expect(title).not.toMatch(/coca|cola/i);
        expect(containsBrandName(title)).toBe(false);
      }
    }
  });
});

describe("selectGameMode", () => {
  const objects = normalizeObjects(deskScene);

  it("is deterministic per seed", () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      expect(selectGameMode(createRng(seed), objects, EMPTY_HINTS)).toBe(
        selectGameMode(createRng(seed), objects, EMPTY_HINTS),
      );
    }
  });

  it("strongly avoids the most recent mode", () => {
    const hints: GenerationHints = { ...EMPTY_HINTS, recentModes: ["classic"] };
    const counts = new Map<GameMode, number>();
    for (let seed = 1; seed <= 300; seed += 1) {
      const mode = selectGameMode(createRng(seed), objects, hints);
      counts.set(mode, (counts.get(mode) ?? 0) + 1);
    }
    const classic = counts.get("classic") ?? 0;
    for (const mode of ["shooter", "skyfall", "rush"] as const) {
      expect(classic).toBeLessThan(counts.get(mode) ?? 0);
    }
  });
});

describe("seeded generation", () => {
  it("produces identical specs for identical seeds", () => {
    const first = generateLevel(deskScene, { imageUrl: IMAGE_URL, seed: 42 });
    const second = generateLevel(deskScene, { imageUrl: IMAGE_URL, seed: 42 });
    expect(JSON.stringify(second)).toEqual(JSON.stringify(first));
  });

  it("varies mode or title across seeds", () => {
    const runs = new Set(
      Array.from({ length: 16 }, (_, seed) => {
        const spec = generateLevel(deskScene, { imageUrl: IMAGE_URL, seed: seed + 1 });
        return `${spec.mode}|${spec.title}`;
      }),
    );
    expect(runs.size).toBeGreaterThan(1);
  });

  it("keeps every mode's spec safe and completable", () => {
    for (let seed = 1; seed <= 64; seed += 1) {
      const spec = generateLevel(deskScene, { imageUrl: IMAGE_URL, seed });
      expect(isSpecSafe(spec)).toBe(true);
      expect(spec.validation.reachable).toBe(true);
      expect(spec.validation.pipelineVersion).toBe(2);
      expect(spec.rules?.headline).toBeTruthy();
      expect(spec.rules?.howToPlay.length).toBeGreaterThan(0);

      // Only classic ends at an exit door; other modes win via objective.
      const goals = spec.entities.filter((entity) => entity.mechanic === "goal");
      expect(goals).toHaveLength(spec.mode === "classic" ? 1 : 0);

      const reachability = computeReachability(spec.entities);
      const targets = spec.entities.filter((entity) => entity.mechanic === "target");
      if (spec.mode === "shooter") {
        expect(winConditionFor(spec)).toBe("destroy_all");
        expect(spec.shooter).toBeDefined();
        expect(targets.length).toBeGreaterThanOrEqual(1);
        expect(spec.shooter!.requiredKills).toBe(targets.length);
        expect(spec.player.canShoot).toBe(true);
        expect(spec.projectile).toBeDefined();
        for (const target of targets) {
          expect(
            reachability.reachable.has(String(target.metadata?.supportId)),
          ).toBe(true);
        }
      } else {
        expect(targets).toHaveLength(0);
      }

      if (spec.mode === "rush") {
        expect(winConditionFor(spec)).toBe("collect_all");
        const collectibles = spec.entities.filter(
          (entity) => entity.mechanic === "collectible",
        );
        expect(spec.rush).toBeDefined();
        expect(spec.rush!.requiredCollectibles).toBeGreaterThanOrEqual(1);
        expect(spec.rush!.requiredCollectibles).toBe(collectibles.length);
        expect(spec.rush!.timeLimitSeconds).toBeGreaterThanOrEqual(45);
        // Every required pickup must be grabbable, or the run can never end.
        for (const pickup of collectibles) {
          expect(isCollectibleReachable(pickup, reachability)).toBe(true);
        }
      }

      if (spec.mode === "skyfall") {
        expect(winConditionFor(spec)).toBe("survive");
        expect(spec.skyfall).toBeDefined();
        expect(spec.skyfall!.intervalMs).toBeGreaterThan(0);
        expect(spec.skyfall!.componentIds.length).toBeGreaterThanOrEqual(1);
        expect(spec.skyfall!.surviveSeconds).toBeGreaterThanOrEqual(15);
        expect(spec.skyfall!.surviveSeconds).toBeLessThanOrEqual(90);
      }

      if (spec.mode === "classic") {
        expect(winConditionFor(spec)).toBe("door");
      }
    }
  });

  it("thins crowded ground hazards into a passable corridor", () => {
    const hazard = (id: string, x: number) => ({
      ...deskScene.objects[3],
      id,
      label: `spiky ${id}`,
      suggestedRole: "hazard" as const,
      bounds: { x, y: 0.86, width: 0.06, height: 0.05 },
    });
    const crowded: SceneAnalysis = {
      ...deskScene,
      objects: [
        deskScene.objects[0],
        hazard("h1", 0.3),
        hazard("h2", 0.34),
        hazard("h3", 0.38),
        hazard("h4", 0.42),
      ],
    };

    const spec = generateLevel(crowded, { imageUrl: IMAGE_URL, seed: 5 });
    expect(isSpecSafe(spec)).toBe(true);
    expect(
      spec.validation.repairActions.some((action) =>
        action.includes("crowded ground hazard"),
      ),
    ).toBe(true);

    const groundHazards = spec.entities
      .filter(
        (entity) =>
          entity.mechanic === "hazard" && entity.bounds.y + entity.bounds.height >= 770,
      )
      .sort((a, b) => a.bounds.x - b.bounds.x);
    for (let i = 1; i < groundHazards.length; i += 1) {
      const gap =
        groundHazards[i].bounds.x -
        (groundHazards[i - 1].bounds.x + groundHazards[i - 1].bounds.width);
      expect(gap).toBeGreaterThanOrEqual(MIN_GROUND_HAZARD_GAP);
    }
  });
});
