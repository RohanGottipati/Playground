import {
  COLLECTIBLE_SIZE,
  GOAL_HEIGHT,
  GOAL_WIDTH,
  GRAVITY_Y,
  GROUND_TOP,
  JUMP_VELOCITY,
  MOVE_SPEED,
  PLAYER_HEIGHT,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "@/game/constants";
import type { GameEntitySpec, GameSpec, Rect } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import { assignMechanics } from "./assignMechanics";
import { calculateDifficulty } from "./difficulty";
import { clamp, normalizeObjects } from "./normalizeObjects";
import { repairLevel } from "./repairLevel";
import {
  computeReachability,
  farthestReachableNode,
  GROUND_NODE_ID,
  isStandable,
  type PlatformNode,
} from "./validateReachability";
import { assertSpecIsSafe } from "./runtimeSafety";
import { withResolvedVisual } from "@/game/art/selectVisual";

export const SPAWN_X = 90;
export const SPAWN_Y = GROUND_TOP - PLAYER_HEIGHT;
const SPAWN_CLEARANCE = 200;

export type GenerateLevelOptions = {
  imageUrl: string;
  slug?: string;
  titleOverride?: string;
};

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

/**
 * Converts a validated scene analysis into a playable, validated GameSpec.
 * Every step is deterministic: the same analysis always yields the same level.
 */
export function generateLevel(
  analysis: SceneAnalysis,
  options: GenerateLevelOptions,
): GameSpec {
  const objects = normalizeObjects(analysis);
  const repairActions: string[] = [];

  let entities = assignMechanics(objects);
  entities = clearSpawnArea(entities, repairActions);
  entities = liftCollectiblesOutOfPlatforms(entities);

  const repair = repairLevel(entities);
  entities = repair.entities;
  repairActions.push(...repair.actions);

  const reachability = computeReachability(entities);
  const goalNode = farthestReachableNode(reachability);
  const goal = createGoal(goalNode);
  entities = removeHazardsAround(entities, goal.bounds, repairActions);
  entities = [...entities, goal];

  const unreachablePlatforms = entities.filter(
    (entity) => isStandable(entity) && !reachability.reachable.has(entity.id),
  );
  if (unreachablePlatforms.length > 0) {
    repairActions.push(
      `Left ${unreachablePlatforms.length} decorative platform(s) off the main route`,
    );
  }

  const difficultyReport = calculateDifficulty(entities, goal);
  entities = entities.map(withResolvedVisual);

  const spec: GameSpec = {
    schemaVersion: 1,
    visualVersion: 1,
    title: (options.titleOverride ?? analysis.titleSuggestion).slice(0, 60),
    slug: options.slug,
    theme: analysis.themeSuggestion,
    difficulty: difficultyReport.difficulty,
    world: { width: WORLD_WIDTH, height: WORLD_HEIGHT, gravityY: GRAVITY_Y },
    player: {
      spawnX: SPAWN_X,
      spawnY: SPAWN_Y,
      moveSpeed: MOVE_SPEED,
      jumpVelocity: JUMP_VELOCITY,
      maxJumps: 1,
    },
    entities,
    validation: {
      reachable: true,
      repaired: repairActions.length > 0,
      repairActions,
      estimatedOptimalTimeSeconds: difficultyReport.estimatedOptimalTimeSeconds,
    },
    source: {
      imageUrl: options.imageUrl,
      detectedObjectCount: objects.length,
    },
  };

  assertSpecIsSafe(spec);
  return spec;
}

/** Hazards must never sit on top of the spawn point. */
function clearSpawnArea(
  entities: GameEntitySpec[],
  actions: string[],
): GameEntitySpec[] {
  const spawnRect: Rect = {
    x: 0,
    y: GROUND_TOP - SPAWN_CLEARANCE,
    width: SPAWN_X + SPAWN_CLEARANCE,
    height: SPAWN_CLEARANCE + 40,
  };

  return entities.map((entity) => {
    if (entity.mechanic !== "hazard") return entity;
    if (!overlaps(entity.bounds, spawnRect)) return entity;
    actions.push(
      `Converted ${entity.sourceLabel ?? entity.id} hazard near the spawn into a collectible`,
    );
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

function liftCollectiblesOutOfPlatforms(
  entities: GameEntitySpec[],
): GameEntitySpec[] {
  const platforms = entities.filter(isStandable);
  return entities.map((entity) => {
    if (entity.mechanic !== "collectible" && entity.mechanic !== "portal") {
      return entity;
    }
    const blocking = platforms.find((platform) =>
      overlaps(entity.bounds, platform.bounds),
    );
    if (!blocking) return entity;
    return {
      ...entity,
      bounds: {
        ...entity.bounds,
        y: clamp(
          blocking.bounds.y - entity.bounds.height - 6,
          20,
          GROUND_TOP - entity.bounds.height,
        ),
      },
    };
  });
}

function removeHazardsAround(
  entities: GameEntitySpec[],
  goalBounds: Rect,
  actions: string[],
): GameEntitySpec[] {
  const safeZone: Rect = {
    x: goalBounds.x - 40,
    y: goalBounds.y - 40,
    width: goalBounds.width + 80,
    height: goalBounds.height + 80,
  };
  return entities.filter((entity) => {
    if (entity.mechanic !== "hazard") return true;
    if (!overlaps(entity.bounds, safeZone)) return true;
    actions.push(
      `Removed ${entity.sourceLabel ?? entity.id} hazard overlapping the goal`,
    );
    return false;
  });
}

function createGoal(node: PlatformNode | undefined): GameEntitySpec {
  const supportId = node?.id ?? GROUND_NODE_ID;
  const surfaceTop = node?.top ?? GROUND_TOP;
  // Movement ranges widen a node; anchor the goal to the platform's start.
  const left = node?.left ?? WORLD_WIDTH - 200;
  const width = node ? Math.max(node.width, GOAL_WIDTH) : GOAL_WIDTH;
  const centerX = left + width / 2;

  return {
    id: "goal",
    mechanic: "goal",
    bounds: {
      x: clamp(centerX - GOAL_WIDTH / 2, 0, WORLD_WIDTH - GOAL_WIDTH),
      y: clamp(surfaceTop - GOAL_HEIGHT, 10, GROUND_TOP - GOAL_HEIGHT),
      width: GOAL_WIDTH,
      height: GOAL_HEIGHT,
    },
    metadata: { supportId, generated: true },
  };
}
