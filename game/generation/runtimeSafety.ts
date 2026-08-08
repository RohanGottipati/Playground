import {
  MOVING_PLATFORM_MAX_DISTANCE,
  MOVING_PLATFORM_MAX_SPEED,
} from "@/game/constants";
import type { GameSpec } from "@/game/types";
import { isEntityVisualKind } from "@/game/art/selectVisual";
import { isSelectableEntityComponent } from "@/game/components/selectComponent";
import { AppError } from "@/lib/errors/AppError";
import { isStandable } from "./validateReachability";

export type SafetyIssue = string;

/** Cheap invariants checked before a level is stored or handed to Phaser. */
export function collectSafetyIssues(spec: GameSpec): SafetyIssue[] {
  const issues: SafetyIssue[] = [];

  if (spec.entities.length === 0) issues.push("level has no entities");
  if (!spec.entities.some(isStandable)) {
    issues.push("level has no standable platform");
  }

  const goals = spec.entities.filter((entity) => entity.mechanic === "goal");
  if (goals.length !== 1) issues.push(`expected exactly one goal, found ${goals.length}`);

  const portals = spec.entities.filter((entity) => entity.mechanic === "portal");
  if (portals.length !== 0 && portals.length !== 2) {
    issues.push(`portal count must be 0 or 2, found ${portals.length}`);
  }

  // Mode invariants: a locked goal must always be unlockable.
  const targets = spec.entities.filter((entity) => entity.mechanic === "target");
  const collectibles = spec.entities.filter(
    (entity) => entity.mechanic === "collectible",
  );
  if (spec.shooter) {
    if (targets.length === 0) {
      issues.push("shooter mode requires at least one target");
    }
    if (spec.shooter.requiredKills > targets.length) {
      issues.push("shooter requires more kills than targets exist");
    }
    if (!spec.player.canShoot || !spec.projectile) {
      issues.push("shooter mode requires a shooting player and projectile spec");
    }
  } else if (targets.length > 0 && spec.mode !== "shooter") {
    issues.push("targets exist without a shooter configuration");
  }
  if (spec.projectile) {
    const { speed, cooldownMs, maxRangePx } = spec.projectile;
    if (
      ![speed, cooldownMs, maxRangePx].every(
        (value) => Number.isFinite(value) && value > 0,
      )
    ) {
      issues.push("projectile configuration has non-positive values");
    }
  }
  if (spec.rush) {
    if (spec.rush.requiredCollectibles > collectibles.length) {
      issues.push("rush requires more collectibles than exist in the level");
    }
    if (
      !Number.isFinite(spec.rush.timeLimitSeconds) ||
      spec.rush.timeLimitSeconds < 20
    ) {
      issues.push("rush time limit is too short to be completable");
    }
  }
  if (spec.skyfall) {
    const { intervalMs, fallSpeed, maxConcurrent } = spec.skyfall;
    if (intervalMs < 700) issues.push("skyfall interval is unfairly fast");
    if (fallSpeed <= 0 || fallSpeed > 420) {
      issues.push("skyfall speed is outside the dodgeable range");
    }
    if (maxConcurrent < 1 || maxConcurrent > 8) {
      issues.push("skyfall concurrency is outside the allowed range");
    }
  }

  if (
    !Number.isFinite(spec.player.spawnX) ||
    !Number.isFinite(spec.player.spawnY) ||
    spec.player.spawnX < 0 ||
    spec.player.spawnY < 0 ||
    spec.player.spawnX > spec.world.width ||
    spec.player.spawnY > spec.world.height
  ) {
    issues.push("player spawn is outside the world bounds");
  }

  for (const entity of spec.entities) {
    const { x, y, width, height } = entity.bounds;
    if (![x, y, width, height].every(Number.isFinite)) {
      issues.push(`${entity.id} has non-finite bounds`);
    }
    if (width <= 0 || height <= 0) {
      issues.push(`${entity.id} has non-positive dimensions`);
    }
    if (x < -width || y < -height || x > spec.world.width || y > spec.world.height) {
      issues.push(`${entity.id} is outside the world bounds`);
    }
    if (entity.movement) {
      const { distance, speed } = entity.movement;
      if (
        !Number.isFinite(distance) ||
        !Number.isFinite(speed) ||
        distance <= 0 ||
        speed <= 0 ||
        distance > MOVING_PLATFORM_MAX_DISTANCE ||
        speed > MOVING_PLATFORM_MAX_SPEED
      ) {
        issues.push(`${entity.id} has movement values outside the allowed range`);
      }
    }
    if (entity.visual && !isEntityVisualKind(entity.visual.kind)) {
      issues.push(`${entity.id} has an unsupported visual kind`);
    }
    if (
      entity.visual?.componentId &&
      !isSelectableEntityComponent(entity.visual.componentId, entity.mechanic)
    ) {
      issues.push(`${entity.id} has an incompatible component id`);
    }
  }

  return issues;
}

export function assertSpecIsSafe(spec: GameSpec): void {
  const issues = collectSafetyIssues(spec);
  if (issues.length > 0) {
    throw new AppError("LEVEL_GENERATION_FAILED", issues.join("; "), issues);
  }
}

export function isSpecSafe(spec: GameSpec): boolean {
  return collectSafetyIssues(spec).length === 0;
}
