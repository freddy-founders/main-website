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

if [ -n "${SUPABASE_PROJECT_REF:-}" ] && [ -z "${TF_VAR_supabase_project_ref:-}" ]; then
  export TF_VAR_supabase_project_ref="$SUPABASE_PROJECT_REF"
fi

export TF_VAR_create_supabase_project="${TF_VAR_create_supabase_project:-false}"
export TF_IN_AUTOMATION="${TF_IN_AUTOMATION:-true}"

if [ -z "${TF_VAR_cloudflare_api_token:-}" ]; then
  echo "Missing CLOUDFLARE_API_TOKEN or TF_VAR_cloudflare_api_token. Terraform apply needs provider credentials."
  exit 1
fi

terraform -chdir=infra/terraform init -input=false
terraform -chdir=infra/terraform fmt -check -recursive
terraform -chdir=infra/terraform validate
terraform -chdir=infra/terraform plan -input=false -out=tfplan
terraform -chdir=infra/terraform apply -input=false -auto-approve tfplan
