import {
  MOVING_PLATFORM_MAX_DISTANCE,
  MOVING_PLATFORM_MAX_SPEED,
} from "@/game/constants";
import type { GameSpec } from "@/game/types";
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
