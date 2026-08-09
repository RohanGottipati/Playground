import { NextResponse } from "next/server";
import { queryComponentCatalog } from "@/game/components/catalog";
import { COMPONENT_RUNTIME_SCOPES } from "@/game/components/types";
import type { ComponentRuntimeScope } from "@/game/components/types";
import type { MechanicType } from "@/game/types";

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

  // The bundled files are the single source of truth for components — the
  // same set game generation skins its templates from.
  const components = queryComponentCatalog({
    category,
    runtimeScope,
    mechanic,
    search,
  });
  return NextResponse.json({ components, count: components.length, source: "source" });
}
