import {
  MIN_LANDING_WIDTH,
  SKYFALL_SAFE_ZONE_X,
} from "@/game/constants";
import { createRng, hashSeed, type Rng } from "@/game/generation/rng";
import { clamp } from "@/game/generation/normalizeObjects";
import type { GameEntitySpec, GameSpec, Rect } from "@/game/types";

/** Cover never shrinks below a strip the player can still stand on. */
const MIN_SHELTER_WIDTH = MIN_LANDING_WIDTH + 8;
/** Two shelters in the same row never merge into one continuous roof. */
const MIN_SHELTER_GAP = 100;
/** Falling objects spawn in [SKYFALL_SAFE_ZONE_X + 60, width - 60]. */
const EDGE_MARGIN = 60;
/** A pickup hovering this close above a shelter travels with it. */
const CARRIED_PICKUP_REACH = 170;
/** Pickups keep this much clearance from their shelter's ends. */
const PICKUP_INSET = 18;

type ShelterProfile = {
  /** Fraction of width a shelter can lose this run. */
  maxShrink: number;
  /** How far along the floor a shelter can slide from its hand-placed spot. */
  driftPx: number;
};

/**
 * How hard the storm bites, per template difficulty. A 1★ drizzle keeps its
 * generous roofs roughly where they were designed; a 5★ storm can halve every
 * shelter and drop it somewhere else entirely, so no run is ever the same
 * memorized safe square.
 */
const PROFILES: Record<1 | 2 | 3 | 4 | 5, ShelterProfile> = {
  1: { maxShrink: 0.15, driftPx: 90 },
  2: { maxShrink: 0.25, driftPx: 140 },
  3: { maxShrink: 0.35, driftPx: 190 },
  4: { maxShrink: 0.45, driftPx: 240 },
  5: { maxShrink: 0.55, driftPx: 300 },
};

/** Static slabs are the only thing falling objects smash against. */
function isShelter(entity: GameEntitySpec): boolean {
  return entity.mechanic === "static_platform";
}

/** Rows are hand-placed at identical heights (floor cover, perches, ...). */
function rowsByTop(shelters: GameEntitySpec[]): GameEntitySpec[][] {
  const rows = new Map<number, GameEntitySpec[]>();
  for (const shelter of shelters) {
    const row = rows.get(shelter.bounds.y) ?? [];
    row.push(shelter);
    rows.set(shelter.bounds.y, row);
  }
  return [...rows.values()].map((row) =>
    [...row].sort((a, b) => a.bounds.x - b.bounds.x),
  );
}

/**
 * Lays one row out again: every shelter keeps its height and its left-to-right
 * order, but loses a seeded slice of its width and slides to a seeded new spot.
 * Positions are clamped so the row always fits between the world edges with
 * MIN_SHELTER_GAP between neighbours — a run can never be handed a single
 * unbroken roof, nor a shelter parked outside the storm.
 */
function planRow(
  row: GameEntitySpec[],
  worldWidth: number,
  profile: ShelterProfile,
  rng: Rng,
): Map<string, Rect> | undefined {
  const leftBound = SKYFALL_SAFE_ZONE_X + EDGE_MARGIN;
  const rightBound = worldWidth - EDGE_MARGIN;

  const widths = row.map((shelter) =>
    Math.max(
      MIN_SHELTER_WIDTH,
      Math.round(shelter.bounds.width * (1 - rng.next() * profile.maxShrink)),
    ),
  );

  const planned = new Map<string, Rect>();
  let cursor = leftBound;
  for (let index = 0; index < row.length; index += 1) {
    const width = widths[index];
    // Reserve the minimum footprint every shelter still to place needs, so
    // clamping an early shelter can never strand a later one.
    let trailing = 0;
    for (let rest = index + 1; rest < row.length; rest += 1) {
      trailing += widths[rest] + MIN_SHELTER_GAP;
    }
    const minX = cursor;
    const maxX = rightBound - width - trailing;
    // Defensive: a row too crowded to shuffle keeps its authored layout.
    if (maxX < minX) return undefined;

    const drift = rng.int(-profile.driftPx, profile.driftPx);
    const x = Math.round(clamp(row[index].bounds.x + drift, minX, maxX));
    planned.set(row[index].id, { ...row[index].bounds, x, width });
    cursor = x + width + MIN_SHELTER_GAP;
  }
  return planned;
}

/** True when the pickup rides on top of this shelter rather than the floor. */
function sitsOnShelter(pickup: GameEntitySpec, shelter: Rect): boolean {
  const centerX = pickup.bounds.x + pickup.bounds.width / 2;
  const bottom = pickup.bounds.y + pickup.bounds.height;
  return (
    centerX >= shelter.x &&
    centerX <= shelter.x + shelter.width &&
    bottom <= shelter.y &&
    bottom >= shelter.y - CARRIED_PICKUP_REACH
  );
}

/**
 * Re-rolls a skyfall level's cover for this run's seed. Shelters are the only
 * thing standing between the player and the storm, so leaving them at their
 * authored spots means every replay is the same solved puzzle — park under the
 * big slab and wait out the clock. Difficulty drives how much cover survives
 * the re-roll (see PROFILES).
 *
 * Deterministic: the same seed always produces the same layout, so a published
 * game replays exactly as it was previewed.
 */
export function randomizeShelters(spec: GameSpec, seed: number): GameSpec {
  if (!spec.skyfall) return spec;

  const shelters = spec.entities.filter(isShelter);
  if (shelters.length === 0) return spec;

  const rng = createRng(hashSeed(String(seed), "shelters"));
  const profile = PROFILES[spec.difficulty];
  const planned = new Map<string, Rect>();
  for (const row of rowsByTop(shelters)) {
    const rowPlan = planRow(row, spec.world.width, profile, rng);
    if (!rowPlan) continue;
    for (const [id, bounds] of rowPlan) planned.set(id, bounds);
  }
  if (planned.size === 0) return spec;

  // Pickups perched on a shelter follow it; floor pickups stay where they are.
  const carried = new Map<string, Rect>();
  for (const pickup of spec.entities) {
    if (pickup.mechanic !== "collectible") continue;
    const host = shelters.find(
      (shelter) => planned.has(shelter.id) && sitsOnShelter(pickup, shelter.bounds),
    );
    if (!host) continue;
    const to = planned.get(host.id)!;
    const dx = to.x - host.bounds.x;
    carried.set(pickup.id, {
      ...pickup.bounds,
      x: Math.round(
        clamp(
          pickup.bounds.x + dx,
          to.x + PICKUP_INSET,
          to.x + to.width - pickup.bounds.width - PICKUP_INSET,
        ),
      ),
    });
  }

  return {
    ...spec,
    entities: spec.entities.map((entity) => {
      const bounds = planned.get(entity.id) ?? carried.get(entity.id);
      return bounds ? { ...entity, bounds } : entity;
    }),
  };
}
