---
title: Troubleshooting
description: Start with safe checks for startup, imports, launches, state, and integrations.
---

Start with the diagnostic log and the exact visible error. **Settings > Advanced** has **Copy diagnostic log**: it copies a redacted diagnostic **summary** (the `/api/diagnostic` preview) that excludes secrets and the full log. The rotating log itself is `<data-dir>/openbox.log` (2 MiB per file, 4 rotations); it redacts tokens, passwords, secrets, API keys, and authorization values, but may include game names and local file paths. Review it before sharing. Confirm the data directory, token, executable path, and platform profile before changing state.

## Startup and browser issues

- The server binds to `127.0.0.1` on a random port. The port and token are written to `<data-dir>/server.port` and `<data-dir>/server.token`; the URL is printed to the terminal. If the window shows "Could not reach the OpenBox server", check that the server process is still running. In `--web` mode, the same message in the browser has the same cause.
- `--no-browser` skips opening a browser; useful for remote or scripted starts. `OPENBOX_DATA_DIR` must be set before launch to change the data directory.
- On Steam Deck / Bazzite Game Mode, OpenBox opens Big Box fullscreen in the native window. The web fallback (`--web`) uses a kiosk browser instead (Chromium, Chrome, Brave, Edge; native or Flatpak); if no kiosk browser is installed that fallback may fail, install one of them. Prefer the AppImage build in Game Mode, since the Flatpak build relies on host tools for window tagging.
- If an older AppImage build opened but never showed a window after desktop integration, install v0.6.0 or newer, remove the old menu entry, and re-add the AppImage.
- Startup failures that were recovered from (a restored last-known-good backup, a library that could not be read) appear in the `startup_errors` list the library page reads at boot; check the diagnostic log for the underlying error.
- Games that launch through Steam still go through Steam (`steam -applaunch` / `steam://`). If Steam Input or overlays do not work in Game Mode, confirm the title is a real Steam launch and that Steam Input is enabled for the OpenBox shortcut.

## Big Box input and display

- Pointer drag, mouse wheel, trackball, and spinner navigation are separate settings. If a wheel or trackball does nothing, check **Settings > Big Box** (`pointer_nav_enabled`, `mouse_wheel_nav`, `spinner_sensitivity`, `bigbox_wheel_speed`); a spinner that jumps too far is a sensitivity problem, not a missing input.
- The battery indicator reads Linux sysfs through `GET /api/native/battery`. It reports `present: false` on non-Linux hosts or when no battery is exposed, and shows nothing when the setting is off; the route never returns a battery path.
- Video problems usually start in **Settings > Big Box**: controls need `bigbox_video_controls`, the audio mix needs `video_bgm_mix`, and a startup video that should not repeat needs `bigbox_startup_video_loop` off. Themes may add background music and a sound pack, so silence can be a theme asset problem.
- Hidden platforms, categories, and playlists are stored in the `bigbox_hidden_*` settings. A platform that is missing from Big Box but present in the library is usually hidden there, not deleted.

## Import problems

- **Steam**: check that one of `~/.local/share/Steam`, `~/.steam/steam`, or the Flatpak path contains `steamapps/` with `appmanifest_*.acf` files. Launching requires `steam`, Flatpak Steam, or `xdg-open`. Imported Steam games record whether their install folder still exists; a missing install shows a red **Missing** badge and the play button becomes **Install**, while an installed game offers **Verify Steam files** (`steam://validate/<id>`).
- **Storefront scans**: a scan reports progress per source, skips sources with no library games, and gives each source a 30-second budget. A slow source is recorded as `timeout` with `"Storefront scan timed out after 30s."` and leaves the library untouched; earlier sources stay applied, so re-run the scan after the store's catalog responds.
- **Heroic**: manifests live under `~/.config/heroic` (legendaryConfig, gog_store, nile_config) or the Flatpak path; launching requires `xdg-open`.
- **Lutris**: OpenBoxGL runs `lutris --list-games --installed --json` (or the Flatpak). A missing binary or malformed JSON reports an error and imports nothing.
- **Arcade**: a DAT/XML file is used when given; otherwise `mame -listxml` must work (up to 256 MiB output, 5-minute timeout). BIOS and non-runnable machines are skipped. Imported sets are classified parent/merged/split/non-merged.
- **Gameyfin**: configure the URL in Storefronts and use **Test Gameyfin connection** first. Install failures keep the previous files; uninstall refuses paths outside the install directory.
- **RPCS3, PICO-8, MSU-1, WHDLoad**: RPCS3 imports external folders and ISOs from `games.yml`; the other sources use their own content folders and must exist before a scan finds anything.
- **Auto-import**: per-source options are `{enabled, platform, include_uninstalled}`. A legacy boolean `storefront_auto_import` value is migrated on the next settings save and still read until then, so an enabled store keeps importing after the upgrade.
- **Folder import**: only recognized extensions import; unknown files are skipped. Multi-disc groups need `(Disc N)` style markers. If a folder import finds 0 of N, check the extension table in [Importing](/guides/library/importing/).
- Missing tools and malformed manifests are reported as import errors rather than creating unusable entries.

