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

/** Photographed object scene analysis: a backyard garden bed, bees very much awake. */
export const BEESWARM_SCENE: SceneAnalysis = defineScene({
  idPrefix: "beeswarm",
  sceneType: "mixed",
  title: "Backyard Buzz",
  theme: "forest",
  objects: [
    {
      label: "beehive",
      at: [0.4, 0.1, 0.24, 0.35],
      props: ["large", "round", "hollow"],
      role: "hazard",
      why: "Paper beehive hanging from the branch.",
    },
    {
      label: "log",
      at: [0.05, 0.65, 0.35, 0.22],
      props: ["large", "long", "rigid"],
      role: "platform",
      why: "Split log lying along the flower bed.",
    },
    {
      label: "watering can",
      at: [0.72, 0.55, 0.16, 0.25],
      props: ["hollow", "container"],
      role: "platform",
      why: "Tin watering can parked on the grass.",
    },
    {
      label: "flower",
      at: [0.48, 0.6, 0.09, 0.2],
      props: ["small", "soft"],
      role: "collectible",
      why: "Lone daisy standing in the bed.",
    },
    {
      label: "mushroom cluster",
      at: [0.62, 0.75, 0.12, 0.12],
      props: ["small", "soft", "springy"],
      role: "bounce_pad",
      why: "Springy mushrooms at the log's end.",
    },
    {
      label: "feather",
      at: [0.9, 0.7, 0.06, 0.12],
      props: ["small", "thin", "soft"],
      role: "collectible",
      why: "Dropped feather near the fence.",
    },
  ],
});

/**
 * Campaign 10 (3★) — "Beeswarm": mid-tempo skyfall. Five objects at a time
 * fall at real speed, shelters shrink, and the win needs 16 clean dodges out
 * in the open.
 */
export function buildBeeswarmSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const shelter1 = platform("beeswarm-shelter-1", nextPlatformLabel(0), 300, 750, 170);
  const shelter2 = platform("beeswarm-shelter-2", nextPlatformLabel(1), 640, 750, 180);
  const perch = platform("beeswarm-perch", nextPlatformLabel(2), 900, 670, 140);
  const shelter3 = platform("beeswarm-shelter-3", nextPlatformLabel(3), 1150, 750, 170);

  const entities = resolveTemplateVisuals(
    [
      shelter1,
      shelter2,
      perch,
      shelter3,
      collectibleOver("beeswarm-prize-1", nextCollectibleLabel(0), shelter1),
      collectible("beeswarm-prize-2", nextCollectibleLabel(1), 500, 780),
      collectibleOver("beeswarm-prize-3", nextCollectibleLabel(2), perch),
      collectibleOver("beeswarm-prize-4", nextCollectibleLabel(3), shelter3),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const fallers = skin.fallerLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Panic`,
    theme: "forest",
    difficulty: 3,
    mode: "skyfall",
    seed,
    skyfall: {
      label: fallers,
      intervalMs: 1000,
      fallSpeed: 300,
      maxConcurrent: 5,
      componentIds: skin.fallerComponentIds,
      dodgeCount: 16,
    },
    rules: {
      headline: `Dodge 16 falling ${fallers}s`,
      objective: `The swarm is knocking ${fallers}s out of the sky. Stay out in the open long enough to bank 16 clean dodges.`,
      howToPlay: [
        `A ${fallers} only counts as dodged if you are out in the storm when it smashes.`,
        "Three shelters and a high perch give cover — but hiding pauses your streak.",
        "None of the shelters stay put for long, and one can vanish without warning.",
        "Five objects can fall at once now. Watch the shadows, not the sky.",
        "One touch sends you back to the start and resets your dodge streak.",
      ],
      controls: BASE_CONTROLS,
      tip: "The perch is risky but objects smashing beside it still count — a bold spot to farm dodges.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(35),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
