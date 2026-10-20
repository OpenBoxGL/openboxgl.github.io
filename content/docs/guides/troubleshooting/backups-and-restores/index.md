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
| `"Save management is disabled."` | The save-management toggle is off. Enable it under **Settings > Sessions & Saves** (save management and backups); the read routes return `{"enabled": false}` instead of failing while it is off. |

## Restore refused

| Message | Cause / fix |
| --- | --- |
| `"This backup is older than the current library. Pass force=True to restore it anyway."` | The archive predates the current library. Only force when you intentionally want the older state; the current library is saved to `library.before-restore.json` first. |
| `"Backup archive is invalid."` / `"Backup manifest is invalid."` | Not a ZIP or missing manifest. Only `OpenBoxBackup-*.zip` archives inside the data directory or `backups/` are accepted. |
| `"Save backup roots do not match this game."` | The game's `save_paths` changed after the backup. Restore the archived paths (or back up again). |
| `"Save backup not found."` | The archive name is not inside the game's backup directory; use a name from the backup list. |
| `"Save backup manifest is invalid."` / `"Save backup manifest is too large."` | The archive's `manifest.json` is corrupt or over 1 MiB. Restore a different backup; the manifest is what maps archive members to save paths. |
| `"Select at least one save file to restore."` | `selected` was empty or not a list. Omit `selected` to restore the whole archive, or check at least one file. |
| `"Save selection does not match the backup."` | A selected archive path is not in this backup. Use names from the preview/manifest response. |
| Restore fails on a symlink | Restore rejects symlinks anywhere in the archive or destination tree (checked before and after each `mkdir`). |

## Selective restore and manifests

Save backups record each file's size, mode, mtime, and SHA-256 in `manifest.json`, so a restore can describe its work before writing:

- `POST /api/saves/restore/preview` (also `GET /api/saves/manifest?game_id=...&backup=...`) lists archive contents. The preview buckets are `add` (absent on disk), `overwrite` (present with a different SHA-256), `unchanged` (same SHA-256), and `missing` (in the manifest but no longer in the archive). `remove` is always empty because a restore never deletes local files. Each bucket is capped and `truncated` names the cut ones; `counts` holds the untruncated totals. The version-history dialog uses the same counts to compare older backups without restoring them.
- `POST /api/saves/restore` with `selected: ["roots/0/..."]` restores only those members. With no `selected`, it restores the whole archive. `dry_run: true` returns the file list and writes nothing.
- If the preview reports a conflict (a checked file would overwrite a local save), the route returns `409` with `"Restoring this backup would overwrite local save files."` and the preview; resend with `confirm_conflict: true` to proceed.
- A real restore takes a `before-restore` save backup first. When the save tree itself is missing, that safety backup is skipped instead of aborting the restore, because a missing tree is exactly when a restore is needed.

## What restore always does first

- Whole-library restore copies the current `library.json` to `library.before-restore.json` before replacing it.
- Save restore creates an automatic `before-restore` save backup of the current state first.
- Backups and restores are refused while games are running.

## See also

- [Library backups](/guides/sessions-saves-and-backups/library-backups/), create/rotate/restore workflow
- [Save discovery and restore](/guides/sessions-saves-and-backups/saves/), per-game save backups
- [Save archives](/reference/save-archives/) and [Library backups API reference](/reference/library-backups/), the archive contracts
