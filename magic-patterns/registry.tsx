import { coreEntries } from "./data/coreCatalog";
import { objectEntries } from "./data/objectCatalog";

/**
 * Lookup and addressing for the bundled sprite components. Rendering them to
 * markup needs react-dom/server, which Next forbids in the client bundle, so
 * that lives in ./render — imported only by server code, scripts and tests.
 */
export const entriesById = new Map(
  [...objectEntries, ...coreEntries].map((entry) => [entry.id, entry] as const),
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

/**
 * Path to this component's pre-rendered SVG (see scripts/generate-sprites).
 * Phaser and <img> both load it directly, so the browser never has to render
 * React to markup and the art stays cacheable.
 */
export function magicPatternSpriteUrl(componentId: string): string {
  return `/sprites/${componentId}.svg`;
}
