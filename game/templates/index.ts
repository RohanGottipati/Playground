import { createRng } from "@/game/generation/rng";
import { assertSpecIsSafe } from "@/game/generation/runtimeSafety";
import type { GameMode, GameSpec } from "@/game/types";
import type { SceneAnalysis } from "@/lib/backboard/schemas";
import { ATTICASCENT_SCENE, buildAtticascentSpec } from "./atticascent";
import { buildCasebarrageSpec, CASEBARRAGE_SCENE } from "./casebarrage";
import { detectsCaseBarrage } from "./detectTrio";
import { BATHTIME_SCENE, buildBathtimeSpec } from "./bathtime";
import { BEESWARM_SCENE, buildBeeswarmSpec } from "./beeswarm";
import { buildMicrowavemayhemSpec, MICROWAVEMAYHEM_SCENE } from "./microwavemayhem";
import { buildPartycrashSpec, PARTYCRASH_SCENE } from "./partycrash";
import { buildToystormSpec, TOYSTORM_SCENE } from "./toystorm";
import { buildCouchcoinsSpec, COUCHCOINS_SCENE } from "./couchcoins";
import { buildFridgeraidSpec, FRIDGERAID_SCENE } from "./fridgeraid";
import { buildJamsessionSpec, JAMSESSION_SCENE } from "./jamsession";
import { buildToyblitzSpec, TOYBLITZ_SCENE } from "./toyblitz";
import { buildDodgeSpec } from "./dodge";
import { buildDesktidySpec, DESKTIDY_SCENE } from "./desktidy";
import { buildDrivewaySpec, DRIVEWAY_SCENE } from "./driveway";
import { buildMidnightsnackSpec, MIDNIGHTSNACK_SCENE } from "./midnightsnack";
import { buildOfficeovertimeSpec, OFFICEOVERTIME_SCENE } from "./officeovertime";
import { buildRaftersSpec, RAFTERS_SCENE } from "./rafters";
import { buildTrickshotsSpec, TRICKSHOTS_SCENE } from "./trickshots";
import { buildGauntletSpec } from "./gauntlet";
import { buildLaundrylineSpec, LAUNDRYLINE_SCENE } from "./laundryline";
import { buildPantrySpec, PANTRY_SCENE } from "./pantry";
import { buildQuestSpec } from "./quest";
import { buildSockdrawerSpec, SOCKDRAWER_SCENE } from "./sockdrawer";
import { buildToolrangeSpec, TOOLRANGE_SCENE } from "./toolrange";
import { PREVIEW_ANALYSIS } from "./previewAnalysis";
import { randomizeShelters } from "./shelters";
import { buildTemplateSkin, type TemplateSkin } from "./skin";

export type TemplateDefinition = {
  build: (skin: TemplateSkin, seed: number, imageUrl: string) => GameSpec;
  /**
   * The simulated "player photo" this template is seeded into the arcade
   * with: a hand-written analysis whose labels all resolve to bundled
   * object sprites.
   */
  previewAnalysis: SceneAnalysis;
  difficulty: 1 | 2 | 3 | 4 | 5;
  mode: GameMode;
  /**
   * Object-signature recipe: when present and matching the photo's labels,
   * this template is selected outright instead of the seeded coin flip.
   * A template with a detector is excluded from the random pool and from the
   * arcade campaign — the only way to reach it is to photograph its objects.
   */
  detect?: (analysis: SceneAnalysis) => boolean;
};

/**
 * The hand-built games every photo maps onto, in ascending campaign order
 * (easiest first — key order is load-bearing). The picture never shapes a
 * layout — it only skins the fixed slots — and the template pick for a new
 * photo is a seeded coin flip, not an AI decision, unless the photo matches
 * a recipe's object signature (see `detect`).
 */
