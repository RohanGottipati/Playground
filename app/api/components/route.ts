import { NextResponse } from "next/server";
import {
  queryComponentCatalog,
} from "@/game/components/catalog";
import { COMPONENT_RUNTIME_SCOPES } from "@/game/components/types";
import type {
  ComponentCatalogEntry,
  ComponentRuntimeScope,
} from "@/game/components/types";
import type { MechanicType } from "@/game/types";
import { supabaseServer } from "@/lib/supabase/server";

const MECHANICS = new Set<MechanicType>([
  "static_platform",
  "moving_platform",
  "bounce_pad",
  "hazard",
  "collectible",
  "portal",
  "goal",
]);
const SCOPES = new Set<string>(COMPONENT_RUNTIME_SCOPES);
const SAFE_CATEGORY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ComponentRow = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  aliases: string[];
  runtime_scope: ComponentRuntimeScope;
  mechanic: MechanicType | null;
  renderer_key: string | null;
  enabled: boolean;
  metadata: Record<string, string | number | boolean>;
};

function toEntry(row: ComponentRow): ComponentCatalogEntry {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    tags: row.tags,
    aliases: row.aliases,
    runtimeScope: row.runtime_scope,
    mechanic: row.mechanic,
    rendererKey: row.renderer_key,
    enabled: row.enabled,
    metadata: row.metadata,
  };
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const category = params.get("category")?.trim() || undefined;
  const scopeValue = params.get("scope")?.trim();
  const mechanicValue = params.get("mechanic")?.trim();
  const search = params.get("q")?.trim().slice(0, 80) || undefined;

  if (category && !SAFE_CATEGORY.test(category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }
  if (scopeValue && !SCOPES.has(scopeValue)) {
    return NextResponse.json({ error: "invalid runtime scope" }, { status: 400 });
  }
  if (mechanicValue && !MECHANICS.has(mechanicValue as MechanicType)) {
    return NextResponse.json({ error: "invalid mechanic" }, { status: 400 });
  }

  const runtimeScope = scopeValue as ComponentRuntimeScope | undefined;
  const mechanic = mechanicValue as MechanicType | undefined;
  const client = supabaseServer();

  if (client) {
    let query = client
      .from("component_catalog")
      .select(
        "id,name,category,description,tags,aliases,runtime_scope,mechanic,renderer_key,enabled,metadata",
      )
      .eq("enabled", true)
      .order("category")
      .order("name")
      .limit(500);
    if (category) query = query.eq("category", category);
    if (runtimeScope) query = query.eq("runtime_scope", runtimeScope);
    if (mechanic) query = query.eq("mechanic", mechanic);

    const { data, error } = await query;
    if (!error) {
      const needle = search?.toLowerCase();
      const components = ((data ?? []) as ComponentRow[])
        .map(toEntry)
        .filter(
          (entry) =>
            !needle ||
            [
              entry.id,
              entry.name,
              entry.description,
              ...entry.tags,
              ...entry.aliases,
            ].some((value) => value.toLowerCase().includes(needle)),
        );
      return NextResponse.json({ components, count: components.length, source: "database" });
    }
  }

  const components = queryComponentCatalog({
    category,
    runtimeScope,
    mechanic,
    search,
  });
  return NextResponse.json({ components, count: components.length, source: "source" });
}
