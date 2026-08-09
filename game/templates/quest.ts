import type { GameSpec } from "@/game/types";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
  collectible,
  groundHazard,
  labelCycler,
  platform,
  resolveTemplateVisuals,
  titleCase,
} from "./common";
import type { TemplateSkin } from "./skin";

/**
 * Template 3 — "Quest": the classic hand-built climb to the exit door.
 * A fixed five-platform staircase with two ground hazards and a bounce pad;
 * every jump sits well inside the safe envelope (rise ≤ 80, gap ≤ 80).
 */
export function buildQuestSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const entities = resolveTemplateVisuals(
    [
      platform("quest-step-1", nextPlatformLabel(0), 250, 750, 180),
      platform("quest-step-2", nextPlatformLabel(1), 500, 670, 160),
      platform("quest-step-3", nextPlatformLabel(2), 730, 590, 170),
      platform("quest-step-4", nextPlatformLabel(3), 980, 510, 160),
      platform("quest-summit", nextPlatformLabel(4), 1290, 530, 230),
      {
        id: "quest-springboard",
        sourceLabel: nextPlatformLabel(5),
        mechanic: "bounce_pad" as const,
        bounds: { x: 1170, y: 780, width: 90, height: 50 },
      },
      groundHazard("quest-thorn-1", skin.objectLabels[0], 500),
      groundHazard("quest-thorn-2", skin.objectLabels[1] ?? skin.objectLabels[0], 940),
      collectible("quest-prize-1", nextCollectibleLabel(0), 560, 630),
      collectible("quest-prize-2", nextCollectibleLabel(1), 790, 550),
      collectible("quest-prize-3", nextCollectibleLabel(2), 1040, 470),
      collectible("quest-prize-4", nextCollectibleLabel(3), 1330, 490),
      {
        id: "quest-door",
        mechanic: "goal" as const,
        bounds: { x: 1430, y: 450, width: 56, height: 80 },
        visual: { kind: "exit-door" as const, componentId: "mechanic-exit-door" },
        metadata: { supportId: "quest-summit" },
      },
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} & the Lost Door`,
    theme: "quest",
    difficulty: 2,
    mode: "classic",
    seed,
    rules: {
      headline: "Find the exit door",
      objective: `Climb the staircase built from your ${skin.starLabel} photo and touch the glowing exit door at the summit.`,
      howToPlay: [
        "Every platform is solid — climb them left to right like a staircase.",
        "The spiky patches on the floor hurt; jump clean over them.",
        "The springboard under the summit launches you extra high.",
        "Grab the 4 shiny pickups on the way up for bonus glory.",
      ],
      controls: BASE_CONTROLS,
      tip: "Deaths only cost time — the run keeps going until you reach the door.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(24),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
