---
title: Save discovery and restore
description: Discover save locations, inspect backup versions, and restore only the files you choose.
---

OpenBoxGL can discover where a game keeps its saves, back them up into versioned archives, and restore them with hard safety checks. Since 1.18.0 each backup also describes every archived file, so you can see what a restore would change and restore only the files you check.

## Before you start

- The game must have a local file (`path`) so OpenBoxGL can identify it.
- Save management is enabled by default. **Enable save management and backups** in Settings can hide the card and refuse save routes (`"Save management is disabled."`).
- Saving works per game from the **Save management** card in the detail pane, or library-wide from the **Library checkup** dialog (**Scan library for saves**).
- Optional tools on `PATH`: [Ludusavi](https://github.com/mtkennerly/ludusavi) and [Hoard](https://github.com/rleeon/hoard) add external save-tool actions.

## Discover save locations

Open a game's **Save management** and choose **Discover locations**. OpenBoxGL looks in the common places for each platform:

| Platform | Location checked |
| --- | --- |
| Steam Cloud | `~/.local/share/Steam/userdata/*/<appid>/remote` (also `.steam/steam` and the Flatpak path) |
| PlayStation 2 | PCSX2 `memcards` (native and Flatpak) |
| PSP | PPSSPP `PSP/SAVEDATA` |
| PlayStation 3 | RPCS3 `dev_hdd0/home/00000001/savedata` |
| GameCube | Dolphin `GC` |
| Wii / WiiWare | Dolphin `Wii/title` |
| Wii U | Cemu `mlc01/usr/save` |
| Sega Saturn | RetroArch `saves` (or `~/.mednafen`) |
| RetroArch | any save or state file under `saves`/`states` whose stem matches the game name |

Candidates are shown as `path` + `label` + `shared`. Confirm them per game, or run **Scan library for saves** to apply discovered paths to every game at once. Confirmed paths are stored on the game (`save_paths`) and drive the library's **Has saves** view.

## Store a state slot

The same card has a **State slot** field for RetroArch save states. Enter 1–32 letters, digits, `-`, or `_` and press Enter; the value is stored on the game (`resume_slot`) and used when Quick Resume captures and reloads that game's state. Leaving it blank restores the default slot. The route behind the field is `POST /api/v2/resume/slot` with `{id, slot}`; an invalid slot returns `RESUME_SLOT_INVALID` with `"Resume slot must be 1-32 letters, digits, '-' or '_'."` See [Quick Resume and Moments](/guides/sessions-saves-and-backups/quick-resume-moments/) for what uses the slot.

## Back up saves

**Back up now** creates a ZIP per game under `<data-dir>/save-backups/<hash>/` named `YYYYmmdd-HHMMSS-<label>.zip` containing a `manifest.json` and the configured save roots. Details:

- Every file is described before archiving with its size, permission mode, modification time, and SHA-256, so later previews and restores can compare content rather than timestamps.
- Files are backed up individually; directories are walked. Files are opened without following symlinks.
- Symlinks in save paths or in the backup directory are refused.
- After each backup, **Save backup retention limit** (0-500, default 10) trims the oldest archives.
- **Back up saves when a game session ends** creates an `on-close` archive automatically and enforces the same retention.

The CLI form is `python3 web_app.py --backup` for whole-library backups; per-game save backups are a UI/API operation (`POST /api/saves/backup`, returned as a durable job).

## Version history

**Version history** on the Save management card lists every backup for the game, newest first, with its label, timestamp, and size. Selecting a version runs a preview against your current saves and shows:

- **new** files the backup would add,
- **overwritten** files whose content differs,
- **unchanged** files whose SHA-256 already matches, and
- **missing from archive** entries the manifest describes but the archive no longer holds.

The preview is read-only. Counts come from `POST /api/saves/restore/preview`; each list is capped for transport while the counts stay exact, so a long history still reports the true totals. **Restore this version** opens the restore dialog; when files would be overwritten the button reads **Restore anyway**.

## Restore saves

The restore dialog lists the archive's contents and every file is checked by default. Uncheck the files you want to keep as-is, then:

1. **Dry run** shows how many files would be added, overwritten, or are missing from the archive without writing anything.
2. **Restore** asks for confirmation, naming the number of files and any that would be overwritten. A restore with conflicts requires that explicit confirmation (`confirm_conflict`); the API otherwise returns `409` with the preview.
3. Before writing, OpenBoxGL creates a `before-restore` safety backup of the current saves. If the game has no configured save root yet, that safety copy is skipped rather than blocking the restore.

Restore validation is strict:

1. The archive must belong to this game and its manifest roots must still be configured. Roots are matched as a subset in manifest order, so a backup taken when only some save locations existed remains restorable; a path you added later does not break it. A saved root that is no longer configured raises `"Save backup roots do not match this game."`, while a root whose live file/directory type changed raises `"Save backup root type does not match this game."`
2. Member paths must be safe (no absolute paths, no `..`, no duplicates, no symlinked destinations, re-checked after creating missing directories), with a 4 GiB per-member cap, 32 GiB total, and at most 50,000 members.
3. Files are written with mode `0o600` through atomic copy. A restore never deletes local files — files you did not select, and files on disk that the backup lacks, are left alone.

## Ludusavi and Hoard

Optional CLI save tools found on `PATH`:

- **Ludusavi**: `backup`, `restore`, `backups`, `find`, run with `--api` JSON output and `--force`; an optional `--path` comes from the game's `ludusavi_backup_path`.
- **Hoard**: `backup`, `restore`, `list`; backup/restore accept a game name.

Both treat restore as destructive (they overwrite local files), so run a backup first and verify the tool's own report. They do not use OpenBoxGL's selective restore; the checkboxes apply to OpenBoxGL save backups.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| `"No configured save paths currently exist."` | The game has no discovered/confirmed save path that exists. Run **Discover locations** or add one manually in Save management. |
| `"Save backup paths may not be symlinks."` | A configured save path is a symlink; point `save_paths` at the real directory. |
| `"Save backup roots do not match this game."` | A saved root is no longer among the game's `save_paths`, or its live file/directory type changed. Restore the archived path (or back up again). |
| `"Save selection does not match the backup."` | A selected name is not a member of the archive. Reload the version history so the listing and the archive agree. |
| `"Restoring this backup would overwrite local save files."` | The preview found conflicts and the confirmation flag was not sent. Review the preview, then confirm the overwrite. |
| `"Save backup not found."` | The archive name is not inside the game's backup directory; use a name from the backup list. |
| Restore does nothing / files missing | Check the job result and the diagnostic log; restores refuse symlink destinations and paths outside the configured roots, and write `0o600`. |

## See also

- [Sessions, saves, and backups](/guides/sessions-saves-and-backups/), session history and whole-library backups
- [Save archives](/reference/save-archives/), archive format, manifest entries, preview and restore validation in detail
- [API saves and operations](/reference/api/saves-and-operations/), the routes behind the UI
- [Local services](/integrations/local-services/), Ludusavi and Hoard setup
