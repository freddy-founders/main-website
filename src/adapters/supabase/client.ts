import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export interface SupabaseBrowserConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseBrowserConfig(): SupabaseBrowserConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function createBrowserSupabaseClient(
  config = getSupabaseBrowserConfig(),
): SupabaseClient<Database> | null {
  if (!config) {
    return null;
  }

  return createClient<Database>(config.url, config.anonKey);
}
