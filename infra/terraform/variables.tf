variable "cloudflare_api_token" {
  description = "Cloudflare API token. Pass via TF_VAR_cloudflare_api_token or CI secrets."
  type        = string
  sensitive   = true
  default     = null
}

variable "cloudflare_account_id" {
  description = "Cloudflare account id that owns Freddy Founders deployment resources."
  type        = string
  default     = null
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone id for freddyfounders.com."
  type        = string
  default     = "74ec913536bf5f472f564d6a9fbb48c2"
}

variable "supabase_access_token" {
  description = "Supabase access token. Pass via TF_VAR_supabase_access_token or CI secrets."
  type        = string
  sensitive   = true
  default     = null
}

variable "supabase_organization_id" {
  description = "Supabase organization id for project resources when Terraform ownership is activated."
  type        = string
  default     = null
}

variable "supabase_project_ref" {
  description = "Existing Supabase project ref once created/linked."
  type        = string
  default     = null
}

variable "project_name" {
  description = "Canonical project name used across providers."
  type        = string
  default     = "freddy-founders"
}

variable "production_domain" {
  description = "Production apex domain."
  type        = string
  default     = "freddyfounders.com"
}
