import type { EntityVisualKind, GameEntitySpec } from "@/game/types";
import type { Rng } from "@/game/generation/rng";
import { COMPONENT_CATALOG } from "./catalog";
import type { ComponentCatalogEntry } from "./types";

const NON_WORD = /[^a-z0-9]+/g;

export function normalizeComponentLabel(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(NON_WORD, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export type ComponentIndex = {
  /**
   * Selects a component the Phaser engine can execute. With an rng, picks a
   * seeded variant among equally good matches so repeated generations of
   * similar photos don't all look identical; without one, the first match
   * wins (the stable behavior stored specs were resolved with).
   */
  selectComponentForEntity(
    entity: GameEntitySpec,
    visualKind: EntityVisualKind,
    rng?: Rng,
  ): ComponentCatalogEntry;
  isSelectableEntityComponent(
    componentId: string | undefined,
    mechanic: GameEntitySpec["mechanic"],
  ): boolean;
};

/** Ids with a locally bundled renderer; DB rows outside this set are unusable. */
const BUNDLED_IDS = new Set(COMPONENT_CATALOG.map((entry) => entry.id));

/** Widest pool a seeded contained-label pick draws from. */
const CONTAINED_MATCH_POOL = 3;

/**
 * Builds a selection index from a component catalog — the bundled one by
 * default, or rows fetched from the component_catalog table so the database
 * acts as a live enable/disable and alias source. Rows without a bundled
 * renderer are dropped defensively: Postgres stores metadata, never code.
 */
export function createComponentIndex(
  catalog: readonly ComponentCatalogEntry[],
): ComponentIndex {
  const entityEntries = catalog.filter(
    (entry) =>
      entry.enabled &&
      entry.runtimeScope === "entity" &&
      Boolean(entry.rendererKey) &&
      BUNDLED_IDS.has(entry.id),
  );

  const labelIndex = new Map<string, ComponentCatalogEntry[]>();
  for (const entry of entityEntries) {
    for (const label of [entry.name, ...entry.aliases]) {
      const normalized = normalizeComponentLabel(label);
      if (!normalized) continue;
      const entries = labelIndex.get(normalized) ?? [];
      entries.push(entry);
      labelIndex.set(normalized, entries);
    }
  }

  function compatible(
    entries: readonly ComponentCatalogEntry[] | undefined,
    entity: GameEntitySpec,
  ): ComponentCatalogEntry[] {
    const sprites =
      entries?.filter(
        (entry) => entry.metadata.componentType === "object-sprite",
      ) ?? [];
    if (sprites.length > 0) return sprites;
    return entries?.filter((entry) => entry.mechanic === entity.mechanic) ?? [];
  }

  function pickFrom(
    candidates: ComponentCatalogEntry[],
    rng: Rng | undefined,
  ): ComponentCatalogEntry | undefined {
    if (candidates.length === 0) return undefined;
    if (!rng || candidates.length === 1) return candidates[0];
    return rng.pick(candidates);
  }

  function selectComponentForEntity(
    entity: GameEntitySpec,
    visualKind: EntityVisualKind,
    rng?: Rng,
  ): ComponentCatalogEntry {
    const normalizedLabel = normalizeComponentLabel(entity.sourceLabel);

    const exact = pickFrom(
      compatible(labelIndex.get(normalizedLabel), entity),
      rng,
    );
    if (exact) return exact;

    if (normalizedLabel) {
      const containedLabels = [...labelIndex.keys()]
        .filter(
          (candidate) =>
            candidate.length >= 3 &&
            ` ${normalizedLabel} `.includes(` ${candidate} `),
        )
        .sort((a, b) => b.length - a.length);
      const pool: ComponentCatalogEntry[] = [];
      for (const candidate of containedLabels) {
        for (const match of compatible(labelIndex.get(candidate), entity)) {
          if (!pool.includes(match)) pool.push(match);
        }
        // Without an rng only the longest matching label may decide, so the
        // resolution of already-published specs never changes.
        if (!rng && pool.length > 0) break;
        if (pool.length >= CONTAINED_MATCH_POOL) break;
      }
      const contained = pickFrom(pool.slice(0, CONTAINED_MATCH_POOL), rng);
      if (contained) return contained;
    }

    const generic = entityEntries.filter(
      (entry) =>
        entry.rendererKey === visualKind && entry.mechanic === entity.mechanic,
    );
    const fallback = pickFrom(generic, rng);
    if (fallback) return fallback;

    throw new Error(
      `No registered component for ${entity.mechanic} / ${visualKind}`,
    );
  }

  function isSelectableEntityComponent(
    componentId: string | undefined,
    mechanic: GameEntitySpec["mechanic"],
  ): boolean {
    return entityEntries.some(
      (entry) =>
        entry.id === componentId &&
        (entry.metadata.componentType === "object-sprite" ||
          entry.mechanic === mechanic),
    );
  }

  return { selectComponentForEntity, isSelectableEntityComponent };
}

/**
 * Index over the bundled catalog. The client always resolves through this so
 * published games keep rendering even if a database row is later disabled.
 */
export const defaultComponentIndex = createComponentIndex(COMPONENT_CATALOG);

export function selectComponentForEntity(
  entity: GameEntitySpec,
  visualKind: EntityVisualKind,
): ComponentCatalogEntry {
  return defaultComponentIndex.selectComponentForEntity(entity, visualKind);
}

export function isSelectableEntityComponent(
  componentId: string | undefined,
  mechanic: GameEntitySpec["mechanic"],
): boolean {
  return defaultComponentIndex.isSelectableEntityComponent(componentId, mechanic);
}
