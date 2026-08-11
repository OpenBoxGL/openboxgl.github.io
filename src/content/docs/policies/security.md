---
title: Security
description: Report vulnerabilities and protect local OpenBoxGL data.
---

Do not report security vulnerabilities in public issues. Use the [private GitHub security advisory form](https://github.com/vindeckyy/OpenBoxGL/security/advisories/new).

Keep `server.token`, provider credentials, webhook secrets, exported library files, and local paths private. The API is designed for loopback use and does not terminate HTTPS. Use a trusted network and an external reverse proxy if exposing it beyond the host.

The maintenance source is [`SECURITY.md`](https://github.com/vindeckyy/OpenBoxGL/blob/master/SECURITY.md). OpenBoxGL is provided under AGPL-3.0 without warranty.
