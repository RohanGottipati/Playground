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
  platform,
  resolveTemplateVisuals,
  shooterControls,
  shooterPlayer,
  target,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: a garage pegboard mid-project. */
export const TOOLRANGE_SCENE: SceneAnalysis = defineScene({
  idPrefix: "toolrange",
  sceneType: "mixed",
  title: "Garage Wall",
  theme: "factory",
  objects: [
    {
      label: "toolbox",
      at: [0.06, 0.55, 0.3, 0.3],
      props: ["large", "rigid", "container"],
      role: "platform",
      why: "Steel toolbox open on the workbench.",
    },
    {
      label: "hammer",
      at: [0.45, 0.25, 0.08, 0.3],
      props: ["long", "rigid"],
      role: "platform",
      why: "Claw hammer hanging on the pegboard.",
    },
    {
      label: "wrench",
      at: [0.58, 0.28, 0.06, 0.26],
      props: ["long", "thin", "rigid"],
      role: "collectible",
      why: "Adjustable wrench on its hook.",
    },
    {
      label: "power drill",
      at: [0.7, 0.5, 0.14, 0.18],
      props: ["small", "rigid", "electronic"],
      role: "collectible",
      why: "Cordless drill resting on the shelf.",
    },
    {
      label: "nail",
      at: [0.52, 0.72, 0.04, 0.04],
      props: ["small", "thin", "sharp"],
      role: "hazard",
      why: "Loose nails spilled on the bench.",
    },
    {
      label: "bucket",
      at: [0.86, 0.62, 0.12, 0.25],
      props: ["hollow", "container"],
      role: "bounce_pad",
      why: "Upturned bucket by the wall.",
    },
  ],
});

/**
 * Campaign 6 (2★) — "Toolrange": a three-drone shooting gallery. One drone
 * needs a two-platform climb to line up, and spilled nails guard the far
 * floor.
 */
export function buildToolrangeSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);
  const sprite = (slot: number) =>
    skin.targetSprites[slot % Math.max(1, skin.targetSprites.length)];

  const bench = platform("toolrange-bench", nextPlatformLabel(0), 420, 740, 170);
  const shelf = platform("toolrange-shelf", nextPlatformLabel(1), 660, 650, 150);

  const entities = resolveTemplateVisuals(
    [
      bench,
      shelf,
      target("toolrange-drone-1", sprite(0), 300, 770, "ground"),
      target("toolrange-drone-2", sprite(1), 480, 676, "toolrange-bench"),
      target("toolrange-drone-3", sprite(2), 720, 586, "toolrange-shelf"),
      groundHazard("toolrange-nails", skin.objectLabels[0], 1000, 110),
      collectibleOver("toolrange-spare-1", nextCollectibleLabel(0), bench, 60),
      collectibleOver("toolrange-spare-2", nextCollectibleLabel(1), shelf, 55),
      collectible("toolrange-spare-3", nextCollectibleLabel(2), 1300, 780),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const ammo = skin.ammoLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Shooting Gallery`,
    theme: "factory",
    difficulty: 2,
    mode: "shooter",
    seed,
    shooter: { requiredKills: 3 },
    projectile: baseProjectile(ammo, skin.ammoComponentIds[0], {
      cooldownMs: 440,
    }),
    rules: {
      headline: "Down all three drones",
      objective: `Three drones lifted props off your ${skin.starLabel} photo. Shoot all of them down with ${ammo}s.`,
      howToPlay: [
        `Fire ${ammo}s in the direction you are facing; shots fly straight.`,
        "One drone hovers at ground height, one over the bench, one high over the shelf.",
        "Climb bench → shelf to line up the high drone — or hit it with a well-timed jump shot.",
        "The spilled nails on the far floor hurt. Jump them on your way to the spare pickups.",
      ],
      controls: shooterControls(),
      tip: "Drones shove you back on contact — clear each one before you climb past it.",
    },
    world: baseWorld(),
    player: shooterPlayer(),
    entities,
    validation: baseValidation(22),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
