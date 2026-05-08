locals {
  supabase_resource_model = {
    data_source_of_truth = "supabase/migrations/*.sql"
    auth_source_of_truth = "Supabase Auth plus SQL-owned profiles/roles/RLS"
    terraform_owns = [
      "optional project creation when create_supabase_project is true",
      "future project/settings resources after ownership is confirmed",
    ]
    terraform_does_not_own = [
      "database schema",
      "row level security policies",
      "seed data",
      "generated database types",
      "browser anon/publishable key values",
    ]
  }

  supabase_project_ref = coalesce(var.supabase_project_ref, try(supabase_project.freddy_founders[0].id, null))
}

resource "supabase_project" "freddy_founders" {
  count = var.create_supabase_project ? 1 : 0

  name              = var.project_name
  organization_id   = var.supabase_organization_id
  region            = var.supabase_region
  database_password = var.supabase_database_password
}

# Supabase schema/policy truth is intentionally migration-owned.
# Activate an existing project with: SUPABASE_PROJECT_REF=... pnpm supabase:activate
# Set create_supabase_project=true only when Terraform should create the project itself.
