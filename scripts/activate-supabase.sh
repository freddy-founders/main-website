#!/usr/bin/env sh
set -eu

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

node scripts/check-env-contract.mjs --supabase-activation

if [ -n "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  export SUPABASE_ACCESS_TOKEN
fi

if [ -z "${SUPABASE_PROJECT_REF:-}" ]; then
  echo "Missing SUPABASE_PROJECT_REF. Set it to the Supabase project ref before activation."
  exit 1
fi

supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase db push
supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" > src/adapters/supabase/database.types.ts

printf '\nSupabase activation complete. Set VITE_DATA_SOURCE=supabase with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use remote data.\n'
