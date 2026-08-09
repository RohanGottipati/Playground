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

/** Simulated player photo: a driveway strewn with sports gear. */
export const DRIVEWAY_SCENE: SceneAnalysis = defineScene({
  idPrefix: "driveway",
  sceneType: "floor",
  title: "Driveway Drop Zone",
  theme: "factory",
  objects: [
    {
      label: "car",
      at: [0.5, 0.15, 0.46, 0.55],
      props: ["large", "rigid", "rollable"],
      role: "platform",
      why: "Hatchback parked mid-driveway.",
    },
    {
      label: "basketball",
      at: [0.32, 0.68, 0.1, 0.14],
      props: ["round", "rollable", "springy"],
      role: "bounce_pad",
      why: "Basketball resting against the kerb.",
    },
    {
      label: "traffic cone",
      at: [0.12, 0.6, 0.1, 0.24],
      props: ["tall", "hollow"],
      role: "hazard",
      why: "Practice slalom cone knocked over.",
    },
    {
      label: "helmet",
      at: [0.45, 0.72, 0.09, 0.11],
      props: ["round", "hollow", "rigid"],
      role: "collectible",
      why: "Bike helmet dropped by the door.",
    },
    {
      label: "skateboard",
      at: [0.05, 0.82, 0.2, 0.08],
      props: ["long", "flat", "rollable"],
      role: "platform",
      why: "Skateboard rolled against the garage.",
    },
    {
      label: "bicycle",
      at: [0.72, 0.6, 0.24, 0.3],
      props: ["large", "rollable"],
      role: "platform",
      why: "Bike on its kickstand by the fence.",
    },
  ],
});

/**
 * Campaign 16 (4★) — "Driveway": heavy skyfall. Six objects at a time at
 * near-max speed, one real shelter plus an exposed perch, and the win needs
 * 24 dodges.
 */
export function buildDrivewaySpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const shelter = platform("driveway-shelter", nextPlatformLabel(0), 620, 750, 200);
  const perch = platform("driveway-perch", nextPlatformLabel(1), 900, 670, 130);

  const entities = resolveTemplateVisuals(
    [
      shelter,
      perch,
      collectible("driveway-gear-1", nextCollectibleLabel(0), 350, 780),
      collectibleOver("driveway-gear-2", nextCollectibleLabel(1), shelter),
      collectibleOver("driveway-gear-3", nextCollectibleLabel(2), perch),
      collectible("driveway-gear-4", nextCollectibleLabel(3), 1250, 780),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const fallers = skin.fallerLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Hailstorm`,
    theme: "storm",
    difficulty: 4,
    mode: "skyfall",
    seed,
    skyfall: {
      label: fallers,
      intervalMs: 850,
      fallSpeed: 360,
      maxConcurrent: 6,
      componentIds: skin.fallerComponentIds,
      dodgeCount: 24,
    },
    rules: {
      headline: `Dodge 24 falling ${fallers}s`,
      objective: `A hailstorm of ${fallers}s is hammering the driveway. Bank 24 clean dodges without getting flattened.`,
      howToPlay: [
        `A ${fallers} counts as dodged when it smashes while you are out in the storm.`,
        "There is exactly one real shelter. The perch beside it is fast but exposed.",
        "The shelter slides around and sometimes vanishes for a beat — don't memorize a safe square.",
        "Six objects fall at once at near-full speed — keep moving, never stargaze.",
        "One touch resets your streak to zero and sends you back to the start.",
      ],
      controls: BASE_CONTROLS,
      tip: "Orbit the shelter's edge: dip out for two dodges, dip back before the next wave lands.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(45),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
