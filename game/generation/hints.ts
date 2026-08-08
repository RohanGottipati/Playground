import type { GameMode } from "@/game/types";

/**
 * Aggregated signals from previously generated games. Each new run reads
 * these to pick a fresh mode, avoid repeating titles, and tune pressure to
 * how well real players are actually finishing levels.
 */
export type ModeStat = {
  mode: string;
  plays: number;
  completions: number;
  completionRate: number;
};

export type GenerationHints = {
  /** Most recent first. Used to avoid generating the same mode twice in a row. */
  recentModes: string[];
  /** Most recent first. Used to avoid repeating titles. */
  recentTitles: string[];
  modeStats: ModeStat[];
};

export const EMPTY_HINTS: GenerationHints = {
  recentModes: [],
  recentTitles: [],
  modeStats: [],
};

export type Pace = "gentle" | "standard" | "spicy";

/**
 * Turns observed completion rates into a pressure dial. Players failing a
 * mode makes the next level of that mode easier; players cruising makes it
 * spicier. Falls back to standard until there is enough data.
 */
export function paceForMode(hints: GenerationHints, mode: GameMode): Pace {
  const stat = hints.modeStats.find((entry) => entry.mode === mode);
  if (!stat || stat.plays < 5) return "standard";
  if (stat.completionRate < 0.2) return "gentle";
  if (stat.completionRate > 0.65) return "spicy";
  return "standard";
}
