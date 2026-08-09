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

/** Simulated player photo: a home office desk deep into overtime. */
export const OFFICEOVERTIME_SCENE: SceneAnalysis = defineScene({
  idPrefix: "officeovertime",
  sceneType: "desk",
  title: "Overtime",
  theme: "arcade",
  objects: [
    {
      label: "laptop",
      at: [0.6, 0.15, 0.34, 0.5],
      props: ["large", "flat", "rigid", "electronic"],
      role: "platform",
      why: "Laptop glowing with 47 unread emails.",
    },
    {
      label: "keyboard",
      at: [0.15, 0.6, 0.28, 0.12],
      props: ["flat", "rigid", "electronic"],
      role: "platform",
      why: "Mechanical keyboard pushed aside.",
    },
    {
      label: "computer mouse",
      at: [0.48, 0.66, 0.07, 0.08],
      props: ["small", "rigid", "electronic"],
      role: "collectible",
      why: "Wireless mouse mid-desk.",
    },
    {
      label: "calculator",
      at: [0.06, 0.4, 0.1, 0.14],
      props: ["small", "flat", "rigid"],
      role: "platform",
      why: "Desk calculator with a paper receipt.",
    },
    {
      label: "paperclip",
      at: [0.55, 0.74, 0.04, 0.03],
      props: ["small", "thin"],
      role: "collectible",
      why: "Bent paperclip by the mouse pad.",
    },
    {
      label: "sticky note",
      at: [0.9, 0.5, 0.07, 0.08],
      props: ["small", "flat"],
      role: "collectible",
      why: "Deadline scribbled on a sticky note.",
    },
  ],
});

/**
 * Campaign 14 (4★) — "Officeovertime": a fast gauntlet. The laptop fires
 * paperclips at 1100ms / 420px/s, cover blocks shrink to 72px, and a spill
 * splits the middle stretch of open floor.
 */
export function buildOfficeovertimeSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextCoverLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const cover2 = coverBlock("officeovertime-cover-2", nextCoverLabel(1), 660, 72);
  const cover4 = coverBlock("officeovertime-cover-4", nextCoverLabel(3), 1200, 72);

  const entities = resolveTemplateVisuals(
    [
      coverBlock("officeovertime-cover-1", nextCoverLabel(0), 380, 72),
      cover2,
      coverBlock("officeovertime-cover-3", nextCoverLabel(2), 940, 72),
      cover4,
      groundHazard("officeovertime-spill", skin.objectLabels[0], 800, 80),
      collectible("officeovertime-bonus-1", nextCollectibleLabel(0), 300, 780),
      collectibleOver("officeovertime-bonus-2", nextCollectibleLabel(1), cover2),
      collectibleOver("officeovertime-bonus-3", nextCollectibleLabel(2), cover4),
      {
        id: "officeovertime-turret",
        sourceLabel: skin.starLabel,
        mechanic: "hazard" as const,
        bounds: { x: 1490, y: 706, width: 70, height: 124 },
        visual: { kind: "spike-strip" as const, componentId: skin.starComponentId },
        metadata: { role: "turret" },
      },
      finishFlag("officeovertime-finish", 1400, 750),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const ammo = skin.ammoLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Overtime`,
    theme: "gauntlet",
    difficulty: 4,
    mode: "gauntlet",
    seed,
    gauntlet: {
      intervalMs: 1100,
      projectileSpeed: 420,
      ammoLabel: ammo,
      ammoComponentIds: skin.ammoComponentIds,
      turretId: "officeovertime-turret",
    },
    rules: {
      headline: "Survive the overtime shift",
      objective: `The ${skin.starLabel} at the far right is firing ${ammo}s on a deadline. Cross the office and punch out at the finish flag.`,
      howToPlay: [
        `${titleCase(ammo)}s come fast — the covers are narrow and the volleys barely pause.`,
        "A spill splits the long middle stretch; you must clear it between volleys.",
        "Low shots skim the floor, high shots pass over the covers at head height.",
        "Touching the machine hurts. The flag is planted just in front of it.",
      ],
      controls: BASE_CONTROLS,
      tip: "Count the rhythm: volley, run, cover. Greedy two-cover sprints end runs here.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(26),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
