import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { componentCatalogData } from "../game/components/catalog-data.mjs";

async function loadLocalEnv() {
  try {
    const contents = await readFile(resolve(process.cwd(), ".env"), "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const entityEntries = componentCatalogData.filter(
  (entry) => entry.enabled && entry.runtimeScope === "entity" && entry.rendererKey,
);

function componentIdFor(entity) {
  const label = normalize(entity.sourceLabel);
  const labelCompatible = (entry) =>
    entry.metadata.componentType === "object-sprite" ||
    entry.mechanic === entity.mechanic;
  const compatible = entityEntries.filter(labelCompatible);
  const exact = compatible.find(
    (entry) =>
      entry.metadata.componentType === "object-sprite" &&
      [entry.name, ...entry.aliases].some(
        (candidate) => normalize(candidate) === label,
      ),
  );
  if (exact) return exact.id;

  const contained = compatible
    .filter((entry) =>
      entry.metadata.componentType === "object-sprite" &&
      [entry.name, ...entry.aliases].some((candidate) => {
        const normalized = normalize(candidate);
        return normalized.length >= 3 && (` ${label} `).includes(` ${normalized} `);
      }),
    )
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (contained) return contained.id;

  const renderer = compatible.find(
    (entry) => entry.rendererKey === entity.visual?.kind,
  );
  if (!renderer) {
    throw new Error(`No component for ${entity.mechanic}/${entity.visual?.kind}`);
  }
  return renderer.id;
}

function withComponentIds(spec) {
  if (!spec || !Array.isArray(spec.entities)) return { spec, changed: false };
  let changed = false;
  const entities = spec.entities.map((entity) => {
    if (!entity.visual?.kind) return entity;
    const componentId = componentIdFor(entity);
    if (entity.visual.componentId === componentId) return entity;
    changed = true;
    return { ...entity, visual: { ...entity.visual, componentId } };
  });
  return {
    changed,
    spec: changed ? { ...spec, visualVersion: 1, entities } : spec,
  };
}

await loadLocalEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
  );
}

const client = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await client.from("games").select("id,game_spec").limit(1000);
if (error) throw new Error(`Could not load games: ${error.message}`);

const updates = (data ?? [])
  .map((row) => ({ id: row.id, ...withComponentIds(row.game_spec) }))
  .filter((row) => row.changed);

if (process.argv.includes("--dry-run")) {
  console.log(`Game component backfill valid: ${updates.length} game(s) need updates.`);
  process.exit(0);
}

for (const update of updates) {
  const { error: updateError } = await client
    .from("games")
    .update({ game_spec: update.spec })
    .eq("id", update.id);
  if (updateError) {
    throw new Error(`Could not update game ${update.id}: ${updateError.message}`);
  }
}

console.log(`Backfilled component ids in ${updates.length} game(s).`);
