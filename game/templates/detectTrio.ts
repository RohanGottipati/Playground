import { normalizeObjects } from "@/game/generation/normalizeObjects";
import { scrubBrandNames } from "@/lib/utils/genericName";
import type { SceneAnalysis } from "@/lib/backboard/schemas";

/**
 * Object-signature detection: a photo whose labels carry all three of these
 * signals is not a coin flip, it is a specific game (see ./casebarrage).
 *
 * Labels reach here already brand-scrubbed ("AirPods" becomes "earbuds", see
 * lib/utils/genericName.ts), but a raw label can still slip through an
 * un-normalized caller, so every signal is tested against both spellings.
 * Deterministic: no rng, no environment reads, no model involvement.
 *
 * Each individual signal is deliberately loose. The model's wording for the
 * same object drifts between calls — one pass says "water bottle", the next
 * says "bottle"; one says "earbud case", the next just "case" — and a strict
 * signal made the same photo produce a different game each time. Specificity
 * comes from needing all three signals together, not from any one of them.
 */

/** Words that identify the earbuds or the case they charge in. */
export const EARBUD_WORDS = [
  "earbud",
  "earbuds",
  "airpod",
  "airpods",
  "earpods",
  "earphone",
  "earphones",
  "buds",
] as const;

/**
 * A bare "case" counts too. On its own it is ambiguous, but the signature
 * needs all three signals at once — a case beside a phone beside a bottle is
 * this photo, and GPT-4o really does return just "case" for the real thing.
 */
export const CASE_WORDS = ["case", "charging"] as const;

/** Whole words that mean a handheld phone — never "headphones". */
export const PHONE_WORDS = [
  "phone",
  "smartphone",
  "iphone",
  "cellphone",
] as const;

const NON_WORD = /[^a-z0-9]+/;

/** Both the raw and the scrubbed spelling, as whole-word sets. */
function wordSets(label: string): Set<string>[] {
  return [label, scrubBrandNames(label)].map(
    (value) => new Set(value.toLowerCase().split(NON_WORD).filter(Boolean)),
  );
}

function anyLabelMatches(
  labels: readonly string[],
  matches: (words: Set<string>) => boolean,
): boolean {
  return labels.some((label) => wordSets(label).some(matches));
}

function hasAny(words: Set<string>, vocabulary: readonly string[]): boolean {
  return vocabulary.some((entry) => words.has(entry));
}

/** An earbud case, bare earbuds, or just "case" — all read as the case. */
export function hasEarbudCase(labels: readonly string[]): boolean {
  return anyLabelMatches(
    labels,
    (words) => hasAny(words, EARBUD_WORDS) || hasAny(words, CASE_WORDS),
  );
}

/**
 * Any bottle. The model calls the same clear single-use bottle "water
 * bottle", "plastic bottle" or plain "bottle" from one call to the next, and
 * demanding the qualifier made the recipe fire only some of the time.
 */
export function hasWaterBottle(labels: readonly string[]): boolean {
  return anyLabelMatches(labels, (words) => words.has("bottle"));
}

/** A handheld phone. Whole-word matching keeps "headphones" out. */
export function hasPhone(labels: readonly string[]): boolean {
  return anyLabelMatches(labels, (words) => hasAny(words, PHONE_WORDS));
}

/**
 * True when the photo holds an earbud case, a clear water bottle and a phone.
 * All three must be present: a partial match falls through to the normal
 * seeded template pick rather than shipping a game about objects that are
 * not on the table.
 */
export function detectsCaseBarrage(analysis: SceneAnalysis): boolean {
  const labels = normalizeObjects(analysis).map((object) => object.label);
  return (
    hasEarbudCase(labels) && hasWaterBottle(labels) && hasPhone(labels)
  );
}
