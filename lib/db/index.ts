import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { MemoryRepository } from "./memory";
import { SupabaseRepository } from "./supabase";
import type { Repository } from "./types";

let cached: Repository | null = null;

/**
 * Supabase is used whenever service credentials exist; otherwise the app runs
 * fully in-memory so the create-play-publish loop still works locally.
 */
export function repository(): Repository {
  if (!cached) {
    cached = isSupabaseConfigured()
      ? new SupabaseRepository()
      : new MemoryRepository();
  }
  return cached;
}

export function resetRepository(): void {
  cached = null;
}

export type { Repository };
