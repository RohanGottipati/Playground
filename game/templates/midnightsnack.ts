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

/** Simulated player photo: the kitchen at 2am, fridge light only. */
export const MIDNIGHTSNACK_SCENE: SceneAnalysis = defineScene({
  idPrefix: "midnightsnack",
  sceneType: "counter",
  title: "Midnight Snack",
  theme: "space",
  objects: [
    {
      label: "fridge",
      at: [0.02, 0.1, 0.3, 0.78],
      props: ["large", "tall", "rigid", "electronic"],
      role: "platform",
      why: "Fridge door open, casting the only light.",
    },
    {
      label: "pizza slice",
      at: [0.42, 0.6, 0.12, 0.1],
      props: ["flat", "soft"],
      role: "collectible",
      why: "Cold pizza slice on a plate.",
    },
    {
      label: "soda can",
      at: [0.55, 0.55, 0.06, 0.11],
      props: ["small", "round", "rollable"],
      role: "collectible",
      why: "Soda can sweating on the counter.",
    },
    {
      label: "cheese",
      at: [0.64, 0.63, 0.09, 0.08],
      props: ["small", "soft"],
      role: "collectible",
      why: "Cheese wedge missing a bite.",
    },
    {
      label: "cupcake",
      at: [0.74, 0.58, 0.08, 0.1],
      props: ["small", "soft"],
      role: "collectible",
      why: "Leftover birthday cupcake.",
    },
    {
      label: "candle",
      at: [0.86, 0.5, 0.06, 0.16],
      props: ["small", "tall"],
      role: "hazard",
      why: "Still-lit candle from dinner.",
    },
    {
      label: "mug",
      at: [0.35, 0.5, 0.08, 0.12],
      props: ["small", "hollow", "container"],
      role: "bounce_pad",
      why: "Cocoa mug, still warm.",
    },
  ],
});

/**
 * Campaign 15 (4★) — "Midnightsnack": nine pickups on a brutal 34-second
 * clock. Two bounce-pad-only perches and three floor hazards force a
 * planned, near-optimal route.
 */
export function buildMidnightsnackSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const counter = platform("midnightsnack-counter", nextPlatformLabel(0), 280, 745, 160);
  const shelf = platform("midnightsnack-shelf", nextPlatformLabel(1), 520, 660, 150);
  const pad1 = bouncePad("midnightsnack-mug-1", nextPlatformLabel(2), 760, 780);
  const perch1 = platform("midnightsnack-perch-1", nextPlatformLabel(3), 850, 590, 140);
  const pad2 = bouncePad("midnightsnack-mug-2", nextPlatformLabel(4), 1150, 780);
  const perch2 = platform("midnightsnack-perch-2", nextPlatformLabel(5), 1240, 560, 150);

  const entities = resolveTemplateVisuals(
    [
      counter,
      shelf,
      pad1,
      perch1,
      pad2,
      perch2,
      groundHazard("midnightsnack-wax-1", skin.objectLabels[0], 460, 100),
      groundHazard(
        "midnightsnack-wax-2",
        skin.objectLabels[1] ?? skin.objectLabels[0],
        990,
        110,
      ),
      groundHazard(
        "midnightsnack-wax-3",
        skin.objectLabels[2] ?? skin.objectLabels[0],
        1440,
        90,
      ),
      collectible("midnightsnack-bite-1", nextCollectibleLabel(0), 200, 780),
      collectible("midnightsnack-bite-2", nextCollectibleLabel(1), 680, 780),
      collectible("midnightsnack-bite-3", nextCollectibleLabel(2), 1350, 780),
      collectibleOver("midnightsnack-bite-4", nextCollectibleLabel(3), counter),
      collectibleOver("midnightsnack-bite-5", nextCollectibleLabel(4), shelf),
      collectibleOver("midnightsnack-bite-6", nextCollectibleLabel(5), shelf, 50),
      collectibleOver("midnightsnack-bite-7", nextCollectibleLabel(6), perch1),
      collectibleOver("midnightsnack-bite-8", nextCollectibleLabel(7), perch2),
      collectibleOver("midnightsnack-bite-9", nextCollectibleLabel(8), pad1),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `Midnight ${star} Heist`,
    theme: "space",
    difficulty: 4,
    mode: "rush",
    seed,
    rush: { requiredCollectibles: 9, timeLimitSeconds: 34 },
    rules: {
      headline: "Nine bites, 34 seconds",
      objective: `Everything tasty in your ${skin.starLabel} photo is out on the counter. Grab all nine bites before the house wakes up.`,
      howToPlay: [
        "Both high perches are bounce-only: land square on a mug and ride it up.",
        "Three wax spills burn on the floor — the gaps between them are tight.",
        "34 seconds is barely enough. Wasted jumps are wasted runs.",
        "Running out of time restarts the heist from zero.",
      ],
      controls: BASE_CONTROLS,
      tip: "Sweep low first, left to right, then take the two bounces on the way back.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(30),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
