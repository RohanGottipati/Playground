import {
  COLLECTIBLE_SIZE,
  PROJECTILE_COOLDOWN_MS,
  PROJECTILE_MAX_RANGE,
  PROJECTILE_SPEED,
  SKYFALL_MAX_CONCURRENT,
  TARGET_SIZE,
  WORLD_WIDTH,
} from "@/game/constants";
import type {
  GameEntitySpec,
  GameMode,
  ProjectileSpec,
  Rect,
  ShooterSpec,
  SkyfallSpec,
} from "@/game/types";
import { resolveEntityVisual } from "@/game/art/selectVisual";
import { selectComponentForEntity } from "@/game/components/selectComponent";
import type { Pace } from "./hints";
import { clamp, type NormalizedObject } from "./normalizeObjects";
import type { Rng } from "./rng";
import type { ReachabilityResult, PlatformNode } from "./validateReachability";

export type ModeApplication = {
  entities: GameEntitySpec[];
  canShoot: boolean;
  projectile?: ProjectileSpec;
  shooter?: ShooterSpec;
  skyfall?: SkyfallSpec;
  /** Collectibles required to unlock the goal in rush mode. */
  rushRequiredCollectibles?: number;
  actions: string[];
};

const AMMO_WORDS = [
  "donut",
  "doughnut",
  "ball",
  "coin",
  "cookie",
  "apple",
  "orange",
  "egg",
  "dice",
  "cap",
  "ring",
  "bagel",
  "cupcake",
  "marble",
];

function nounOf(label: string): string {
  const words = label.toLowerCase().split(/\s+/).filter(Boolean);
  return words[words.length - 1] ?? "object";
}

function plural(noun: string): string {
  if (/(s|x|z|ch|sh)$/i.test(noun)) return `${noun}es`;
  if (/[^aeiou]y$/i.test(noun)) return `${noun.slice(0, -1)}ies`;
  return `${noun}s`;
}

function overlaps(a: Rect, b: Rect, pad = 0): boolean {
  return (
    a.x - pad < b.x + b.width &&
    b.x - pad < a.x + a.width &&
    a.y - pad < b.y + b.height &&
    b.y - pad < a.y + a.height
  );
}

function componentIdForLabel(
  label: string,
  fallback: string | undefined,
): string | undefined {
  try {
    return selectComponentForEntity(
      {
        id: `probe-${label}`,
        sourceLabel: label,
        mechanic: "collectible",
        bounds: { x: 0, y: 0, width: 32, height: 32 },
      },
      "coin",
    ).id;
  } catch {
    return fallback;
  }
}

/** Ammo prefers a real round object from the photo, falling back to donuts. */
function pickAmmo(
  rng: Rng,
  objects: NormalizedObject[],
): { label: string; componentId?: string } {
  const candidates = objects.filter((object) => {
    const noun = nounOf(object.label);
    return (
      AMMO_WORDS.some((word) => noun.includes(word)) ||
      (object.properties.includes("round") &&
        (object.properties.includes("small") ||
          object.properties.includes("rollable")))
    );
  });
  if (candidates.length > 0) {
    const chosen = rng.pick(candidates);
    const label = nounOf(chosen.label);
    return { label, componentId: componentIdForLabel(chosen.label, "food-donut") };
  }
  return { label: "donut", componentId: "food-donut" };
}

function reachableNodes(reachability: ReachabilityResult): PlatformNode[] {
  return reachability.nodes.filter((node) => reachability.reachable.has(node.id));
}

/**
 * Hover height keeps a drone hittable by a straight shot fired from a player
 * standing on its supporting surface (projectiles leave at chest height).
 */
const TARGET_HOVER_ABOVE_SURFACE = 30;

