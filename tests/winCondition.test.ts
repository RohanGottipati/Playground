import { describe, expect, it } from "vitest";
import {
  GRAVITY_Y,
  JUMP_VELOCITY,
  MOVE_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "@/game/constants";
import { isSpecSafe } from "@/game/generation/runtimeSafety";
import { winConditionFor } from "@/game/generation/winCondition";
import type { GameEntitySpec, GameMode, GameSpec } from "@/game/types";

const platformEntity: GameEntitySpec = {
  id: "p1",
  mechanic: "static_platform",
  bounds: { x: 300, y: 720, width: 200, height: 26 },
};

const goalEntity: GameEntitySpec = {
  id: "goal",
  mechanic: "goal",
  bounds: { x: 1500, y: 750, width: 56, height: 80 },
  metadata: { supportId: "ground" },
};

const targetEntity: GameEntitySpec = {
  id: "t1",
  mechanic: "target",
  bounds: { x: 600, y: 600, width: 46, height: 46 },
  metadata: { supportId: "ground" },
};

function baseSpec(mode: GameMode, entities: GameEntitySpec[]): GameSpec {
  return {
    schemaVersion: 1,
    title: "Legacy Level",
    theme: "arcade",
    difficulty: 2,
    mode,
    world: { width: WORLD_WIDTH, height: WORLD_HEIGHT, gravityY: GRAVITY_Y },
    player: {
      spawnX: 90,
      spawnY: 700,
      moveSpeed: MOVE_SPEED,
      jumpVelocity: JUMP_VELOCITY,
      maxJumps: 1,
    },
    entities,
    validation: {
      // Deliberately no pipelineVersion: this mimics a legacy stored spec.
      reachable: true,
      repaired: false,
      repairActions: [],
      estimatedOptimalTimeSeconds: 12,
    },
    source: { imageUrl: "https://example.test/legacy.jpg", detectedObjectCount: 3 },
  };
}

describe("winConditionFor", () => {
  it("derives door for any spec that carries a goal entity", () => {
    for (const mode of ["classic", "shooter", "skyfall", "rush"] as const) {
      expect(winConditionFor(baseSpec(mode, [platformEntity, goalEntity]))).toBe(
        "door",
      );
    }
  });

  it("derives the objective win for door-less new specs", () => {
    expect(winConditionFor(baseSpec("shooter", [platformEntity]))).toBe(
      "destroy_all",
    );
    expect(winConditionFor(baseSpec("rush", [platformEntity]))).toBe("collect_all");

    const skyfall = baseSpec("skyfall", [platformEntity]);
    skyfall.skyfall = {
      label: "staplers",
      intervalMs: 1700,
      fallSpeed: 240,
      maxConcurrent: 4,
      componentIds: [],
      surviveSeconds: 30,
    };
    expect(winConditionFor(skyfall)).toBe("survive");
  });

  it("falls back to door for a legacy skyfall spec without a survive timer", () => {
    const skyfall = baseSpec("skyfall", [platformEntity]);
    skyfall.skyfall = {
      label: "staplers",
      intervalMs: 1700,
      fallSpeed: 240,
      maxConcurrent: 4,
      componentIds: [],
    };
    expect(winConditionFor(skyfall)).toBe("door");
  });
});

describe("legacy spec tolerance in the safety gate", () => {
  it("accepts a legacy shooter spec with its locked door", () => {
    const spec = baseSpec("shooter", [platformEntity, targetEntity, goalEntity]);
    spec.shooter = { requiredKills: 1 };
    spec.projectile = {
      label: "donut",
      speed: 640,
      cooldownMs: 320,
      maxRangePx: 620,
    };
    spec.player.canShoot = true;
    expect(isSpecSafe(spec)).toBe(true);
  });

  it("accepts a legacy rush spec with its locked door", () => {
    const pickup: GameEntitySpec = {
      id: "c1",
      mechanic: "collectible",
      bounds: { x: 500, y: 780, width: 34, height: 34 },
    };
    const spec = baseSpec("rush", [platformEntity, pickup, goalEntity]);
    spec.rush = { requiredCollectibles: 1, timeLimitSeconds: 60 };
    expect(isSpecSafe(spec)).toBe(true);
  });

  it("accepts a legacy skyfall spec with a door and no survive timer", () => {
    const spec = baseSpec("skyfall", [platformEntity, goalEntity]);
    spec.skyfall = {
      label: "staplers",
      intervalMs: 1700,
      fallSpeed: 240,
      maxConcurrent: 4,
      componentIds: [],
    };
    expect(isSpecSafe(spec)).toBe(true);
  });

  it("rejects a door-less skyfall spec without a survive timer", () => {
    const spec = baseSpec("skyfall", [platformEntity]);
    spec.skyfall = {
      label: "staplers",
      intervalMs: 1700,
      fallSpeed: 240,
      maxConcurrent: 4,
      componentIds: [],
    };
    expect(isSpecSafe(spec)).toBe(false);
  });

  it("rejects a door win condition without a goal entity", () => {
    expect(isSpecSafe(baseSpec("classic", [platformEntity]))).toBe(false);
  });
});
