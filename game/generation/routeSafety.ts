import {
  COLLECTIBLE_SIZE,
  GROUND_TOP,
  MIN_LANDING_WIDTH,
  PLAYER_HEIGHT,
  SAFE_MAX_UPWARD_DELTA,
} from "@/game/constants";
import type { GameEntitySpec, Rect } from "@/game/types";
import { clamp } from "./normalizeObjects";
import { createRng, hashSeed, type Rng } from "./rng";
import {
  computeReachability,
  type PlatformNode,
  type ReachabilityResult,
} from "./validateReachability";

/**
 * A hazard occludes a landing when it covers the space a player occupies
 * while standing on the surface: anything from just below the surface up to
 * roughly player height above it.
 */
const OCCLUSION_ABOVE = 60;
const OCCLUSION_BELOW = 8;

/**
 * Vertical envelope inside which a jump can grab a pickup hovering over a
 * standable surface: player height plus the validated jump rise.
 */
const PICKUP_REACH_ABOVE = PLAYER_HEIGHT + SAFE_MAX_UPWARD_DELTA;

function overlaps(a: Rect, b: Rect, pad = 0): boolean {
  return (
    a.x - pad < b.x + b.width &&
    b.x - pad < a.x + a.width &&
    a.y - pad < b.y + b.height &&
    b.y - pad < a.y + a.height
  );
}

function occludesLanding(node: PlatformNode, hazard: GameEntitySpec): boolean {
  const bounds = hazard.bounds;
  const horizontal = bounds.x < node.right && bounds.x + bounds.width > node.left;
  const vertical =
    bounds.y < node.top + OCCLUSION_BELOW &&
    bounds.y + bounds.height > node.top - OCCLUSION_ABOVE;
  return horizontal && vertical;
}

/** True when the node keeps a hazard-free strip wide enough to land on. */
export function hasSafeLanding(
  node: PlatformNode,
  hazards: GameEntitySpec[],
): boolean {
  const occluding = hazards
    .filter((hazard) => occludesLanding(node, hazard))
    .sort((a, b) => a.bounds.x - b.bounds.x);

  let cursor = node.left;
  let widest = 0;
  for (const hazard of occluding) {
    widest = Math.max(widest, hazard.bounds.x - cursor);
    cursor = Math.max(cursor, hazard.bounds.x + hazard.bounds.width);
  }
  widest = Math.max(widest, node.right - cursor);
  return widest >= MIN_LANDING_WIDTH;
}

function occludedWidth(node: PlatformNode, hazard: GameEntitySpec): number {
  const left = Math.max(node.left, hazard.bounds.x);
  const right = Math.min(node.right, hazard.bounds.x + hazard.bounds.width);
  return Math.max(0, right - left);
}

/**
 * The reachability BFS is hazard-blind, so a hazard sitting on the only route
 * platform makes a level "reachable" but lethal to land on. Convert the fewest
 * hazards needed to restore a safe landing strip on every reachable platform.
 * Ground-level hazards are handled separately by the corridor pass.
 */
export function clearRouteHazards(
  entities: GameEntitySpec[],
  actions: string[],
): GameEntitySpec[] {
  const reachability = computeReachability(entities);
  const routeNodes = reachability.nodes.filter(
    (node) => node.mechanic !== "ground" && reachability.reachable.has(node.id),
  );
  if (routeNodes.length === 0) return entities;

  const demoted = new Set<string>();
  const liveHazards = () =>
    entities.filter(
      (entity) => entity.mechanic === "hazard" && !demoted.has(entity.id),
    );

  for (const node of routeNodes) {
    if (hasSafeLanding(node, liveHazards())) continue;
    const occluding = liveHazards()
      .filter((hazard) => occludesLanding(node, hazard))
      .sort((a, b) => occludedWidth(node, b) - occludedWidth(node, a));
    for (const hazard of occluding) {
      demoted.add(hazard.id);
      if (hasSafeLanding(node, liveHazards())) break;
    }
  }
  if (demoted.size === 0) return entities;

  actions.push(
    `Converted ${demoted.size} hazard(s) blocking route platforms into collectibles`,
  );
  return entities.map((entity) => {
    if (!demoted.has(entity.id)) return entity;
    return {
      ...entity,
      mechanic: "collectible" as const,
      bounds: {
        x: entity.bounds.x,
        y: clamp(entity.bounds.y, 40, GROUND_TOP - COLLECTIBLE_SIZE - 8),
        width: COLLECTIBLE_SIZE,
        height: COLLECTIBLE_SIZE,
      },
    };
  });
}

