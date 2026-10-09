---
title: Sessions, saves, and backups
description: Track play and protect library and save data.
---

OpenBoxGL records session history, play counts, play time, last-played state, and exit outcomes when tracking is enabled, and protects both save data and the whole library with versioned backups.

<Callout type="tip" title="Why sessions and saves are keyed by stable game id">

Every active session, queue entry, and save backup points at a `game_id` derived from the game's *identity* (path, platform, store ids), never its position in the list. Completed history records store the game title string, start timestamp, elapsed duration, and exit code. That is why reordering your library, re-importing, or deleting other games never breaks the link between a session and its game. See [How OpenBoxGL works](/reference/how-it-works/#the-state-store) for the identity model.

</Callout>

## Sessions and history

Every launch starts a session: play count increments, last-played stamps, and the first-launch progress setting applies. When the session ends (see tracking modes in [Emulators and launching](/guides/emulators-and-launching/)), play time adds, the session history records game, start time, duration, and exit code (history keeps the last 500 entries), and progress automation may move the game to Playing or Paused. **Track play session history** in Settings disables history recording while still tracking current sessions. **Back up saves when a game session ends** creates a save backup with an `on-close` label and enforces the save retention limit.

The **Running** dialog (top bar) shows live sessions with Pause/Resume, Restart, Exit, and Force close. The **History** dialog lists past sessions with timestamps, durations, and exit codes. A session that fails fast (under 5 seconds, nonzero exit) shows a "Session failed" overlay with the code and a hint to check the Launch command and emulator install.

Since 1.16.0 the long-run case is distinguished too: a game that ran for a while and *then* exited with an error shows **Session ended** with the exit code, rather than the ordinary "Play time and history were saved". A normal exit still shows the usual message. The same two values reach [webhooks](/integrations/webhooks/) — the exit code, plus a separate `timed_out` flag when a session ended because it timed out rather than failing.

## Save discovery

Per game, **Save management** offers **Discover locations**, **Back up now**, Ludusavi and Hoard actions, and **Scan library for saves** (in the Health dialog) which applies discovered paths to every game at once. Discovery knows the common locations:

- **Steam Cloud**: `~/.local/share/Steam/userdata/*/<appid>/remote` (also `.steam/steam` and the Flatpak path).
- **PlayStation 2**: PCSX2 `memcards` (native and Flatpak).
- **PSP**: PPSSPP `PSP/SAVEDATA`.
- **PlayStation 3**: RPCS3 `dev_hdd0/home/00000001/savedata`.
- **GameCube**: Dolphin `GC`.
- **Wii / WiiWare**: Dolphin `Wii/title`.
- **Sega Saturn**: RetroArch `saves` (or `~/.mednafen`).
- **Wii U**: Cemu `mlc01/usr/save`.
- **RetroArch**: any save or state file under `saves`/`states` whose stem matches the game name.

Discovered paths can be confirmed per game or applied library-wide; configured paths persist on the game (`save_paths`), and the library's "Has saves" view reflects them.

## Save backups

**Back up now** creates a ZIP per game under `<data-dir>/save-backups/<hash>/` named `YYYYmmdd-HHMMSS-<label>.zip` containing a `manifest.json` and the configured save roots. Files backup individually; directories are walked. Symlinks in save paths or in the backup directory are refused, so backups cannot follow or create links. The **Save backup retention limit** (0-500, default 10) trims oldest archives after each backup.

Restore validates hard: the archive must belong to this game (manifest roots must match the current configured paths exactly), member paths must be safe (no absolute paths, no `..`, no duplicates, no symlinked destinations, re-checked after creating missing directories), and members are capped at 4 GiB each and 32 GiB total. Before writing anything, restore creates a `before-restore` safety backup of the current saves. If the archive's roots no longer match the game's configured save paths, restore refuses.

Ludusavi and Hoard are optional command-line tools found on PATH; **Ludusavi backup/restore** and **Hoard backup** run with `--api` JSON output (Ludusavi) and report results in the UI. Restoring with either tool overwrites local files, so it is treated as a destructive operation.

## Library backups

The **Backup** dialog creates a ZIP under `<data-dir>/backups/` named `OpenBoxBackup-<timestamp>.zip` containing a manifest plus any of: settings, library, media, plugins, themes, and extension data. The dialog defaults to library + settings with optional media/plugins/themes (extension data is opt-in); the UI's **Create backup** uses a rotation of 7. The opt-in weekly automatic backup covers library, settings, media, plugins, and themes (no extension data). Rotation keeps the newest N archives (`keep`), deleting older ones.

Restore is guarded:

