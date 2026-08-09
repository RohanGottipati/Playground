/**
 * Pre-renders every bundled Magic Patterns component to a static SVG file.
 *
 * The components are React, and rendering them needs react-dom/server, which
 * the Next App Router refuses to bundle — for the browser or a route handler.
 * Writing the art out ahead of time keeps it available to Phaser, to <img>
 * tags and to the arcade, as plain cacheable files.
 *
 *   npm run sprites:generate
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { entriesById } from "../magic-patterns/registry.tsx";
import { renderMagicPatternSvg } from "../magic-patterns/render.ts";

const OUTPUT_DIR = join(process.cwd(), "public", "sprites");

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let written = 0;
  let bytes = 0;
  for (const componentId of entriesById.keys()) {
    const svg = renderMagicPatternSvg(componentId);
    if (!svg) {
      console.warn(`skipped ${componentId}: nothing rendered`);
      continue;
    }
    await writeFile(join(OUTPUT_DIR, `${componentId}.svg`), svg, "utf8");
    written += 1;
    bytes += svg.length;
  }

  console.log(
    `wrote ${written} sprites (${(bytes / 1024).toFixed(0)} KB) to ${OUTPUT_DIR}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
