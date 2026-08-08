import { GROUND_TOP, MOVE_SPEED, WORLD_WIDTH } from "@/game/constants";
import type { GameEntitySpec } from "@/game/types";
import { computeReachability, isStandable } from "./validateReachability";

export type DifficultyReport = {
  difficulty: 1 | 2 | 3 | 4 | 5;
  score: number;
  estimatedOptimalTimeSeconds: number;
  jumpCount: number;
};

/**
 * Deterministic difficulty from level geometry, never from AI output.
 */
export function calculateDifficulty(
  entities: GameEntitySpec[],
  goal: GameEntitySpec,
): DifficultyReport {
  const reachability = computeReachability(entities);
  const platforms = entities.filter(isStandable);
  const hazardCount = entities.filter((e) => e.mechanic === "hazard").length;
  const movingPlatformCount = entities.filter(
    (e) => e.mechanic === "moving_platform",
  ).length;
  const portalCount = entities.filter((e) => e.mechanic === "portal").length;
  const collectibleCount = entities.filter(
    (e) => e.mechanic === "collectible",
  ).length;

  const goalNodeId = String(goal.metadata?.supportId ?? "ground");
  const jumpCount = reachability.jumpsFromSpawn.get(goalNodeId) ?? platforms.length;

  const gaps = platforms.map((platform) => platform.bounds.width);
  const averageWidth =
    gaps.length > 0 ? gaps.reduce((sum, w) => sum + w, 0) / gaps.length : 200;
  const normalizedGapDifficulty = Math.min(
    1,
    Math.max(0, (260 - averageWidth) / 260),
  );

  const highestTop = platforms.reduce(
    (min, platform) => Math.min(min, platform.bounds.y),
    GROUND_TOP,
  );
  const verticalComplexity = Math.min(1, (GROUND_TOP - highestTop) / GROUND_TOP);

  const pathLength =
    Math.abs(goal.bounds.x - 80) + Math.abs(GROUND_TOP - goal.bounds.y);
  const pathLengthFactor = Math.min(1, pathLength / (WORLD_WIDTH * 1.2));

  const score =
    Math.min(jumpCount, 12) * 0.15 +
    normalizedGapDifficulty * 0.25 +
    Math.min(hazardCount, 6) * 0.12 +
    Math.min(movingPlatformCount, 4) * 0.15 +
    verticalComplexity * 0.18 +
    pathLengthFactor * 0.15 +
    Math.min(portalCount, 2) * 0.05;

  const difficulty = mapScoreToDifficulty(score);
  const estimatedOptimalTimeSeconds = Math.max(
    6,
    Math.round(
      pathLength / MOVE_SPEED +
        jumpCount * 0.6 +
        collectibleCount * 0.4 +
        hazardCount * 0.3 +
        movingPlatformCount * 1.2,
    ),
  );

  return {
    difficulty,
    score: Number(score.toFixed(3)),
    estimatedOptimalTimeSeconds,
    jumpCount,
  };
}

export function mapScoreToDifficulty(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score < 0.6) return 1;
  if (score < 1.0) return 2;
  if (score < 1.5) return 3;
  if (score < 2.1) return 4;
  return 5;
}
