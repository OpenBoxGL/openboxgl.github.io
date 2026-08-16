---
title: Security
description: Report vulnerabilities and protect local OpenBoxGL data.
---

## Reporting a vulnerability

Do not report security vulnerabilities in public issues. Use the [private GitHub security advisory form](https://github.com/vindeckyy/OpenBoxGL/security/advisories/new). If advisories are unavailable, open a minimal public issue asking for a private contact channel without disclosing exploit details. Include the issue description and impact, reproduction steps, affected version(s), a proof of concept if available, and a suggested remediation.

Maintainers aim to acknowledge valid reports within 5 business days and provide a remediation plan or status update within 14 business days.

## Supported versions

| Version | Support |
| --- | --- |
| 1.3.x | Yes |
| 1.2.x | Yes |
| 1.1.x | Yes |
| 1.0.x | Yes |
| 0.9.x | Yes |
| 0.8.x | Yes |
| 0.7.x | Best effort |
| 0.6.x | Best effort |
| 0.5.x | Best effort |
| 0.4.x | Best effort |
| < 0.4.0 | No |

Security fixes are provided for the latest release on the `master` branch.

## Protecting local data

- Keep `server.token`, provider credentials, webhook secrets, exported library files, and local paths private. The token grants full read/write access to the local API.
- The API is designed for loopback use and does not terminate HTTPS. Use a trusted network and an external reverse proxy if exposing it beyond the host.
- The diagnostic log (`openbox.log`, rotating at 2 MiB x 4) redacts tokens, passwords, API keys, and authorization headers, but can include game names and local file paths; review it before sharing it.
- State files, backups, credentials, and the session token are written with owner-only permissions (`0o600`). A `.env` file is plaintext: keep it out of version control.
- Webhooks refuse plain HTTP by default (`OPENBOX_ALLOW_HTTP_WEBHOOKS=1` enables it only for trusted local tests), reject reserved/loopback-self addresses, and sign deliveries with HMAC-SHA256.
- Restores and extractions validate archive members and reject symlinks, absolute paths, and `..` traversal.

## Scope and warranty

OpenBoxGL is provided under AGPL-3.0 without warranty. The maintenance source is [SECURITY.md](https://github.com/vindeckyy/OpenBoxGL/blob/master/SECURITY.md).
