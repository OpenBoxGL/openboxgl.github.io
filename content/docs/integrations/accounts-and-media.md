---
title: Accounts and media
description: Configure optional metadata, achievement, artwork, and bezel services.
---

RetroAchievements, IGDB, ScreenScraper, SteamGridDB, Gameyfin, EmuMovies, and Bezel Project integrations are optional. Credentials come from the Settings dialog or from documented environment aliases, and are redacted from logs and API responses. Per-provider integration tokens are stored privately and shown only masked. External services retain their own terms and rate limits.

## RetroAchievements

- **What it does**: match ROMs to achievement sets by hash, show progress (earned, hardcore, beaten, mastered), serve badges, and inject credentials into RetroArch/Dolphin/PCSX2 configs so emulators enable achievements.
- **Setup**: Tools → RetroAchievements account with your username and web API key, or environment variables:
 - `RETROACHIEVEMENTS_USERNAME` (aliases `RA_USERNAME`, `OPENBOX_RA_USERNAME`)
 - `RETROACHIEVEMENTS_API_KEY` (aliases `RA_API_KEY`, `RETROACHIEVEMENTS_KEY`, `OPENBOX_RA_API_KEY`)
- Credentials are validated against `API_GetUserProfile.php` before saving and stored in `retroachievements.json` (mode `0o600`). Rejected credentials (HTTP `401`/`403` or a profile without a `User`) surface as `400 "RetroAchievements rejected those credentials."`
- Hashing supports NES, SNES, N64 (byte-swapped `.v64`/`.n64`), Game Boy/Color/Advance, Sega Genesis/Mega Drive, Master System, Game Gear, Atari 2600/7800, Lynx, PC Engine, and Arcade (by set name), including ROMs inside ZIP and 7z archives. Other platforms require entering a RetroAchievements Game ID manually.
- System/game lists are cached for 7 days under `cache/retroachievements/`.

## IGDB

- **What it does**: optional metadata provider (name, description, year, genre, developer, publisher, rating, time-to-beat).
- **Setup**: Twitch developer app credentials in `~/.env` only:
 - `IGDB_CLIENT_ID`
 - `IGDB_CLIENT_SECRET`
- The OAuth token is fetched from `id.twitch.tv` and cached in memory for the token lifetime (refreshed 30 seconds before expiry). Missing credentials make the IGDB routes return `400` with `"Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in ~/.env to use IGDB."`
- Queries go to `api.igdb.com/v4` with the client id and bearer token; search returns at most 12 results (up to 50 requested, filtered by platform when given). IGDB results carry the `igdb` source and follow the configured metadata provider priority.

## EmuMovies

- **What it does**: licensed media downloads across the full asset set: covers (box fronts), box backs, box spines, 3D boxes, screenshots, title screens, marquees, cart fronts and backs, discs, clear logos, snap videos, theme videos, manuals, and music. Legacy endpoint spellings (`snap`, `screenshot`, `title`, `marquee`, `video`, `boxback`, `boxspine`, `box3d`, `boxfront`, `cart`, `cartback`, `logo`) are accepted as aliases.
- **Setup**: Settings > EmuMovies, or environment variables:
 - `EMUMOVIES_USERNAME` (alias `OPENBOX_EMUMOVIES_USERNAME`)
 - `EMUMOVIES_PASSWORD` (alias `OPENBOX_EMUMOVIES_PASSWORD`)
- Credentials are stored in `emumovies.json` (mode `0o600`) and sent as HTTP Basic auth to `api.emumovies.com`.
- Requests call `https://api.emumovies.com/v1/media/<kind>` with the game's system and search name, throttle to 1 request/second, and time out after 30 seconds. A 4xx is permanent; a 5xx or timeout is retried twice after 2 and 8 seconds.
- Downloads enforce an expected content type per kind and a size cap: images 64 MiB (`image/`), videos 512 MiB (`video/`), music 32 MiB (`audio/` or `application/ogg`), manuals 64 MiB (`application/pdf`). Files are written under `media/emumovies/<platform>/<game>/<kind>.<ext>`; only HTTPS media URLs are accepted.
- A licensed EmuMovies account is required; the service rejects unlicensed credentials.

## SteamGridDB

- **What it does**: optional artwork provider for covers, backgrounds, clear logos, icons, and banners, with a local disk cache.
- **Setup**: `STEAMGRIDDB_API_KEY` (alias `OPENBOX_STEAMGRIDDB_API_KEY`) in `~/.env`; the key is never returned in settings or diagnostics.
- Results carry the `steamgriddb` source, so they participate in metadata provider priority and appear with a source label. See [SteamGridDB and launcher trophies](/guides/metadata-and-media/steamgriddb-and-trophies/) for its routes and workflows.

## Gameyfin

