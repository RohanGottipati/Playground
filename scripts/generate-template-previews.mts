/**
 * Writes the arcade cover art for every campaign game. Each cover is composed
 * from the same Magic Patterns sprites the level renders, so a card's photo
 * always matches the game behind it.
 *
 *   npm run previews:generate
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { TEMPLATE_IDS, TEMPLATES } from "../game/templates/index.ts";
import { composeScenePreviewSvg } from "../game/templates/previewImage.ts";

const OUTPUT_DIR = join(process.cwd(), "public", "template-previews");

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const template of TEMPLATE_IDS) {
    const svg = composeScenePreviewSvg(TEMPLATES[template].previewAnalysis);
    const file = join(OUTPUT_DIR, `${template}.svg`);
    await writeFile(file, `${svg}\n`, "utf8");
    console.log(`wrote ${template}.svg (${(svg.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`\n${TEMPLATE_IDS.length} covers written to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
