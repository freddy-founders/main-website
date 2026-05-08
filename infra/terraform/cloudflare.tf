locals {
  cloudflare_resource_model = {
    deployment_substrate = "Cloudflare Workers static assets"
    config_source        = "wrangler.jsonc"
    terraform_owns       = ["future account settings", "future routable/account resources"]
    terraform_does_not_own = [
      "application source code",
      "build artifacts",
      "runtime secrets committed to git",
      "Workers custom-domain host records for freddyfounders.com and www.freddyfounders.com",
    ]
  }
}

# Worker deployment and custom-domain bindings are owned by wrangler.jsonc.
# Do not model duplicate host-level DNS records in Terraform for the Worker domains.
