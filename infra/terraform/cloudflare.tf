locals {
  cloudflare_resource_model = {
    deployment_substrate = "Cloudflare Workers static assets"
    config_source        = "wrangler.jsonc"
    terraform_owns       = ["DNS records", "future account settings", "future routable resources"]
    terraform_does_not_own = [
      "application source code",
      "build artifacts",
      "runtime secrets committed to git",
    ]
  }
}

# Worker deployment and custom-domain bindings are owned by wrangler.jsonc.
# DNS records that must exist for those custom domains are owned here.
