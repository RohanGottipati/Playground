import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
  collectible,
  coverBlock,
  finishFlag,
  labelCycler,
  resolveTemplateVisuals,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: laundry day in a small utility room. */
export const LAUNDRYLINE_SCENE: SceneAnalysis = defineScene({
  idPrefix: "laundryline",
  sceneType: "floor",
  title: "Laundry Day",
  theme: "paper",
  objects: [
    {
      label: "washing machine",
      at: [0.66, 0.3, 0.3, 0.55],
      props: ["large", "rigid", "electronic"],
      role: "platform",
      why: "Front-loader mid-spin, door rattling.",
    },
    {
      label: "laundry basket",
      at: [0.08, 0.55, 0.24, 0.3],
      props: ["hollow", "container"],
      role: "platform",
      why: "Overflowing laundry basket on the left.",
    },
    {
      label: "sock",
      at: [0.4, 0.75, 0.07, 0.06],
      props: ["small", "soft", "flexible"],
      role: "collectible",
      why: "Escaped sock on the floor.",
    },
    {
      label: "iron",
      at: [0.45, 0.5, 0.12, 0.12],
      props: ["small", "rigid", "electronic"],
      role: "hazard",
      why: "Hot iron parked on its board.",
    },
    {
      label: "towel",
      at: [0.32, 0.3, 0.14, 0.3],
      props: ["flat", "soft", "flexible"],
      role: "platform",
      why: "Towel drying on the line.",
    },
  ],
});

/**
 * Campaign 7 (2★) — "Laundryline": the gentle gauntlet. The washing machine
 * lobs socks at a sleepy 1900ms rhythm and five wide cover blocks make the
 * crossing forgiving.
 */
export function buildLaundrylineSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextCoverLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const entities = resolveTemplateVisuals(
    [
      coverBlock("laundryline-cover-1", nextCoverLabel(0), 350, 90),
      coverBlock("laundryline-cover-2", nextCoverLabel(1), 600, 90),
      coverBlock("laundryline-cover-3", nextCoverLabel(2), 850, 90),
      coverBlock("laundryline-cover-4", nextCoverLabel(3), 1100, 90),
      coverBlock("laundryline-cover-5", nextCoverLabel(4), 1300, 90),
      collectible("laundryline-prize-1", nextCollectibleLabel(0), 480, 780),
      collectible("laundryline-prize-2", nextCollectibleLabel(1), 980, 780),
      collectible("laundryline-prize-3", nextCollectibleLabel(2), 1230, 780),
      {
        id: "laundryline-turret",
        sourceLabel: skin.starLabel,
        mechanic: "hazard" as const,
        bounds: { x: 1490, y: 706, width: 70, height: 124 },
        visual: { kind: "spike-strip" as const, componentId: skin.starComponentId },
        metadata: { role: "turret" },
      },
      finishFlag("laundryline-finish", 1400, 750),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const ammo = skin.ammoLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `The ${star} Barrage`,
    theme: "gauntlet",
    difficulty: 2,
    mode: "gauntlet",
    seed,
    gauntlet: {
      intervalMs: 1900,
      projectileSpeed: 260,
      ammoLabel: ammo,
      ammoComponentIds: skin.ammoComponentIds,
      turretId: "laundryline-turret",
    },
    rules: {
      headline: "Cross the laundry line",
      objective: `The ${skin.starLabel} on the far right is flinging ${ammo}s across the room. Cross the whole floor and tag the finish flag beside it.`,
      howToPlay: [
        `${titleCase(ammo)}s fly in slow, lazy volleys — jump them or duck behind a cover block.`,
        "Five wide covers line the route; shots smash harmlessly against them.",
        "You can stand on the covers, but up there you are exposed.",
        "Touching the machine itself hurts. The flag is planted just in front of it.",
      ],
      controls: BASE_CONTROLS,
      tip: "Move one cover at a time and you will never be caught in the open.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(20),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
