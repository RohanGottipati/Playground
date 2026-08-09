import { renderMagicPatternSvg } from "@/magic-patterns/render";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import { scrubBrandNames } from "@/lib/utils/genericName";
import { sanitizeTitle } from "@/lib/utils/sanitize";
import { objectComponentIdFor } from "./skin";

export const PREVIEW_WIDTH = 640;
/** 16:9 — the exact aspect the arcade card crops to, so nothing is cut off. */
export const PREVIEW_HEIGHT = 360;

/** Where the surface objects rest on sits, as a fraction of frame height. */
const HORIZON = 0.66;

type RoomTone = {
  wallTop: string;
  wallBottom: string;
  surface: string;
  surfaceEdge: string;
  glow: string;
};

/**
 * Room lighting per scene theme, so a garage photo reads cooler than a
 * kitchen one without any of the art changing.
 */
const ROOM_TONES: Record<string, RoomTone> = {
  kitchen: {
    wallTop: "#3d2b1f",
    wallBottom: "#1b120d",
    surface: "#c8a171",
    surfaceEdge: "#7d5a37",
    glow: "#ffcf5c",
  },
  arcade: {
    wallTop: "#2a2340",
    wallBottom: "#120f1d",
    surface: "#5f7adb",
    surfaceEdge: "#33427d",
    glow: "#7ce7c8",
  },
  neon: {
    wallTop: "#2b0f3a",
    wallBottom: "#100720",
    surface: "#7b2f8f",
    surfaceEdge: "#43154f",
    glow: "#ff5d73",
  },
  factory: {
    wallTop: "#26282c",
    wallBottom: "#0f1012",
    surface: "#6b6f76",
    surfaceEdge: "#3a3d42",
    glow: "#ffb45e",
  },
  forest: {
    wallTop: "#1a3326",
    wallBottom: "#0b1710",
    surface: "#4e7c4a",
    surfaceEdge: "#2b482a",
    glow: "#a9d08a",
  },
  space: {
    wallTop: "#151a33",
    wallBottom: "#05070f",
    surface: "#2f3a63",
    surfaceEdge: "#1a2140",
    glow: "#7ce7ff",
  },
  paper: {
    wallTop: "#3a3226",
    wallBottom: "#1a1611",
    surface: "#c9b48c",
    surfaceEdge: "#7f6d4f",
    glow: "#f6efe2",
  },
  default: {
    wallTop: "#2c2a33",
    wallBottom: "#131216",
    surface: "#8a8391",
    surfaceEdge: "#4b4753",
    glow: "#ffcf5c",
  },
};

