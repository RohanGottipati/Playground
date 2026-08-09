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

/** Simulated player photo: the corner of a bathroom at bath time. */
export const BATHTIME_SCENE: SceneAnalysis = defineScene({
  idPrefix: "bathtime",
  sceneType: "floor",
  title: "Bath Time",
  theme: "paper",
  objects: [
    {
      label: "bathtub",
      at: [0.08, 0.4, 0.45, 0.42],
      props: ["large", "hollow", "rigid", "container"],
      role: "platform",
      why: "Freestanding tub dominating the left of the photo.",
    },
    {
      label: "towel",
      at: [0.62, 0.3, 0.18, 0.35],
      props: ["flat", "soft", "flexible"],
      role: "platform",
      why: "Folded towel hanging off the rail.",
    },
    {
      label: "rubber duck",
      at: [0.3, 0.32, 0.08, 0.08],
      props: ["small", "round", "soft"],
      role: "collectible",
      why: "Rubber duck perched on the tub's edge.",
    },
    {
      label: "soap bar",
      at: [0.56, 0.7, 0.08, 0.06],
      props: ["small", "rigid"],
      role: "collectible",
      why: "Bar of soap by the tub's foot.",
    },
    {
      label: "toothbrush",
      at: [0.83, 0.55, 0.04, 0.16],
      props: ["small", "long", "thin"],
      role: "collectible",
      why: "Toothbrush standing in a cup by the sink.",
    },
    {
      label: "toilet roll",
      at: [0.88, 0.74, 0.09, 0.1],
      props: ["small", "round", "soft"],
      role: "collectible",
      why: "Spare roll stacked in the corner.",
    },
  ],
});

/**
 * Campaign 3 (1★) — "Bathtime": the gentlest skyfall. Objects drip from the
 * ceiling at a sleepy pace (1800ms, slow fall, 2 at once) and the win is
 * simply surviving 20 seconds under two huge shelters.
 */
export function buildBathtimeSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const shelter1 = platform("bathtime-shelter-1", nextPlatformLabel(0), 350, 750, 260);
  const shelter2 = platform("bathtime-shelter-2", nextPlatformLabel(1), 950, 750, 240);

  const entities = resolveTemplateVisuals(
    [
      shelter1,
      shelter2,
      collectibleOver("bathtime-prize-1", nextCollectibleLabel(0), shelter1),
      collectibleOver("bathtime-prize-2", nextCollectibleLabel(1), shelter2),
      collectible("bathtime-prize-3", nextCollectibleLabel(2), 760, 780),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const fallers = skin.fallerLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Splashdown`,
    theme: "storm",
    difficulty: 1,
    mode: "skyfall",
    seed,
    skyfall: {
      label: fallers,
      intervalMs: 1800,
      fallSpeed: 190,
      maxConcurrent: 2,
      componentIds: skin.fallerComponentIds,
      surviveSeconds: 20,
    },
    rules: {
      headline: "Stay dry for 20 seconds",
      objective: `${titleCase(fallers)}s from your photo are dripping from the ceiling. Survive the drizzle for 20 seconds and the run is yours.`,
      howToPlay: [
        "Objects fall slowly and only a couple at a time — watch their shadows and step aside.",
        "Duck under the two big shelters whenever you want a breather; drops shatter on them.",
        "One touch sends you back to the start, but the timer only resets on a hit.",
      ],
      controls: BASE_CONTROLS,
      tip: "You can win this one standing under a shelter — step out only for the pickups.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(22),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
