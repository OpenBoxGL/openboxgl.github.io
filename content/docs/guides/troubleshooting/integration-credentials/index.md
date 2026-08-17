---
title: Troubleshooting integration credentials
description: Diagnose RetroAchievements, IGDB, EmuMovies, and webhook credential problems.
---

Credentials are optional and come from three places in order: persisted settings, `.env` files, and the process environment (environment wins). All credential values are redacted from the diagnostic log and never returned by the API (`*_set` booleans instead).

## RetroAchievements

- **Required**: username and web API key, from Settings > RetroAchievements or `~/.env` (`RETROACHIEVEMENTS_USERNAME` / `RETROACHIEVEMENTS_API_KEY`, with aliases `RA_USERNAME`/`RA_API_KEY` and others).
- Credentials are validated against `API_GetUserProfile.php` before saving; rejected credentials raise `400`.
- Matching needs a local ROM file (ZIP and 7z hashing supported), and only supported platforms auto-match (NES, SNES, N64, GB/C/A, Genesis/MD, SMS, Game Gear, Atari 2600/7800, Lynx, PC Engine, Arcade by set name). Other platforms require entering a RetroAchievements Game ID manually in Edit metadata.
- `"Configure RetroAchievements first."` means no credentials are saved.

## IGDB

- Needs `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` in `~/.env` only (Twitch developer app credentials).
- Missing credentials make IGDB routes return `400` with `"Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in ~/.env to use IGDB."`

## EmuMovies

- Requires a licensed account; credentials come from Settings or `~/.env` (`EMUMOVIES_USERNAME` / `EMUMOVIES_PASSWORD`).
- Missing credentials raise `"Configure EmuMovies credentials in Settings first."`; the service rejects unlicensed credentials.

## Webhooks

- HTTPS is required unless `OPENBOX_ALLOW_HTTP_WEBHOOKS=1` is set (trusted local testing only).
- Loopback URLs pointing at the running server are rejected (port match and live TCP probe), so the app cannot webhook itself.
- Secrets are stored locally, preserved through `secret_set`, and never returned by GET responses. Delivery failures appear as notifications with a `webhook:<event_id>` dedupe key.

## General

- Credentials resolve in order: persisted settings file, then `.env`, then process environment (environment wins because `.env` never overrides an existing variable).
- Logs redact credentials, but may include game names and file paths, so review a copied log before sharing it.
- Keep `.env`, `retroachievements.json`, and `emumovies.json` private; they are plaintext files with owner-only permissions.

## See also

- [Accounts and media](/integrations/accounts-and-media/), setup for each provider
- [Configuration](/reference/configuration/), the full environment table and aliases
- [Webhooks](/integrations/webhooks/), delivery, signing, and URL validation
