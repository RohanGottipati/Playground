import { createRng, hashSeed } from "@/game/generation/rng";
import type { GameEntitySpec, GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import {
  BASE_CONTROLS,
  assertChainJumpable,
  basePlayer,
  baseValidation,
  baseWorld,
  bouncePad,
  collectibleOver,
  coverBlock,
  finishFlag,
  labelCycler,
  platform,
  resolveTemplateVisuals,
} from "./common";
import { defineScene } from "./fixtures";
import type { TemplateSkin } from "./skin";

/** The open case that fires, the buds it fires, the bottles, the phone. */
const CASE_OPEN_COMPONENT = "tech-earbud-case-open";
const CASE_CLOSED_COMPONENT = "tech-earbud-case";
const EARBUD_COMPONENT = "tech-earbuds";
const BOTTLE_COMPONENT = "kit-water-bottle";
const PHONE_PAD_COMPONENT = "tech-phone-bounce-pad";

/** Exactly two of the four stations get a phone, re-rolled per run. */
export const PHONE_PAD_COUNT = 2;

/**
 * Simulated player photo for the object signature this template answers to:
 * an earbud case, a clear water bottle and a phone on a desk. Every label
 * resolves to bundled sprite art, and the whole scene satisfies
 * detectsCaseBarrage — it is the detector's own reference fixture.
 */
export const CASEBARRAGE_SCENE: SceneAnalysis = defineScene({
  idPrefix: "casebarrage",
  sceneType: "desk",
  title: "Desk Standoff",
  theme: "arcade",
  objects: [
    {
      label: "earbud case",
      at: [0.62, 0.52, 0.12, 0.14],
      props: ["small", "container", "electronic"],
      role: "hazard",
      why: "Charging case sitting lid-up at the right of the desk.",
    },
    {
      label: "water bottle",
      at: [0.34, 0.28, 0.11, 0.42],
      props: ["tall", "hollow", "rigid"],
      role: "vertical_platform",
      why: "Clear single-use bottle standing mid-desk.",
    },
    {
      label: "smartphone",
      at: [0.12, 0.62, 0.18, 0.1],
      props: ["flat", "rigid", "electronic"],
      role: "bounce_pad",
      why: "Phone lying face-up near the front edge.",
    },
    {
      label: "notebook",
      at: [0.02, 0.72, 0.24, 0.14],
      props: ["flat", "rigid"],
      role: "platform",
      why: "Closed notebook under the phone.",
    },
    {
      label: "mug",
      at: [0.82, 0.58, 0.12, 0.16],
      props: ["small", "hollow"],
      role: "platform",
      why: "Half-full mug at the far edge.",
    },
  ],
});

/** A ground slot that may receive a phone, and the ledge it launches you to. */
type PadStation = {
  id: string;
  /** Left edge of the phone pad. */
  padX: number;
  /** Left edge of the ledge directly above it. */
  perchX: number;
};

/**
 * Four hand-placed slots in the gaps between cover. Each ledge sits 190px
 * above its pad: inside the bounce envelope (112 × 2.2) but well outside a
 * plain jump (112), so the phone is the only way up.
 */
const PAD_STATIONS: readonly PadStation[] = [
  { id: "a", padX: 430, perchX: 415 },
  { id: "b", padX: 700, perchX: 685 },
  { id: "c", padX: 970, perchX: 955 },
  { id: "d", padX: 1240, perchX: 1225 },
];

const PAD_TOP = 780;
const PERCH_TOP = 590;
const PERCH_WIDTH = 120;

const TURRET_ID = "casebarrage-case";

/**
 * Builds one station's phone pad, the ledge above it and the pickup that
 * makes climbing worth the detour. The pad → ledge hop is verified against
 * the real reachability envelope at build time, so a bad tweak throws in
 * tests instead of shipping an unreachable ledge.
 */
function padStationEntities(
  station: PadStation,
  perchLabel: string,
  prizeLabel: string,
): GameEntitySpec[] {
  const pad = bouncePad(
    `casebarrage-phone-${station.id}`,
    "phone",
    station.padX,
    PAD_TOP,
  );
  pad.visual = { kind: "trampoline", componentId: PHONE_PAD_COMPONENT };

  const perch = platform(
    `casebarrage-perch-${station.id}`,
    perchLabel,
    station.perchX,
    PERCH_TOP,
    PERCH_WIDTH,
  );

  assertChainJumpable(`casebarrage-station-${station.id}`, [pad, perch]);
  return [
    pad,
    perch,
    collectibleOver(`casebarrage-prize-${station.id}`, prizeLabel, perch),
  ];
}

/**
 * Object-signature recipe — "The Case Barrage". Triggered by a photo holding
 * an earbud case, a clear water bottle and a phone (see ./detectTrio), never
 * by the seeded template pick.
 *
 * The case sits at the far right and fires earbuds right-to-left down the
 * course (gauntlet mode). Water bottles drop straight out of the sky the
 * whole way, smashing harmlessly on cover. Two of the four ground slots hold
 * a phone that launches the player to a ledge, re-rolled per seed so no two
 * runs are the same climb. The run is won at the flag planted in front of
 * the case.
 */
export function buildCasebarrageSpec(
  skin: TemplateSkin,
  seed: number,
  imageUrl: string,
): GameSpec {
  const nextCoverLabel = labelCycler(skin.platformLabels);
  const nextPrizeLabel = labelCycler(skin.collectibleLabels);

  // Two of the four slots, chosen per run but stable for a stored seed.
  const chosen = createRng(hashSeed(String(seed), "casebarrage-pads"))
    .shuffle(PAD_STATIONS)
    .slice(0, PHONE_PAD_COUNT)
    // Keep world order so ids and art read left to right in the saved spec.
    .sort((a, b) => a.padX - b.padX);

  // The closed case from the photo doubles as the first block of cover.
  const deskCase = coverBlock("casebarrage-cover-1", "earbud case", 240, 130);
  deskCase.visual = {
    kind: "crate-platform",
    componentId: CASE_CLOSED_COMPONENT,
  };

  const entities = resolveTemplateVisuals(
    [
      deskCase,
      coverBlock("casebarrage-cover-2", nextCoverLabel(0), 570, 110),
      coverBlock("casebarrage-cover-3", nextCoverLabel(1), 840, 110),
      coverBlock("casebarrage-cover-4", nextCoverLabel(2), 1110, 110),
      ...chosen.flatMap((station, slot) =>
        padStationEntities(
          station,
          nextCoverLabel(slot + 3),
          nextPrizeLabel(slot),
        ),
      ),
      {
        id: TURRET_ID,
        sourceLabel: "earbud case",
        mechanic: "hazard" as const,
        bounds: { x: 1490, y: 706, width: 70, height: 124 },
        visual: { kind: "spike-strip" as const, componentId: CASE_OPEN_COMPONENT },
        metadata: { role: "turret" },
      },
      finishFlag("casebarrage-finish", 1400, 750),
    ],
    seed,
  );

  return {
    schemaVersion: 1,
    visualVersion: 1,
    title: "The Case Barrage",
    theme: "gauntlet",
    difficulty: 4,
    mode: "gauntlet",
    seed,
    gauntlet: {
      intervalMs: 1600,
      projectileSpeed: 300,
      ammoLabel: "earbud",
      ammoComponentIds: [EARBUD_COMPONENT],
      turretId: TURRET_ID,
    },
    skyfall: {
      label: "water bottle",
      componentIds: [BOTTLE_COMPONENT],
      intervalMs: 1400,
      fallSpeed: 250,
      maxConcurrent: 3,
    },
    rules: {
      headline: "Cross the desk, reach the flag",
      objective:
        "The open case at the far right is spitting earbuds down the desk, and water bottles are falling the whole way. Cross the course and touch the flag planted in front of the case.",
      howToPlay: [
        "Low earbuds skim the desk — jump them; they fly straight through cover and everything else.",
        "High earbuds pass at head height — stay grounded and let them go by.",
        "Bottles drop straight down and one touch is fatal. They shatter on cover, so duck under a block when the sky gets busy.",
        "Two phones are lying face-up on the desk. Land on one and it flings you to the ledge above for a pickup.",
        "The phones move to different spots every run — find them before you need them.",
        "Touching the case itself hurts. The flag is planted just in front of it.",
      ],
      controls: BASE_CONTROLS,
      tip: "Cover is your umbrella and your cover story — read the volley height, then wait out the bottles underneath.",
    },
    world: baseWorld(),
    player: basePlayer(),
    entities,
    validation: baseValidation(40),
    source: { imageUrl, detectedObjectCount: skin.detectedObjectCount },
  };
}
