import { createInMemoryAdapters } from '../adapters/memory';
import { createBrowserSupabaseClient, createSupabaseAdapters } from '../adapters/supabase';
import { getRuntimeConfig, shouldUseSupabase } from '../env';
import { createApplicationServices } from './services';

const runtimeConfig = getRuntimeConfig();
const supabaseClient = shouldUseSupabase(runtimeConfig)
  ? createBrowserSupabaseClient(runtimeConfig.supabase)
  : null;

export const applicationServices = createApplicationServices(
  supabaseClient ? createSupabaseAdapters(supabaseClient) : createInMemoryAdapters(),
);
