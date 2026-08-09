import { describe, expect, it } from "vitest";
import { generateLevel } from "@/game/generation/generateLevel";
import {
  clearRouteHazards,
  fixUnreachableCollectibles,
  hasSafeLanding,
  isCollectibleReachable,
} from "@/game/generation/routeSafety";
import { isSpecSafe } from "@/game/generation/runtimeSafety";
import {
  computeReachability,
  farthestReachableNode,
  toPlatformNode,
} from "@/game/generation/validateReachability";
import type { GameEntitySpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import { deskScene } from "./fixtures/scenes";

const platform = (
  id: string,
  x: number,
  y: number,
  width = 200,
): GameEntitySpec => ({
  id,
  mechanic: "static_platform",
  bounds: { x, y, width, height: 26 },
});

const hazard = (
  id: string,
  x: number,
  y: number,
  width = 140,
  height = 56,
): GameEntitySpec => ({
  id,
  mechanic: "hazard",
  bounds: { x, y, width, height },
});

const collectible = (id: string, x: number, y: number): GameEntitySpec => ({
  id,
  mechanic: "collectible",
  bounds: { x, y, width: 34, height: 34 },
});

describe("hasSafeLanding", () => {
  const node = toPlatformNode(platform("p", 200, 700, 160));

  it("passes a clean surface", () => {
    expect(hasSafeLanding(node, [])).toBe(true);
  });

  it("fails when a hazard covers the whole landing strip", () => {
    expect(hasSafeLanding(node, [hazard("h", 190, 650, 180)])).toBe(false);
  });

  it("passes when a wide-enough free interval remains", () => {
    expect(hasSafeLanding(node, [hazard("h", 200, 650, 60)])).toBe(true);
  });

  it("ignores hazards far below the surface", () => {
    expect(hasSafeLanding(node, [hazard("h", 190, 800, 180)])).toBe(true);
  });
});

describe("clearRouteHazards", () => {
  it("converts a hazard smothering a reachable platform into a collectible", () => {
    const entities = [platform("p", 200, 720, 160), hazard("blocker", 190, 660, 180)];
    const actions: string[] = [];
    const cleared = clearRouteHazards(entities, actions);
    expect(cleared.find((entity) => entity.id === "blocker")?.mechanic).toBe(
      "collectible",
    );
    expect(actions.some((action) => action.includes("blocking route"))).toBe(true);
  });

  it("leaves hazards on unreachable platforms alone", () => {
    const entities = [platform("far", 800, 200, 160), hazard("guard", 790, 140, 180)];
    const cleared = clearRouteHazards(entities, []);
    expect(cleared.find((entity) => entity.id === "guard")?.mechanic).toBe("hazard");
  });
});

describe("fixUnreachableCollectibles", () => {
  it("relocates or removes pickups floating beyond jump reach", () => {
    const entities = [collectible("floaty", 800, 60)];
    const reachability = computeReachability(entities);
    expect(isCollectibleReachable(entities[0], reachability)).toBe(false);

    const actions: string[] = [];
    const fixed = fixUnreachableCollectibles(9, entities, reachability, actions);
    const floaty = fixed.find((entity) => entity.id === "floaty");
    if (floaty) {
      expect(isCollectibleReachable(floaty, reachability)).toBe(true);
    }
    expect(actions.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same seed", () => {
    const entities = [collectible("floaty", 800, 60), collectible("high", 400, 40)];
    const reachability = computeReachability(entities);
    const first = fixUnreachableCollectibles(21, entities, reachability, []);
    const second = fixUnreachableCollectibles(21, entities, reachability, []);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it("keeps grounded pickups untouched", () => {
    const grounded = collectible("ok", 500, 780);
    const reachability = computeReachability([grounded]);
    const fixed = fixUnreachableCollectibles(3, [grounded], reachability, []);
    expect(fixed[0].bounds).toEqual(grounded.bounds);
  });
});

describe("farthestReachableNode moving-platform exclusion", () => {
  it("prefers a static anchor over a farther moving platform", () => {
    const entities: GameEntitySpec[] = [
      platform("static-a", 1200, 740, 200),
      {
        id: "mover",
        mechanic: "moving_platform",
        bounds: { x: 1300, y: 740, width: 160, height: 26 },
        movement: { axis: "x", distance: 100, speed: 70 },
      },
    ];
    const result = computeReachability(entities);
    expect(farthestReachableNode(result)?.id).toBe("mover");
    expect(farthestReachableNode(result, { excludeMoving: true })?.id).not.toBe(
      "mover",
    );
  });
});

describe("hazard-heavy generation stays completable", () => {
  const nasty: SceneAnalysis = {
    ...deskScene,
    objects: [
      ...deskScene.objects,
      {
        ...deskScene.objects[3],
        id: "h-mid",
        label: "razor",
        suggestedRole: "hazard" as const,
        bounds: { x: 0.52, y: 0.44, width: 0.08, height: 0.05 },
      },
      {
        ...deskScene.objects[4],
        id: "c-high",
        label: "gem stone",
        suggestedRole: "collectible" as const,
        bounds: { x: 0.6, y: 0.05, width: 0.04, height: 0.04 },
      },
    ],
  };

  it("passes the strict safety gate across seeds", () => {
    for (let seed = 1; seed <= 32; seed += 1) {
      const spec = generateLevel(nasty, {
        imageUrl: "https://example.test/nasty.jpg",
        seed,
      });
      expect(isSpecSafe(spec)).toBe(true);
      expect(spec.validation.reachable).toBe(true);
    }
  });
});
