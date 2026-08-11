---
title: API saves and operations
description: Save, backup, sync, and operation-specific status routes.
---

Save management, library backups, cloud sync, save-tool hooks, high scores, and OBS. All routes require `X-OpenBox-Token: TOKEN`; POST bodies are JSON objects. Games are located by `id` (numeric index) or `game_id` (stable id).

## Save discovery and management

### `GET /api/saves`

`?id=<index>&game_id=<stable>` returns `{"backups": [{"name", "size"}, ...]}` for the game, newest first. Unknown game: `404`.

### `GET /api/saves/discover`

`?id=<index>&game_id=<stable>` returns `{"candidates": [...]}` of save paths found on disk that are not yet configured: `{"path", "label", "shared"}`. Discovery covers Steam Cloud (`userdata/*/<app_id>/remote`), shared platform roots (PCSX2 memcards, PPSSPP SAVEDATA, RPCS3 savedata, Dolphin GC/Wii title, Cemu `usr/save`, RetroArch saves/states, Mednafen), and RetroArch files whose stem matches the game title.

### `POST /api/saves/scan`

Scan every library game for save paths. Returns `{"games": {"<game_id>": [paths]}, "count": <n>}`.

### `POST /api/saves/scan/apply`

Add all scanned save paths to each game. Returns `{"updated": <count>, "games": <n>}`.

### `POST /api/saves/backup`

Create a versioned save backup ZIP. Body: `{"id"|"game_id"}`. Requirements and behavior:

- At least one configured save path must exist, or `400` `"No configured save paths currently exist."`
- Backup paths and sources may not be symlinks (`400` otherwise).
- The archive is stored under `save-backups/<hash>/<timestamp>-manual.zip` with a `manifest.json` listing `game` and `roots` (path + whether it is a single file).
- After backup, retention applies: `save_backup_limit` (default 10, 0..500) trims the oldest archives.

Returns `{"backup": "<name>", "trimmed": <removed count>}`.

### `POST /api/saves/restore`

`{"id"|"game_id", "backup": "<name>"}` restores a save backup. Safety behavior:

- An automatic `before-restore` backup is created first.
- The backup name is resolved strictly inside the game's backup directory (no path traversal).
- The archive manifest must list roots that match the game's currently configured `save_paths` in the same count and order, or `400` `"Save backup roots do not match this game."`
- Members are validated: no absolute paths, no `..`, no duplicate names, no symlinks in the destination tree, per-member cap 4 GiB, total cap 32 GiB.
- Files are written with mode `0o600` through atomic copy.

Returns `{"restored": "<name>"}`.

### `POST /api/saves/add`

`{"id"|"game_id", "path": "/absolute/save/path"}` adds an existing path to the game's `save_paths`. Nonexistent path: `400`. Returns `{"path"}`.

## Library backups

### `POST /api/backup/create`

`{"items": ["library", "settings", "media", "plugins", "themes", "extension_data"], "keep": <int>}` creates `backups/OpenBoxBackup-<timestamp>.zip`. Default items when omitted: `library`, `settings`. Behavior:

- Refuses while any game is running: `400` `"Close running games before creating a backup."`
- Backs up at most 50,000 members, 4 GiB per member, 32 GiB total.
- Backs up no symlinks (raises on any symlink in the source).
- `keep` (when > 0) rotates old `OpenBoxBackup-*.zip` files to retain the newest `keep`.

Returns `{"archive": "<path>", "name": "<filename>"}`.

### `GET /api/backups`

`{"backups": [...]}` newest first, each with `name`, `path`, `size`, `created` (from the manifest), `items`, and `invalid: true` when the archive or manifest cannot be read.

### `GET /api/backup/manifest`

`{"items": ["settings", "library", "media", "plugins", "themes", "extension_data"]}`.

### `POST /api/backup/restore`

`{"path": "/path/to/OpenBoxBackup-....zip", "items": [...], "force": bool}` restores selected items. Path must be a real `.zip` inside the data directory (or `backups/`); anything else raises `400`. Behavior:

- Refuses while games are running.
- Validates every member: no absolute/`..`/duplicate paths, no symlink/device modes, member cap 4 GiB, total cap 32 GiB.
- When restoring `library`, the current `library.json` is copied to `library.before-restore.json` first, and the archive's settings are merged into the restored library state.
- An archive older than the current `library.json` is refused unless `force: true`: `400` `"This backup is older than the current library. Pass force=True to restore it anyway."`
- Media/plugins/themes/extension-data members are written atomically with mode `0o600` under the data directory; symlink destinations are rejected before and after mkdir.

Returns `{"restored": ["library", ...]}`. Media restores bump the media epoch.

## Cloud statistics sync

### `POST /api/cloud/sync`

Merge statistics with the mounted cloud folder (`settings.cloud_folder`). No folder configured: `400` `"Configure a mounted cloud sync folder first."`. Reads/writes `openbox-statistics.json` (format 1) under a file lock:

- Merges `play_count`, `playtime_seconds`, `last_played` by maximum.
- `progress`, `rating`, `favorite` follow the side with the newer `last_played`; with no play timestamps the newer file (by `generated_at` vs `last_cloud_sync`) wins.
- Deleted local games are never resurrected.
- The file is written atomically with mode `0o600`.

