import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
  collectible,
  collectibleOver,
  coverBlock,
  finishFlag,
  groundHazard,
  labelCycler,
  resolveTemplateVisuals,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: a counter mid-meal-prep, microwave furious. */
export const MICROWAVEMAYHEM_SCENE: SceneAnalysis = defineScene({
  idPrefix: "microwavemayhem",
  sceneType: "counter",
  title: "Meal Prep Mayhem",
  theme: "kitchen",
  objects: [
    {
      label: "microwave",
      at: [0.64, 0.2, 0.32, 0.45],
      props: ["large", "rigid", "electronic"],
      role: "platform",
      why: "Microwave rattling on full power.",
    },
    {
      label: "tin can",
      at: [0.5, 0.6, 0.06, 0.12],
      props: ["small", "round", "rollable"],
      role: "collectible",
      why: "Open tin can by the hob.",
    },
    {
      label: "fork",
      at: [0.4, 0.7, 0.09, 0.04],
      props: ["small", "thin", "sharp"],
      role: "hazard",
      why: "Fork that absolutely should not go in the microwave.",
    },
    {
      label: "knife",
      at: [0.3, 0.74, 0.12, 0.04],
      props: ["long", "thin", "sharp"],
      role: "hazard",
      why: "Chef's knife on the cutting board.",
    },
    {
      label: "frying pan",
      at: [0.06, 0.55, 0.22, 0.2],
      props: ["flat", "round", "rigid"],
      role: "platform",
      why: "Cast-iron pan waiting on the hob.",
    },
    {
      label: "plate",
      at: [0.16, 0.78, 0.16, 0.08],
      props: ["flat", "round", "rigid"],
      role: "platform",
      why: "Stack of plates by the sink.",
    },
  ],
});

/**
 * Campaign 18 (5★) — "Microwavemayhem": the brutal gauntlet. Near-max
 * projectile speed (500) on a 950ms rhythm, three narrow covers, and cutlery
 * hazards littering the floor between them.
 */
export function buildMicrowavemayhemSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextCoverLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const cover2 = coverBlock("microwavemayhem-cover-2", nextCoverLabel(1), 800, 68);

  const entities = resolveTemplateVisuals(
    [
      coverBlock("microwavemayhem-cover-1", nextCoverLabel(0), 420, 64),
      cover2,
      coverBlock("microwavemayhem-cover-3", nextCoverLabel(2), 1150, 70),
      groundHazard("microwavemayhem-fork", skin.objectLabels[0], 560, 110),
      groundHazard(
        "microwavemayhem-knife",
        skin.objectLabels[1] ?? skin.objectLabels[0],
        950,
        110,
      ),
      collectible("microwavemayhem-scrap-1", nextCollectibleLabel(0), 300, 780),
      collectibleOver("microwavemayhem-scrap-2", nextCollectibleLabel(1), cover2),
      collectible("microwavemayhem-scrap-3", nextCollectibleLabel(2), 1300, 780),
      {
        id: "microwavemayhem-turret",
        sourceLabel: skin.starLabel,
        mechanic: "hazard" as const,
        bounds: { x: 1490, y: 706, width: 70, height: 124 },
        visual: { kind: "spike-strip" as const, componentId: skin.starComponentId },
        metadata: { role: "turret" },
      },
      finishFlag("microwavemayhem-finish", 1395, 750),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const ammo = skin.ammoLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Mayhem`,
    theme: "gauntlet",
    difficulty: 5,
    mode: "gauntlet",
    seed,
    gauntlet: {
      intervalMs: 950,
      projectileSpeed: 500,
      ammoLabel: ammo,
      ammoComponentIds: skin.ammoComponentIds,
      turretId: "microwavemayhem-turret",
    },
    rules: {
      headline: "Survive the mayhem",
      objective: `The ${skin.starLabel} has gone rogue and is firing ${ammo}s at full power. Cross the kitchen and slam the finish flag beside it.`,
      howToPlay: [
        `${titleCase(ammo)}s scream across at near-full speed with barely a second between volleys.`,
        "Only three covers, all narrow, to climb on. Sharp cutlery litters the floor between them.",
        "Jump the low shots, stay grounded for the high ones, and never linger in the open.",
        "Touching the machine hurts. The flag is planted just in front of it.",
      ],
      controls: BASE_CONTROLS,
      tip: "The stretch after the second cover is the killer — time each jump, don't count on cover to save you.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(28),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
