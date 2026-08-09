import type { GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  baseValidation,
  basePlayer,
  baseWorld,
  collectible,
  collectibleOver,
  labelCycler,
  platform,
  resolveTemplateVisuals,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: a playroom floor after a windy afternoon. */
export const TOYSTORM_SCENE: SceneAnalysis = defineScene({
  idPrefix: "toystorm",
  sceneType: "floor",
  title: "Toy Storm",
  theme: "neon",
  objects: [
    {
      label: "kite",
      at: [0.3, 0.05, 0.35, 0.4],
      props: ["large", "flat", "flexible"],
      role: "platform",
      why: "Diamond kite crash-landed on the rug.",
    },
    {
      label: "pinwheel",
      at: [0.12, 0.5, 0.12, 0.3],
      props: ["small", "round"],
      role: "collectible",
      why: "Pinwheel still spinning in the draught.",
    },
    {
      label: "yo-yo",
      at: [0.5, 0.62, 0.07, 0.09],
      props: ["small", "round", "rollable"],
      role: "collectible",
      why: "Yo-yo unwound across the floor.",
    },
    {
      label: "spinning top",
      at: [0.62, 0.66, 0.08, 0.1],
      props: ["small", "round", "rigid"],
      role: "hazard",
      why: "Metal top wobbling dangerously.",
    },
    {
      label: "bubble wand",
      at: [0.74, 0.55, 0.06, 0.2],
      props: ["thin", "long"],
      role: "collectible",
      why: "Bubble wand leaking suds.",
    },
    {
      label: "marble",
      at: [0.86, 0.72, 0.05, 0.06],
      props: ["small", "round", "rollable"],
      role: "collectible",
      why: "Marble rolling for the door.",
    },
  ],
});

/**
 * Campaign 20 (5★) — "Toystorm": maximum skyfall. Eight objects at once at
 * 400px/s on a 750ms interval, one tiny shelter, and the win is surviving a
 * full 75 seconds.
 */
export function buildToystormSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const shelter = platform("toystorm-shelter", nextPlatformLabel(0), 700, 756, 120);
  const perch = platform("toystorm-perch", nextPlatformLabel(1), 880, 676, 110);

  const entities = resolveTemplateVisuals(
    [
      shelter,
      perch,
      collectible("toystorm-toy-1", nextCollectibleLabel(0), 400, 780),
      collectibleOver("toystorm-toy-2", nextCollectibleLabel(1), perch),
      collectible("toystorm-toy-3", nextCollectibleLabel(2), 1200, 780),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  const fallers = skin.fallerLabel;
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `${star} Storm`,
    theme: "neon",
    difficulty: 5,
    mode: "skyfall",
    seed,
    skyfall: {
      label: fallers,
      intervalMs: 750,
      fallSpeed: 400,
      maxConcurrent: 8,
      componentIds: skin.fallerComponentIds,
      surviveSeconds: 75,
    },
    rules: {
      headline: "Survive 75 seconds",
      objective: `The full contents of your ${skin.starLabel} photo are falling at once. Stay alive for 75 seconds in the worst storm in the arcade.`,
      howToPlay: [
        "Eight objects can be airborne at once, falling at near-maximum speed.",
        "One tiny shelter — barely wider than you — is the only true cover, and it never sits still.",
        "It slides constantly and blinks out entirely for stretches — never plan around where it was.",
        "The perch tempts with a pickup, but up there nothing protects you.",
        "One touch sends you back to the start and restarts the survival clock.",
      ],
      controls: BASE_CONTROLS,
      tip: "Do not camp: drops cluster wherever you linger, and the shelter won't wait for you anyway. Weave in wide arcs.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(80),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
