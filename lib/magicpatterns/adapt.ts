import type { GameSpec, MagicPatternsInfo } from "@/game/types";
import type { MagicPatternsSourceFile } from "./client";

/**
 * "Adapts Code" step of the Magic Patterns flow: the generated design source
 * is mined for its color system, which is folded into the Phaser palette so
 * every game inherits the look of its own design instead of shipping raw
 * React components into the game runtime.
 */

type Hsl = { h: number; s: number; l: number };

function hexToInt(hex: string): number {
  return Number.parseInt(hex.slice(1), 16);
}

function hexToHsl(hex: string): Hsl {
  const value = hexToInt(hex);
  const r = ((value >> 16) & 0xff) / 255;
  const g = ((value >> 8) & 0xff) / 255;
  const b = (value & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

/** Distinct hex colors in the design source, most frequent first. */
export function extractDesignColors(
  sourceFiles: MagicPatternsSourceFile[],
): string[] {
  const counts = new Map<string, number>();
  for (const file of sourceFiles) {
    for (const match of file.code.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
      const hex = `#${match[1].toLowerCase()}`;
      counts.set(hex, (counts.get(hex) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);
}

/**
 * Picks palette accents from the design colors. Conservative on purpose:
 * only slots with a clearly suitable color get overridden, everything else
 * keeps the theme default so contrast and readability never regress.
 */
export function adaptDesignPalette(
  sourceFiles: MagicPatternsSourceFile[],
): NonNullable<MagicPatternsInfo["palette"]> {
  const colors = extractDesignColors(sourceFiles).slice(0, 40);
  if (colors.length < 3) return {};

  const rated = colors.map((hex) => ({ hex, ...hexToHsl(hex) }));
  const palette: NonNullable<MagicPatternsInfo["palette"]> = {};

  const darks = rated
    .filter((color) => color.l >= 0.04 && color.l <= 0.24)
    .sort((a, b) => a.l - b.l);
  if (darks[0]) palette.background = hexToInt(darks[0].hex);
  if (darks[1]) palette.backgroundAccent = hexToInt(darks[1].hex);

  const vivid = rated
    .filter((color) => color.s >= 0.55 && color.l >= 0.45 && color.l <= 0.75)
    .sort((a, b) => b.s - a.s);
  if (vivid[0]) palette.collectible = hexToInt(vivid[0].hex);
  if (vivid[1]) palette.goal = hexToInt(vivid[1].hex);

  const warm = vivid.find((color) => color.h <= 40 || color.h >= 330);
  if (warm) palette.hazard = hexToInt(warm.hex);

  const neutrals = rated
    .filter((color) => color.s <= 0.35 && color.l >= 0.55 && color.l <= 0.85)
    .sort((a, b) => b.l - a.l);
  if (neutrals[0]) palette.platform = hexToInt(neutrals[0].hex);

  return palette;
}

/** Prompt sent from the AI agent to Magic Patterns for this game's design. */
export function buildDesignPrompt(
  spec: GameSpec,
  objectLabels: string[],
): string {
  const labels = objectLabels.slice(0, 6).join(", ") || "everyday objects";
  const mode = spec.mode ?? "classic";
  return [
    `Design a playful arcade theme kit for a 2D platformer called "${spec.title}".`,
    `Game mode: ${mode}. It was generated from a photo of: ${labels}.`,
    "Create a single hero poster component with the game title, a bold flat-shape",
    "illustration of those objects as game elements, and a 6-color arcade palette",
    "(background, accent, platform, pickup, danger, goal) listed as hex swatches.",
    "Style: chunky outlines, high contrast, retro arcade, no gradients, no brand names.",
  ].join(" ");
}
