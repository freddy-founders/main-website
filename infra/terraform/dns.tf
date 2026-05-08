resource "cloudflare_dns_record" "www_worker_hostname" {
  count = var.cloudflare_zone_id == null ? 0 : 1

  zone_id = var.cloudflare_zone_id
  name    = "www"
  type    = "CNAME"
  content = var.production_domain
  ttl     = 1
  proxied = true
  comment = "Routes www.freddyfounders.com through Cloudflare to the Freddy Founders Worker custom domain."
}
