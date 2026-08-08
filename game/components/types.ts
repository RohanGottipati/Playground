import type { MechanicType } from "@/game/types";

export const COMPONENT_RUNTIME_SCOPES = [
  "entity",
  "player",
  "world",
  "ui",
  "future",
] as const;

export type ComponentRuntimeScope = (typeof COMPONENT_RUNTIME_SCOPES)[number];

export type ComponentCatalogEntry = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  aliases: string[];
  runtimeScope: ComponentRuntimeScope;
  mechanic: MechanicType | null;
  rendererKey: string | null;
  enabled: boolean;
  metadata: Record<string, string | number | boolean>;
};

export type ComponentCatalogQuery = {
  category?: string;
  runtimeScope?: ComponentRuntimeScope;
  mechanic?: MechanicType;
  search?: string;
};
