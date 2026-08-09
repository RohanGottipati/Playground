import {
  COLLECTIBLE_SIZE,
  GOAL_HEIGHT,
  GOAL_WIDTH,
  GRAVITY_Y,
  GROUND_TOP,
  JUMP_VELOCITY,
  MIN_GROUND_HAZARD_GAP,
  MIN_PLATFORM_HEIGHT,
  MOVE_SPEED,
  PLAYER_HEIGHT,
  RUSH_MIN_TIME_LIMIT_S,
  RUSH_TIME_PER_COLLECTIBLE_S,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "@/game/constants";
import type { GameEntitySpec, GameMode, GameSpec, Rect } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import { assignMechanics } from "./assignMechanics";
import { calculateDifficulty } from "./difficulty";
import { EMPTY_HINTS, paceForMode, type GenerationHints } from "./hints";
import { applyGameMode, effectiveMode } from "./modes";
import { clamp, normalizeObjects } from "./normalizeObjects";
import { repairLevel } from "./repairLevel";
import { createRng, hashSeed } from "./rng";
import {
  clearRouteHazards,
  fixUnreachableCollectibles,
  hasSafeLanding,
  isCollectibleReachable,
} from "./routeSafety";
import { buildRules } from "./rules";
import { selectGameMode } from "./selectMode";
import { generateTitle } from "./title";
import {
  computeReachability,
  farthestReachableNode,
  GROUND_NODE_ID,
  isStandable,
  toPlatformNode,
  type PlatformNode,
} from "./validateReachability";
import { assertSpecIsSafe } from "./runtimeSafety";
import type { WinCondition } from "./winCondition";
import { withResolvedVisual } from "@/game/art/selectVisual";
import {
  createComponentIndex,
  defaultComponentIndex,
} from "@/game/components/selectComponent";
import type { ComponentCatalogEntry } from "@/game/components/types";

export const SPAWN_X = 90;
export const SPAWN_Y = GROUND_TOP - PLAYER_HEIGHT;
const SPAWN_CLEARANCE = 200;

export type GenerateLevelOptions = {
  imageUrl: string;
  slug?: string;
  titleOverride?: string;
  /**
   * Seed for this run's mode, title and layout accents. Defaults to a stable
   * hash of the image URL so the same call stays deterministic; the generate
   * API passes a fresh random seed to make every run unique.
   */
  seed?: number;
  /** Learning signals from previous runs; absent means no adjustments. */
  hints?: GenerationHints;
  /**
   * Component rows fetched from the component_catalog table; absent falls
   * back to the bundled catalog. Only affects which enabled components can be
   * selected — the stored spec keeps its componentIds forever either way.
   */
  catalog?: readonly ComponentCatalogEntry[];
  /** QA override: skip the seeded mode roll. Never set in production flows. */
  forceMode?: GameMode;
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
 * Deterministic for a given (analysis, options) pair — including the seed —
 * so published games always replay exactly as previewed.
 */
export function generateLevel(
  analysis: SceneAnalysis,
  options: GenerateLevelOptions,
): GameSpec {
  const seed = options.seed ?? hashSeed(options.imageUrl, analysis.titleSuggestion);
  const rng = createRng(seed);
  const hints = options.hints ?? EMPTY_HINTS;
  const componentIndex = options.catalog
    ? createComponentIndex(options.catalog)
    : defaultComponentIndex;

  const objects = normalizeObjects(analysis);
  const repairActions: string[] = [];

  let entities = assignMechanics(objects);
  entities = clearSpawnArea(entities, repairActions);
  entities = enforceGroundHazardCorridors(entities, repairActions);
  entities = liftCollectiblesOutOfPlatforms(entities);
  entities = ensureSparseCourse(entities, repairActions);

  const repair = repairLevel(entities);
  entities = repair.entities;
  repairActions.push(...repair.actions);

  // The reachability BFS is hazard-blind: clear lethal landings and stranded
  // pickups before trusting its verdict.
  entities = clearRouteHazards(entities, repairActions);
  const reachability = computeReachability(entities);
  entities = fixUnreachableCollectibles(seed, entities, reachability, repairActions);

  const unreachablePlatforms = entities.filter(
    (entity) => isStandable(entity) && !reachability.reachable.has(entity.id),
  );
  if (unreachablePlatforms.length > 0) {
    repairActions.push(
      `Left ${unreachablePlatforms.length} decorative platform(s) off the main route`,
    );
  }

  // Pick this run's game mode, then decorate the already-validated level.
  // Mode application only ever adds floating entities or configuration, so
  // the verified routes cannot break afterwards.
  const requestedMode = options.forceMode ?? selectGameMode(rng, objects, hints);
  const pace = paceForMode(hints, requestedMode);
  const application = applyGameMode(
    requestedMode,
    entities,
    objects,
    rng,
    pace,
    computeReachability(entities),
    componentIndex,
  );
  entities = application.entities;
  repairActions.push(...application.actions);
  const mode = effectiveMode(requestedMode, application);

  // Only classic runs end at an exit door; every other mode wins through its
  // own objective. Shooter/rush degradations resolve to classic above, so a
  // degraded run still gets its door here.
  const finalReachability = computeReachability(entities);
  const farNode = farthestReachableNode(finalReachability, {
    excludeMoving: true,
  });
  let goal: GameEntitySpec | undefined;
  if (mode === "classic") {
    goal = createGoal(homeAnchoredNode(entities, farNode));
    entities = removeHazardsAround(entities, goal.bounds, repairActions);
    entities = [...entities, goal];
  }

  // Difficulty measures the trek to the far anchor even when no door spawns.
  const difficultyAnchor = goal ?? createGoal(homeAnchoredNode(entities, farNode));
  const difficultyReport = calculateDifficulty(entities, difficultyAnchor);
  // Per-entity derived rng: picks stay deterministic for a stored seed while
  // varying between runs, without perturbing the mode/title rng stream.
  entities = entities.map((entity) =>
    withResolvedVisual(
      entity,
      componentIndex,
      createRng(hashSeed(String(seed), "visual", entity.id)),
    ),
  );

  const collectibleCount = entities.filter(
    (entity) => entity.mechanic === "collectible",
  ).length;
  const targetCount = entities.filter(
    (entity) => entity.mechanic === "target",
  ).length;

  const rush =
    mode === "rush" && application.rushRequiredCollectibles != null
      ? {
          requiredCollectibles: application.rushRequiredCollectibles,
          timeLimitSeconds: Math.max(
            RUSH_MIN_TIME_LIMIT_S,
            Math.round(
              difficultyReport.estimatedOptimalTimeSeconds * 3 +
                application.rushRequiredCollectibles * RUSH_TIME_PER_COLLECTIBLE_S,
            ),
          ),
        }
      : undefined;

  const winCondition: WinCondition = goal
    ? "door"
    : mode === "shooter"
      ? "destroy_all"
      : mode === "rush"
        ? "collect_all"
        : mode === "skyfall"
          ? "survive"
          : "door";

  const objectLabels = objects.map((object) => object.label);
  const rules = buildRules({
    mode,
    winCondition,
    objectLabels,
    collectibleCount,
    targetCount,
    ammoLabel: application.projectile?.label,
    skyfallLabel: application.skyfall?.label,
    rushTimeLimitSeconds: rush?.timeLimitSeconds,
    surviveSeconds: application.skyfall?.surviveSeconds,
  });

  const title =
    options.titleOverride ??
    generateTitle(
      rng,
      mode,
      objects,
      application.projectile?.label,
      hints.recentTitles,
    );

  const spec: GameSpec = {
    schemaVersion: 1,
    visualVersion: 1,
    title: title.slice(0, 60),
    slug: options.slug,
    theme: analysis.themeSuggestion,
    difficulty: difficultyReport.difficulty,
    mode,
    seed,
    rules,
    projectile: application.projectile,
    skyfall: application.skyfall,
    shooter: application.shooter,
    rush,
    world: { width: WORLD_WIDTH, height: WORLD_HEIGHT, gravityY: GRAVITY_Y },
    player: {
      spawnX: SPAWN_X,
      spawnY: SPAWN_Y,
      moveSpeed: MOVE_SPEED,
      jumpVelocity: JUMP_VELOCITY,
      maxJumps: 1,
      canShoot: application.canShoot,
    },
    entities,
    validation: {
      reachable: computeSpecReachable(mode, entities, goal),
      repaired: repairActions.length > 0,
      repairActions,
      estimatedOptimalTimeSeconds: difficultyReport.estimatedOptimalTimeSeconds,
      pipelineVersion: 2,
    },
    source: {
      imageUrl: options.imageUrl,
      detectedObjectCount: objects.length,
    },
  };

  assertSpecIsSafe(spec);
  return spec;
}

const MIN_COURSE_PLATFORMS = 2;
// Helper heights stay well inside the validated jump envelope (max up 104px).
const SPARSE_HELPER_PAIRS: Rect[][] = [
  [
    { x: 300, y: GROUND_TOP - 95, width: 190, height: MIN_PLATFORM_HEIGHT },
    { x: 560, y: GROUND_TOP - 190, width: 190, height: MIN_PLATFORM_HEIGHT },
  ],
  [
    { x: 880, y: GROUND_TOP - 95, width: 190, height: MIN_PLATFORM_HEIGHT },
    { x: 1140, y: GROUND_TOP - 190, width: 190, height: MIN_PLATFORM_HEIGHT },
  ],
];

/**
 * A single photographed object is a valid input. Add neutral scaffolding only
 * when the detected mechanics cannot provide a short platforming route alone.
 */
function ensureSparseCourse(
  input: GameEntitySpec[],
  actions: string[],
): GameEntitySpec[] {
  const standableCount = input.filter(isStandable).length;
  const needed = Math.max(0, MIN_COURSE_PLATFORMS - standableCount);
  if (needed === 0) return input;

  const availablePair =
    SPARSE_HELPER_PAIRS.find((pair) =>
      pair.every((bounds) =>
        input.every((entity) => !overlaps(bounds, padded(entity.bounds, 18))),
      ),
    ) ?? SPARSE_HELPER_PAIRS[0];

  const helpers = availablePair.slice(0, needed).map((bounds, index) => ({
    id: `sparse-helper-${index + 1}`,
    mechanic: "static_platform" as const,
    bounds: { ...bounds },
    metadata: {
      generated: true,
      role: "helper",
      sparseCourse: true,
    },
  }));

  actions.push(
    `Added ${helpers.length} helper platform${helpers.length === 1 ? "" : "s"} for a sparse photo`,
  );
  return [...input, ...helpers];
}

function padded(bounds: Rect, amount: number): Rect {
  return {
    x: bounds.x - amount,
    y: bounds.y - amount,
    width: bounds.width + amount * 2,
    height: bounds.height + amount * 2,
  };
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

const GROUND_HAZARD_BAND = 60;

/**
 * The BFS route check treats the ground as one walkable node, so a wall of
 * ground hazards used to make levels technically "reachable" but practically
 * impossible. Enforce jumpable spacing between ground-level hazards and lift
 * the extras into collectibles.
 */
function enforceGroundHazardCorridors(
  entities: GameEntitySpec[],
  actions: string[],
): GameEntitySpec[] {
  const grounded = entities
    .filter(
      (entity) =>
        entity.mechanic === "hazard" &&
        entity.bounds.y + entity.bounds.height >= GROUND_TOP - GROUND_HAZARD_BAND,
    )
    .sort((a, b) => a.bounds.x - b.bounds.x);
  if (grounded.length <= 1) return entities;

  const demoted = new Set<string>();
  let lastKeptRight = Number.NEGATIVE_INFINITY;
  for (const hazard of grounded) {
    if (hazard.bounds.x - lastKeptRight < MIN_GROUND_HAZARD_GAP) {
      demoted.add(hazard.id);
      continue;
    }
    lastKeptRight = hazard.bounds.x + hazard.bounds.width;
  }
  if (demoted.size === 0) return entities;

  actions.push(
    `Converted ${demoted.size} crowded ground hazard(s) into collectibles to keep the route clear`,
  );
  return entities.map((entity) => {
    if (!demoted.has(entity.id)) return entity;
    return {
      ...entity,
      mechanic: "collectible" as const,
      bounds: {
        x: entity.bounds.x,
        y: clamp(
          entity.bounds.y - COLLECTIBLE_SIZE,
          40,
          GROUND_TOP - COLLECTIBLE_SIZE - 8,
        ),
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

/**
 * A y-moving platform's node top is its travel apex, so anything pinned there
 * floats above the platform most of the time. Anchor to the home bounds when
 * the fallback anchor is a moving platform.
 */
function homeAnchoredNode(
  entities: GameEntitySpec[],
  node: PlatformNode | undefined,
): PlatformNode | undefined {
  if (!node || node.mechanic !== "moving_platform") return node;
  const entity = entities.find((candidate) => candidate.id === node.id);
  if (!entity) return node;
  return toPlatformNode({ ...entity, movement: undefined });
}

/**
 * Genuine completability verdict for the finished level. Replaces a literal
 * `true` that shipped unreachable levels; assertSpecIsSafe enforces it for
 * pipeline-v2 specs.
 */
function computeSpecReachable(
  mode: GameMode,
  entities: GameEntitySpec[],
  goal: GameEntitySpec | undefined,
): boolean {
  const reachability = computeReachability(entities);
  const hazards = entities.filter((entity) => entity.mechanic === "hazard");

  if (mode === "classic" && !goal) return false;
  if (goal) {
    const supportId = String(goal.metadata?.supportId ?? GROUND_NODE_ID);
    const support = reachability.nodes.find((node) => node.id === supportId);
    if (!support || !reachability.reachable.has(support.id)) return false;
    if (!hasSafeLanding(support, hazards)) return false;
  }

  if (mode === "rush") {
    const stranded = entities
      .filter((entity) => entity.mechanic === "collectible")
      .some((entity) => !isCollectibleReachable(entity, reachability));
    if (stranded) return false;
  }

  if (mode === "shooter") {
    const targets = entities.filter((entity) => entity.mechanic === "target");
    if (targets.length === 0) return false;
    const unsupported = targets.some(
      (target) =>
        !reachability.reachable.has(String(target.metadata?.supportId ?? "")),
    );
    if (unsupported) return false;
  }

  if (mode === "skyfall" && reachability.reachable.size === 0) return false;
  return true;
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
