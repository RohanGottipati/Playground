import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CAMPAIGN_TEMPLATE_IDS, TEMPLATES } from "@/game/templates";
import { composeScenePreviewSvg } from "@/game/templates/previewImage";

const PREVIEW_DIR = join(process.cwd(), "public", "template-previews");

describe("scene preview composer", () => {
  it("contains exactly one committed cover per campaign template", () => {
    expect(
      readdirSync(PREVIEW_DIR)
        .filter((file) => file.endsWith(".svg"))
        .sort(),
    ).toEqual(CAMPAIGN_TEMPLATE_IDS.map((template) => `${template}.svg`).sort());
  });

  it("draws every scene object with its real sprite art", () => {
    for (const template of CAMPAIGN_TEMPLATE_IDS) {
      const analysis = TEMPLATES[template].previewAnalysis;
      const svg = composeScenePreviewSvg(analysis);

      expect(svg.startsWith("<svg "), template).toBe(true);
      expect(svg.endsWith("</svg>"), template).toBe(true);
      // One nested <svg> per object, plus the outer frame.
      const nested = svg.match(/<svg\b/g)?.length ?? 0;
      expect(nested, template).toBe(analysis.objects.length + 1);
      expect(svg, template).toContain(analysis.titleSuggestion);
    }
  });

  it("is deterministic, so regenerating never churns the committed files", () => {
    for (const template of CAMPAIGN_TEMPLATE_IDS) {
      const analysis = TEMPLATES[template].previewAnalysis;
      expect(composeScenePreviewSvg(analysis)).toBe(
        composeScenePreviewSvg(analysis),
      );
    }
  });

  it("has a committed cover on disk matching the composer", () => {
    for (const template of CAMPAIGN_TEMPLATE_IDS) {
      const file = join(PREVIEW_DIR, `${template}.svg`);
      expect(existsSync(file), `missing cover for ${template}`).toBe(true);
      expect(readFileSync(file, "utf8").trim(), template).toBe(
        composeScenePreviewSvg(TEMPLATES[template].previewAnalysis),
      );
    }
  });
});
