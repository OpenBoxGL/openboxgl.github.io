---
title: Local services
description: Connect Gameyfin, OBS, MAME scores, Ludusavi, and Hoard.
---

OpenBoxGL integrates with local services and command-line tools that already exist on your machine. None of them are required; each is detected or configured explicitly.

## Gameyfin

- **What it is**: a self-hosted game library server. OpenBoxGL reads its catalog over HTTP, downloads games on demand, and tracks owned/installed state.
- **Setup**: Tools → Storefronts (Storefront Manager): `gameyfin_url` (a bare host gets `http://` prepended), optional username/password, `gameyfin_install_dir`, and provider.
- **Behavior**:
 - Catalog browse via `GET /api/storefront/catalog?source=gameyfin`.
 - Install (`POST /api/gameyfin/install`) downloads the game into the install directory with a 4 GiB per-file cap, staging and rollback so a failed download never destroys an existing install; symlinked paths are refused.
 - Uninstall refuses anything outside the install directory and any symlink.
 - Install status is exposed through bounded polling of `GET /api/gameyfin/install/status?gameyfin_id=<id>` (state `idle`/`installing`/`done`/`error`).
 - `storefront_auto_import.gameyfin` enables startup auto-import of the catalog.
- The password is stored in settings and never returned by the API (`gameyfin_password_set` only).

## OBS Studio

- **What it does**: attach your latest OBS recording to a game when a session closes (`obs_auto_attach`, default on), and manual attach from the game detail pane.
- **Recording directory discovery**: reads `FilePath`/`RecFilePath` from the newest profile's `basic.ini` (`SimpleOutput`/`AdvOut`) under `~/.config/obs-studio/basic/profiles` or the Flatpak `~/.var/app/com.obsproject.Studio/config/obs-studio/basic/profiles`; falls back to `~/Videos`.
- **Status** (`GET /api/obs/status`): `running`/`recording` via `pgrep -x obs`, `directory`, and the newest `.mp4`/`.mkv`/`.mov`/`.flv`/`.webm` file (`latest_recording`).
- Auto-attach only picks recordings modified after the session start; manual attach accepts any existing video file and sets `video_recording` (plus `video` when unset).
- A configured `obs_recording_path` overrides discovery.

## MAME high scores

- **What it does**: discover, export, and import community high-score files for Arcade/MAME/FinalBurn Neo games.
- **Locations searched**: `~/.mame/hi`, `~/.config/mame/hi`, and the Flatpak `~/.var/app/org.mamedev.MAME/config/mame/hi` (first existing wins).
- Scores are keyed by the game's `rom_name` (or path stem); `GET /api/highscores` lists matching files with size.
- Export writes the matching `.hi` files plus a `highscores.json` manifest (format 1) into `highscores/<slug>/` for sharing. Import restores from a folder or manifest bundle, renaming files with a ROM prefix when needed, and writes mode `0o600`.

## Ludusavi

- **What it is**: the [Ludusavi](https://github.com/mtkennerly/ludusavi) save backup CLI. Detected on `PATH`; `GET /api/save-tools/status` reports `{"ludusavi": bool, "hoard": bool}`.
- **Actions**: `backup`, `restore`, `backups`, `find`, run with `--api` and `--force` (backup/restore), optional `--path` from the game's configured `ludusavi_backup_path`, 600-second timeout.
- The parsed `--api` JSON is returned as `result`; a nonzero exit without JSON raises with stderr.
- **Not installed**: `"ludusavi is not installed. Install it from https://github.com/mtkennerly/ludusavi"`.

## Hoard

- **What it is**: the [Hoard](https://github.com/rleeon/hoard) save manager CLI. Detected on `PATH`.
- **Actions**: `backup`, `restore`, `list`; `backup`/`restore` accept a game name. A nonzero exit raises with stderr; success returns `{"ok": true, "action", "output"}`.

## Safety notes

- Ludusavi and Hoard backup and restore actions affect local files, and restore is destructive: run backups before restores and verify the tool's own report. `--force` is passed by default.
- Gameyfin install/uninstall moves files under the configured install directory only; the app refuses symlinks and out-of-tree paths.
- Auto-attaching OBS recordings reads your video directory; keep the recording path private if you share the diagnostic log.

## Related

- [API saves and operations](/reference/api/saves-and-operations/) for the routes
- [Import sources](/integrations/import-sources/) for Gameyfin catalog import
- [Accounts and media](/integrations/accounts-and-media/) for credential-based services
