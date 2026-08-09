import type { GameSpec } from "@/game/types";

/**
 * How a run is won. Derived from the spec rather than stored: the presence of
 * a goal entity is the compatibility signal. Legacy specs of every mode carry
 * a door and keep their unlock behavior; new non-classic specs omit it.
 */
export type WinCondition =
  | "door"
  | "destroy_all"
  | "collect_all"
  | "survive"
  | "dodge";

export function winConditionFor(spec: GameSpec): WinCondition {
  if (spec.entities.some((entity) => entity.mechanic === "goal")) return "door";
  if (spec.mode === "shooter") return "destroy_all";
  if (spec.mode === "rush") return "collect_all";
  if (spec.mode === "skyfall" && spec.skyfall?.dodgeCount) return "dodge";
  if (spec.mode === "skyfall" && spec.skyfall?.surviveSeconds) return "survive";
  return "door";
}
