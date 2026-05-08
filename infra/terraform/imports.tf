data "cloudflare_dns_records" "www_worker_hostname" {
  zone_id   = var.cloudflare_zone_id
  max_items = 1
  type      = "CNAME"

  name = {
    exact = "www.${var.production_domain}"
  }
}

import {
  to = cloudflare_dns_record.www_worker_hostname[0]
  id = "${var.cloudflare_zone_id}/${one(data.cloudflare_dns_records.www_worker_hostname.result).id}"
}
