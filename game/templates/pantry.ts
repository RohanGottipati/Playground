import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
  collectible,
  collectibleOver,
  labelCycler,
  platform,
  resolveTemplateVisuals,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: a raided kitchen pantry shelf. */
export const PANTRY_SCENE: SceneAnalysis = defineScene({
  idPrefix: "pantry",
  sceneType: "counter",
  title: "Pantry Raid",
  theme: "kitchen",
  objects: [
    {
      label: "cereal box",
      at: [0.06, 0.22, 0.24, 0.55],
      props: ["large", "tall", "rigid"],
      role: "platform",
      why: "Tall cereal box anchoring the left of the shelf.",
    },
    {
      label: "plate",
      at: [0.4, 0.68, 0.2, 0.1],
      props: ["flat", "round", "rigid"],
      role: "platform",
      why: "Dinner plate lying flat mid-shelf.",
    },
    {
      label: "apple",
      at: [0.46, 0.5, 0.08, 0.1],
      props: ["small", "round", "rollable"],
      role: "collectible",
      why: "Shiny apple resting on the plate.",
    },
    {
      label: "cupcake",
      at: [0.62, 0.56, 0.08, 0.1],
      props: ["small", "soft"],
      role: "collectible",
      why: "Frosted cupcake near the middle.",
    },
    {
      label: "cheese",
      at: [0.75, 0.62, 0.1, 0.09],
      props: ["small", "soft"],
      role: "collectible",
      why: "Wedge of cheese by the right edge.",
    },
    {
      label: "banana",
      at: [0.88, 0.55, 0.08, 0.14],
      props: ["small", "soft", "flexible"],
      role: "collectible",
      why: "Lone banana leaning on the shelf wall.",
    },
  ],
});

/**
 * Campaign 1 (1★) — "Pantry": the gentlest rush level. Five snacks sit low
 * along a flat pantry floor with two easy shelf hops and a generous timer;
 * no hazards anywhere.
 */
export function buildPantrySpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const shelf1 = platform("pantry-shelf-1", nextPlatformLabel(0), 320, 750, 200);
  const shelf2 = platform("pantry-shelf-2", nextPlatformLabel(1), 640, 750, 200);

  const entities = resolveTemplateVisuals(
    [
      shelf1,
      shelf2,
      collectible("pantry-snack-1", nextCollectibleLabel(0), 240, 780),
      collectibleOver("pantry-snack-2", nextCollectibleLabel(1), shelf1),
      collectibleOver("pantry-snack-3", nextCollectibleLabel(2), shelf2),
      collectible("pantry-snack-4", nextCollectibleLabel(3), 1000, 780),
      collectible("pantry-snack-5", nextCollectibleLabel(4), 1300, 780),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Snack Scramble`,
    theme: "kitchen",
    difficulty: 1,
    mode: "rush",
    seed,
    rush: { requiredCollectibles: 5, timeLimitSeconds: 75 },
    rules: {
      headline: "Grab every snack",
      objective: `Five treats from your ${skin.starLabel} photo are scattered across the pantry. Scoop up all of them before the timer runs out.`,
      howToPlay: [
        "Every glowing pickup counts — the run ends the moment you grab the last one.",
        "Two low shelves hold a snack each; a single hop gets you up.",
        "There are no hazards here. The clock is the only enemy, and it is generous.",
        "Running out of time just restarts the run — you can always try again.",
      ],
      controls: BASE_CONTROLS,
      tip: "Sweep left to right in one pass and you will finish with half the clock to spare.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(15),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
