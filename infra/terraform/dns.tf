# No standalone Cloudflare DNS record resources are managed here.
# The Freddy Founders Worker custom-domain bindings in wrangler.jsonc already own
# the host-level routing for freddyfounders.com and www.freddyfounders.com.
# Terraform should not create duplicate DNS records for those hosts.
