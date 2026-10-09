---
title: Security
description: Report vulnerabilities and protect local OpenBoxGL data.
---

## Reporting a vulnerability

Do not report security vulnerabilities in public issues. Use the [private GitHub security advisory form](https://github.com/vindeckyy/OpenBoxGL/security/advisories/new). If advisories are unavailable, open a minimal public issue asking for a private contact channel without disclosing exploit details. Include the issue description and impact, reproduction steps, affected version(s), a proof of concept if available, and a suggested remediation.

Maintainers aim to acknowledge valid reports within 5 business days and provide a remediation plan or status update within 14 business days.

## Fixed in 1.16.0: what 1.15.x and earlier are exposed to

If you run 1.15.x or older, these are the security defects 1.16.0 closes. **None of them is backported, so upgrading is the fix.**

- **Arbitrary `.json` read through a crafted `preview_id`.** The import setup preview and the Launch Doctor joined the request's `preview_id` into a file path without checking it, so a `../`-laden id returned any JSON file on disk, `settings.json` with your provider credentials included. Every `preview_id` now goes through one identifier validator and a containment check.
- **Arbitrary file write through a game's `rom_name`.** Restoring a high-score bundle built the destination filename from `rom_name`, so a traversal string wrote outside the high-score folder. The name is reduced to a safe component and the destination is checked to stay inside that folder.
- **Plugins reading your library.** The plugin sandbox masked a fixed list of paths, so if you had moved your OpenBox data folder with `OPENBOX_DATA_DIR`, a sandboxed plugin could read `library.json` and `settings.json`. The resolved data directory is now hidden from plugins wherever it lives.
- **Unescaped text in the Wrapped report.** Game names reached the page without escaping. Your CSP blocked script execution, so this was one policy change away from being exploitable rather than exploitable directly; names are escaped now, and an automated check fails if the pattern returns.
- **An outside package changing how your library is saved.** When a particular third-party Python package happened to be installed, OpenBox used it to serialize state, and it could write the file differently. The runtime is standard-library only now, and an automated check enforces it.

## Supported versions

| Version | Support |
| --- | --- |
| 1.16.x | Yes (current) |
| 1.15.x | No — upgrade required (see above) |
| 1.14.x | No — upgrade required |
| 1.13.x | No — upgrade required |
| 1.12.x | No — upgrade required |
| 1.11.x | No — upgrade required |
| 1.10.x | No — upgrade required |
| 1.9.x | No — upgrade required |
| 1.8.x | No — upgrade required |
| 1.7.x | No — upgrade required |
| 1.6.x | No — upgrade required |
| 1.5.x | No — upgrade required |
| 1.4.x | No — upgrade required |
| 1.3.x | No — upgrade required |
| 1.2.x | No — upgrade required |
| 1.1.x | No — upgrade required |
| 1.0.x | No — upgrade required |
| 0.9.x | No — upgrade required |
| 0.8.x | No — upgrade required |
| 0.7.x | Best effort |
| 0.6.x | Best effort |
| 0.5.x | Best effort |
| 0.4.x | Best effort |
| < 0.4.0 | No |

Only the latest release on the `master` branch is maintained, and the 1.16.x line is the current maintained release. The older rows document the historical support policy and do not promise backports; upgrade to 1.16.x to receive fixes.

## Protecting local data

- Keep `server.token`, provider credentials, webhook secrets, exported library files, and local paths private. The token grants full read/write access to the local API.
- The API is designed for loopback use and does not terminate HTTPS. Use a trusted network and an external reverse proxy if exposing it beyond the host.
- The diagnostic log (`openbox.log`, rotating at 2 MiB x 4) redacts tokens, passwords, API keys, and authorization headers, but can include game names and local file paths; review it before sharing it.
- State files, backups, credentials, and the session token are written with owner-only permissions (`0o600`). A `.env` file is plaintext: keep it out of version control.
- Webhooks refuse plain HTTP by default (`OPENBOX_ALLOW_HTTP_WEBHOOKS=1` enables it only for trusted local tests), reject reserved/loopback-self addresses, and sign deliveries with HMAC-SHA256.
- Restores and extractions validate archive members and reject symlinks, absolute paths, and `..` traversal.

## Scope and warranty

OpenBoxGL is provided under AGPL-3.0 without warranty. The maintenance source is [SECURITY.md](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/SECURITY.md).

## Related pages

- [Roadmap](/roadmap/) — what is in the current release and what is genuinely not shipped yet.
- [Changelog](/changelog/) — the full release history, including what each release fixed.
