#!/usr/bin/env sh
set -eu

repo="${GITHUB_REPOSITORY:-freddy-founders/main-website}"

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "Missing CLOUDFLARE_API_TOKEN in local environment."
  echo "Create a Cloudflare API token with Workers deploy permissions, then rerun:"
  echo "  CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... pnpm bootstrap:github-cd"
  exit 1
fi

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "Missing CLOUDFLARE_ACCOUNT_ID in local environment."
  exit 1
fi

printf '%s' "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN --repo "$repo"
gh variable set CLOUDFLARE_ACCOUNT_ID --repo "$repo" --body "$CLOUDFLARE_ACCOUNT_ID"


if [ -n "${VITE_DATA_SOURCE:-}" ]; then
  gh variable set VITE_DATA_SOURCE --repo "$repo" --body "$VITE_DATA_SOURCE"
fi

if [ -n "${VITE_SUPABASE_URL:-}" ]; then
  gh variable set VITE_SUPABASE_URL --repo "$repo" --body "$VITE_SUPABASE_URL"
fi

if [ -n "${VITE_SUPABASE_ANON_KEY:-}" ]; then
  gh variable set VITE_SUPABASE_ANON_KEY --repo "$repo" --body "$VITE_SUPABASE_ANON_KEY"
fi

if [ -n "${SUPABASE_PROJECT_REF:-}" ]; then
  gh variable set SUPABASE_PROJECT_REF --repo "$repo" --body "$SUPABASE_PROJECT_REF"
fi
echo "GitHub Actions CD bootstrap complete for $repo."
echo "Configured secret: CLOUDFLARE_API_TOKEN"
echo "Configured variable: CLOUDFLARE_ACCOUNT_ID"
echo "Optional Supabase runtime variables are configured when present in local env."
