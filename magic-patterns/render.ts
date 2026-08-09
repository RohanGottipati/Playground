import { renderToStaticMarkup } from "react-dom/server";
import { entriesById } from "./registry";

/**
 * Server-only rendering of the bundled Magic Patterns components. Keep this
 * out of client components: react-dom/server must never reach the browser
 * bundle. Client code loads the same art through the sprite route instead.
 */

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

function svgToBase64(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Base64 data URI of a component's art. Phaser's loader treats every `data:`
 * URL as base64 (File#base64) and decodes it with `atob`, so these must be
 * base64-encoded, not URL-encoded.
 */
export function magicPatternSvgDataUri(
  componentId: string | undefined,
): string | undefined {
  const svg = renderMagicPatternSvg(componentId);
  return svg ? `data:image/svg+xml;base64,${svgToBase64(svg)}` : undefined;
}
