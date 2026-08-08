import { describe, expect, it } from "vitest";
import {
  MAX_PLATFORM_WIDTH,
  MIN_PLATFORM_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "@/game/constants";
import { assignMechanics, mechanicForObject } from "@/game/generation/assignMechanics";
import { calculateDifficulty } from "@/game/generation/difficulty";
import { generateLevel } from "@/game/generation/generateLevel";
import { clamp, normalizeObjects } from "@/game/generation/normalizeObjects";
import { isSpecSafe } from "@/game/generation/runtimeSafety";
import {
  canJump,
  computeReachability,
  groundNode,
  toPlatformNode,
} from "@/game/generation/validateReachability";
import {
  resolveEntityVisual,
  selectEntityVisualKind,
} from "@/game/art/selectVisual";
import type { GameEntitySpec } from "@/game/types";
import { clutteredScene, deskScene } from "./fixtures/scenes";

describe("clamp", () => {
  it("bounds values and rejects NaN", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(Number.NaN, 0, 1)).toBe(0);
  });
});

describe("normalizeObjects", () => {
  it("keeps every object inside the world", () => {
    for (const object of normalizeObjects(clutteredScene)) {
      expect(object.bounds.x).toBeGreaterThanOrEqual(0);
      expect(object.bounds.y).toBeGreaterThanOrEqual(0);
      expect(object.bounds.x + object.bounds.width).toBeLessThanOrEqual(WORLD_WIDTH);
      expect(object.bounds.y + object.bounds.height).toBeLessThanOrEqual(WORLD_HEIGHT);
    }
  });

  it("deduplicates overlapping objects with the same label", () => {
    const labels = normalizeObjects(clutteredScene).map((object) => object.label);
    expect(labels.filter((label) => label === "plate")).toHaveLength(1);
  });

  it("sorts objects left to right", () => {
    const xs = normalizeObjects(deskScene).map((object) => object.bounds.x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
  });
});

describe("mechanic mapping", () => {
  it("maps roles deterministically", () => {
    const [first] = normalizeObjects(deskScene);
    expect(mechanicForObject(first)).toBe(mechanicForObject(first));
  });

  it("clamps platform widths", () => {
    for (const entity of assignMechanics(normalizeObjects(clutteredScene))) {
      if (entity.mechanic !== "static_platform") continue;
      expect(entity.bounds.width).toBeGreaterThanOrEqual(MIN_PLATFORM_WIDTH);
      expect(entity.bounds.width).toBeLessThanOrEqual(MAX_PLATFORM_WIDTH);
    }
  });

  it("never emits a single unpaired portal", () => {
    const portals = assignMechanics(normalizeObjects(clutteredScene)).filter(
      (entity) => entity.mechanic === "portal",
    );
    expect(portals.length === 0 || portals.length === 2).toBe(true);
  });
});

describe("object-aware visual mapping", () => {
  const entity = (
    sourceLabel: string,
    mechanic: GameEntitySpec["mechanic"],
    properties = "",
  ): GameEntitySpec => ({
    id: `visual-${sourceLabel}`,
    sourceLabel,
    mechanic,
    bounds: { x: 100, y: 100, width: 120, height: 36 },
    metadata: { properties },
  });

  it("uses recognizable photographed-object art before generic fallbacks", () => {
    expect(selectEntityVisualKind(entity("notebook", "static_platform", "flat,rigid"))).toBe("book-platform");
    expect(selectEntityVisualKind(entity("yellow pencil", "static_platform", "long,thin"))).toBe("pencil-bridge");
    expect(selectEntityVisualKind(entity("water bottle", "static_platform", "tall,container"))).toBe("bottle-tower");
    expect(selectEntityVisualKind(entity("coffee mug", "bounce_pad", "round,hollow"))).toBe("mug-bouncer");
    expect(selectEntityVisualKind(entity("scissors", "hazard", "sharp,rigid"))).toBe("scissors");
    expect(selectEntityVisualKind(entity("eraser", "collectible", "small,soft"))).toBe("eraser");
  });

  it("falls back safely for unknown labels and legacy specs", () => {
    expect(selectEntityVisualKind(entity("mystery object", "hazard"))).toBe("spike-strip");
    expect(resolveEntityVisual(entity("mystery object", "collectible"))).toEqual({
      kind: "gem",
      componentId: "collectible-gem",
    });
  });

  it("prioritizes the final mechanic after repair conversions", () => {
    expect(selectEntityVisualKind(entity("scissors", "collectible", "sharp,rigid"))).toBe("gem");
  });

  it("preserves an exact stored object component across supported mechanics", () => {
    const mirror = entity("mirror", "collectible");
    mirror.visual = { kind: "gem", componentId: "fur-mirror" };
    expect(resolveEntityVisual(mirror)).toEqual({
      kind: "gem",
      componentId: "fur-mirror",
    });
  });
});

describe("reachability", () => {
  const platform = (x: number, y: number, width = 160) =>
    toPlatformNode({
      id: `p-${x}-${y}`,
      mechanic: "static_platform",
      bounds: { x, y, width, height: 26 },
    });

  it("allows a short, low hop", () => {
    expect(canJump(groundNode(), platform(200, 720))).toBe(true);
  });

  it("rejects an impossible gap", () => {
    expect(canJump(platform(100, 700), platform(1200, 300))).toBe(false);
  });

  it("finds nodes reachable through a chain", () => {
    const entities = [
      { id: "a", mechanic: "static_platform" as const, bounds: { x: 200, y: 720, width: 160, height: 26 } },
      { id: "b", mechanic: "static_platform" as const, bounds: { x: 400, y: 620, width: 160, height: 26 } },
      { id: "c", mechanic: "static_platform" as const, bounds: { x: 1500, y: 120, width: 160, height: 26 } },
    ];
    const result = computeReachability(entities);
    expect(result.reachable.has("a")).toBe(true);
    expect(result.reachable.has("b")).toBe(true);
    expect(result.reachable.has("c")).toBe(false);
  });
});

describe("generateLevel", () => {
  it("is deterministic for the same analysis", () => {
    const first = generateLevel(deskScene, { imageUrl: "https://example.test/a.jpg" });
    const second = generateLevel(deskScene, { imageUrl: "https://example.test/a.jpg" });
    expect(JSON.stringify(second)).toEqual(JSON.stringify(first));
  });

  it("produces a safe, reachable, goal-bearing spec", () => {
    const spec = generateLevel(deskScene, { imageUrl: "https://example.test/a.jpg" });
    expect(isSpecSafe(spec)).toBe(true);
    expect(spec.visualVersion).toBe(1);
    expect(spec.entities.every((entity) => entity.visual?.kind)).toBe(true);
    expect(spec.entities.every((entity) => entity.visual?.componentId)).toBe(true);
    expect(
      spec.entities
        .filter((entity) => entity.sourceLabel)
        .map((entity) => entity.visual?.componentId),
    ).toEqual([
      "stat-notebook",
      "kit-mug",
      "stat-pencil",
      "stat-scissors",
      "stat-eraser",
    ]);
    expect(spec.validation.reachable).toBe(true);
    expect(spec.entities.filter((entity) => entity.mechanic === "goal")).toHaveLength(1);
  });

  it("survives a degenerate, cluttered scene", () => {
    const spec = generateLevel(clutteredScene, { imageUrl: "https://example.test/b.jpg" });
    expect(isSpecSafe(spec)).toBe(true);
    expect(spec.difficulty).toBeGreaterThanOrEqual(1);
    expect(spec.difficulty).toBeLessThanOrEqual(5);
  });

  it("records any repairs it applied", () => {
    const spec = generateLevel(clutteredScene, { imageUrl: "https://example.test/b.jpg" });
    if (spec.validation.repaired) {
      expect(spec.validation.repairActions.length).toBeGreaterThan(0);
    }
  });
});

describe("calculateDifficulty", () => {
  it("returns a rating between 1 and 5", () => {
    const spec = generateLevel(deskScene, { imageUrl: "https://example.test/a.jpg" });
    const goal = spec.entities.find((entity) => entity.mechanic === "goal");
    expect(goal).toBeDefined();
    if (!goal) return;
    const report = calculateDifficulty(spec.entities, goal);
    expect(report.difficulty).toBeGreaterThanOrEqual(1);
    expect(report.difficulty).toBeLessThanOrEqual(5);
  });
});
