---
title: Accounts and media
description: Configure optional metadata, achievement, artwork, and bezel services.
---

RetroAchievements, IGDB, EmuMovies, and Bezel Project integrations are optional. Credentials come from the Settings dialog or from documented environment aliases, and are redacted from logs and API responses. External services retain their own terms and rate limits.

## RetroAchievements

- **What it does**: match ROMs to achievement sets by hash, show progress (earned, hardcore, beaten, mastered), serve badges, and inject credentials into RetroArch/Dolphin/PCSX2 configs so emulators enable achievements.
- **Setup**: Settings > RetroAchievements with your username and web API key, or environment variables:
 - `RETROACHIEVEMENTS_USERNAME` (aliases `RA_USERNAME`, `OPENBOX_RA_USERNAME`)
 - `RETROACHIEVEMENTS_API_KEY` (aliases `RA_API_KEY`, `RETROACHIEVEMENTS_KEY`, `OPENBOX_RA_API_KEY`)
- Credentials are validated against `API_GetUserProfile.php` before saving and stored in `retroachievements.json` (mode `0o600`).
- Hashing supports NES, SNES, N64 (byte-swapped `.v64`/`.n64`), Game Boy/Color/Advance, Sega Genesis/Mega Drive, Master System, Game Gear, Atari 2600/7800, Lynx, PC Engine, and Arcade (by set name), including ROMs inside ZIP and 7z archives. Other platforms require entering a RetroAchievements Game ID manually.
- System/game lists are cached for 7 days under `cache/retroachievements/`.

## IGDB

- **What it does**: optional metadata provider (name, description, year, genre, developer, publisher, rating, time-to-beat).
- **Setup**: Twitch developer app credentials in `~/.env` only:
 - `IGDB_CLIENT_ID`
 - `IGDB_CLIENT_SECRET`
- The OAuth token is fetched from `id.twitch.tv` and cached in memory for the token lifetime (refreshed 30 seconds before expiry). Missing credentials make the IGDB routes return `400` with `"Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in ~/.env to use IGDB."`
- Queries go to `api.igdb.com/v4` with the client id and bearer token; search returns at most 12 results (up to 50 requested, filtered by platform when given).

## EmuMovies

- **What it does**: licensed media downloads (box art by default; the current API surface is `box`).
- **Setup**: Settings > EmuMovies, or environment variables:
 - `EMUMOVIES_USERNAME` (alias `OPENBOX_EMUMOVIES_USERNAME`)
 - `EMUMOVIES_PASSWORD` (alias `OPENBOX_EMUMOVIES_PASSWORD`)
- Credentials are stored in `emumovies.json` (mode `0o600`) and sent as HTTP Basic auth to `api.emumovies.com`. Downloads enforce image content types and a 32 MiB cap.
- A licensed EmuMovies account is required; the service rejects unlicensed credentials.

## Bezel Project

- **What it does**: download and install community bezel sets per platform for RetroArch-style presentation.
- **Supported platforms**: NES, SNES, Nintendo 64, Game Boy Advance, Sega Genesis, PlayStation, Arcade.
- Downloads the master ZIP from `codeload.github.com` (thebezelproject repos, 512 MiB cap, 120 s timeout), extracts with the safe extractor into a staging directory, and swaps the existing bezel set only after a fully successful extraction, so a corrupt download never destroys a working set.
- No credentials required.

## Shared rules

- Credentials resolve in this order: persisted settings file, then environment (`.env`), then process environment (environment wins over `.env` because `.env` never overrides an existing variable).
- All credential values are redacted from the diagnostic log and never returned by the API (`*_set` booleans instead).
- Remote or archive failures should be retried only after checking the provider response and the local destination. Rate limits and terms belong to each provider.

## Related

- [Import sources](/integrations/import-sources/) for catalog imports
- [API content and imports](/reference/api/content-and-imports/) for the metadata/media/RA routes
- [Configuration](/reference/configuration/) for the full environment table
