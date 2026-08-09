import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
  bouncePad,
  collectible,
  collectibleOver,
  groundHazard,
  labelCycler,
  platform,
  resolveTemplateVisuals,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: an open fridge and the counter beside it. */
export const FRIDGERAID_SCENE: SceneAnalysis = defineScene({
  idPrefix: "fridgeraid",
  sceneType: "counter",
  title: "Fridge Raid",
  theme: "kitchen",
  objects: [
    {
      label: "fridge",
      at: [0.68, 0.08, 0.28, 0.78],
      props: ["large", "tall", "rigid", "electronic"],
      role: "platform",
      why: "Fridge door hanging open, light on.",
    },
    {
      label: "microwave",
      at: [0.06, 0.3, 0.24, 0.28],
      props: ["large", "rigid", "electronic"],
      role: "platform",
      why: "Microwave on the counter, door ajar.",
    },
    {
      label: "donut",
      at: [0.38, 0.62, 0.08, 0.08],
      props: ["small", "round", "soft"],
      role: "collectible",
      why: "Half a donut on a napkin.",
    },
    {
      label: "egg",
      at: [0.48, 0.68, 0.05, 0.06],
      props: ["small", "round"],
      role: "collectible",
      why: "Egg rolled out of its carton.",
    },
    {
      label: "carrot",
      at: [0.56, 0.72, 0.1, 0.05],
      props: ["small", "long", "rigid"],
      role: "collectible",
      why: "Carrot dropped by the crisper drawer.",
    },
    {
      label: "mug",
      at: [0.3, 0.5, 0.08, 0.12],
      props: ["small", "hollow", "container"],
      role: "bounce_pad",
      why: "Mug abandoned mid-snack.",
    },
  ],
});

/**
 * Campaign 11 (3★) — "Fridgeraid": an eight-pickup rush on a 45-second
 * clock. One shelf can only be reached off the mug bounce pad, and two
 * spills guard the floor route.
 */
export function buildFridgeraidSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const counter = platform("fridgeraid-counter", nextPlatformLabel(0), 300, 740, 180);
  const shelf = platform("fridgeraid-shelf", nextPlatformLabel(1), 560, 660, 150);
  const pad = bouncePad("fridgeraid-mug", nextPlatformLabel(2), 1120, 780);
  const topShelf = platform("fridgeraid-top-shelf", nextPlatformLabel(3), 1230, 600, 150);

  const entities = resolveTemplateVisuals(
    [
      counter,
      shelf,
      pad,
      topShelf,
      groundHazard("fridgeraid-spill-1", skin.objectLabels[0], 480, 110),
      groundHazard(
        "fridgeraid-spill-2",
        skin.objectLabels[1] ?? skin.objectLabels[0],
        900,
        120,
      ),
      collectible("fridgeraid-snack-1", nextCollectibleLabel(0), 200, 780),
      collectible("fridgeraid-snack-2", nextCollectibleLabel(1), 700, 780),
      collectible("fridgeraid-snack-3", nextCollectibleLabel(2), 1450, 780),
      collectibleOver("fridgeraid-snack-4", nextCollectibleLabel(3), counter),
      collectibleOver("fridgeraid-snack-5", nextCollectibleLabel(4), shelf),
      collectibleOver("fridgeraid-snack-6", nextCollectibleLabel(5), shelf, 50),
      collectibleOver("fridgeraid-snack-7", nextCollectibleLabel(6), pad),
      collectibleOver("fridgeraid-snack-8", nextCollectibleLabel(7), topShelf),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Raid`,
    theme: "kitchen",
    difficulty: 3,
    mode: "rush",
    seed,
    rush: { requiredCollectibles: 8, timeLimitSeconds: 45 },
    rules: {
      headline: "Raid every snack",
      objective: `Eight snacks from your ${skin.starLabel} photo are scattered across the kitchen. Grab all of them in 45 seconds.`,
      howToPlay: [
        "Two spills on the floor hurt to touch — jump them cleanly.",
        "The top shelf can only be reached off the mug: land on it and ride the bounce up.",
        "Route matters now. Plan one loop that ends at the bounce shelf.",
        "Running out of time restarts the run; pickups reset with it.",
      ],
      controls: BASE_CONTROLS,
      tip: "Take the floor snacks on your way right, then bounce — backtracking costs the run.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(32),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
