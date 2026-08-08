import { renderToStaticMarkup } from "react-dom/server";
import { objectEntries } from "./data/objectCatalog";

const entriesById = new Map(
  objectEntries.map((entry) => [entry.id, entry] as const),
);

/** Stable IDs for every everyday-object component supplied by Magic Patterns. */
export const MAGIC_PATTERN_COMPONENT_IDS = Object.freeze(
  objectEntries.map((entry) => entry.id),
);

/** Phaser texture keys are namespaced so they cannot collide with game assets. */
export function magicPatternTextureKey(componentId: string): string {
  return `magic-pattern:${componentId}`;
}

export function hasMagicPatternComponent(
  componentId: string | undefined,
): componentId is string {
  return Boolean(componentId && entriesById.has(componentId));
}

/** Renders the real React/SVG component shipped in the Magic Patterns bundle. */
export function renderMagicPatternSvg(
  componentId: string | undefined,
): string | undefined {
  if (!componentId) return undefined;
  const entry = entriesById.get(componentId);
  if (!entry) return undefined;

  const markup = renderToStaticMarkup(entry.render());
  return markup.startsWith("<svg ") && !markup.includes("xmlns=")
    ? markup.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')
    : markup;
}

export function magicPatternSvgDataUri(
  componentId: string | undefined,
): string | undefined {
  const svg = renderMagicPatternSvg(componentId);
  return svg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    : undefined;
}
