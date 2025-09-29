
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function connectSupabase(url: string, key: string): SupabaseClient {
  if (!url || !key) {
    throw new Error("Supabase URL and Key must be provided.");
  }
  supabase = createClient(url, key);
  return supabase;
}

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase client has not been initialized. Call connectSupabase first.");
  }
  return supabase;
}

export function isSupabaseConnected(): boolean {
  return supabase !== null;
}
