import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
  collectibleOver,
  goalDoor,
  labelCycler,
  platform,
  resolveTemplateVisuals,
  staircase,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: a bedroom floor mid-laundry-day. */
export const SOCKDRAWER_SCENE: SceneAnalysis = defineScene({
  idPrefix: "sockdrawer",
  sceneType: "floor",
  title: "Laundry Day",
  theme: "paper",
  objects: [
    {
      label: "bed",
      at: [0.05, 0.35, 0.4, 0.45],
      props: ["large", "flat", "soft"],
      role: "platform",
      why: "Unmade bed filling the left half of the frame.",
    },
    {
      label: "wardrobe",
      at: [0.72, 0.1, 0.24, 0.7],
      props: ["large", "tall", "rigid"],
      role: "platform",
      why: "Tall wardrobe against the far wall.",
    },
    {
      label: "sock",
      at: [0.5, 0.75, 0.06, 0.06],
      props: ["small", "soft", "flexible"],
      role: "collectible",
      why: "Stray sock dropped mid-floor.",
    },
    {
      label: "t-shirt",
      at: [0.58, 0.68, 0.12, 0.1],
      props: ["flat", "soft", "flexible"],
      role: "collectible",
      why: "Folded t-shirt waiting to be put away.",
    },
    {
      label: "cap",
      at: [0.47, 0.55, 0.08, 0.07],
      props: ["small", "soft", "hollow"],
      role: "collectible",
      why: "Baseball cap tossed onto the pile.",
    },
    {
      label: "teddy bear",
      at: [0.33, 0.6, 0.1, 0.16],
      props: ["small", "soft"],
      role: "collectible",
      why: "Teddy bear slumped against the bed.",
    },
  ],
});

/**
 * Campaign 2 (1★) — "Sockdrawer": a wide, forgiving staircase climb to the
 * wardrobe door. Rise 56 / gap 32 on 200px steps — every jump sits far
 * inside the safe envelope, and there are no hazards at all.
 */
export function buildSockdrawerSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const steps = staircase("sockdrawer-step", nextPlatformLabel, {
    startX: 260,
    startY: 754,
    steps: 4,
    rise: 56,
    gap: 32,
    width: 200,
  });
  const summit = platform(
    "sockdrawer-summit",
    nextPlatformLabel(4),
    1250,
    570,
    240,
  );

  const entities = resolveTemplateVisuals(
    [
      ...steps,
      summit,
      collectibleOver("sockdrawer-prize-1", nextCollectibleLabel(0), steps[0]),
      collectibleOver("sockdrawer-prize-2", nextCollectibleLabel(1), steps[1]),
      collectibleOver("sockdrawer-prize-3", nextCollectibleLabel(2), steps[2]),
      collectibleOver("sockdrawer-prize-4", nextCollectibleLabel(3), summit, -60),
      goalDoor("sockdrawer-door", 1360, 490, "sockdrawer-summit"),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `The ${star} Staircase`,
    theme: "paper",
    difficulty: 1,
    mode: "classic",
    seed,
    rules: {
      headline: "Climb to the door",
      objective: `Hop up the staircase built from your ${skin.starLabel} photo and step through the glowing door at the top.`,
      howToPlay: [
        "Four wide steps lead up from left to right — every jump is an easy one.",
        "Nothing here can hurt you. Fall off and you just climb again.",
        "Grab the 4 shiny pickups on the way up for bonus glory.",
      ],
      controls: BASE_CONTROLS,
      tip: "Hold right and tap jump at each ledge — the rhythm carries you straight to the top.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(18),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
