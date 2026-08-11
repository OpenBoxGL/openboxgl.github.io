---
title: Webhooks
description: Deliver signed best-effort event notifications to trusted destinations.
---

OpenBoxGL accepts up to 32 webhook configurations. Events are allowlisted, destinations are validated against local-address and loopback rules, and HTTPS is required by default. Set `OPENBOX_ALLOW_HTTP_WEBHOOKS=1` only for trusted local testing.

Secrets are preserved through `secret_set` and redacted in GET responses. Deliveries use HMAC-SHA256 signed JSON, bounded retries, and timeouts in an asynchronous best-effort path. The `/api/webhooks/test` operation makes an outbound request.

Keep webhook endpoints private and inspect failure notifications. See [API automation](/reference/api/) for request shapes.
