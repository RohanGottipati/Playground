import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  assertChainJumpable,
  baseValidation,
  basePlayer,
  baseWorld,
  bouncePad,
  collectibleOver,
  goalDoor,
  groundHazard,
  labelCycler,
  platform,
  resolveTemplateVisuals,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: looking up into cluttered garage rafters. */
export const RAFTERS_SCENE: SceneAnalysis = defineScene({
  idPrefix: "rafters",
  sceneType: "mixed",
  title: "Garage Rafters",
  theme: "factory",
  objects: [
    {
      label: "step ladder",
      at: [0.05, 0.25, 0.16, 0.62],
      props: ["large", "tall", "rigid"],
      role: "platform",
      why: "Paint-splattered step ladder against the wall.",
    },
    {
      label: "toolbox",
      at: [0.3, 0.7, 0.14, 0.14],
      props: ["rigid", "container"],
      role: "platform",
      why: "Toolbox parked under the beam.",
    },
    {
      label: "tyre",
      at: [0.5, 0.72, 0.14, 0.15],
      props: ["large", "round", "rigid"],
      role: "platform",
      why: "Spare tyre leaning on the workbench.",
    },
    {
      label: "paint bucket",
      at: [0.68, 0.68, 0.09, 0.14],
      props: ["hollow", "container"],
      role: "hazard",
      why: "Open paint bucket, lid missing.",
    },
    {
      label: "chain",
      at: [0.8, 0.15, 0.05, 0.5],
      props: ["long", "thin", "rigid"],
      role: "hazard",
      why: "Rusty chain hanging from the rafters.",
    },
    {
      label: "flashlight",
      at: [0.6, 0.52, 0.07, 0.05],
      props: ["small", "rigid", "electronic"],
      role: "collectible",
      why: "Flashlight balanced on the beam.",
    },
    {
      label: "nail",
      at: [0.44, 0.6, 0.03, 0.03],
      props: ["small", "thin", "sharp"],
      role: "collectible",
      why: "Bright galvanised nail on the bench.",
    },
    {
      label: "bucket",
      at: [0.9, 0.72, 0.08, 0.12],
      props: ["hollow", "container"],
      role: "bounce_pad",
      why: "Upturned bucket below the beam gap.",
    },
  ],
});

/**
 * Campaign 13 (4★) — "Rafters": three consecutive near-limit jumps
 * (rise 96 / gap 64 against a 72px allowance), a hazard-guarded drop, and a
 * bounce-pad launch onto a chain-guarded summit.
 */
export function buildRaftersSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const beam1 = platform("rafters-beam-1", nextPlatformLabel(0), 250, 734, 150);
  const beam2 = platform("rafters-beam-2", nextPlatformLabel(1), 464, 638, 140);
  const beam3 = platform("rafters-beam-3", nextPlatformLabel(2), 668, 542, 130);
  const drop = platform("rafters-drop", nextPlatformLabel(3), 930, 610, 120);
  const pad = bouncePad("rafters-bucket", nextPlatformLabel(4), 1150, 780);
  const summit = platform("rafters-summit", nextPlatformLabel(5), 1240, 572, 150);
  assertChainJumpable("rafters", [beam1, beam2, beam3, drop]);
  assertChainJumpable("rafters-launch", [pad, summit]);

  const entities = resolveTemplateVisuals(
    [
      beam1,
      beam2,
      beam3,
      drop,
      pad,
      summit,
      groundHazard("rafters-spill-1", skin.objectLabels[0], 470, 120),
      groundHazard(
        "rafters-spill-2",
        skin.objectLabels[1] ?? skin.objectLabels[0],
        930,
        130,
      ),
      {
        id: "rafters-chain",
        sourceLabel: skin.objectLabels[2] ?? skin.objectLabels[0],
        mechanic: "hazard" as const,
        bounds: { x: 1240, y: 546, width: 60, height: 26 },
      },
      collectibleOver("rafters-glint-1", nextCollectibleLabel(0), beam1),
      collectibleOver("rafters-glint-2", nextCollectibleLabel(1), beam2),
      collectibleOver("rafters-glint-3", nextCollectibleLabel(2), beam3),
      collectibleOver("rafters-glint-4", nextCollectibleLabel(3), drop),
      goalDoor("rafters-door", 1310, 492, "rafters-summit"),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Rafter Run`,
    theme: "factory",
    difficulty: 4,
    mode: "classic",
    seed,
    rules: {
      headline: "Cross the rafters",
      objective: `Pick your way across the rafters built from your ${skin.starLabel} photo and reach the door past the hanging chain.`,
      howToPlay: [
        "The first three beams demand full-length jumps — commit to every one.",
        "After the drop beam, ride the bucket's bounce up to the summit.",
        "A chain guards the summit's left edge; land on the right side of it.",
        "Paint spills mark the two floor hazards. Falling is survivable — landing in paint is not.",
      ],
      controls: BASE_CONTROLS,
      tip: "On the beam jumps, run off the very edge before jumping — early jumps fall short.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(30),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