function placeTargets(
  rng: Rng,
  entities: GameEntitySpec[],
  reachability: ReachabilityResult,
  count: number,
  goal: GameEntitySpec | undefined,
  actions: string[],
): GameEntitySpec[] {
  // Drones kill on contact, so they only hover over wide surfaces where the
  // player has room to stop and shoot instead of landing into them.
  const nodes = reachableNodes(reachability).filter(
    (node) => node.mechanic === "ground" || node.right - node.left >= 220,
  );
  if (nodes.length === 0) return entities;

  const placed: GameEntitySpec[] = [];
  const blockers = [...entities];
  const orderedNodes = rng.shuffle(nodes);

  for (let index = 0; index < count; index += 1) {
    const node = orderedNodes[index % orderedNodes.length];
    let position: Rect | undefined;

    for (let attempt = 0; attempt < 10 && !position; attempt += 1) {
      const minX = Math.max(node.left + 40, 380);
      const maxX = Math.min(node.right - TARGET_SIZE - 40, WORLD_WIDTH - 80);
      if (maxX <= minX) break;
      const candidate: Rect = {
        x: rng.int(Math.round(minX), Math.round(maxX)),
        y: clamp(
          node.top - TARGET_HOVER_ABOVE_SURFACE - TARGET_SIZE / 2,
          40,
          node.top - TARGET_SIZE / 2,
        ),
        width: TARGET_SIZE,
        height: TARGET_SIZE,
      };
      const collides =
        blockers.some((entity) => overlaps(candidate, entity.bounds, 14)) ||
        (goal ? overlaps(candidate, goal.bounds, 60) : false) ||
        placed.some((target) => overlaps(candidate, target.bounds, 90));
      if (!collides) position = candidate;
    }

    if (!position) continue;
    const target: GameEntitySpec = {
      id: `target-${placed.length + 1}`,
      mechanic: "target",
      bounds: position,
      visual: { kind: "drone-target" },
      metadata: { generated: true, supportId: node.id },
    };
    placed.push(target);
    blockers.push(target);
  }

  if (placed.length > 0) {
    actions.push(`Deployed ${placed.length} hoverable drone target(s)`);
  }
  return [...entities, ...placed];
}

function placeRushCollectibles(
  rng: Rng,
  entities: GameEntitySpec[],
  reachability: ReachabilityResult,
  desiredTotal: number,
  actions: string[],
): GameEntitySpec[] {
  const existing = entities.filter((entity) => entity.mechanic === "collectible");
  const needed = Math.max(0, desiredTotal - existing.length);
  if (needed === 0) return entities;

  const nodes = reachableNodes(reachability);
  if (nodes.length === 0) return entities;

  const added: GameEntitySpec[] = [];
  const blockers = [...entities];
  const orderedNodes = rng.shuffle(nodes);

  for (let index = 0; index < needed; index += 1) {
    const node = orderedNodes[index % orderedNodes.length];
    let position: Rect | undefined;

    for (let attempt = 0; attempt < 10 && !position; attempt += 1) {
      const minX = node.left + 14;
      const maxX = node.right - COLLECTIBLE_SIZE - 14;
      if (maxX <= minX) break;
      const candidate: Rect = {
        x: rng.int(Math.round(minX), Math.round(maxX)),
        y: clamp(node.top - COLLECTIBLE_SIZE - 12, 30, node.top - COLLECTIBLE_SIZE),
        width: COLLECTIBLE_SIZE,
        height: COLLECTIBLE_SIZE,
      };
      const collides =
        blockers.some((entity) => overlaps(candidate, entity.bounds, 10)) ||
        added.some((pickup) => overlaps(candidate, pickup.bounds, 48));
      if (!collides) position = candidate;
    }

    if (!position) continue;
    const pickup: GameEntitySpec = {
      id: `rush-pickup-${added.length + 1}`,
      mechanic: "collectible",
      bounds: position,
      metadata: { generated: true, rush: true, supportId: node.id },
    };
    added.push(pickup);
    blockers.push(pickup);
  }

  if (added.length > 0) {
    actions.push(`Scattered ${added.length} rush collectible(s) along the route`);
  }
  return [...entities, ...added];
}

