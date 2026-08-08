import { GAME_MODES, type GameMode } from "@/game/types";
import type { NormalizedObject } from "./normalizeObjects";
import type { GenerationHints } from "./hints";
import type { Rng } from "./rng";

/**
 * Picks this run's game mode from the seeded RNG, the photographed objects,
 * and what the database says about previous runs. Recent modes are avoided so
 * back-to-back generations from similar photos still play differently.
 */
export function selectGameMode(
  rng: Rng,
  objects: NormalizedObject[],
  hints: GenerationHints,
): GameMode {
  const weights = new Map<GameMode, number>(
    GAME_MODES.map((mode) => [mode, 1]),
  );

  // Object affinity: round/small things beg to be thrown, many trinkets make
  // a satisfying rush, hazard-heavy scenes suit dodging falling objects.
  const roundish = objects.filter(
    (object) =>
      object.properties.includes("round") ||
      object.properties.includes("rollable") ||
      object.properties.includes("small"),
  ).length;
  const trinkets = objects.filter(
    (object) => object.role === "collectible" || object.role === "decoration",
  ).length;
  const hazards = objects.filter((object) => object.role === "hazard").length;

  bump(weights, "shooter", roundish >= 1 ? 1.4 : 0.6);
  bump(weights, "rush", trinkets >= 2 ? 1.3 : 0.7);
  bump(weights, "skyfall", hazards >= 1 ? 1.3 : 0.9);

  // Variety: strongly demote the most recent modes.
  const [last, secondLast] = hints.recentModes;
  if (last && weights.has(last as GameMode)) {
    weights.set(last as GameMode, (weights.get(last as GameMode) ?? 1) * 0.12);
  }
  if (secondLast && weights.has(secondLast as GameMode)) {
    weights.set(
      secondLast as GameMode,
      (weights.get(secondLast as GameMode) ?? 1) * 0.45,
    );
  }

  // Learning: modes nobody finishes get generated less until they improve.
  for (const stat of hints.modeStats) {
    if (!weights.has(stat.mode as GameMode)) continue;
    if (stat.plays >= 8 && stat.completionRate < 0.1) {
      weights.set(
        stat.mode as GameMode,
        (weights.get(stat.mode as GameMode) ?? 1) * 0.5,
      );
    }
  }

  return weightedPick(rng, weights);
}

function bump(
  weights: Map<GameMode, number>,
  mode: GameMode,
  factor: number,
): void {
  weights.set(mode, (weights.get(mode) ?? 1) * factor);
}

function weightedPick(rng: Rng, weights: Map<GameMode, number>): GameMode {
  const entries = [...weights.entries()];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng.next() * total;
  for (const [mode, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return mode;
  }
  return entries[entries.length - 1][0];
}
