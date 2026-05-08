import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getRuntimeConfig, type SupabaseRuntimeConfig } from '../../env';

export type SupabaseBrowserConfig = SupabaseRuntimeConfig;

export function getSupabaseBrowserConfig(): SupabaseBrowserConfig | null {
  return getRuntimeConfig().supabase;
}

export function createBrowserSupabaseClient(
  config = getSupabaseBrowserConfig(),
): SupabaseClient<Database> | null {
  if (!config) {
    return null;
  }

  return createClient<Database>(config.url, config.anonKey);
}
