/**
 * Writes the arcade cover art for every campaign game. Each cover is composed
 * from the visual components the level renders, so a card's photo
 * always matches the game behind it.
 *
 *   npm run previews:generate
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CAMPAIGN_TEMPLATE_IDS, TEMPLATES } from "../game/templates/index.ts";
import { composeScenePreviewSvg } from "../game/templates/previewImage.ts";

const OUTPUT_DIR = join(process.cwd(), "public", "template-previews");

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const template of CAMPAIGN_TEMPLATE_IDS) {
    const svg = composeScenePreviewSvg(TEMPLATES[template].previewAnalysis);
    const file = join(OUTPUT_DIR, `${template}.svg`);
    await writeFile(file, `${svg}\n`, "utf8");
    console.log(`wrote ${template}.svg (${(svg.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`\n${CAMPAIGN_TEMPLATE_IDS.length} covers written to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
