#!/usr/bin/env sh
set -eu

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

if [ -n "${CLOUDFLARE_API_TOKEN:-}" ] && [ -z "${TF_VAR_cloudflare_api_token:-}" ]; then
  export TF_VAR_cloudflare_api_token="$CLOUDFLARE_API_TOKEN"
fi

if [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] && [ -z "${TF_VAR_cloudflare_account_id:-}" ]; then
  export TF_VAR_cloudflare_account_id="$CLOUDFLARE_ACCOUNT_ID"
fi

if [ -n "${SUPABASE_ACCESS_TOKEN:-}" ] && [ -z "${TF_VAR_supabase_access_token:-}" ]; then
  export TF_VAR_supabase_access_token="$SUPABASE_ACCESS_TOKEN"
fi

if [ -n "${SUPABASE_ORGANIZATION_ID:-}" ] && [ -z "${TF_VAR_supabase_organization_id:-}" ]; then
  export TF_VAR_supabase_organization_id="$SUPABASE_ORGANIZATION_ID"
fi

if [ -n "${SUPABASE_PROJECT_REF:-}" ] && [ -z "${TF_VAR_supabase_project_ref:-}" ]; then
  export TF_VAR_supabase_project_ref="$SUPABASE_PROJECT_REF"
fi

if [ -n "${SUPABASE_DB_PASSWORD:-}" ] && [ -z "${TF_VAR_supabase_database_password:-}" ]; then
  export TF_VAR_supabase_database_password="$SUPABASE_DB_PASSWORD"
fi

if [ -n "${SUPABASE_REGION:-}" ] && [ -z "${TF_VAR_supabase_region:-}" ]; then
  export TF_VAR_supabase_region="$SUPABASE_REGION"
fi

if [ -z "${TF_VAR_cloudflare_api_token:-}" ]; then
  echo "Missing CLOUDFLARE_API_TOKEN or TF_VAR_cloudflare_api_token. Terraform plan needs provider credentials."
  exit 1
fi

terraform -chdir=infra/terraform init
terraform -chdir=infra/terraform fmt -check -recursive
terraform -chdir=infra/terraform validate
terraform -chdir=infra/terraform plan
