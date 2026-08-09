import type { GameSpec } from "@/game/types";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
  collectible,
  coverBlock,
  labelCycler,
  resolveTemplateVisuals,
  titleCase,
} from "./common";
import type { TemplateSkin } from "./skin";

/**
 * Template 1 — "Gauntlet": the photo's star machine sits at the far right and
 * hurls its ammo left at two heights. The player crosses the whole course —
 * jumping low shots, sheltering behind cover blocks — and wins at the finish
 * flag planted beside the machine.
 */
export function buildGauntletSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextCoverLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const entities = resolveTemplateVisuals(
    [
      coverBlock("gauntlet-cover-1", nextCoverLabel(0), 400, 80),
      coverBlock("gauntlet-cover-2", nextCoverLabel(1), 700, 90),
      coverBlock("gauntlet-cover-3", nextCoverLabel(2), 1000, 80),
      coverBlock("gauntlet-cover-4", nextCoverLabel(3), 1240, 90),
      collectible("gauntlet-prize-1", nextCollectibleLabel(0), 450, 700),
      collectible("gauntlet-prize-2", nextCollectibleLabel(1), 750, 690),
      collectible("gauntlet-prize-3", nextCollectibleLabel(2), 1050, 700),
      {
        id: "gauntlet-turret",
        sourceLabel: skin.starLabel,
        mechanic: "hazard" as const,
        bounds: { x: 1490, y: 706, width: 70, height: 124 },
        visual: { kind: "spike-strip" as const, componentId: skin.starComponentId },
        metadata: { role: "turret" },
      },
      {
        id: "gauntlet-finish",
        mechanic: "goal" as const,
        bounds: { x: 1400, y: 750, width: 56, height: 80 },
        visual: { kind: "exit-door" as const, componentId: "decor-finish-flag" },
        metadata: { supportId: "ground" },
      },
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const ammo = skin.ammoLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `The ${star} Gauntlet`,
    theme: "gauntlet",
    difficulty: 3,
    mode: "gauntlet",
    seed,
    gauntlet: {
      intervalMs: 1500,
      projectileSpeed: 320,
      ammoLabel: ammo,
      ammoComponentIds: skin.ammoComponentIds,
      turretId: "gauntlet-turret",
    },
    rules: {
      headline: "Run the gauntlet",
      objective: `The ${skin.starLabel} at the far right is hurling ${ammo}s at you. Cross the whole course and touch the finish flag planted right beside it.`,
      howToPlay: [
        `Low ${ammo}s skim the floor — jump them or duck behind a cover block; shots smash against cover.`,
        `High ${ammo}s fly over the covers at head height — stay low and let them pass.`,
        "You can stand on top of the cover blocks, but up there you are exposed.",
        "Touching the machine itself hurts. The flag is planted just in front of it.",
      ],
      controls: BASE_CONTROLS,
      tip: "Wait behind cover for a volley to smash, then sprint the next stretch.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(20),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
