import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  assertChainJumpable,
  baseValidation,
  basePlayer,
  baseWorld,
  bouncePad,
  collectible,
  collectibleOver,
  groundHazard,
  labelCycler,
  platform,
  resolveTemplateVisuals,
  staircase,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: the birthday table five minutes before guests. */
export const PARTYCRASH_SCENE: SceneAnalysis = defineScene({
  idPrefix: "partycrash",
  sceneType: "table",
  title: "Party Prep",
  theme: "arcade",
  objects: [
    {
      label: "birthday cake",
      at: [0.36, 0.25, 0.28, 0.4],
      props: ["large", "round", "soft"],
      role: "platform",
      why: "Three-tier cake, candles unlit.",
    },
    {
      label: "party balloons",
      at: [0.05, 0.05, 0.25, 0.4],
      props: ["large", "round", "soft"],
      role: "platform",
      why: "Balloon bundle tied to a chair.",
    },
    {
      label: "gift box",
      at: [0.7, 0.5, 0.18, 0.3],
      props: ["rigid", "container"],
      role: "platform",
      why: "The big present, ribbon and all.",
    },
    {
      label: "party hat",
      at: [0.6, 0.62, 0.08, 0.16],
      props: ["small", "tall", "hollow"],
      role: "hazard",
      why: "Cone hat — surprisingly pointy.",
    },
    {
      label: "lollipop",
      at: [0.52, 0.68, 0.05, 0.14],
      props: ["small", "round"],
      role: "collectible",
      why: "Giant swirl lollipop in a jar.",
    },
    {
      label: "candle",
      at: [0.48, 0.16, 0.04, 0.12],
      props: ["small", "tall"],
      role: "hazard",
      why: "Loose birthday candle, already lit somehow.",
    },
  ],
});

/**
 * Campaign 21 (5★) — "Partycrash": the final rush. Ten pickups in 30
 * seconds; floor hazards close the low road, forcing the staircase and a
 * bounce-launched perch in one continuous, near-optimal loop.
 */
export function buildPartycrashSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const steps = staircase("partycrash-tier", nextPlatformLabel, {
    startX: 260,
    startY: 742,
    steps: 3,
    rise: 88,
    gap: 70,
    width: 160,
    widths: [170, 160, 150],
  });

  const pad = bouncePad("partycrash-spring", nextPlatformLabel(3), 1000, 780);
  const perch = platform("partycrash-perch", nextPlatformLabel(4), 1090, 560, 150);
  const landing = platform("partycrash-landing", nextPlatformLabel(5), 1330, 610, 150);
  assertChainJumpable("partycrash-launch", [pad, perch, landing]);

  const entities = resolveTemplateVisuals(
    [
      ...steps,
      pad,
      perch,
      landing,
      groundHazard("partycrash-spill-1", skin.objectLabels[0], 430, 130),
      groundHazard(
        "partycrash-spill-2",
        skin.objectLabels[1] ?? skin.objectLabels[0],
        860,
        120,
      ),
      groundHazard(
        "partycrash-spill-3",
        skin.objectLabels[2] ?? skin.objectLabels[0],
        1250,
        60,
      ),
      collectibleOver("partycrash-treat-1", nextCollectibleLabel(0), steps[0]),
      collectibleOver("partycrash-treat-2", nextCollectibleLabel(1), steps[1]),
      collectibleOver("partycrash-treat-3", nextCollectibleLabel(2), steps[2]),
      collectibleOver("partycrash-treat-4", nextCollectibleLabel(3), perch),
      collectibleOver("partycrash-treat-5", nextCollectibleLabel(4), landing),
      collectibleOver("partycrash-treat-6", nextCollectibleLabel(5), pad),
      collectible("partycrash-treat-7", nextCollectibleLabel(6), 180, 780),
      collectible("partycrash-treat-8", nextCollectibleLabel(7), 640, 780),
      collectible("partycrash-treat-9", nextCollectibleLabel(8), 1150, 780),
      collectible("partycrash-treat-10", nextCollectibleLabel(9), 1450, 780),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Party Crash`,
    theme: "arcade",
    difficulty: 5,
    mode: "rush",
    seed,
    rush: { requiredCollectibles: 10, timeLimitSeconds: 30 },
    rules: {
      headline: "Ten treats, 30 seconds",
      objective: `The party starts in 30 seconds and ten treats from your ${skin.starLabel} photo are still out. Grab every single one.`,
      howToPlay: [
        "Three spills close most of the floor — the high road over the tiers is the real route.",
        "The spring launches you to the perch; the landing shelf catches the drop after it.",
        "Ten pickups, thirty seconds, zero slack. This is the arcade's final exam.",
        "Running out of time restarts the run from zero.",
      ],
      controls: BASE_CONTROLS,
      tip: "One loop: floor treats left to right, up the tiers, spring, perch, drop to the landing, done.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(29),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
