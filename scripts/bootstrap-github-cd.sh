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

echo "GitHub Actions CD bootstrap complete for $repo."
echo "Configured secret: CLOUDFLARE_API_TOKEN"
echo "Configured variable: CLOUDFLARE_ACCOUNT_ID"
