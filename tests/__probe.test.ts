import { describe, it } from "vitest";
import { buildTemplateSpec } from "@/game/templates";
import { PREVIEW_ANALYSIS } from "@/game/templates/previewAnalysis";

describe("probe", () => {
  it("prints shelters", () => {
    for (const t of ["bathtime", "dodge", "beeswarm", "driveway", "toystorm"] as const) {
      for (const seed of [1, 77, 4242]) {
        const spec = buildTemplateSpec(PREVIEW_ANALYSIS, seed, {
          imageUrl: "x", forceTemplate: t,
        });
        const plats = spec.entities
          .filter((e) => e.mechanic === "static_platform")
          .map((e) => `${e.id}@${e.bounds.x},${e.bounds.y}w${e.bounds.width}`);
        const cols = spec.entities
          .filter((e) => e.mechanic === "collectible")
          .map((e) => `${e.id}@${e.bounds.x},${e.bounds.y}`);
        console.log(t, seed, plats.join(" | "), "||", cols.join(" "));
      }
    }
  });
});
