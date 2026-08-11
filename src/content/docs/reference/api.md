---
title: REST API
description: Use the local authenticated HTTP API for automation.
---

The API listens on loopback at `http://127.0.0.1:SERVER_PORT`. OpenBoxGL does not terminate HTTPS. Use an external reverse proxy only when you understand the trust boundary.

Authenticate with `X-OpenBox-Token: TOKEN`; query `token` is supported but can leak through history and logs. JSON request bodies are limited to 65,536 bytes.

Common errors include 403 `{"error":"Unauthorized"}`, 400 validation errors, 404 `{"error":"Not found"}`, 503 corrupt-state errors, and 500 diagnostic-log errors. Operation-specific routes include `/api/library`, `/api/settings`, `/api/launch`, `/api/queue`, `/api/tags`, `/api/notifications`, and `/api/webhooks`.

Keep exported library data and local paths sensitive. See [Configuration](/reference/configuration/) and the application source for the current route contract.