/**
 * True when the pickup hovers over some reachable surface closely enough for
 * a jump to grab it. Photo-derived pickups can otherwise float far above the
 * jump apex, which permanently bricks rush runs.
 */
export function isCollectibleReachable(
  entity: GameEntitySpec,
  reachability: ReachabilityResult,
): boolean {
  const bounds = entity.bounds;
  const bottom = bounds.y + bounds.height;
  return reachability.nodes.some((node) => {
    if (!reachability.reachable.has(node.id)) return false;
    const horizontal =
      bounds.x < node.right + 20 && bounds.x + bounds.width > node.left - 20;
    const rise = node.top - bottom;
    return horizontal && rise >= 0 && rise <= PICKUP_REACH_ABOVE;
  });
}

function findSpotOnNodes(
  rng: Rng,
  entity: GameEntitySpec,
  nodes: PlatformNode[],
  blockers: GameEntitySpec[],
): Rect | undefined {
  const { width, height } = entity.bounds;
  for (const node of rng.shuffle(nodes)) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const minX = node.left + 14;
      const maxX = node.right - width - 14;
      if (maxX <= minX) break;
      const candidate: Rect = {
        x: rng.int(Math.round(minX), Math.round(maxX)),
        y: clamp(node.top - height - 12, 30, node.top - height),
        width,
        height,
      };
      const collides = blockers.some(
        (blocker) =>
          blocker.id !== entity.id && overlaps(candidate, blocker.bounds, 10),
      );
      if (!collides) return candidate;
    }
  }
  return undefined;
}

/**
 * Relocates pickups and portals that no jump can reach onto reachable
 * surfaces; drops them when no spot fits. Each entity uses its own derived
 * rng stream so relocation never perturbs the run's mode/title randomness.
 */
export function fixUnreachableCollectibles(
  seed: number,
  entities: GameEntitySpec[],
  reachability: ReachabilityResult,
  actions: string[],
): GameEntitySpec[] {
  const nodes = reachability.nodes.filter((node) =>
    reachability.reachable.has(node.id),
  );
  if (nodes.length === 0) return entities;

  let current = [...entities];
  let relocated = 0;
  let dropped = 0;
  let portalPairBroken = false;

  for (const entity of entities) {
    if (entity.mechanic !== "collectible" && entity.mechanic !== "portal") {
      continue;
    }
    if (isCollectibleReachable(entity, reachability)) continue;

    const rng = createRng(hashSeed(String(seed), entity.id));
    const spot = findSpotOnNodes(rng, entity, nodes, current);
    const index = current.findIndex((candidate) => candidate.id === entity.id);
    if (index < 0) continue;
    if (spot) {
      current[index] = { ...entity, bounds: spot };
      relocated += 1;
    } else {
      current.splice(index, 1);
      dropped += 1;
      if (entity.mechanic === "portal") portalPairBroken = true;
    }
  }

  // Portals only work in pairs; a broken pair takes its partner with it.
  if (portalPairBroken) {
    const orphans = current.filter((entity) => entity.mechanic === "portal");
    if (orphans.length > 0 && orphans.length !== 2) {
      current = current.filter((entity) => entity.mechanic !== "portal");
      dropped += orphans.length;
    }
  }

  if (relocated > 0) {
    actions.push(`Moved ${relocated} out-of-reach pickup(s) onto the route`);
  }
  if (dropped > 0) {
    actions.push(`Removed ${dropped} pickup(s) that no jump could reach`);
  }
  return current;
}
