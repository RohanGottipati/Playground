import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
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

/** Simulated player photo: a lived-in living room, movie night aftermath. */
export const COUCHCOINS_SCENE: SceneAnalysis = defineScene({
  idPrefix: "couchcoins",
  sceneType: "floor",
  title: "Movie Night",
  theme: "arcade",
  objects: [
    {
      label: "sofa",
      at: [0.05, 0.42, 0.42, 0.4],
      props: ["large", "soft"],
      role: "platform",
      why: "Big two-seater sofa on the left.",
    },
    {
      label: "television",
      at: [0.6, 0.18, 0.32, 0.4],
      props: ["large", "flat", "electronic"],
      role: "platform",
      why: "Wall-mounted television mid-film.",
    },
    {
      label: "rug",
      at: [0.35, 0.75, 0.4, 0.18],
      props: ["flat", "soft", "flexible"],
      role: "platform",
      why: "Patterned rug covering the floor.",
    },
    {
      label: "game controller",
      at: [0.45, 0.66, 0.09, 0.07],
      props: ["small", "rigid", "electronic"],
      role: "collectible",
      why: "Controller abandoned on the rug.",
    },
    {
      label: "popcorn",
      at: [0.56, 0.6, 0.09, 0.11],
      props: ["small", "container"],
      role: "collectible",
      why: "Popcorn bucket wedged into the cushions.",
    },
    {
      label: "desk lamp",
      at: [0.88, 0.5, 0.1, 0.3],
      props: ["tall", "thin", "electronic"],
      role: "hazard",
      why: "Wobbly floor lamp leaning by the wall.",
    },
  ],
});

/**
 * Campaign 5 (2★) — "Couchcoins": a seven-pickup rush around the living
 * room. One sofa-back perch needs a two-hop climb, and a single knocked-over
 * lamp guards the middle of the floor.
 */
export function buildCouchcoinsSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const cushion = platform("couchcoins-cushion", nextPlatformLabel(0), 330, 744, 230);
  const perch = platform("couchcoins-perch", nextPlatformLabel(1), 640, 664, 150);
  const shelf = platform("couchcoins-shelf", nextPlatformLabel(2), 1150, 744, 200);

  const entities = resolveTemplateVisuals(
    [
      cushion,
      perch,
      shelf,
      groundHazard("couchcoins-lamp", skin.objectLabels[0], 900, 120),
      collectible("couchcoins-loot-1", nextCollectibleLabel(0), 200, 780),
      collectibleOver("couchcoins-loot-2", nextCollectibleLabel(1), cushion),
      collectibleOver("couchcoins-loot-3", nextCollectibleLabel(2), perch),
      collectible("couchcoins-loot-4", nextCollectibleLabel(3), 700, 780),
      collectibleOver("couchcoins-loot-5", nextCollectibleLabel(4), shelf),
      collectible("couchcoins-loot-6", nextCollectibleLabel(5), 1420, 780),
      collectible("couchcoins-loot-7", nextCollectibleLabel(6), 1080, 780),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Treasure Sweep`,
    theme: "arcade",
    difficulty: 2,
    mode: "rush",
    seed,
    rush: { requiredCollectibles: 7, timeLimitSeconds: 55 },
    rules: {
      headline: "Sweep the living room",
      objective: `Seven treasures from your ${skin.starLabel} photo fell between the cushions. Grab all of them before the timer hits zero.`,
      howToPlay: [
        "Pickups sit on the floor, on the furniture, and one on a high perch — a two-hop climb.",
        "The toppled lamp mid-floor hurts to touch. Jump clean over it.",
        "Dying resets the timer, not your progress — pickups stay collected.",
      ],
      controls: BASE_CONTROLS,
      tip: "Clear the far right first; ending your loop at the perch saves a backtrack.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(28),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