Returns `{"path", "games", "merged", "synced_at"}`.

## Save tools (Ludusavi / Hoard)

### `GET /api/save-tools/status`

`{"ludusavi": bool, "hoard": bool}` presence on `PATH`.

### `POST /api/save-tools/ludusavi`

`{"action": "backup"|"restore"|"backups"|"find", "name"|"id", "path": ""}`. Requires the `ludusavi` binary (`400` with the install URL otherwise); unknown actions raise `400`. Backup/restore pass `--force`; `path` maps to `--path`. Runs with a 600-second timeout. Returns `{"ok", "action", "result", "stderr"}` where `result` is the parsed `--api` JSON (or `{"raw": ...}`).

### `POST /api/save-tools/hoard`

`{"action": "backup"|"restore"|"list", "name"|"id"}`. Requires `hoard` on `PATH`. Returns `{"ok": true, "action", "output"}`.

These actions affect local files and restore is destructive: run backups before restores and verify the tool's own report.

## MAME high scores

### `GET /api/highscores`

`?id=<index>&game_id=<stable>` lists local high-score files for the game's `rom_name` (or path stem): `{"scores": [{"file", "size", "label"}, ...]}`. Only meaningful for Arcade/MAME/FinalBurn Neo games. `404` when the game is missing.

### `POST /api/highscores/export`

Exports matching `.hi` files plus a `highscores.json` manifest (format 1, `exported_at`, `game`, `rom`, `files`) into `highscores/<slug>/`. Returns `{"files": [...], "manifest": "<path>"}`.

### `POST /api/highscores/import`

`{"id"|"game_id", "path": "/dir"}` restores `.hi` files from a folder (or a `highscores.json` bundle) into the MAME hi directory, prefixing filenames with the ROM name when needed, mode `0o600`. Returns `{"restored": [...]}`; no usable files raise `400`.

## OBS

### `GET /api/obs/status`

`{"running": bool, "recording": bool, "directory": "<obs output dir>", "latest_recording": "<path or null>"}`. The directory is read from the newest OBS profile's `basic.ini` (`SimpleOutput`/`AdvOut` FilePath/RecFilePath), falling back to `~/Videos`.

### `POST /api/obs/attach`

`{"id"|"game_id", "path": "/path/to/recording.mp4"}` attaches a recording file as `video_recording` (and `video` when no video is set). Missing file: `400`. Returns `{"path", "obs": {status}}`.

## Screenshot and capture

### `POST /api/screenshot`

Capture the screen with the first available tool among gnome-screenshot, spectacle, scrot, and ImageMagick `import`; appends the PNG to the game's `screenshots` under `media/captures/` and bumps the media epoch. Returns `{"path"}`; no tool available raises `400`.

## RetroAchievements

### `GET /api/ra/settings`

`{"configured": false}` when no credentials exist; otherwise fetches the user profile and returns `{"configured": true, "username", "points", "motto"}`. Profile API failures return `400`.

### `POST /api/ra/settings`

`{"username", "api_key"}` validates against `API_GetUserProfile.php` and persists to `retroachievements.json` (mode `0o600`). Rejected credentials raise `400`. Returns the profile summary.

### `POST /api/ra/game`

Match a game to RetroAchievements (requires credentials): computes the ROM hash (with header stripping for NES/SNES/7800/Lynx/PC Engine, byte swaps for N64, archive ROM extraction for ZIP/7z) and returns `API_GetGameInfoAndUserProgress` enriched with beaten/mastered totals and points. Missing credentials: `400` `"Configure RetroAchievements first."`; unmatched hashes raise `400`.

### `POST /api/ra/inject`

Write credentials into emulator configs (RetroArch `cheevos_*`, Dolphin, PCSX2) for both native and Flatpak paths. Returns `{"updated": [...], "skipped": [...]}`.

### `GET /api/ra/badge`

`?name=<badge>&locked=0|1` serves a badge PNG, downloading it on demand from `media.retroachievements.org`. Unknown badge: `404`.

## Bezels and EmuMovies

### `POST /api/bezels/download`

`{"platform"}` downloads and safely extracts the Bezel Project set for the platform (NES, SNES, Nintendo 64, Game Boy Advance, Sega Genesis, PlayStation, Arcade). Unknown platform raises `400`. Returns `{"path"}`.

### `POST /api/emumovies/settings`

`{"username", "password"}` persists EmuMovies credentials to `emumovies.json` (mode `0o600`). Returns `{"configured": true}`.

### `POST /api/emumovies/download`

`{"id"|"game_id", "type": "box"}` downloads media from EmuMovies with basic-auth credentials (32 MiB cap, image content type enforced). Missing credentials raise `400` `"Configure EmuMovies credentials in Settings first."`. Returns `{"path"}`.

## Errors

Missing games return `404`; destructive operations validate prerequisites before touching files; provider and tool failures return `400` with the exact reason. See [REST API overview](/reference/api/overview/) for the shared envelope and [Save archives](/reference/save-archives/) / [Library backups](/reference/library-backups/) for the archive contracts.
