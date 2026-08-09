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
  goalDoor,
  groundHazard,
  labelCycler,
  platform,
  resolveTemplateVisuals,
  staircase,
  titleCase,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** Simulated player photo: a dusty attic lit by one candle. */
export const ATTICASCENT_SCENE: SceneAnalysis = defineScene({
  idPrefix: "atticascent",
  sceneType: "mixed",
  title: "Attic Ascent",
  theme: "default",
  objects: [
    {
      label: "wardrobe",
      at: [0.05, 0.15, 0.28, 0.7],
      props: ["large", "tall", "rigid"],
      role: "platform",
      why: "Sheet-draped wardrobe looming on the left.",
    },
    {
      label: "mirror",
      at: [0.4, 0.25, 0.14, 0.5],
      props: ["tall", "flat", "reflective"],
      role: "platform",
      why: "Full-length mirror catching the candlelight.",
    },
    {
      label: "picture frame",
      at: [0.6, 0.35, 0.12, 0.16],
      props: ["flat", "rigid"],
      role: "platform",
      why: "Stack of old family portraits.",
    },
    {
      label: "candle",
      at: [0.55, 0.68, 0.05, 0.12],
      props: ["small", "tall"],
      role: "hazard",
      why: "The only light source, burning low.",
    },
    {
      label: "alarm clock",
      at: [0.74, 0.6, 0.09, 0.12],
      props: ["small", "round", "rigid"],
      role: "collectible",
      why: "Wind-up clock stopped decades ago.",
    },
    {
      label: "step ladder",
      at: [0.84, 0.3, 0.14, 0.55],
      props: ["tall", "rigid"],
      role: "platform",
      why: "Ladder up to the roof hatch.",
    },
  ],
});

/**
 * Campaign 19 (5★) — "Atticascent": the brutal classic. Rise-104 jumps
 * against a 64px allowance on 110px beams, two chained bounce pads, and
 * on-platform hazards that leave exactly the minimum 64px of safe landing.
 */
export function buildAtticascentSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextPlatformLabel = labelCycler(skin.platformLabels);
  const nextCollectibleLabel = labelCycler(skin.collectibleLabels);

  const steps = staircase("atticascent-beam", nextPlatformLabel, {
    startX: 240,
    startY: 726,
    steps: 3,
    rise: 104,
    gap: 56,
    width: 110,
  });
  const pad1 = bouncePad("atticascent-spring-1", nextPlatformLabel(3), 770, 780);
  const ledge = platform("atticascent-ledge", nextPlatformLabel(4), 860, 560, 120);
  const pad2 = bouncePad("atticascent-spring-2", nextPlatformLabel(5), 1060, 780);
  const summit = platform("atticascent-summit", nextPlatformLabel(6), 1150, 548, 150);
  assertChainJumpable("atticascent-launch-1", [pad1, ledge]);
  assertChainJumpable("atticascent-launch-2", [pad2, summit]);

  const entities = resolveTemplateVisuals(
    [
      ...steps,
      pad1,
      ledge,
      pad2,
      summit,
      groundHazard("atticascent-gap-1", skin.objectLabels[0], 500, 120),
      groundHazard(
        "atticascent-gap-2",
        skin.objectLabels[1] ?? skin.objectLabels[0],
        900,
        120,
      ),
      {
        id: "atticascent-splinters-1",
        sourceLabel: skin.objectLabels[2] ?? skin.objectLabels[0],
        mechanic: "hazard" as const,
        bounds: { x: 406, y: 596, width: 46, height: 26 },
      },
      {
        id: "atticascent-splinters-2",
        sourceLabel: skin.objectLabels[3] ?? skin.objectLabels[0],
        mechanic: "hazard" as const,
        bounds: { x: 1150, y: 518, width: 86, height: 26 },
      },
      collectibleOver("atticascent-relic-1", nextCollectibleLabel(0), steps[0]),
      collectibleOver("atticascent-relic-2", nextCollectibleLabel(1), steps[2]),
      collectibleOver("atticascent-relic-3", nextCollectibleLabel(2), ledge),
      collectible("atticascent-relic-4", nextCollectibleLabel(3), 300, 780),
      goalDoor("atticascent-hatch", 1236, 468, "atticascent-summit"),
    ],
    seed,
  );

  const star = titleCase(skin.starLabel);
  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: `The ${star} Ascent`,
    theme: "quest",
    difficulty: 5,
    mode: "classic",
    seed,
    rules: {
      headline: "Reach the roof hatch",
      objective: `Scale the relics of your ${skin.starLabel} photo — full-stretch jumps, two spring launches — and escape through the hatch.`,
      howToPlay: [
        "The three beams demand maximum jumps: full rise, tight landing, 110px of beam.",
        "Splinters on the second beam and the summit leave one exact safe strip — land precisely.",
        "Two springs chain the final ascent: beam three, drop to the first spring, launch, cross, spring again.",
        "Two floor gaps burn below. Falling is usually recoverable; falling into a gap is not.",
      ],
      controls: BASE_CONTROLS,
      tip: "On the summit, land right of the splinters — the hatch sits inside the safe strip.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(38),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
