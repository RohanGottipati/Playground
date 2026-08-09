import type { GameSpec } from "@/game/types";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
  collectible,
  labelCycler,
  platform,
  resolveTemplateVisuals,
  titleCase,
} from "./common";
import type { TemplateSkin } from "./skin";

export const DODGE_TARGET = 14;

/**
 * Template 2 — "Dodge": objects from the photo rain from the sky and the run
 * is won after DODGE_TARGET of them smash harmlessly nearby. Three low
 * shelters and one perch give cover; everything is reachable (rise ≤ 80).
 */
export function buildDodgeSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const entities = resolveTemplateVisuals(
    [
      platform("dodge-shelter-1", nextPlatformLabel(0), 330, 750, 190),
      platform("dodge-shelter-2", nextPlatformLabel(1), 700, 750, 210),
      platform("dodge-perch", nextPlatformLabel(2), 910, 670, 150),
      platform("dodge-shelter-3", nextPlatformLabel(3), 1180, 750, 190),
      collectible("dodge-prize-1", nextCollectibleLabel(0), 400, 700),
      collectible("dodge-prize-2", nextCollectibleLabel(1), 770, 700),
      collectible("dodge-prize-3", nextCollectibleLabel(2), 960, 620),
      collectible("dodge-prize-4", nextCollectibleLabel(3), 1250, 700),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const fallers = skin.fallerLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Skyfall`,
    theme: "storm",
    difficulty: 2,
    mode: "skyfall",
    seed,
    skyfall: {
      label: fallers,
      intervalMs: 1050,
      fallSpeed: 270,
      maxConcurrent: 5,
      componentIds: skin.fallerComponentIds,
      dodgeCount: DODGE_TARGET,
    },
    rules: {
      headline: `Dodge the ${fallers} storm`,
      objective: `${titleCase(fallers)}s from your photo are raining down. Stay out in the storm and let ${DODGE_TARGET} of them smash without getting hit.`,
      howToPlay: [
        `A ${fallers} only counts as dodged if you are out in the storm when it smashes — hiding in the spawn corner pauses your streak.`,
        "Duck under the shelters: falling objects shatter on them, and every shatter counts.",
        "One touch sends you back to the start and resets your dodge streak to zero.",
        "The 4 shiny pickups are optional, but grabbing them mid-storm is serious bragging rights.",
      ],
      controls: BASE_CONTROLS,
      tip: "Park at the edge of a shelter and lean out only long enough to bank each dodge.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(30),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
