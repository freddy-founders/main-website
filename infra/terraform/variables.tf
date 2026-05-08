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

variable "create_supabase_project" {
  description = "When true, Terraform creates the Supabase project. Default false assumes an existing project is linked through the Supabase CLI."
  type        = bool
  default     = false
}

variable "supabase_region" {
  description = "Supabase region used only when create_supabase_project is true."
  type        = string
  default     = "us-east-1"
}

variable "supabase_database_password" {
  description = "Initial database password used only when create_supabase_project is true. Pass via TF_VAR_supabase_database_password."
  type        = string
  sensitive   = true
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
