#!/usr/bin/env sh
set -eu

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

node scripts/check-env-contract.mjs --cloudflare-deploy

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "Missing CLOUDFLARE_API_TOKEN. Set it locally or as a GitHub Actions secret."
  exit 1
fi

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "Missing CLOUDFLARE_ACCOUNT_ID. Set it locally or as a GitHub Actions variable."
  exit 1
fi

pnpm build
pnpm exec wrangler deploy
