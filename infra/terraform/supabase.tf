locals {
  supabase_resource_model = {
    data_source_of_truth = "supabase/migrations/*.sql"
    auth_source_of_truth = "Supabase Auth plus SQL-owned profiles/roles/RLS"
    terraform_owns = [
      "future Supabase project/settings resources after ownership and remote state are confirmed",
    ]
    terraform_does_not_own = [
      "current Supabase project",
      "database schema",
      "row level security policies",
      "seed data",
      "generated database types",
      "browser anon/publishable key values",
    ]
  }

  supabase_project_ref = var.supabase_project_ref
}

# Supabase schema/policy truth is intentionally migration-owned.
# Activate/link the project with: SUPABASE_PROJECT_REF=... pnpm supabase:activate
# Do not add Supabase Terraform resources until durable remote state/locking exists.
