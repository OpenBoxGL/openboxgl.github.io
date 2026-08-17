---
title: Save discovery and restore
description: Discover save locations, create versioned backups, and restore safely.
---

OpenBoxGL can discover where a game keeps its saves, back them up into versioned archives, and restore them with hard safety checks. This page covers the practical workflow: find saves, back them up, restore them, and recover when a restore is refused.

## Before you start

- The game must have a local file (`path`) so OpenBoxGL can identify it.
- Saving works per game from the **Save management** section of the detail pane, or library-wide from the **Health** dialog (**Scan library for saves**).
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

## Back up saves

**Back up now** creates a ZIP per game under `<data-dir>/save-backups/<hash>/` named `YYYYmmdd-HHMMSS-<label>.zip` containing a `manifest.json` and the configured save roots. Details:

- Files are backed up individually; directories are walked.
- Symlinks in save paths or the backup directory are refused.
- After each backup, **Save backup retention limit** (0-500, default 10) trims the oldest archives.
- **Back up saves when a game session ends** creates an `on-close` archive automatically and enforces the same retention.

The CLI form is `python3 web_app.py --backup` for whole-library backups; per-game save backups are a UI/API operation (`POST /api/saves/backup`).

## Restore saves

Restore validates hard before writing anything:

1. An automatic `before-restore` backup of the current saves is created first.
2. The archive's manifest roots must match the game's currently configured `save_paths` exactly (count and order). If you edited the save paths after the backup, restore refuses with `"Save backup roots do not match this game."`, restore the paths to the archived values, or make a new backup.
3. Members are validated: no absolute paths, no `..`, no duplicates, no symlinked destinations, per-member cap 4 GiB, total cap 32 GiB.
4. Files are written with mode `0o600` through atomic copy.

Restoring is destructive by design, the `before-restore` archive is your safety copy.

## Ludusavi and Hoard

Optional CLI save tools found on `PATH`:

- **Ludusavi**: `backup`, `restore`, `backups`, `find`, run with `--api` JSON output and `--force`; an optional `--path` comes from the game's `ludusavi_backup_path`.
- **Hoard**: `backup`, `restore`, `list`; backup/restore accept a game name.

Both treat restore as destructive (they overwrite local files), so run a backup first and verify the tool's own report.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| `"No configured save paths currently exist."` | The game has no discovered/confirmed save path. Run **Discover locations** or add one manually in Save management. |
| `"Save backup paths may not be symlinks."` | A configured save path is a symlink; point `save_paths` at the real directory. |
| `"Save backup roots do not match this game."` | The game's `save_paths` changed after the backup. Restore the archived paths (or back up again). |
| `"Save backup not found."` | The archive name is not inside the game's backup directory; use a name from the backup list. |
| Restore does nothing / files missing | Check the diagnostic log; restores refuse symlink destinations and paths outside the data directory, and write `0o600`. |

## See also

- [Sessions, saves, and backups](/guides/sessions-saves-and-backups/), session history and whole-library backups
- [Save archives](/reference/save-archives/), archive format and restore validation in detail
- [API saves and operations](/reference/api/saves-and-operations/), the routes behind the UI
- [Local services](/integrations/local-services/), Ludusavi and Hoard setup
