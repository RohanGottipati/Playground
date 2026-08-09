import { withResolvedVisual } from "@/game/art/selectVisual";
import { defaultComponentIndex } from "@/game/components/selectComponent";
import {
  GOAL_HEIGHT,
  GOAL_WIDTH,
  GRAVITY_Y,
  JUMP_VELOCITY,
  MOVE_SPEED,
  PROJECTILE_COOLDOWN_MS,
  PROJECTILE_MAX_RANGE,
  PROJECTILE_SPEED,
  TARGET_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "@/game/constants";
import { createRng, hashSeed } from "@/game/generation/rng";
import {
  canJump,
  groundNode,
  toPlatformNode,
} from "@/game/generation/validateReachability";
import type { GameEntitySpec, GameSpec, ProjectileSpec } from "@/game/types";

export const TEMPLATE_PIPELINE_VERSION = 2;

export const BASE_CONTROLS = [
  "Move: A / D or arrow keys (on-screen buttons on mobile)",
  "Jump: W, ↑ or Space",
  "Restart: R",
];

export const SHOOT_CONTROL = "Shoot: X or F (Shoot button on mobile)";

export function shooterControls(): string[] {
  return [...BASE_CONTROLS, SHOOT_CONTROL];
}

export function baseWorld(): GameSpec["world"] {
  return { width: WORLD_WIDTH, height: WORLD_HEIGHT, gravityY: GRAVITY_Y };
}

export function basePlayer(
  overrides: Partial<GameSpec["player"]> = {},
): GameSpec["player"] {
  return {
    spawnX: 90,
    spawnY: 740,
    moveSpeed: MOVE_SPEED,
    jumpVelocity: JUMP_VELOCITY,
    maxJumps: 1,
    ...overrides,
  };
}

export function platform(
  id: string,
  label: string | undefined,
  x: number,
  y: number,
  width: number,
): GameEntitySpec {
  return {
    id,
    sourceLabel: label,
    mechanic: "static_platform",
    bounds: { x, y, width, height: 26 },
  };
}

export function collectible(
  id: string,
  label: string | undefined,
  x: number,
  y: number,
): GameEntitySpec {
  return {
    id,
    sourceLabel: label,
    mechanic: "collectible",
    bounds: { x, y, width: 34, height: 34 },
  };
}

export function groundHazard(
  id: string,
  label: string | undefined,
  x: number,
  width = 110,
): GameEntitySpec {
  return {
    id,
    sourceLabel: label,
    mechanic: "hazard",
    bounds: { x, y: 800, width, height: 30 },
  };
}

export function bouncePad(
  id: string,
  label: string | undefined,
  x: number,
  y: number,
  width = 90,
): GameEntitySpec {
  return {
    id,
    sourceLabel: label,
    mechanic: "bounce_pad",
    bounds: { x, y, width, height: 50 },
  };
}

export function movingPlat(
  id: string,
  label: string | undefined,
  x: number,
  y: number,
  width: number,
  movement: { axis: "x" | "y"; distance: number; speed: number },
): GameEntitySpec {
  return {
    id,
    sourceLabel: label,
    mechanic: "moving_platform",
    bounds: { x, y, width, height: 26 },
    movement,
  };
}

/** Standable cover block sized so gauntlet volleys smash against it. */
export function coverBlock(
  id: string,
  label: string | undefined,
  x: number,
  width: number,
): GameEntitySpec {
  return {
    id,
    sourceLabel: label,
    mechanic: "static_platform",
    bounds: { x, y: 766, width, height: 64 },
  };
}

/** Shooter drone pinned above a standable support the player can reach. */
export function target(
  id: string,
  sprite: { label: string; componentId: string } | undefined,
  x: number,
  y: number,
  supportId: string,
): GameEntitySpec {
  return {
    id,
    sourceLabel: sprite?.label,
    mechanic: "target",
    bounds: { x, y, width: TARGET_SIZE, height: TARGET_SIZE },
    visual: sprite
      ? { kind: "drone-target", componentId: sprite.componentId }
      : { kind: "drone-target" },
    metadata: { supportId },
  };
}

export function goalDoor(
  id: string,
  x: number,
  y: number,
  supportId: string,
): GameEntitySpec {
  return {
    id,
    mechanic: "goal",
    bounds: { x, y, width: GOAL_WIDTH, height: GOAL_HEIGHT },
    visual: { kind: "exit-door", componentId: "mechanic-exit-door" },
    metadata: { supportId },
  };
}

export function finishFlag(
  id: string,
  x: number,
  y: number,
  supportId = "ground",
): GameEntitySpec {
  return {
    id,
    mechanic: "goal",
    bounds: { x, y, width: GOAL_WIDTH, height: GOAL_HEIGHT },
    visual: { kind: "exit-door", componentId: "decor-finish-flag" },
    metadata: { supportId },
  };
}

/** A pickup floating just above a platform's top, always in jump reach. */
export function collectibleOver(
  id: string,
  label: string | undefined,
  platformEntity: GameEntitySpec,
  offsetX = 0,
): GameEntitySpec {
  const { bounds } = platformEntity;
  return collectible(
    id,
    label,
    bounds.x + Math.round(bounds.width / 2) - 17 + offsetX,
    bounds.y - 60,
  );
}

export function shooterPlayer(): GameSpec["player"] {
  return basePlayer({ canShoot: true });
}

export function baseProjectile(
  label: string,
  componentId: string | undefined,
  overrides: Partial<Omit<ProjectileSpec, "label" | "componentId">> = {},
): ProjectileSpec {
  return {
    label,
    componentId,
    speed: PROJECTILE_SPEED,
    cooldownMs: PROJECTILE_COOLDOWN_MS,
    maxRangePx: PROJECTILE_MAX_RANGE,
    ...overrides,
  };
}

/**
 * A run of platforms climbing left to right. Each step's jump is verified
 * against the real reachability envelope at build time, so an impossible
 * staircase throws in tests instead of shipping.
 */
export function staircase(
  idPrefix: string,
  nextLabel: (slot: number) => string,
  options: {
    startX: number;
    startY: number;
    steps: number;
    rise: number;
    gap: number;
    width: number;
    /** Per-step width override, when a run should narrow near the top. */
    widths?: number[];
  },
): GameEntitySpec[] {
  const { startX, startY, steps, rise, gap, width, widths } = options;
  const platforms: GameEntitySpec[] = [];
  let x = startX;
  let y = startY;
  for (let step = 0; step < steps; step += 1) {
    const stepWidth = widths?.[step] ?? width;
    platforms.push(
      platform(`${idPrefix}-${step + 1}`, nextLabel(step), x, y, stepWidth),
    );
    x += stepWidth + gap;
    y -= rise;
  }
  assertChainJumpable(idPrefix, platforms);
  return platforms;
}

/**
 * Build-time guard: every consecutive pair in the chain (and ground → first
 * entry) must pass the conservative canJump test used by the validator.
 */
export function assertChainJumpable(
  context: string,
  chain: GameEntitySpec[],
): void {
  const nodes = [groundNode(), ...chain.map(toPlatformNode)];
  for (let i = 1; i < nodes.length; i += 1) {
    if (!canJump(nodes[i - 1], nodes[i])) {
      throw new Error(
        `template ${context}: jump ${nodes[i - 1].id} → ${nodes[i].id} is outside the safe envelope`,
      );
    }
  }
}

/** Cycles the photo's labels across a template's fixed slots. */
export function labelCycler(labels: readonly string[]): (slot: number) => string {
  const pool = labels.length > 0 ? labels : ["object"];
  return (slot) => pool[slot % pool.length];
}

/**
 * Resolves every entity's visual against the bundled component files with a
 * per-entity seeded rng: deterministic for a stored seed, varied across runs.
 */
export function resolveTemplateVisuals(
  entities: GameEntitySpec[],
  seed: number,
): GameEntitySpec[] {
  return entities.map((entity) =>
    withResolvedVisual(
      entity,
      defaultComponentIndex,
      createRng(hashSeed(String(seed), "visual", entity.id)),
    ),
  );
}

export function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function baseValidation(
  estimatedOptimalTimeSeconds: number,
): GameSpec["validation"] {
  return {
    reachable: true,
    repaired: false,
    repairActions: [],
    estimatedOptimalTimeSeconds,
    pipelineVersion: TEMPLATE_PIPELINE_VERSION,
  };
}