## Launch problems

- A game with no launch command and a non-executable file fails before any process starts with a message naming the game; set a platform profile in **Emulators & controllers** or a per-game **Launch command**.
- **Session failed (exit code N)** after launch means the process started and exited. Check the command tokens (`{path}`, `{rom_name}`, and so on), the emulator binary, and any BIOS files the game needs. Use **Emulators & controllers** to verify install state and mode (native vs Flatpak).
- Paths with spaces stay one argument because commands are tokenized, not shell-interpolated. If the emulator needs its own quoting, add quotes around `{path}` in the profile.
- **Archive extraction**: ZIP is handled internally; 7z/RAR need `7z` or `7zz` on PATH. Extraction fails loudly on unsafe archives (traversal, symlinks, oversized members) and never replaces a good cache with a partial one.
- TDP limits (ryzenadj) never block a launch; check the log for `apply_perf` warnings if you expected a limit to apply. `auto` mode applies only on gamescope guests or battery-powered hosts.
- If the game is marked running but the window is gone, the Running dialog's **Force close** (SIGKILL) ends the session; unsaved progress may be lost.
- Emulator settings that cannot be applied never block a launch. A missing data directory, an unwritable config, or a missing bundled shader is logged as a warning and the launch command is unchanged; check the log for `RetroArch settings could not be written` and `Plugin emulator settings`. Per-platform overrides in the Edit Emulator dialog (adapter, RetroArch core, extra arguments) take precedence over the global settings.

## State recovery

- Library state is `library.json` (schema version 6) with a `.bak` last-known-good copy and a `.lock` file beside it. Writes are atomic and owner-only.
- If the primary file cannot be read, operations return 503 with "OpenBox library data needs recovery"; the original file is preserved, never overwritten. Recovery loads the `.bak` file, normalizes it, and writes it back. If the backup is also unusable, recovery fails with a clear error.
- Back up the data directory before manual intervention: copy `library.json` and `library.json.bak` together.
- Stable game IDs (`game-<hex>`) survive reordering; legacy index-suffixed IDs are kept as aliases (`legacy_game_ids`).

## Backups and restores

- Backup and restore are refused while games are running; close them first.
- Restore creates `library.before-restore.json` automatically. Restoring a backup older than the current library is refused unless forced.
- Save restore creates a `before-restore` save backup first and refuses when the archive's manifest roots no longer match the game's configured save paths.
- Save backups describe every file (size, mode, mtime, SHA-256). The restore dialog previews the archive contents with add, overwrite, unchanged, and missing counts and restores only the files you check; a preview that would overwrite local saves must be confirmed (`confirm_conflict`), and a dry run writes nothing.
- Only `OpenBoxBackup-*.zip` archives inside the data directory or `backups/` folder are accepted for restore; ZIP archives only.

## Metadata and media

