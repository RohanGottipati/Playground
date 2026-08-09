import type { GameMode } from "@/game/types";
import { scrubBrandNames } from "@/lib/utils/genericName";
import { sanitizeTitle } from "@/lib/utils/sanitize";
import type { NormalizedObject } from "./normalizeObjects";
import type { Rng } from "./rng";

const PATTERNS: Record<GameMode, string[]> = {
  classic: [
    "{Object} Run",
    "The {Object} Trail",
    "{Object} Hop",
    "Across the {Objects}",
    "{Object} Expedition",
    "Little {Object} Journey",
  ],
  shooter: [
    "{Ammo} Blaster",
    "{Ammo} Barrage",
    "Target Practice: {Object}",
    "{Ammo} Cannonade",
    "Fire the {Ammos}",
    "{Object} Skirmish",
  ],
  skyfall: [
    "{Object} Storm",
    "Falling {Objects}",
    "Dodge the {Objects}",
    "{Object} Downpour",
    "Rain of {Objects}",
    "{Object} Skyfall",
  ],
  rush: [
    "{Object} Rush",
    "{Object} Scramble",
    "Grab Every {Object}",
    "{Object} Sweep",
    "The Great {Object} Heist",
    "{Object} Dash",
  ],
  gauntlet: [
    "The {Object} Gauntlet",
    "{Object} Barrage",
    "Run the {Object} Line",
    "{Object} Crossfire",
    "Past the {Object}",
    "{Object} Salvo",
  ],
};

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function plural(noun: string): string {
  if (/(s|x|z|ch|sh)$/i.test(noun)) return `${noun}es`;
  if (/[^aeiou]y$/i.test(noun)) return `${noun.slice(0, -1)}ies`;
  return `${noun}s`;
}

/** Last word of the label reads best in titles: "coffee mug" -> "mug". */
function nounOf(label: string): string {
  const words = scrubBrandNames(label).toLowerCase().split(" ").filter(Boolean);
  return words[words.length - 1] ?? "object";
}

/**
 * Deterministic, brand-free title built from the run seed, the mode and the
 * most prominent photographed object. Recently used titles are skipped so the
 * arcade does not fill up with duplicates.
 */
export function generateTitle(
  rng: Rng,
  mode: GameMode,
  objects: NormalizedObject[],
  ammoLabel: string | undefined,
  recentTitles: string[],
): string {
  const prominent = [...objects].sort(
    (a, b) =>
      b.bounds.width * b.bounds.height - a.bounds.width * a.bounds.height,
  )[0];
  const object = nounOf(prominent?.label ?? "object");
  const ammo = nounOf(ammoLabel ?? "donut");

  const recent = new Set(recentTitles.map((title) => title.toLowerCase()));
  const patterns = rng.shuffle(PATTERNS[mode]);

  let chosen = "";
  for (const pattern of patterns) {
    const candidate = pattern
      .replace("{Objects}", titleCase(plural(object)))
      .replace("{Object}", titleCase(object))
      .replace("{Ammos}", titleCase(plural(ammo)))
      .replace("{Ammo}", titleCase(ammo));
    chosen = candidate;
    if (!recent.has(candidate.toLowerCase())) break;
  }

  return sanitizeTitle(scrubBrandNames(chosen));
}