function toneFor(analysis: SceneAnalysis): RoomTone {
  return ROOM_TONES[analysis.themeSuggestion] ?? ROOM_TONES.default;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Re-frames a rendered sprite as a nested <svg> at an exact spot. The sprite
 * keeps its own viewBox, so it scales to fit the box without distortion and
 * sits on its baseline like a real object resting on a surface.
 */
function placeSprite(
  markup: string,
  x: number,
  y: number,
  width: number,
  height: number,
): string | undefined {
  const openTag = markup.match(/^<svg\b([^>]*)>/);
  if (!openTag) return undefined;
  const attributes = openTag[1]
    .replace(/\s(?:width|height|x|y|preserveAspectRatio)="[^"]*"/g, "")
    .trim();
  const rest = markup.slice(openTag[0].length);
  return [
    `<svg ${attributes} x="${round(x)}" y="${round(y)}"`,
    ` width="${round(width)}" height="${round(height)}"`,
    ` preserveAspectRatio="xMidYMax meet">`,
    rest,
  ].join("");
}

/**
 * Composes the "photo" an arcade card shows for a seeded game: the scene's
 * own objects, drawn with the very same Magic Patterns art the level renders,
 * arranged on a surface the way the analysis says they sat in frame.
 *
 * Pure and deterministic — the build script writes the result to disk.
 */
export function composeScenePreviewSvg(analysis: SceneAnalysis): string {
  const tone = toneFor(analysis);
  const horizonY = PREVIEW_HEIGHT * HORIZON;

  // Farthest-back objects first so nearer ones overlap them naturally.
  const ordered = [...analysis.objects].sort(
    (a, b) => a.bounds.y + a.bounds.height - (b.bounds.y + b.bounds.height),
  );

  const shadows: string[] = [];
  const sprites: string[] = [];

  for (const object of ordered) {
    const componentId = objectComponentIdFor(object.label, "collectible", "gem");
    const markup = componentId ? renderMagicPatternSvg(componentId) : undefined;
    if (!markup) continue;

    // Objects are laid out across the surface, scaled by how big they looked
    // in frame, and always standing on the surface rather than floating.
    const width = Math.max(46, object.bounds.width * PREVIEW_WIDTH * 1.15);
    const height = Math.max(46, object.bounds.height * PREVIEW_HEIGHT * 1.15);
    const side = Math.min(190, Math.max(width, height));
    const centerX =
      (object.bounds.x + object.bounds.width / 2) * PREVIEW_WIDTH;
    const baseline =
      horizonY +
      (object.bounds.y + object.bounds.height - HORIZON) * PREVIEW_HEIGHT * 0.42;
    const restY = Math.min(PREVIEW_HEIGHT - 26, Math.max(horizonY - 6, baseline));

    const placed = placeSprite(markup, centerX - side / 2, restY - side, side, side);
    if (!placed) continue;

    shadows.push(
      `<ellipse cx="${round(centerX)}" cy="${round(restY - 2)}" rx="${round(
        side * 0.27,
      )}" ry="${round(side * 0.05)}" fill="#000" opacity="0.24"/>`,
    );
    sprites.push(placed);
  }

  const caption = escapeXml(
    sanitizeTitle(scrubBrandNames(analysis.titleSuggestion)),
  );
  const count = analysis.objects.length;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}" width="${PREVIEW_WIDTH}" height="${PREVIEW_HEIGHT}">`,
    "<defs>",
    `<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="${tone.wallTop}"/>`,
    `<stop offset="1" stop-color="${tone.wallBottom}"/>`,
    "</linearGradient>",
    `<linearGradient id="surface" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="${tone.surface}"/>`,
    `<stop offset="1" stop-color="${tone.surfaceEdge}"/>`,
    "</linearGradient>",
    `<radialGradient id="lamp" cx="0.5" cy="0.1" r="0.75">`,
    `<stop offset="0" stop-color="${tone.glow}" stop-opacity="0.34"/>`,
    `<stop offset="1" stop-color="${tone.glow}" stop-opacity="0"/>`,
    "</radialGradient>",
    `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/></filter>`,
    "</defs>",
    `<rect width="${PREVIEW_WIDTH}" height="${PREVIEW_HEIGHT}" fill="url(#wall)"/>`,
    `<rect width="${PREVIEW_WIDTH}" height="${PREVIEW_HEIGHT}" fill="url(#lamp)"/>`,
    `<rect y="${round(horizonY)}" width="${PREVIEW_WIDTH}" height="${round(
      PREVIEW_HEIGHT - horizonY,
    )}" fill="url(#surface)"/>`,
    `<rect y="${round(horizonY)}" width="${PREVIEW_WIDTH}" height="3" fill="#000" opacity="0.28"/>`,
    shadows.join(""),
    sprites.join(""),
    // Photo grain over everything, to sell the snapshot look. The scene name
    // and object count stay out of the art — the arcade card prints both.
    `<rect width="${PREVIEW_WIDTH}" height="${PREVIEW_HEIGHT}" filter="url(#grain)" opacity="0.06"/>`,
    `<title>${caption} — ${count} objects</title>`,
    "</svg>",
  ].join("");
}
