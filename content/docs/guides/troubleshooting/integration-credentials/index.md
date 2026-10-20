---
title: Troubleshooting integration credentials
description: Diagnose RetroAchievements, IGDB, EmuMovies, and webhook credential problems.
---

Credentials are optional, and where each one comes from depends on the provider rather than on one global order. All credential values are redacted from the diagnostic log and never returned by the API (`*_set` booleans instead).

- **RetroAchievements** — the saved `retroachievements.json` wins; the environment fills in what the file does not have.
- **EmuMovies** — the saved `emumovies.json` wins; the environment fills in what the file does not have.
- **Steam** — a saved value wins per field; the environment fills the gaps.
- **IGDB, ScreenScraper, SteamGridDB** — environment only; the `~/.env` pair or key is the only source.
- **Gameyfin** — settings only; the URL, username, and password come from the settings dialog.

In every case the process environment beats `.env`, because `.env` never overrides an existing variable.

## RetroAchievements

- **Required**: username and web API key, from Settings > RetroAchievements or `~/.env` (`RETROACHIEVEMENTS_USERNAME` / `RETROACHIEVEMENTS_API_KEY`, with aliases `RA_USERNAME`/`RA_API_KEY` and others).
- Credentials are validated against `API_GetUserProfile.php` before saving; rejected credentials raise `400 "RetroAchievements rejected those credentials."` (HTTP `401`/`403` or a profile without a `User`).
- Matching needs a local ROM file (ZIP and 7z hashing supported), and only supported platforms auto-match (NES, SNES, N64, GB/C/A, Genesis/MD, SMS, Game Gear, Atari 2600/7800, Lynx, PC Engine, Arcade by set name). Other platforms require entering a RetroAchievements Game ID manually in Edit metadata.
- `"Configure RetroAchievements first."` means no credentials are saved.

## IGDB

- Needs `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` in `~/.env` only (Twitch developer app credentials).
- Missing credentials make IGDB routes return `400` with `"Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in ~/.env to use IGDB."`

## EmuMovies

- Requires a licensed account; credentials come from Settings or `~/.env` (`EMUMOVIES_USERNAME` / `EMUMOVIES_PASSWORD`).
- Missing credentials raise `"Configure EmuMovies credentials in Settings first."`; the service rejects unlicensed credentials.

## Stored tokens and the masked view

Optional tokens for IGDB, ScreenScraper, SteamGridDB, Gameyfin, and RetroAchievements can be stored in settings. They are kept out of the public settings projection: the library state exposes only booleans (`integration_tokens.<provider>`), and `GET /api/v2/integration-tokens` returns the provider list plus a masked form (`abcd…yz`, or `••••` for short values). The full value is never returned to the browser and is redacted from the diagnostic log.

- `POST /api/v2/integration-tokens` with `{"provider": "<name>", "token": "<value>"}` saves one token; an unknown provider or an empty/oversized/control-character value is rejected.
- `POST /api/v2/integration-tokens/remove` with the provider clears it.
- Storing a token does not change where a provider reads its operational credentials: IGDB still needs `IGDB_CLIENT_ID`/`IGDB_CLIENT_SECRET`, ScreenScraper `SCREENSCRAPER_USER`/`SCREENSCRAPER_PASSWORD`, and SteamGridDB `STEAMGRIDDB_API_KEY` in `~/.env`. The token store is the private, masked record of those values for the settings UI; the provider adapters keep reading `~/.env`.

## Webhooks

- HTTPS is required unless `OPENBOX_ALLOW_HTTP_WEBHOOKS=1` is set (trusted local testing only).
- Loopback URLs pointing at the running server are rejected (port match and live TCP probe), so the app cannot webhook itself.
- Secrets are stored locally, preserved through `secret_set`, and never returned by GET responses. Delivery failures appear as notifications with a `webhook:<event_id>` dedupe key.

## General

- Precedence is per provider, not global: RetroAchievements and EmuMovies prefer their saved file and fall back to the environment, Steam resolves field by field (file first, environment for the gaps), IGDB/ScreenScraper/SteamGridDB are environment only, and Gameyfin is settings only. The process environment beats `.env` in every case, because `.env` never overrides an existing variable.
- Logs redact credentials, but may include game names and file paths, so review a copied log before sharing it.
- Keep `.env`, `retroachievements.json`, and `emumovies.json` private; they are plaintext files with owner-only permissions.

## See also

- [Accounts and media](/integrations/accounts-and-media/), setup for each provider
- [Configuration](/reference/configuration/), the full environment table and aliases
- [Webhooks](/integrations/webhooks/), delivery, signing, and URL validation
