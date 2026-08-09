import type { GameMode, GameRules } from "@/game/types";

/** Matches explicit "you cannot die" style claims in generated rules text. */
const NO_DEATH_PATTERN =
  /\b(?:cannot|can't|can not|never|impossible to)\s+die\b|\bno\s+way\s+to\s+die\b|\bno\s+deaths?\b|\bdeath[- ]?free\b/i;

/** Modes that can kill the player through the mode mechanic itself, independent of hazard entities. */
const MODES_WITH_INHERENT_DANGER: GameMode[] = ["shooter", "skyfall"];

function rulesText(rules?: GameRules): string {
  if (!rules) return "";
  return [rules.headline, rules.objective, ...(rules.howToPlay ?? []), rules.tip]
    .filter(Boolean)
    .join(" ");
}

/**
 * Best-effort guess at whether a game can ever produce a fatality. An explicit
 * "you can't die" claim in the rules text wins outright; otherwise this infers
 * from the mechanics actually present — hazard entities, or a mode (shooter,
 * skyfall) that can kill the player on its own.
 */
export function inferCanDie(
  entities: { mechanic: string }[],
  rules?: GameRules,
  mode?: GameMode,
): boolean {
  if (NO_DEATH_PATTERN.test(rulesText(rules))) return false;
  const hasHazards = entities.some((entity) => entity.mechanic === "hazard");
  const modeIsInherentlyDangerous = mode ? MODES_WITH_INHERENT_DANGER.includes(mode) : false;
  return hasHazards || modeIsInherentlyDangerous;
}
