locals {
  supabase_resource_model = {
    data_source_of_truth = "supabase/migrations/*.sql"
    auth_source_of_truth = "Supabase Auth plus SQL-owned profiles/roles/RLS"
    terraform_owns       = ["project/settings when project ownership is activated"]
    terraform_does_not_own = [
      "database schema",
      "row level security policies",
      "seed data",
      "generated database types",
    ]
  }
}

# Supabase schema/policy truth is intentionally migration-owned.
# Add project/settings resources here once the organization/project ownership model is known.
