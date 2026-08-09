/**
 * Fallback data for the Technation dashboard, used only where the real
 * repository has nothing to show yet (fresh local DB, no plays recorded).
 * Real numbers always take priority; this only fills gaps so the layout
 * never looks empty.
 */

export type SyntheticEntity = {
  id: string;
  mechanic: "hazard" | "static_platform" | "collectible" | "goal" | "moving_platform";
  sourceLabel: string;
  bounds: { x: number; y: number; width: number; height: number };
};

export type SyntheticGame = {
  id: string;
  slug: string;
  title: string;
  detectedObjectCount: number;
  world: { width: number; height: number };
  entities: SyntheticEntity[];
};

export const SYNTHETIC_WORLD = { width: 1600, height: 900 };

export const SYNTHETIC_GAMES: SyntheticGame[] = [
  {
    id: "synthetic-desk-of-doom",
    slug: "desk-of-doom",
    title: "Desk of Doom",
    detectedObjectCount: 9,
    world: SYNTHETIC_WORLD,
    entities: [
      { id: "e1", mechanic: "hazard", sourceLabel: "Scissors", bounds: { x: 420, y: 560, width: 60, height: 40 } },
      { id: "e2", mechanic: "hazard", sourceLabel: "Stapler", bounds: { x: 980, y: 320, width: 70, height: 40 } },
      { id: "e3", mechanic: "static_platform", sourceLabel: "Book", bounds: { x: 200, y: 700, width: 140, height: 30 } },
      { id: "e4", mechanic: "collectible", sourceLabel: "Coin", bounds: { x: 700, y: 150, width: 24, height: 24 } },
      { id: "e5", mechanic: "goal", sourceLabel: "Mug", bounds: { x: 1460, y: 200, width: 60, height: 60 } },
    ],
  },
  {
    id: "synthetic-cable-canyon",
    slug: "cable-canyon",
    title: "Cable Canyon",
    detectedObjectCount: 7,
    world: SYNTHETIC_WORLD,
    entities: [
      { id: "e1", mechanic: "hazard", sourceLabel: "Cable", bounds: { x: 640, y: 620, width: 220, height: 20 } },
      { id: "e2", mechanic: "static_platform", sourceLabel: "Notebook", bounds: { x: 300, y: 500, width: 120, height: 30 } },
      { id: "e3", mechanic: "collectible", sourceLabel: "Battery", bounds: { x: 900, y: 260, width: 24, height: 24 } },
      { id: "e4", mechanic: "goal", sourceLabel: "Lamp", bounds: { x: 1420, y: 180, width: 60, height: 60 } },
    ],
  },
  {
    id: "synthetic-mugshot-manor",
    slug: "mugshot-manor",
    title: "Mugshot Manor",
    detectedObjectCount: 11,
    world: SYNTHETIC_WORLD,
    entities: [
      { id: "e1", mechanic: "hazard", sourceLabel: "Pushpins", bounds: { x: 520, y: 400, width: 80, height: 30 } },
      { id: "e2", mechanic: "hazard", sourceLabel: "Mug", bounds: { x: 1080, y: 560, width: 60, height: 60 } },
      { id: "e3", mechanic: "static_platform", sourceLabel: "Coaster", bounds: { x: 260, y: 640, width: 100, height: 24 } },
      { id: "e4", mechanic: "goal", sourceLabel: "Keys", bounds: { x: 1480, y: 240, width: 50, height: 50 } },
    ],
  },
];

export const SYNTHETIC_TOP_OBJECTS: { label: string; count: number }[] = [
  { label: "book", count: 34 },
  { label: "mug", count: 21 },
  { label: "scissors", count: 15 },
  { label: "cable", count: 12 },
  { label: "stapler", count: 9 },
  { label: "pen", count: 7 },
];

const MIN_SYNTHETIC_FATALITIES = 3;
const MAX_SYNTHETIC_FATALITIES = 20;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/** Small deterministic PRNG (mulberry32) so a given game always renders the same scatter. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A per-game fatality count in [3, 20], stable across polls but varied game to game. */
export function syntheticFatalityCount(gameId: string): number {
  const random = seededRandom(hashString(gameId));
  return MIN_SYNTHETIC_FATALITIES + Math.floor(random() * (MAX_SYNTHETIC_FATALITIES - MIN_SYNTHETIC_FATALITIES + 1));
}

/** Organic, non-repeating scatter of death points clustered loosely around a level's hazards. */
export function syntheticDeathPoints(
  gameId: string,
  world: { width: number; height: number },
  entities: { mechanic: string; bounds: { x: number; y: number; width: number; height: number } }[],
  count: number,
): { x: number; y: number }[] {
  const random = seededRandom(hashString(gameId) ^ 0x9e3779b9);
  const hazards = entities.filter((entity) => entity.mechanic === "hazard");
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i += 1) {
    const hazard = hazards.length > 0 ? hazards[Math.floor(random() * hazards.length)] : null;
    const cx = hazard ? hazard.bounds.x + hazard.bounds.width / 2 : world.width / 2;
    const cy = hazard ? hazard.bounds.y + hazard.bounds.height / 2 : world.height / 2;

    // Sum of uniforms (Irwin-Hall-ish) biases the scatter toward the center
    // of its cluster instead of an even ring, which reads as organic rather
    // than a mechanical spiral or grid.
    const spread = ((random() + random() + random()) / 3) * 170 + 15;
    const angle = random() * Math.PI * 2;
    const wobble = (random() - 0.5) * 40;

    points.push({
      x: Math.round(Math.min(world.width - 10, Math.max(10, cx + Math.cos(angle) * spread + wobble))),
      y: Math.round(Math.min(world.height - 10, Math.max(10, cy + Math.sin(angle) * spread * 0.65 + wobble))),
    });
  }
  return points;
}
