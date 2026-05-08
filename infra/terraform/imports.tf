data "cloudflare_dns_records" "www_worker_hostname" {
  zone_id   = var.cloudflare_zone_id
  max_items = 1
  type      = "CNAME"

  name = {
    exact = "www.${var.production_domain}"
  }
}


