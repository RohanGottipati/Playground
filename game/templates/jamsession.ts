import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
  collectibleOver,
  goalDoor,
  groundHazard,
  labelCycler,
  movingPlat,
  platform,
  resolveTemplateVisuals,
  staircase,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: the music corner of a bedroom studio. */
export const JAMSESSION_SCENE: SceneAnalysis = defineScene({
  idPrefix: "jamsession",
  sceneType: "floor",
  title: "Jam Session",
  theme: "neon",
  objects: [
    {
      label: "piano",
      at: [0.05, 0.3, 0.42, 0.55],
      props: ["large", "rigid"],
      role: "platform",
      why: "Upright piano filling the left of the frame.",
    },
    {
      label: "guitar",
      at: [0.52, 0.25, 0.14, 0.6],
      props: ["large", "tall", "rigid"],
      role: "platform",
      why: "Acoustic guitar on its stand.",
    },
    {
      label: "drum",
      at: [0.7, 0.5, 0.18, 0.32],
      props: ["round", "hollow", "rigid"],
      role: "bounce_pad",
      why: "Snare drum ready to bounce.",
    },
    {
      label: "vinyl record",
      at: [0.44, 0.72, 0.1, 0.09],
      props: ["flat", "round", "thin"],
      role: "collectible",
      why: "Record slid out of its sleeve.",
    },
    {
      label: "microphone",
      at: [0.9, 0.35, 0.06, 0.3],
      props: ["thin", "tall", "electronic"],
      role: "hazard",
      why: "Mic stand with trailing cable.",
    },
    {
      label: "trumpet",
      at: [0.33, 0.62, 0.12, 0.12],
      props: ["small", "rigid", "reflective"],
      role: "collectible",
      why: "Trumpet resting against the piano leg.",
    },
  ],
});

/**
 * Campaign 9 (3★) — "Jamsession": a steeper staircase (rise 88 / gap 56)
 * into a moving stage riser, with two cable hazards on the floor. First
 * level where timing a moving platform is mandatory.
 */
export function buildJamsessionSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const steps = staircase("jamsession-step", nextPlatformLabel, {
    startX: 250,
    startY: 742,
    steps: 3,
    rise: 88,
    gap: 56,
    width: 150,
  });
  const riser = movingPlat(
    "jamsession-riser",
    nextPlatformLabel(3),
    900,
    566,
    130,
    { axis: "x", distance: 200, speed: 80 },
  );
  const stage = platform("jamsession-stage", nextPlatformLabel(4), 1290, 540, 220);

  const entities = resolveTemplateVisuals(
    [
      ...steps,
      riser,
      stage,
      groundHazard("jamsession-cable-1", skin.objectLabels[0], 470, 110),
      groundHazard(
        "jamsession-cable-2",
        skin.objectLabels[1] ?? skin.objectLabels[0],
        1000,
        120,
      ),
      collectibleOver("jamsession-note-1", nextCollectibleLabel(0), steps[0]),
      collectibleOver("jamsession-note-2", nextCollectibleLabel(1), steps[1]),
      collectibleOver("jamsession-note-3", nextCollectibleLabel(2), steps[2]),
      collectibleOver("jamsession-note-4", nextCollectibleLabel(3), stage, -70),
      goalDoor("jamsession-door", 1390, 460, "jamsession-stage"),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Encore`,
    theme: "neon",
    difficulty: 3,
    mode: "classic",
    seed,
    rules: {
      headline: "Reach the stage door",
      objective: `Climb the gear from your ${skin.starLabel} photo, ride the drifting riser, and take a bow at the stage door.`,
      howToPlay: [
        "Three steep steps lead up from the left — each jump needs a full press.",
        "The riser platform slides side to side. Wait for it to drift close, then hop on.",
        "Two live cables snake across the floor; brushing them ends the run.",
        "Four backstage pickups mark the clean route up.",
      ],
      controls: BASE_CONTROLS,
      tip: "Jump onto the riser as it moves toward you — jumping late means chasing it.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(26),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
