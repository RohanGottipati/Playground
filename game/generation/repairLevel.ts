import {
  GROUND_TOP,
  MAX_HELPER_PLATFORMS,
  MAX_PLATFORM_WIDTH,
  MIN_LANDING_WIDTH,
  MIN_PLATFORM_HEIGHT,
  MOVING_PLATFORM_MAX_DISTANCE,
  MOVING_PLATFORM_MIN_DISTANCE,
  SAFE_MAX_HORIZONTAL_GAP,
  SAFE_MAX_UPWARD_DELTA,
  WORLD_WIDTH,
} from "@/game/constants";
import type { GameEntitySpec } from "@/game/types";
import { clamp } from "./normalizeObjects";
import {
  canJump,
  computeReachability,
  isStandable,
  type PlatformNode,
  toPlatformNode,
} from "./validateReachability";

export type RepairResult = {
  entities: GameEntitySpec[];
  actions: string[];
  repaired: boolean;
};

const MAX_ITERATIONS = 14;
const MAX_SHIFT = 260;

function nodeOf(entity: GameEntitySpec): PlatformNode {
  return toPlatformNode(entity);
}

function label(entity: GameEntitySpec): string {
  return entity.sourceLabel ?? entity.id;
}

/**
 * Makes standable platforms reachable using the least intrusive change first:
 * widen, move, convert to moving platform, convert a support to a bounce pad,
 * then finally insert a helper platform.
 */
