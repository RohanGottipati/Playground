import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { entriesById } from "@/magic-patterns/registry";
import { renderMagicPatternSvg } from "@/magic-patterns/render";

const SPRITE_DIR = join(process.cwd(), "public", "sprites");

describe("committed sprite assets", () => {
  it("contains exactly one SVG for every renderable component", () => {
    const expected = [...entriesById.keys()]
      .map((componentId) => `${componentId}.svg`)
      .sort();
    const actual = readdirSync(SPRITE_DIR)
      .filter((file) => file.endsWith(".svg"))
      .sort();

    expect(actual).toEqual(expected);
  });

  it("byte-matches every deterministic component renderer", () => {
    for (const componentId of entriesById.keys()) {
      const file = join(SPRITE_DIR, `${componentId}.svg`);
      expect(existsSync(file), `missing sprite for ${componentId}`).toBe(true);
      expect(readFileSync(file, "utf8"), componentId).toBe(
        renderMagicPatternSvg(componentId),
      );
    }
  });
});