- Creating or restoring a backup is refused while any game is running.
- The archive is validated before any write: at most 50,000 members, 4 GiB per member, 32 GiB total, no absolute or `..` paths, no duplicate names, no symlinks or device nodes, and the archive must be ZIP. The data directory may not be a symlink.
- The current `library.json` is copied to `library.before-restore.json` before the archived library replaces it.
- If the backup's manifest timestamp is older than the current library's mtime, restore refuses unless forced (the API `force` flag; the UI asks before any restore and a "force" path exists for older archives).
- Restored settings merge into the restored library state.
- Media, plugins, themes, and extension data restore only entries inside their own prefix, re-validating symlinks after each directory is created.

Backup archives can be inspected from the API (manifest listing); the CLI also offers `--backup --items a,b --keep N` and `--restore-backup <file>`.

Settings also offers an opt-in **weekly automatic backup** (v1.12.0): enable it, choose a retention count (`backup_auto_keep`, 1-52, default 4), and the scheduler runs the same backup engine on an hourly tick once seven days have passed since `last_auto_backup`. The Settings line shows the last automatic run; archives are identical to manual ones and land in the same `backups/` folder.

### Preview a restore before you restore

Restoring a backup replaces your current library with the one inside it. Before 1.16.0 the only warning was a "Restore this backup?" prompt, so restoring an old backup was a leap of faith.

In **Backups**, choose **Preview changes** next to any backup. OpenBox compares it with your current library and shows the difference before anything happens:

- **Games that would be removed** — in your library now but not in the backup, usually games you added since it was made.
- **Games that would come back** — in the backup but not in your library now, usually games you deleted since.
- **Games that would change** — for each one, exactly which fields differ, with your value and the backup's side by side. A game you marked Beaten since the backup would go back to Playing.
- **Your settings** — a line tells you whether the restore would move them too, because that can change where saves are stored and how emulators are set up. If the backup leaves out saved account keys, it says your current ones are kept.
- **True totals on long lists** — big differences show the real count, such as "showing 200 of 1,340", so a truncated list never looks smaller than it is.

The **Restore** button only appears after a preview has loaded successfully. If the preview cannot be loaded — a damaged archive, say — you get a **Retry** button and no way to restore, so you can never restore a backup without having seen what it does. OpenBox still makes the safety copy of your current library before any restore.

The same data is available from `GET /api/v2/backup/diff`; see [API 1.16 additions](/reference/api/one-sixteen/#restore-preview-1160) for the response shape and [Library backups](/reference/library-backups/#restore-preview-v1160) for the full contract.

## Statistics sync

**Settings** has a **Mounted cloud folder** field (any mounted folder: Syncthing, Dropbox, Nextcloud, Drive, or a local path) and a **Sync statistics now** button. Sync reads and writes `openbox-statistics.json` (format 1) in that folder under a file lock. Per game it merges `play_count` and `playtime_seconds` by maximum, `last_played` by newer timestamp, and resolves progress, rating, and favorite by whoever played last (the side with the newer `last_played` is authoritative; if neither side has played, file freshness decides). The file's `generated_at` timestamp is preserved when the remote was newer, and bumped when local state is newer, so later comparisons stay correct. Deleted local games are not resurrected: games present only in the cloud file are dropped from the merged output. Only games that exist locally are written back.

The sync runs automatically after each session ends, so play time propagates to the mounted folder without manual action. Configure the same folder on another machine to merge stats there.

## Library catalog sync

Separate from statistics sync, **Settings → Integrations** has an opt-in **library catalog sync** (v1.10.0) that shares catalog metadata — names, platforms, metadata, store IDs, tags — through the same mounted folder. Paths, launch settings, credentials, and statistics never leave the machine. The workflow is explicit: **Preview catalog changes**, resolve any field conflicts, **Apply reviewed changes** (a recovery snapshot is written first), then **Publish local changes** for other machines. See [Library catalog sync](/guides/sessions-saves-and-backups/library-sync/).

## Guides in this section

- [Saves](/guides/sessions-saves-and-backups/saves/) — save discovery, per-game management, and where OpenBox looks.
- [Library backups](/guides/sessions-saves-and-backups/library-backups/) — creating backups, the restore guards, and previewing a restore.
- [Statistics sync](/guides/sessions-saves-and-backups/statistics-sync/) — sharing play time through a mounted folder.
- [Library catalog sync](/guides/sessions-saves-and-backups/library-sync/) — sharing catalog metadata, and what deliberately never leaves the machine.
- [Quick Resume and Moments](/guides/sessions-saves-and-backups/quick-resume-moments/) — resuming an emulator session, clips, reels, and the recaps.
- [Activity Center](/guides/sessions-saves-and-backups/activity-center/) — watching background jobs, their progress, and failures.
