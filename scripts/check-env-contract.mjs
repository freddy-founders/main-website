import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const expectedKeys = [
  'VITE_DATA_SOURCE',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'SUPABASE_ACCESS_TOKEN',
  'SUPABASE_ORGANIZATION_ID',
  'SUPABASE_PROJECT_REF',
  'SUPABASE_DB_PASSWORD',
  'SUPABASE_REGION',
];

const exampleEnv = parseEnv(await readFile('.env.example', 'utf8'));
const localEnv = existsSync('.env') ? parseEnv(await readFile('.env', 'utf8')) : {};
const env = { ...localEnv, ...process.env };
const errors = [];

for (const key of expectedKeys) {
  if (!(key in exampleEnv)) {
    errors.push(`.env.example is missing ${key}`);
  }
}

const dataSource = env.VITE_DATA_SOURCE || exampleEnv.VITE_DATA_SOURCE || 'auto';
if (!['auto', 'memory', 'supabase'].includes(dataSource)) {
  errors.push('VITE_DATA_SOURCE must be one of: auto, memory, supabase');
}

if (dataSource === 'supabase') {
  requireEnv('VITE_SUPABASE_URL');
  requireEnv('VITE_SUPABASE_ANON_KEY');
}

if (hasValue(env.VITE_SUPABASE_URL)) {
  try {
    const url = new URL(env.VITE_SUPABASE_URL);
    if (url.protocol !== 'https:' && url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') {
      errors.push('VITE_SUPABASE_URL must use https unless it points at local Supabase');
    }
  } catch {
    errors.push('VITE_SUPABASE_URL must be a valid URL');
  }
}

if (
  hasValue(env.VITE_SUPABASE_ANON_KEY) &&
  !/^(eyJ|sb_publishable_)/.test(env.VITE_SUPABASE_ANON_KEY)
) {
  errors.push('VITE_SUPABASE_ANON_KEY should look like a Supabase anon JWT or publishable key');
}

if (hasValue(env.CLOUDFLARE_ACCOUNT_ID) && !/^[a-f0-9]{32}$/i.test(env.CLOUDFLARE_ACCOUNT_ID)) {
  errors.push('CLOUDFLARE_ACCOUNT_ID should be a 32-character hex account id');
}

if (hasValue(env.SUPABASE_PROJECT_REF) && !/^[a-z0-9]{20}$/i.test(env.SUPABASE_PROJECT_REF)) {
  errors.push('SUPABASE_PROJECT_REF should be the 20-character Supabase project ref');
}

if (hasValue(env.SUPABASE_REGION) && !/^[a-z]+-[a-z]+-\d+$/.test(env.SUPABASE_REGION)) {
  errors.push('SUPABASE_REGION should look like a cloud region, e.g. us-east-1');
}

if (process.argv.includes('--cloudflare-deploy')) {
  requireEnv('CLOUDFLARE_API_TOKEN');
  requireEnv('CLOUDFLARE_ACCOUNT_ID');
}

if (process.argv.includes('--supabase-activation')) {
  requireEnv('SUPABASE_ACCESS_TOKEN');
  requireEnv('SUPABASE_PROJECT_REF');
  requireEnv('VITE_SUPABASE_URL');
  requireEnv('VITE_SUPABASE_ANON_KEY');
}

if (errors.length > 0) {
  console.error('Environment contract check failed:\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Environment contract check passed.');

function requireEnv(key) {
  if (!hasValue(env[key])) {
    errors.push(`${key} is required for this mode`);
  }
}

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseEnv(source) {
  const parsed = {};

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    parsed[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }

  return parsed;
}
