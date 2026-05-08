locals {
  cloudflare_resource_model = {
    deployment_substrate = "Cloudflare Workers static assets or Pages"
    config_source        = "wrangler.jsonc"
    terraform_owns       = ["account settings", "DNS/custom domain when known", "future routable resources"]
    terraform_does_not_own = [
      "application source code",
      "build artifacts",
      "runtime secrets committed to git",
    ]
  }
}

# Keep Cloudflare deployment config in wrangler.jsonc for v0.
# Add concrete Terraform resources here once the Cloudflare account/zone/domain are chosen.
