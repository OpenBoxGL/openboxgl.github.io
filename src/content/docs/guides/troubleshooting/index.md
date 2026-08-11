---
title: Troubleshooting
description: Start with safe checks for startup, imports, launches, state, and integrations.
---

Start with the diagnostic log and the exact visible error. **Settings** has **Copy diagnostic log**: it copies the rotating log (`<data-dir>/openbox.log`, 2 MiB per file, 4 rotations) which redacts tokens, passwords, secrets, API keys, and authorization values, but may include game names and local file paths. Review it before sharing. Confirm the data directory, token, executable path, and platform profile before changing state.

## Startup and browser issues

- The Web UI binds to `127.0.0.1` on a random port. The port and token are written to `<data-dir>/server.port` and `<data-dir>/server.token`; the URL is printed to the terminal. If the browser shows "Could not reach the OpenBox server", check that `web_app.py` is still running.
- `--no-browser` skips opening a browser; useful for remote or scripted starts. `OPENBOX_DATA_DIR` must be set before launch to change the data directory.
- On Steam Deck / Bazzite Game Mode, the UI opens in a kiosk browser (Chromium, Chrome, Brave, Edge; native or Flatpak). If no kiosk browser is installed the fallback may fail; install one of them. Prefer the AppImage build in Game Mode, since the Flatpak build relies on host tools for window tagging.
- If an older AppImage build opened but never showed a window after desktop integration, install v0.6.0 or newer, remove the old menu entry, and re-add the AppImage.
- Games that launch through Steam still go through Steam (`steam -applaunch` / `steam://`). If Steam Input or overlays do not work in Game Mode, confirm the title is a real Steam launch and that Steam Input is enabled for the OpenBox shortcut.

## Import problems

- **Steam**: check that one of `~/.local/share/Steam`, `~/.steam/steam`, or the Flatpak path contains `steamapps/` with `appmanifest_*.acf` files. Launching requires `steam`, Flatpak Steam, or `xdg-open`.
- **Heroic**: manifests live under `~/.config/heroic` (legendaryConfig, gog_store, nile_config) or the Flatpak path; launching requires `xdg-open`.
- **Lutris**: OpenBoxGL runs `lutris --list-games --installed --json` (or the Flatpak). A missing binary or malformed JSON reports an error and imports nothing.
- **Arcade**: a DAT/XML file is used when given; otherwise `mame -listxml` must work (up to 256 MiB output, 5-minute timeout). BIOS and non-runnable machines are skipped. Imported sets are classified parent/merged/split/non-merged.
- **Gameyfin**: configure the URL in Storefronts and use **Test Gameyfin connection** first. Install failures keep the previous files; uninstall refuses paths outside the install directory.
- **Folder import**: only recognized extensions import; unknown files are skipped. Multi-disc groups need `(Disc N)` style markers. If a folder import finds 0 of N, check the extension table in [Importing](/guides/library/importing/).
- Missing tools and malformed manifests are reported as import errors rather than creating unusable entries.

## Launch problems

- A game with no launch command and a non-executable file fails before any process starts with a message naming the game; set a platform profile in **Emulators** or a per-game **Launch command**.
- **Session failed (exit code N)** after launch means the process started and exited. Check the command tokens (`{path}`, `{rom_name}`, and so on), the emulator binary, and any BIOS files the game needs. Use **Emulators** to verify install state and mode (native vs Flatpak).
- Paths with spaces stay one argument because commands are tokenized, not shell-interpolated. If the emulator needs its own quoting, add quotes around `{path}` in the profile.
- **Archive extraction**: ZIP is handled internally; 7z/RAR need `7z` or `7zz` on PATH. Extraction fails loudly on unsafe archives (traversal, symlinks, oversized members) and never replaces a good cache with a partial one.
- TDP limits (ryzenadj) never block a launch; check the log for `apply_perf` warnings if you expected a limit to apply. `auto` mode applies only on gamescope guests or battery-powered hosts.
- If the game is marked running but the window is gone, the Running dialog's **Force close** (SIGKILL) ends the session; unsaved progress may be lost.

## State recovery

- Library state is `library.json` (schema version 4) with a `.bak` last-known-good copy and a `.lock` file beside it. Writes are atomic and owner-only.
- If the primary file cannot be read, operations return 503 with "OpenBox library data needs recovery"; the original file is preserved, never overwritten. Recovery loads the `.bak` file, normalizes it, and writes it back. If the backup is also unusable, recovery fails with a clear error.
- Back up the data directory before manual intervention: copy `library.json` and `library.json.bak` together.
- Stable game IDs (`game-<hex>`) survive reordering; legacy index-suffixed IDs are kept as aliases (`legacy_game_ids`).

## Backups and restores

- Backup and restore are refused while games are running; close them first.
- Restore creates `library.before-restore.json` automatically. Restoring a backup older than the current library is refused unless forced.
- Save restore creates a `before-restore` save backup first and refuses when the archive's manifest roots no longer match the game's configured save paths.
- Only `OpenBoxBackup-*.zip` archives inside the data directory or `backups/` folder are accepted for restore; ZIP archives only.

## Metadata and media

- `/api/metadata/search` and bulk media return HTTP 409 until the metadata database is downloaded (Metadata dialog, **Download database**).
- Media downloads cap at 32 MiB per image and require an `image/` content type. Check credentials and rate limits for EmuMovies and IGDB; both are optional integrations.
- A corrupt bezel download never destroys the existing set; re-run **Download bezel** after fixing the archive.
- Duplicate-media cleanup deletes only files inside the OpenBox data directory, never symlinks; run the scan, review the group count, then apply.

## Integrations and credentials

- RetroAchievements: username and web API key are required; the key comes from RetroAchievements settings. Matching needs a local ROM file (ZIP and 7z hashing supported), and only supported platforms auto-match. You can enter a RetroAchievements Game ID manually in Edit metadata.
- EmuMovies requires a licensed account; credentials come from Settings or `~/.env`.
- Webhooks require HTTPS unless `OPENBOX_ALLOW_HTTP_WEBHOOKS=1`; loopback URLs pointing at the running server are rejected. Delivery failures appear as notifications.
- Plugins are trusted local Python code: install only packages you trust. A failed plugin update rolls back to the previous version; removal keeps a recoverable copy.
- Logs redact credentials, but may include game names and file paths, so review the copied log before sharing it.

## Still stuck?

Reproduce the failure with a small, disposable example (for example a single test ROM in a scratch folder), capture the exact visible error and the diagnostic log, and file an issue at [OpenBoxGL issues](https://github.com/vindeckyy/OpenBoxGL/issues) with both. Security and credential problems belong in [Security and legal](/policies/security/).