function buildSkyfall(
  rng: Rng,
  entities: GameEntitySpec[],
  pace: Pace,
): SkyfallSpec {
  const sourced = entities.filter((entity) => entity.sourceLabel);
  const componentIds = [
    ...new Set(
      sourced
        .map((entity) => resolveEntityVisual(entity).componentId)
        .filter((id): id is string => Boolean(id)),
    ),
  ].slice(0, 4);

  const label = plural(
    nounOf(sourced.length > 0 ? rng.pick(sourced).sourceLabel ?? "object" : "object"),
  );

  const tuning: Record<Pace, { intervalMs: number; fallSpeed: number; maxConcurrent: number }> = {
    gentle: { intervalMs: 2400, fallSpeed: 190, maxConcurrent: 3 },
    standard: { intervalMs: 1700, fallSpeed: 240, maxConcurrent: 4 },
    spicy: { intervalMs: 1150, fallSpeed: 300, maxConcurrent: SKYFALL_MAX_CONCURRENT },
  };
  const base = tuning[pace];
  const jitter = 1 + (rng.next() - 0.5) * 0.3;

  return {
    label,
    intervalMs: Math.round(base.intervalMs * jitter),
    fallSpeed: Math.round(base.fallSpeed * (2 - jitter)),
    maxConcurrent: base.maxConcurrent,
    componentIds,
  };
}

/**
 * Mutates a validated, reachable level into this run's game mode. Only adds
 * floating entities or configuration — never moves platforms — so the
 * already-validated route to the goal stays intact.
 */
export function applyGameMode(
  mode: GameMode,
  entities: GameEntitySpec[],
  objects: NormalizedObject[],
  rng: Rng,
  pace: Pace,
  reachability: ReachabilityResult,
): ModeApplication {
  const actions: string[] = [];
  const goal = entities.find((entity) => entity.mechanic === "goal");

  switch (mode) {
    case "shooter": {
      const targetCount = pace === "gentle" ? 2 : pace === "spicy" ? 4 : 3;
      const withTargets = placeTargets(
        rng,
        entities,
        reachability,
        targetCount,
        goal,
        actions,
      );
      const placedCount = withTargets.filter(
        (entity) => entity.mechanic === "target",
      ).length;
      if (placedCount === 0) {
        // No room for targets: degrade to classic rather than ship a locked goal.
        actions.push("No space for drone targets; fell back to classic mode");
        return { entities, canShoot: false, actions };
      }
      const ammo = pickAmmo(rng, objects);
      return {
        entities: withTargets,
        canShoot: true,
        projectile: {
          label: ammo.label,
          componentId: ammo.componentId,
          speed: PROJECTILE_SPEED,
          cooldownMs: PROJECTILE_COOLDOWN_MS,
          maxRangePx: PROJECTILE_MAX_RANGE,
        },
        shooter: { requiredKills: placedCount },
        actions,
      };
    }

    case "skyfall":
      return {
        entities,
        canShoot: false,
        skyfall: buildSkyfall(rng, entities, pace),
        actions,
      };

    case "rush": {
      const desiredTotal = pace === "gentle" ? 4 : pace === "spicy" ? 8 : 6;
      const withPickups = placeRushCollectibles(
        rng,
        entities,
        reachability,
        desiredTotal,
        actions,
      );
      const total = withPickups.filter(
        (entity) => entity.mechanic === "collectible",
      ).length;
      if (total === 0) {
        actions.push("No room for rush collectibles; fell back to classic mode");
        return { entities, canShoot: false, actions };
      }
      return {
        entities: withPickups,
        canShoot: false,
        rushRequiredCollectibles: total,
        actions,
      };
    }

    case "classic":
    default:
      return { entities, canShoot: false, actions };
  }
}

/** Resolves the mode actually in effect after degradations. */
export function effectiveMode(mode: GameMode, application: ModeApplication): GameMode {
  if (mode === "shooter" && !application.shooter) return "classic";
  if (mode === "rush" && application.rushRequiredCollectibles == null) return "classic";
  return mode;
}