- `/api/metadata/search` and bulk media return HTTP 409 until the metadata database is downloaded (Artwork & details dialog, **Download database**).
- The media queue is durable: closing OpenBox does not lose queued artwork or media. `GET /api/media/queue` reports `items`, `queue`, and per-state `counts`; a failed item keeps its `last_error` and attempts, and `POST /api/media/queue/retry` with the item `id` re-queues it. Pause, resume, cancel, and per-item retry exist as separate routes.
- Downloads validate HTTP status, content type, and payload before writing. A provider that returns the wrong type fails with `"The remote server returned an unsupported content type: <type>"`, and an oversized response with `"The download is too large."`; LaunchBox database downloads keep retry/progress reporting.
- Provider media caps depend on the kind: images 64 MiB, video 512 MiB, music 32 MiB, and manuals 64 MiB (PDF only). LaunchBox Games Database images keep their 32 MiB cap. Every image needs an `image/` content type.
- Metadata and media searches honour the configured provider priority (`metadata_provider_priority`), and each result carries its source. A bulk download can prefer plugin results (`plugin_metadata_priority`).
- Check credentials and rate limits for EmuMovies and IGDB; both are optional integrations.
- A corrupt bezel download never destroys the existing set; re-run **Download bezel** after fixing the archive.
- **Media cache cleanup** (`POST /api/media/cache/cleanup`, `days` 1..3650, default 30) removes only stale regular files under `<data-dir>/cache/media`, skips symlinks, and returns `{root, deleted, bytes, skipped}`. User media is never touched.
- Duplicate-media cleanup deletes only files inside the OpenBox data directory, never symlinks; run the scan, review the group count, then apply.

## Integrations and credentials

- RetroAchievements: username and web API key are required; the key comes from RetroAchievements settings. Matching needs a local ROM file (ZIP and 7z hashing supported), and only supported platforms auto-match. You can enter a RetroAchievements Game ID manually in Edit metadata.
- EmuMovies requires a licensed account; credentials come from Settings or `~/.env`.
- Per-provider tokens for IGDB, ScreenScraper, SteamGridDB, Gameyfin, and RetroAchievements are stored outside the public settings projection and only shown masked. A route that reports a provider unconfigured means no token is saved, not that the settings page lost it.
- **Online play** opens the public RetroArch netplay lobby. No credentials are sent; a timeout, HTTP error, malformed listing, or empty result returns `{"available": false, "error": "Netplay lobby is unavailable."}` instead of raising, and successful listings are cached for 60 seconds. Copy the room address and let RetroArch make the connection.
- Webhooks require HTTPS unless `OPENBOX_ALLOW_HTTP_WEBHOOKS=1`; loopback URLs pointing at the running server are rejected. Delivery failures appear as notifications.
- Plugins are trusted local Python code: install only packages you trust. A failed plugin update rolls back to the previous version; removal keeps a recoverable copy and clears the plugin's settings, trust, permissions, data, credentials, and stats cache, and deletes the games it imported.
- Logs redact credentials, but may include game names and file paths, so review the copied log before sharing it.

## Go deeper

Each area above has a dedicated page with the full detail, the exact error strings, and the checks in the order worth trying:

- [Startup and browser issues](/guides/troubleshooting/startup-and-browser/) — the server not starting, the window not appearing, Steam and Game Mode specifics, and Big Box input, battery, video, and sound.
- [Import problems](/guides/troubleshooting/imports/) — every storefront and folder-import source, per-source scan timeouts, Steam missing/verify states, and what each one needs on the machine.
- [Launch problems](/guides/troubleshooting/launching/) — command tokens, archive extraction, emulator settings that did not apply, TDP limits, Launch check history, and sessions that end early.
- [State recovery](/guides/troubleshooting/state-recovery/) — what to do when `library.json` needs recovery and how to avoid it.
- [Backups and restores](/guides/troubleshooting/backups-and-restores/) — manifests, selective restore, restore refusals, and the safety copies behind them.
- [Metadata and media](/guides/troubleshooting/metadata-and-media/) — the 409 before the database exists, provider priority, the durable media queue, and media cleanup.
- [Integration credentials](/guides/troubleshooting/integration-credentials/) — where credentials come from, in priority order, masked per-provider tokens, and why a provider reports itself unconfigured.
- [Plugins](/guides/troubleshooting/plugins/) — a plugin that is skipped, times out, lacks a capability or permission, or is not trusted.
- [Diagnostic logs](/guides/troubleshooting/diagnostic-logs/) — what the log records, which cache files explain failures, what it redacts, and how to share it.

## Still stuck?

Reproduce the failure with a small, disposable example (for example a single test ROM in a scratch folder), capture the exact visible error and the diagnostic log, and file an issue at [OpenBoxGL issues](https://github.com/vindeckyy/OpenBoxGL/issues) with both. Security and credential problems belong in [Security and legal](/policies/security/).
