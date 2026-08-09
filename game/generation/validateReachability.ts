import {
  GROUND_TOP,
  MIN_LANDING_WIDTH,
  SAFE_MAX_DOWNWARD_DELTA,
  SAFE_MAX_HORIZONTAL_GAP,
  SAFE_MAX_UPWARD_DELTA,
  WORLD_WIDTH,
} from "@/game/constants";
import type { GameEntitySpec, MechanicType } from "@/game/types";

export const GROUND_NODE_ID = "ground";

export type PlatformNode = {
  id: string;
  /** Left edge of the standable surface, including movement range. */
  left: number;
  /** Right edge of the standable surface, including movement range. */
  right: number;
  /** Highest standable surface height (smallest y). */
  top: number;
  /** Lowest standable surface height, for vertically moving platforms. */
  bottom: number;
  width: number;
  mechanic: MechanicType | "ground";
};

const STANDABLE: MechanicType[] = [
  "static_platform",
  "moving_platform",
  "bounce_pad",
];

export function isStandable(entity: GameEntitySpec): boolean {
  return STANDABLE.includes(entity.mechanic);
}

export function toPlatformNode(entity: GameEntitySpec): PlatformNode {
  const { bounds, movement } = entity;
  const left = bounds.x;
  let right = bounds.x + bounds.width;
  let top = bounds.y;
  let bottom = bounds.y;

  if (movement) {
    if (movement.axis === "x") {
      right += movement.distance;
    } else {
      top -= movement.distance / 2;
      bottom += movement.distance / 2;
    }
  }

  return {
    id: entity.id,
    left,
    right,
    top,
    bottom,
    width: bounds.width,
    mechanic: entity.mechanic,
  };
}

export function groundNode(): PlatformNode {
  return {
    id: GROUND_NODE_ID,
    left: 0,
    right: WORLD_WIDTH,
    top: GROUND_TOP,
    bottom: GROUND_TOP,
    width: WORLD_WIDTH,
    mechanic: "ground",
  };
}

export function buildPlatformNodes(entities: GameEntitySpec[]): PlatformNode[] {
  return [groundNode(), ...entities.filter(isStandable).map(toPlatformNode)];
}

export function horizontalGap(a: PlatformNode, b: PlatformNode): number {
  if (a.right >= b.left && b.right >= a.left) return 0;
  return b.left > a.right ? b.left - a.right : a.left - b.right;
}

/** Conservative single-jump test between two standable surfaces. */
export function canJump(a: PlatformNode, b: PlatformNode): boolean {
  if (a.id === b.id) return false;
  if (b.width < MIN_LANDING_WIDTH && b.mechanic !== "ground") return false;

  const gap = horizontalGap(a, b);
  const upwardDelta = a.top - b.top; // positive when b is higher
  const bounce = a.mechanic === "bounce_pad";
  // 2.2 × 104 ≈ 229px, safely inside the ~290px bounce apex.
  const maxUp = bounce ? SAFE_MAX_UPWARD_DELTA * 2.2 : SAFE_MAX_UPWARD_DELTA;

  if (upwardDelta > 0) {
    if (upwardDelta > maxUp) return false;
    const allowance = SAFE_MAX_HORIZONTAL_GAP * (bounce ? 1.2 : 1) *
      (1 - Math.min(0.6, upwardDelta / (maxUp * 1.5)));
    return gap <= allowance;
  }

  const downwardDelta = b.top - a.top;
  if (downwardDelta > SAFE_MAX_DOWNWARD_DELTA) return false;
  return gap <= SAFE_MAX_HORIZONTAL_GAP * 1.4;
}

export type ReachabilityResult = {
  nodes: PlatformNode[];
  reachable: Set<string>;
  /** Shortest jump count from the spawn platform, per node id. */
  jumpsFromSpawn: Map<string, number>;
};

export function computeReachability(
  entities: GameEntitySpec[],
  startNodeId: string = GROUND_NODE_ID,
): ReachabilityResult {
  const nodes = buildPlatformNodes(entities);
  const reachable = new Set<string>();
  const jumpsFromSpawn = new Map<string, number>();
  const start = nodes.find((node) => node.id === startNodeId) ?? nodes[0];
  if (!start) return { nodes, reachable, jumpsFromSpawn };

  const queue: PlatformNode[] = [start];
  reachable.add(start.id);
  jumpsFromSpawn.set(start.id, 0);

  while (queue.length > 0) {
    const current = queue.shift() as PlatformNode;
    const depth = jumpsFromSpawn.get(current.id) ?? 0;
    for (const candidate of nodes) {
      if (reachable.has(candidate.id)) continue;
      if (!canJump(current, candidate)) continue;
      reachable.add(candidate.id);
      jumpsFromSpawn.set(candidate.id, depth + 1);
      queue.push(candidate);
    }
  }

  return { nodes, reachable, jumpsFromSpawn };
}

/** Farthest reachable node, preferring distance to the right then height. */
export function farthestReachableNode(
  result: ReachabilityResult,
  options?: { excludeMoving?: boolean },
): PlatformNode | undefined {
  let reachableNodes = result.nodes.filter((node) =>
    result.reachable.has(node.id),
  );
  if (options?.excludeMoving) {
    // A goal pinned to a moving platform floats away from it for most of the
    // oscillation, so prefer a static anchor whenever one is reachable.
    const staticNodes = reachableNodes.filter(
      (node) => node.mechanic !== "moving_platform",
    );
    if (staticNodes.length > 0) reachableNodes = staticNodes;
  }
  if (reachableNodes.length === 0) return undefined;
  return reachableNodes.reduce((best, node) => {
    const bestScore = best.right * 1.0 + (GROUND_TOP - best.top) * 0.8;
    const nodeScore = node.right * 1.0 + (GROUND_TOP - node.top) * 0.8;
    return nodeScore > bestScore ? node : best;
  });
}
