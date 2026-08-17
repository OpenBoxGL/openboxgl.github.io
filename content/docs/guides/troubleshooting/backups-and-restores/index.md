---
title: Troubleshooting backups and restores
description: Diagnose refused backups, stale restores, and failed restores.
---

Both whole-library backups and per-game save backups validate hard before writing. Most problems are a specific refusal message; start with that message and the diagnostic log.

## Backup refused

| Message | Cause / fix |
| --- | --- |
| `"Close running games before creating a backup."` | A game session is active; close games first (Running dialog). Applies to create and restore. |
| `"Backup source is a symlink: ..."` | Backup refuses symlinks anywhere in the source tree. Point the item at real files. |

## Restore refused

| Message | Cause / fix |
| --- | --- |
| `"This backup is older than the current library. Pass force=True to restore it anyway."` | The archive predates the current library. Only force when you intentionally want the older state; the current library is saved to `library.before-restore.json` first. |
| `"Backup archive is invalid."` / `"Backup manifest is invalid."` | Not a ZIP or missing manifest. Only `OpenBoxBackup-*.zip` archives inside the data directory or `backups/` are accepted. |
| `"Save backup roots do not match this game."` | The game's `save_paths` changed after the backup. Restore the archived paths (or back up again). |
| `"Save backup not found."` | The archive name is not inside the game's backup directory; use a name from the backup list. |
| Restore fails on a symlink | Restore rejects symlinks anywhere in the archive or destination tree (checked before and after each `mkdir`). |

## What restore always does first

- Whole-library restore copies the current `library.json` to `library.before-restore.json` before replacing it.
- Save restore creates an automatic `before-restore` save backup of the current state first.
- Backups and restores are refused while games are running.

## See also

- [Library backups](/guides/sessions-saves-and-backups/library-backups/), create/rotate/restore workflow
- [Save discovery and restore](/guides/sessions-saves-and-backups/saves/), per-game save backups
- [Save archives](/reference/save-archives/) and [Library backups API reference](/reference/library-backups/), the archive contracts