- **What it does**: self-hosted game library server used for catalog browsing, on-demand installs, and catalog auto-import.
- **Setup**: `gameyfin_url` (a bare host gets `http://` prepended), optional username/password stored as settings, `gameyfin_install_dir`, and provider.
- The password is never returned by the API (`gameyfin_password_set` only). Optional per-provider tokens are stored separately; see [Local services](/integrations/local-services/#gameyfin).

## ScreenScraper

- **What it does**: optional per-ROM-hash metadata and media provider for emulated games. It matches by content hash rather than filename, so generic ROM names still resolve to the right game.
- **Setup**: environment variables in `~/.env`:
 - `SCREENSCRAPER_USER` (alias `OPENBOX_SCREENSCRAPER_USER`)
 - `SCREENSCRAPER_PASSWORD` (alias `OPENBOX_SCREENSCRAPER_PASSWORD`)
 - `SCREENSCRAPER_DEV_ID` (alias `OPENBOX_SCREENSCRAPER_DEV_ID`)
 - `SCREENSCRAPER_DEV_PASSWORD` (alias `OPENBOX_SCREENSCRAPER_DEV_PASSWORD`)
- All four values are required. The provider returns `400` and names the missing values when any is absent; the ScreenScraper API refuses lookups without the developer pair, so there is no anonymous path.
- Requests send `ssid`/`sspassword` and `softname`, the ROM hashes as `md5`/`sha1`/`crc` with `romtaille`, and `romtype` as `rom` or `iso`. They are throttled to 1 request/second with 429/5xx backoff, and results are cached for 30 days under `cache/screenscraper/`. Media URLs are forced to HTTPS and chosen by your region priority. ScreenScraper results carry the `screenscraper` source and follow the configured metadata provider priority.

## Bezel Project

- **What it does**: download and install community bezel sets per platform for RetroArch-style presentation.
- **Supported platforms**: NES, SNES, Nintendo 64, Game Boy Advance, Sega Genesis, PlayStation, Arcade.
- Downloads the master ZIP from `codeload.github.com` (thebezelproject repos, 512 MiB cap, 120 s timeout), extracts with the safe extractor into a staging directory, and swaps the existing bezel set only after a fully successful extraction, so a corrupt download never destroys a working set.
- No credentials required.

## Per-provider integration tokens

Optional API tokens for IGDB, ScreenScraper, SteamGridDB, Gameyfin, and RetroAchievements are stored privately and never appear in the public settings projection. Settings → Metadata & Media lists them under **Integration tokens**, and saved values are shown masked (`abcd…yz` or dots when short).

- `GET /api/v2/integration-tokens` returns `{"providers": [...]}` and a `tokens` object containing only the providers that have a saved token, each masked.
- `POST /api/v2/integration-tokens` takes `{"provider": "igdb"|"screenscraper"|"steamgriddb"|"gameyfin"|"retroachievements", "token": "<value>"}`. Tokens are trimmed, must be at most 4,096 characters, and may not contain control characters; an unknown provider or invalid token returns `400`.
- `POST /api/v2/integration-tokens/remove` takes `{"provider": ...}` and deletes that token.
- The public settings view exposes only booleans (`{"igdb": true, ...}`); full token values are never returned by any route.

These tokens are separate from the environment credentials each provider documents: setting a token does not replace `IGDB_CLIENT_ID`/`IGDB_CLIENT_SECRET`, the ScreenScraper pair, or `STEAMGRIDDB_API_KEY`.

## Shared rules

- Credential precedence is per provider, not one global order:
  - **RetroAchievements** — the values saved in `retroachievements.json` win; the environment fills in what the file does not have.
  - **EmuMovies** — the values saved in `emumovies.json` win; the environment fills in what the file does not have.
  - **Steam** — a saved value wins per field; the environment fills the gaps (a file with only a Steam ID still picks up `STEAM_API_KEY` from the environment).
  - **IGDB, ScreenScraper, SteamGridDB** — environment only; the `~/.env` pair or key is the only source.
  - **Gameyfin** — settings only; the URL, username, and password come from the settings dialog.
  - In every case the process environment beats `.env`, because `.env` never overrides an existing variable.
- All credential values are redacted from the diagnostic log and never returned by the API (`*_set` booleans instead).
- Media work runs through the durable queue and honours metadata provider priority; see [Metadata and media](/guides/metadata-and-media/) and [Media providers](/guides/media-providers/).
- Remote or archive failures should be retried only after checking the provider response and the local destination. Rate limits and terms belong to each provider.

## Related

- [Import sources](/integrations/import-sources/) for catalog imports
- [API content and imports](/reference/api/content-and-imports/) for the metadata/media/RA routes
- [Configuration](/reference/configuration/) for the full environment table