export const TEMPLATES = {
  pantry: {
    build: buildPantrySpec,
    previewAnalysis: PANTRY_SCENE,
    difficulty: 1,
    mode: "rush",
  },
  sockdrawer: {
    build: buildSockdrawerSpec,
    previewAnalysis: SOCKDRAWER_SCENE,
    difficulty: 1,
    mode: "classic",
  },
  bathtime: {
    build: buildBathtimeSpec,
    previewAnalysis: BATHTIME_SCENE,
    difficulty: 1,
    mode: "skyfall",
  },
  desktidy: {
    build: buildDesktidySpec,
    previewAnalysis: DESKTIDY_SCENE,
    difficulty: 1,
    mode: "shooter",
  },
  quest: {
    build: buildQuestSpec,
    previewAnalysis: PREVIEW_ANALYSIS,
    difficulty: 2,
    mode: "classic",
  },
  dodge: {
    build: buildDodgeSpec,
    previewAnalysis: PREVIEW_ANALYSIS,
    difficulty: 2,
    mode: "skyfall",
  },
  couchcoins: {
    build: buildCouchcoinsSpec,
    previewAnalysis: COUCHCOINS_SCENE,
    difficulty: 2,
    mode: "rush",
  },
  toolrange: {
    build: buildToolrangeSpec,
    previewAnalysis: TOOLRANGE_SCENE,
    difficulty: 2,
    mode: "shooter",
  },
  laundryline: {
    build: buildLaundrylineSpec,
    previewAnalysis: LAUNDRYLINE_SCENE,
    difficulty: 2,
    mode: "gauntlet",
  },
  gauntlet: {
    build: buildGauntletSpec,
    previewAnalysis: PREVIEW_ANALYSIS,
    difficulty: 3,
    mode: "gauntlet",
  },
  jamsession: {
    build: buildJamsessionSpec,
    previewAnalysis: JAMSESSION_SCENE,
    difficulty: 3,
    mode: "classic",
  },
  beeswarm: {
    build: buildBeeswarmSpec,
    previewAnalysis: BEESWARM_SCENE,
    difficulty: 3,
    mode: "skyfall",
  },
  fridgeraid: {
    build: buildFridgeraidSpec,
    previewAnalysis: FRIDGERAID_SCENE,
    difficulty: 3,
    mode: "rush",
  },
  toyblitz: {
    build: buildToyblitzSpec,
    previewAnalysis: TOYBLITZ_SCENE,
    difficulty: 3,
    mode: "shooter",
  },
  rafters: {
    build: buildRaftersSpec,
    previewAnalysis: RAFTERS_SCENE,
    difficulty: 4,
    mode: "classic",
  },
  officeovertime: {
    build: buildOfficeovertimeSpec,
    previewAnalysis: OFFICEOVERTIME_SCENE,
    difficulty: 4,
    mode: "gauntlet",
  },
  midnightsnack: {
    build: buildMidnightsnackSpec,
    previewAnalysis: MIDNIGHTSNACK_SCENE,
    difficulty: 4,
    mode: "rush",
  },
  driveway: {
    build: buildDrivewaySpec,
    previewAnalysis: DRIVEWAY_SCENE,
    difficulty: 4,
    mode: "skyfall",
  },
  trickshots: {
    build: buildTrickshotsSpec,
    previewAnalysis: TRICKSHOTS_SCENE,
    difficulty: 4,
    mode: "shooter",
  },
  casebarrage: {
    build: buildCasebarrageSpec,
    previewAnalysis: CASEBARRAGE_SCENE,
    difficulty: 4,
    mode: "gauntlet",
    detect: detectsCaseBarrage,
  },
  microwavemayhem: {
    build: buildMicrowavemayhemSpec,
    previewAnalysis: MICROWAVEMAYHEM_SCENE,
    difficulty: 5,
    mode: "gauntlet",
  },
  atticascent: {
    build: buildAtticascentSpec,
    previewAnalysis: ATTICASCENT_SCENE,
    difficulty: 5,
    mode: "classic",
  },
  toystorm: {
    build: buildToystormSpec,
    previewAnalysis: TOYSTORM_SCENE,
    difficulty: 5,
    mode: "skyfall",
  },
  partycrash: {
    build: buildPartycrashSpec,
    previewAnalysis: PARTYCRASH_SCENE,
    difficulty: 5,
    mode: "rush",
  },
} satisfies Record<string, TemplateDefinition>;

export type TemplateId = keyof typeof TEMPLATES;

/** Every hand-built game, in ascending difficulty order. */
export const TEMPLATE_IDS = Object.keys(TEMPLATES) as readonly TemplateId[];

/** Widens one roster entry back to the interface it satisfies. */
function definitionOf(id: TemplateId): TemplateDefinition {
  return TEMPLATES[id];
}

/** Templates reachable only by photographing their objects. */
export type RecipeTemplateId = {
  [K in TemplateId]: (typeof TEMPLATES)[K] extends { detect: unknown }
    ? K
    : never;
}[TemplateId];

