import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  baseProjectile,
  baseValidation,
  baseWorld,
  collectible,
  collectibleOver,
  groundHazard,
  labelCycler,
  movingPlat,
  platform,
  resolveTemplateVisuals,
  shooterControls,
  shooterPlayer,
  target,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: a gym bag emptied onto the garage floor. */
export const TRICKSHOTS_SCENE: SceneAnalysis = defineScene({
  idPrefix: "trickshots",
  sceneType: "floor",
  title: "Gym Bag Dump",
  theme: "neon",
  objects: [
    {
      label: "yoga mat",
      at: [0.05, 0.55, 0.4, 0.3],
      props: ["large", "flat", "flexible"],
      role: "platform",
      why: "Half-unrolled yoga mat on the left.",
    },
    {
      label: "dumbbell",
      at: [0.52, 0.7, 0.14, 0.12],
      props: ["small", "rigid"],
      role: "platform",
      why: "Hex dumbbell parked mid-floor.",
    },
    {
      label: "tennis racket",
      at: [0.66, 0.35, 0.12, 0.4],
      props: ["long", "rigid"],
      role: "platform",
      why: "Racket leaning against the wall.",
    },
    {
      label: "frisbee",
      at: [0.45, 0.6, 0.1, 0.05],
      props: ["flat", "round", "rollable"],
      role: "collectible",
      why: "Frisbee ready to fly.",
    },
    {
      label: "bowling pin",
      at: [0.82, 0.6, 0.07, 0.22],
      props: ["tall", "rigid"],
      role: "hazard",
      why: "Bowling pin begging to be knocked over.",
    },
    {
      label: "boxing glove",
      at: [0.9, 0.75, 0.09, 0.12],
      props: ["small", "soft"],
      role: "collectible",
      why: "One boxing glove, partner missing.",
    },
  ],
});

/**
 * Campaign 17 (4★) — "Trickshots": five drones, one of which can only be
 * lined up from a vertically drifting platform, with a tight cooldown and a
 * hazard under the climb.
 */
export function buildTrickshotsSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);
  const sprite = (slot: number) =>
    skin.targetSprites[slot % Math.max(1, skin.targetSprites.length)];

  const mat = platform("trickshots-mat", nextPlatformLabel(0), 380, 740, 160);
  const bench = platform("trickshots-bench", nextPlatformLabel(1), 620, 655, 150);
  const lift = movingPlat("trickshots-lift", nextPlatformLabel(2), 800, 605, 130, {
    axis: "y",
    distance: 100,
    speed: 70,
  });

  const entities = resolveTemplateVisuals(
    [
      mat,
      bench,
      lift,
      target("trickshots-drone-1", sprite(0), 250, 770, "ground"),
      target("trickshots-drone-2", sprite(1), 430, 676, "trickshots-mat"),
      target("trickshots-drone-3", sprite(2), 680, 591, "trickshots-bench"),
      target("trickshots-drone-4", sprite(3), 1100, 756, "ground"),
      target("trickshots-drone-5", sprite(4), 860, 470, "trickshots-lift"),
      groundHazard("trickshots-pin", skin.objectLabels[0], 990, 110),
      collectibleOver("trickshots-spare-1", nextCollectibleLabel(0), bench, 55),
      collectible("trickshots-spare-2", nextCollectibleLabel(1), 1300, 780),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const ammo = skin.ammoLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Trickshots`,
    theme: "neon",
    difficulty: 4,
    mode: "shooter",
    seed,
    shooter: { requiredKills: 5 },
    projectile: baseProjectile(ammo, skin.ammoComponentIds[0], {
      cooldownMs: 340,
    }),
    rules: {
      headline: "Five drones, one trick shot",
      objective: `Five drones are juggling gear from your ${skin.starLabel} photo. Down all five — the last one takes a moving-platform trick shot.`,
      howToPlay: [
        `Fire ${ammo}s in the direction you are facing; shots fly straight.`,
        "Four drones line up from the ground or the two fixed platforms.",
        "The highest drone only lines up from the drifting lift — time your shot at the top of its rise.",
        "A knocked-over pin guards the right floor. Getting shoved into it is the classic fail.",
      ],
      controls: shooterControls(),
      tip: "Ride the lift a full cycle first to learn its rhythm, then fire at the apex.",
    },
    world: baseWorld(),
    player: shooterPlayer(),
    entities,
    validation: baseValidation(35),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