export function repairLevel(input: GameEntitySpec[]): RepairResult {
  let entities = input.map((entity) => ({ ...entity, bounds: { ...entity.bounds } }));
  const actions: string[] = [];
  const abandoned = new Set<string>();
  let helperCount = 0;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
    const reachability = computeReachability(entities);
    const targets = entities.filter(
      (entity) =>
        isStandable(entity) &&
        !reachability.reachable.has(entity.id) &&
        !abandoned.has(entity.id),
    );
    if (targets.length === 0) break;

    const reachableNodes = reachability.nodes.filter((node) =>
      reachability.reachable.has(node.id),
    );
    if (reachableNodes.length === 0) break;

    const target = targets
      .map((entity) => ({
        entity,
        distance: Math.min(
          ...reachableNodes.map((node) => nodeDistance(node, nodeOf(entity))),
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0].entity;

    const from = reachableNodes.reduce((best, node) =>
      nodeDistance(node, nodeOf(target)) < nodeDistance(best, nodeOf(target))
        ? node
        : best,
    );

    const outcome = repairOne(entities, target, from, helperCount);
    if (outcome) {
      entities = outcome.entities;
      actions.push(outcome.action);
      if (outcome.addedHelper) helperCount += 1;
    } else {
      abandoned.add(target.id);
    }
  }

  return { entities, actions, repaired: actions.length > 0 };
}

function nodeDistance(a: PlatformNode, b: PlatformNode): number {
  const dx = Math.max(0, Math.max(a.left - b.right, b.left - a.right));
  const dy = Math.abs(a.top - b.top);
  return Math.hypot(dx, dy);
}

type SingleRepair = {
  entities: GameEntitySpec[];
  action: string;
  addedHelper: boolean;
};

function repairOne(
  entities: GameEntitySpec[],
  target: GameEntitySpec,
  from: PlatformNode,
  helperCount: number,
): SingleRepair | undefined {
  const index = entities.findIndex((entity) => entity.id === target.id);
  if (index < 0) return undefined;

  const widened = widen(target, from);
  if (widened) {
    const next = replace(entities, index, widened.entity);
    if (canJump(from, nodeOf(widened.entity))) {
      return { entities: next, action: widened.action, addedHelper: false };
    }
  }

  const moved = move(target, from);
  if (moved && canJump(from, nodeOf(moved.entity))) {
    return {
      entities: replace(entities, index, moved.entity),
      action: moved.action,
      addedHelper: false,
    };
  }

  const moving = toMovingPlatform(target, from);
  if (moving && canJump(from, nodeOf(moving.entity))) {
    return {
      entities: replace(entities, index, moving.entity),
      action: moving.action,
      addedHelper: false,
    };
  }

  const bounced = convertSupportToBouncePad(entities, target, from);
  if (bounced) return bounced;

  if (helperCount < MAX_HELPER_PLATFORMS) {
    const helper = createHelperPlatform(from, nodeOf(target), helperCount);
    if (canJump(from, nodeOf(helper)) && canJump(nodeOf(helper), nodeOf(target))) {
      return {
        entities: [...entities, helper],
        action: `Added one helper platform between ${from.id} and ${label(target)}`,
        addedHelper: true,
      };
    }
  }

  return undefined;
}

function replace(
  entities: GameEntitySpec[],
  index: number,
  entity: GameEntitySpec,
): GameEntitySpec[] {
  const next = [...entities];
  next[index] = entity;
  return next;
}

function widen(
  target: GameEntitySpec,
  from: PlatformNode,
): { entity: GameEntitySpec; action: string } | undefined {
  const bounds = target.bounds;
  if (bounds.width >= MAX_PLATFORM_WIDTH) return undefined;
  const extension = Math.min(
    MAX_PLATFORM_WIDTH - bounds.width,
    SAFE_MAX_HORIZONTAL_GAP,
  );
  if (extension <= 0) return undefined;

  const fromIsLeft = from.right <= bounds.x;
  const x = fromIsLeft
    ? clamp(bounds.x - extension, 0, WORLD_WIDTH)
    : bounds.x;
  const width = clamp(
    bounds.width + extension,
    MIN_LANDING_WIDTH,
    MAX_PLATFORM_WIDTH,
  );

  return {
    entity: {
      ...target,
      bounds: { ...bounds, x: clamp(x, 0, WORLD_WIDTH - width), width },
    },
    action: `Widened ${label(target)} platform by ${Math.round(extension)} pixels`,
  };
}

function move(
  target: GameEntitySpec,
  from: PlatformNode,
): { entity: GameEntitySpec; action: string } | undefined {
  const bounds = target.bounds;
  const fromCenter = (from.left + from.right) / 2;
  const targetCenter = bounds.x + bounds.width / 2;
  const dx = clamp(fromCenter - targetCenter, -MAX_SHIFT, MAX_SHIFT) * 0.6;

  const desiredTop = clamp(
    from.top - SAFE_MAX_UPWARD_DELTA * 0.8,
    60,
    GROUND_TOP - bounds.height - 8,
  );
  const dy = clamp(desiredTop - bounds.y, -MAX_SHIFT, MAX_SHIFT);

  if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return undefined;

  return {
    entity: {
      ...target,
      bounds: {
        ...bounds,
        x: clamp(bounds.x + dx, 0, WORLD_WIDTH - bounds.width),
        y: clamp(bounds.y + dy, 40, GROUND_TOP - bounds.height - 8),
      },
    },
    action: `Moved ${label(target)} platform by ${Math.round(Math.hypot(dx, dy))} pixels`,
  };
}

function toMovingPlatform(
  target: GameEntitySpec,
  from: PlatformNode,
): { entity: GameEntitySpec; action: string } | undefined {
  if (target.mechanic === "moving_platform") return undefined;
  const node = nodeOf(target);
  const horizontalGapToFrom = Math.max(
    0,
    Math.max(from.left - node.right, node.left - from.right),
  );
  const axis: "x" | "y" = horizontalGapToFrom > 0 ? "x" : "y";
  const distance = clamp(
    axis === "x" ? horizontalGapToFrom + 60 : Math.abs(from.top - node.top) + 40,
    MOVING_PLATFORM_MIN_DISTANCE,
    MOVING_PLATFORM_MAX_DISTANCE,
  );
  const bounds = { ...target.bounds };
  if (axis === "x" && from.right < node.left) {
    bounds.x = clamp(bounds.x - distance, 0, WORLD_WIDTH - bounds.width);
  }

  return {
    entity: {
      ...target,
      mechanic: "moving_platform",
      bounds,
      movement: { axis, distance, speed: 70 },
    },
    action: `Converted ${label(target)} into a moving platform to close a gap`,
  };
}

function convertSupportToBouncePad(
  entities: GameEntitySpec[],
  target: GameEntitySpec,
  from: PlatformNode,
): SingleRepair | undefined {
  if (from.mechanic === "bounce_pad") return undefined;
  const index = entities.findIndex((entity) => entity.id === from.id);
  if (index < 0) return undefined;
  const support = entities[index];
  if (support.mechanic !== "static_platform") return undefined;

  const converted: GameEntitySpec = {
    ...support,
    mechanic: "bounce_pad",
    bounds: {
      ...support.bounds,
      height: Math.max(MIN_PLATFORM_HEIGHT, Math.min(support.bounds.height, 40)),
    },
    movement: undefined,
  };
  if (!canJump(nodeOf(converted), nodeOf(target))) return undefined;

  return {
    entities: replace(entities, index, converted),
    action: `Converted ${label(support)} into a bounce pad to reach ${label(target)}`,
    addedHelper: false,
  };
}

function createHelperPlatform(
  from: PlatformNode,
  to: PlatformNode,
  helperIndex: number,
): GameEntitySpec {
  const width = 120;
  const fromCenter = (from.left + from.right) / 2;
  const toCenter = (to.left + to.right) / 2;
  const centerX = (fromCenter + toCenter) / 2;
  const centerY = (from.top + to.top) / 2;

  return {
    id: `helper-${helperIndex + 1}`,
    mechanic: "static_platform",
    bounds: {
      x: clamp(centerX - width / 2, 0, WORLD_WIDTH - width),
      y: clamp(centerY, 60, GROUND_TOP - MIN_PLATFORM_HEIGHT - 8),
      width,
      height: MIN_PLATFORM_HEIGHT,
    },
    metadata: { generated: true, role: "helper" },
  };
}
