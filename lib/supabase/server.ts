import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Anon server client for read-only queries against published rows. Server code
 * that needs to write uses `supabaseAdmin()` instead.
 */
export function supabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
