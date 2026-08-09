import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  baseProjectile,
  baseValidation,
  baseWorld,
  collectible,
  collectibleOver,
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

/** Simulated player photo: a tidy work-from-home desk. */
export const DESKTIDY_SCENE: SceneAnalysis = defineScene({
  idPrefix: "desktidy",
  sceneType: "desk",
  title: "Desk Tidy",
  theme: "arcade",
  objects: [
    {
      label: "laptop",
      at: [0.55, 0.2, 0.32, 0.5],
      props: ["large", "flat", "rigid", "electronic"],
      role: "platform",
      why: "Open laptop at the centre of the desk.",
    },
    {
      label: "notebook",
      at: [0.12, 0.62, 0.2, 0.12],
      props: ["flat", "rigid"],
      role: "platform",
      why: "Spiral notebook by the keyboard.",
    },
    {
      label: "pencil",
      at: [0.35, 0.7, 0.14, 0.03],
      props: ["long", "thin", "rigid"],
      role: "platform",
      why: "Sharpened pencil lying across the notebook.",
    },
    {
      label: "eraser",
      at: [0.44, 0.6, 0.05, 0.04],
      props: ["small", "rigid"],
      role: "collectible",
      why: "Pink eraser next to the pencil.",
    },
    {
      label: "mug",
      at: [0.05, 0.42, 0.09, 0.16],
      props: ["small", "hollow", "container"],
      role: "bounce_pad",
      why: "Coffee mug steaming at the desk's edge.",
    },
    {
      label: "sticky note",
      at: [0.9, 0.55, 0.07, 0.08],
      props: ["small", "flat"],
      role: "collectible",
      why: "Sticky note pressed to the monitor's corner.",
    },
  ],
});

/**
 * Campaign 4 (1★) — "Desktidy": target practice. Two drones hover at easy
 * heights — one at ground level, one over a single low vantage platform —
 * with a relaxed fire cooldown and nothing that can hurt you.
 */
export function buildDesktidySpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const desk = platform("desktidy-desk", nextPlatformLabel(0), 500, 730, 200);

  const entities = resolveTemplateVisuals(
    [
      desk,
      target("desktidy-drone-1", skin.targetSprites[0], 300, 770, "ground"),
      target(
        "desktidy-drone-2",
        skin.targetSprites[1] ?? skin.targetSprites[0],
        600,
        690,
        "desktidy-desk",
      ),
      collectibleOver("desktidy-prize-1", nextCollectibleLabel(0), desk, -70),
      collectible("desktidy-prize-2", nextCollectibleLabel(1), 900, 780),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const ammo = skin.ammoLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Target Practice`,
    theme: "arcade",
    difficulty: 1,
    mode: "shooter",
    seed,
    shooter: { requiredKills: 2 },
    projectile: baseProjectile(ammo, skin.ammoComponentIds[0], {
      cooldownMs: 500,
    }),
    rules: {
      headline: "Pop both drones",
      objective: `Two drones are hovering over your ${skin.starLabel} photo. Knock both of them down with well-aimed ${ammo}s.`,
      howToPlay: [
        `Fire ${ammo}s in the direction you are facing; shots fly straight and pass over platforms.`,
        "One drone floats at ground height — line up and shoot from anywhere.",
        "The second hovers over the low desk platform: hop up first, then fire.",
        "Drones shove you back on contact but nothing here can hurt you.",
      ],
      controls: shooterControls(),
      tip: "You can shoot while jumping — a mid-air shot lines up with the higher drone too.",
    },
    world: baseWorld(),
    player: shooterPlayer(),
    entities,
    validation: baseValidation(16),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
