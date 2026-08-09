import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  componentCatalogCounts,
  componentCatalogData,
} from "../game/components/catalog-data.mjs";

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

function assertCatalog() {
  if (componentCatalogCounts.total !== 354) {
    throw new Error(`Expected 354 catalog entries, found ${componentCatalogCounts.total}`);
  }
  const ids = new Set();
  for (const entry of componentCatalogData) {
    if (ids.has(entry.id)) throw new Error(`Duplicate component id: ${entry.id}`);
    ids.add(entry.id);
  }
  const objectEntries = componentCatalogData.filter(
    (entry) => entry.metadata.componentType === "object-sprite",
  );
  if (
    objectEntries.length !== 216 ||
    objectEntries.some(
      (entry) =>
        entry.runtimeScope !== "entity" ||
        entry.rendererKey !== `object.${entry.id}`,
    )
  ) {
    throw new Error("Every everyday-object component must have an exact entity renderer");
  }
}

await loadLocalEnv();
assertCatalog();

if (process.argv.includes("--dry-run")) {
  console.log(
    `Component catalog valid: ${componentCatalogCounts.total} entries (${componentCatalogCounts.core} core, ${componentCatalogCounts.objects} everyday objects).`,
  );
  process.exit(0);
}

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

const rows = componentCatalogData.map((entry) => ({
  id: entry.id,
  name: entry.name,
  category: entry.category,
  description: entry.description,
  tags: entry.tags,
  aliases: entry.aliases,
  runtime_scope: entry.runtimeScope,
  mechanic: entry.mechanic,
  renderer_key: entry.rendererKey,
  enabled: entry.enabled,
  metadata: entry.metadata,
  updated_at: new Date().toISOString(),
}));

const batchSize = 200;
for (let offset = 0; offset < rows.length; offset += batchSize) {
  const { error } = await client
    .from("component_catalog")
    .upsert(rows.slice(offset, offset + batchSize), { onConflict: "id" });
  if (error) throw new Error(`Catalog upsert failed: ${error.message}`);
}

const { count, error: countError } = await client
  .from("component_catalog")
  .select("id", { count: "exact", head: true })
  .in("id", rows.map((row) => row.id));
if (countError) throw new Error(`Catalog verification failed: ${countError.message}`);
if (count !== rows.length) {
  throw new Error(`Catalog verification expected ${rows.length} rows, found ${count}`);
}

console.log(`Synced and verified ${count} component catalog rows.`);
