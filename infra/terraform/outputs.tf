output "project_name" {
  description = "Canonical project name used by provider resources."
  value       = var.project_name
}

output "cloudflare_resource_model" {
  description = "Cloudflare ownership boundary for Everything-as-Code."
  value       = local.cloudflare_resource_model
}

output "supabase_resource_model" {
  description = "Supabase ownership boundary for Everything-as-Code."
  value       = local.supabase_resource_model
}