/** Templates the arcade is seeded with and the seeded pick may return. */
export type CampaignTemplateId = Exclude<TemplateId, RecipeTemplateId>;

/**
 * The games the arcade is seeded with, in campaign order. Object-signature
 * recipes are left out: they are answers to one specific photo, so they get
 * no cover art, no creator and no shelf slot.
 */
export const CAMPAIGN_TEMPLATE_IDS = TEMPLATE_IDS.filter(
  (id) => !definitionOf(id).detect,
) as readonly CampaignTemplateId[];

export function isTemplateId(value: unknown): value is TemplateId {
  return (
    typeof value === "string" &&
    (TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

/** Base weight per template: gentle layouts are likelier for casual uploads. */
function baseWeight(id: TemplateId): number {
  return 6 - TEMPLATES[id].difficulty;
}

/** Back-to-back generations may never repeat any of these many templates. */
export const TEMPLATE_REPEAT_WINDOW = 3;
/** Weight multipliers for the last and second-to-last mode played. */
const LAST_MODE_PENALTY = 0.1;
const PRIOR_MODE_PENALTY = 0.4;

function weightedPick(rng: ReturnType<typeof createRng>, weights: Map<TemplateId, number>): TemplateId {
  const entries = [...weights.entries()];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng.next() * total;
  for (const [id, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return id;
  }
  return entries[entries.length - 1][0];
}

/**
 * Seeded pick over the campaign roster so a stored seed always replays the
 * same game. Object-signature recipes are never in the pool — a photo has to
 * actually contain their objects to get one.
 *
 * `recent` (most recent first) makes the pick history-aware: the last
 * TEMPLATE_REPEAT_WINDOW templates are banned outright, and templates sharing
 * a mode with the last two runs are heavily demoted. Two uploads in a row can
 * therefore never hand back the same game, and rarely even the same kind of
 * game. Without history it degrades to the plain difficulty-weighted pick.
 */
export function templateForSeed(
  seed: number,
  recent: readonly string[] = [],
): TemplateId {
  const banned = new Set(recent.slice(0, TEMPLATE_REPEAT_WINDOW));
  const recentModes = recent
    .slice(0, 2)
    .map((id) => (isTemplateId(id) ? TEMPLATES[id].mode : undefined));

  const weights = new Map<TemplateId, number>();
  for (const id of CAMPAIGN_TEMPLATE_IDS) {
    if (banned.has(id)) continue;
    let weight = baseWeight(id);
    if (TEMPLATES[id].mode === recentModes[0]) weight *= LAST_MODE_PENALTY;
    if (TEMPLATES[id].mode === recentModes[1]) weight *= PRIOR_MODE_PENALTY;
    weights.set(id, weight);
  }
  // Defensive: a history wider than the roster still has to pick something.
  if (weights.size === 0) {
    for (const id of CAMPAIGN_TEMPLATE_IDS) weights.set(id, baseWeight(id));
  }

  return weightedPick(createRng(seed ^ 0x51f15eed), weights);
}

/**
 * The recipe this photo's objects call for, if any. Recipes are checked in
 * roster order and the first match wins, so overlapping signatures resolve
 * deterministically. Runs before the seeded pick and deliberately ignores
 * `recentTemplates`: photographing the same objects twice is a request for
 * the same game, not a repeat to be avoided.
 */
export function recipeForAnalysis(
  analysis: SceneAnalysis,
): TemplateId | undefined {
  return TEMPLATE_IDS.find((id) => definitionOf(id).detect?.(analysis));
}

export function buildTemplateSpec(
  analysis: SceneAnalysis,
  seed: number,
  options: {
    imageUrl: string;
    forceTemplate?: TemplateId;
    /** Template ids of the previous runs, most recent first. */
    recentTemplates?: readonly string[];
  },
): GameSpec {
  const template =
    options.forceTemplate ??
    recipeForAnalysis(analysis) ??
    templateForSeed(seed, options.recentTemplates);
  const skin = buildTemplateSkin(analysis);
  const built = TEMPLATES[template].build(skin, seed, options.imageUrl);
  // Skyfall cover is re-rolled per run so the storm is never the same solved
  // puzzle twice; every layout is procedurally balanced by the AI generator.
  const spec = { ...randomizeShelters(built, seed), templateId: template };

  assertSpecIsSafe(spec);
  return spec;
}
