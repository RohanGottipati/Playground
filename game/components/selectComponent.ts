import type { EntityVisualKind, GameEntitySpec } from "@/game/types";
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

const entityEntries = COMPONENT_CATALOG.filter(
  (entry) =>
    entry.enabled &&
    entry.runtimeScope === "entity" &&
    Boolean(entry.rendererKey),
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
): ComponentCatalogEntry | undefined {
  return (
    entries?.find(
      (entry) => entry.metadata.componentType === "object-sprite",
    ) ?? entries?.find((entry) => entry.mechanic === entity.mechanic)
  );
}

/**
 * Selects a component that the current Phaser engine can actually execute.
 * Catalog-only UI, enemy, and future-mechanic rows are deliberately excluded.
 */
export function selectComponentForEntity(
  entity: GameEntitySpec,
  visualKind: EntityVisualKind,
): ComponentCatalogEntry {
  const normalizedLabel = normalizeComponentLabel(entity.sourceLabel);

  const exact = compatible(labelIndex.get(normalizedLabel), entity);
  if (exact) return exact;

  if (normalizedLabel) {
    const containedLabels = [...labelIndex.keys()]
      .filter(
        (candidate) =>
          candidate.length >= 3 &&
          (` ${normalizedLabel} `).includes(` ${candidate} `),
      )
      .sort((a, b) => b.length - a.length);
    for (const candidate of containedLabels) {
      const match = compatible(labelIndex.get(candidate), entity);
      if (match) return match;
    }
  }

  const rendererMatch = entityEntries.find(
    (entry) =>
      entry.rendererKey === visualKind && entry.mechanic === entity.mechanic,
  );
  if (rendererMatch) return rendererMatch;

  throw new Error(
    `No registered component for ${entity.mechanic} / ${visualKind}`,
  );
}

export function isSelectableEntityComponent(
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
