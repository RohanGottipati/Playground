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

/** Simulated player photo: a toy box upended onto the playroom floor. */
export const TOYBLITZ_SCENE: SceneAnalysis = defineScene({
  idPrefix: "toyblitz",
  sceneType: "floor",
  title: "Toy Box Spill",
  theme: "arcade",
  objects: [
    {
      label: "jack-in-the-box",
      at: [0.08, 0.35, 0.26, 0.45],
      props: ["large", "rigid", "springy"],
      role: "platform",
      why: "Jack-in-the-box mid-pop on the left.",
    },
    {
      label: "toy car",
      at: [0.42, 0.65, 0.14, 0.12],
      props: ["small", "rigid", "rollable"],
      role: "platform",
      why: "Die-cast car on its side.",
    },
    {
      label: "building brick",
      at: [0.58, 0.72, 0.09, 0.08],
      props: ["small", "rigid"],
      role: "hazard",
      why: "The brick every parent fears stepping on.",
    },
    {
      label: "dice",
      at: [0.52, 0.55, 0.07, 0.08],
      props: ["small", "rigid"],
      role: "collectible",
      why: "Oversized foam die from a board game.",
    },
    {
      label: "action figure",
      at: [0.7, 0.5, 0.09, 0.25],
      props: ["small", "rigid"],
      role: "collectible",
      why: "Action figure posed heroically.",
    },
    {
      label: "marble",
      at: [0.85, 0.75, 0.05, 0.05],
      props: ["small", "round", "rollable"],
      role: "collectible",
      why: "Marble rolling toward the skirting board.",
    },
  ],
});

/**
 * Campaign 12 (3★) — "Toyblitz": four drones at three different heights.
 * The climb to the top vantage passes over a spilled brick, and the fire
 * cooldown tightens.
 */
export function buildToyblitzSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);
  const sprite = (slot: number) =>
    skin.targetSprites[slot % Math.max(1, skin.targetSprites.length)];

  const vantage1 = platform("toyblitz-vantage-1", nextPlatformLabel(0), 400, 736, 160);
  const vantage2 = platform("toyblitz-vantage-2", nextPlatformLabel(1), 626, 646, 150);
  const vantage3 = platform("toyblitz-vantage-3", nextPlatformLabel(2), 842, 556, 140);

  const entities = resolveTemplateVisuals(
    [
      vantage1,
      vantage2,
      vantage3,
      target("toyblitz-drone-1", sprite(0), 250, 770, "ground"),
      target("toyblitz-drone-2", sprite(1), 450, 672, "toyblitz-vantage-1"),
      target("toyblitz-drone-3", sprite(2), 690, 582, "toyblitz-vantage-2"),
      target("toyblitz-drone-4", sprite(3), 900, 492, "toyblitz-vantage-3"),
      groundHazard("toyblitz-brick", skin.objectLabels[0], 640, 120),
      collectibleOver("toyblitz-spare-1", nextCollectibleLabel(0), vantage3, 55),
      collectible("toyblitz-spare-2", nextCollectibleLabel(1), 1200, 780),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const ammo = skin.ammoLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Blitz`,
    theme: "arcade",
    difficulty: 3,
    mode: "shooter",
    seed,
    shooter: { requiredKills: 4 },
    projectile: baseProjectile(ammo, skin.ammoComponentIds[0], {
      cooldownMs: 380,
    }),
    rules: {
      headline: "Down all four drones",
      objective: `Four drones made off with toys from your ${skin.starLabel} photo. Shoot every one of them down.`,
      howToPlay: [
        `Fire ${ammo}s in the direction you are facing; shots fly straight.`,
        "Drones hover at four heights — climb the three vantage platforms to line them up.",
        "A spilled brick sits under the second vantage. Do not land on it.",
        "Drones shove you back on contact; getting shoved over the brick is the classic mistake.",
      ],
      controls: shooterControls(),
      tip: "Clear each drone before climbing past its height — fighting two at once rarely ends well.",
    },
    world: baseWorld(),
    player: shooterPlayer(),
    entities,
    validation: baseValidation(30),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
