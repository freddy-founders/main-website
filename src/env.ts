export type DataSourceMode = 'auto' | 'memory' | 'supabase';

export interface SupabaseRuntimeConfig {
  url: string;
  anonKey: string;
}

export interface RuntimeConfig {
  dataSource: DataSourceMode;
  supabase: SupabaseRuntimeConfig | null;
}

const browserEnv =
  (import.meta as ImportMeta & { env?: Record<string, string | boolean | undefined> }).env ?? {};

export function getRuntimeConfig(env = browserEnv): RuntimeConfig {
  const dataSource = parseDataSource(valueFromEnv(env, 'VITE_DATA_SOURCE') ?? 'auto');
  const supabaseUrl = valueFromEnv(env, 'VITE_SUPABASE_URL');
  const supabaseAnonKey = valueFromEnv(env, 'VITE_SUPABASE_ANON_KEY');
  const supabase =
    supabaseUrl && supabaseAnonKey ? { url: supabaseUrl, anonKey: supabaseAnonKey } : null;

  if (dataSource === 'supabase' && !supabase) {
    throw new Error(
      'VITE_DATA_SOURCE=supabase requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }

  return { dataSource, supabase };
}

export function shouldUseSupabase(config = getRuntimeConfig()): boolean {
  return (
    config.dataSource === 'supabase' || (config.dataSource === 'auto' && config.supabase !== null)
  );
}

function parseDataSource(value: string): DataSourceMode {
  if (value === 'auto' || value === 'memory' || value === 'supabase') {
    return value;
  }

  throw new Error(`Invalid VITE_DATA_SOURCE value "${value}". Use auto, memory, or supabase.`);
}

function valueFromEnv(
  env: Record<string, string | boolean | undefined>,
  key: string,
): string | undefined {
  const value = env[key];

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
