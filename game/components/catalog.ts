import { componentCatalogData, componentCatalogCounts } from "./catalog-data.mjs";
import type {
  ComponentCatalogEntry,
  ComponentCatalogQuery,
} from "./types";

export const COMPONENT_CATALOG = componentCatalogData as unknown as readonly ComponentCatalogEntry[];

export const COMPONENT_CATALOG_COUNTS = componentCatalogCounts as Readonly<{
  core: number;
  objects: number;
  total: number;
}>;

const byId = new Map(COMPONENT_CATALOG.map((entry) => [entry.id, entry]));

export function getComponentById(
  id: string | undefined,
): ComponentCatalogEntry | undefined {
  return id ? byId.get(id) : undefined;
}

export function queryComponentCatalog(
  query: ComponentCatalogQuery = {},
): ComponentCatalogEntry[] {
  const search = query.search?.trim().toLowerCase();
  return COMPONENT_CATALOG.filter((entry) => {
    if (!entry.enabled) return false;
    if (query.category && entry.category !== query.category) return false;
    if (query.runtimeScope && entry.runtimeScope !== query.runtimeScope) {
      return false;
    }
    if (query.mechanic && entry.mechanic !== query.mechanic) return false;
    if (!search) return true;
    return [entry.id, entry.name, entry.description, ...entry.tags, ...entry.aliases]
      .some((value) => value.toLowerCase().includes(search));
  });
}
