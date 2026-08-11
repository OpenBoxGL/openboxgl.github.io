---
title: Library backups
description: Create, rotate, and restore whole-library backup archives.
---

The **Backup** dialog (top bar) creates whole-library ZIP archives under `<data-dir>/backups/` named `OpenBoxBackup-<timestamp>.zip`. Each archive contains a manifest plus any of: settings, library, media, plugins, themes, and extension data.

## Create a backup

1. Open **Backup**.
2. Choose which items to include. The defaults are `library` and `settings`; you can add `media`, `plugins`, `themes`, and `extension_data`.
3. Choose rotation (**keep**): the newest N archives are kept, older ones are deleted. Default from the API is 0 (no rotation); the UI's **Create backup** uses a rotation of 7.
4. Create. Backup and restore are refused while any game is running.

The CLI form is:

```bash
python3 web_app.py --backup --items library,settings,media --keep 7
```

The archive is written via a temp file and `os.replace`, then the directory is fsynced.

## Restore a backup

Restore is guarded at every step:

1. Refused while any game is running.
2. The data directory must not be a symlink.
3. Every member is validated before any write: no empty names, NUL bytes, absolute paths, `..`, duplicates, or symlink/device modes; member cap 4 GiB, total cap 32 GiB.
4. The archive must decode; a non-ZIP raises `"Backup archive is invalid."`, a bad manifest `"Backup manifest is invalid."`
5. **Stale-backup guard**: when restoring `library`, if the archive's `created` time is older than the current `library.json` modification time, restore is refused unless forced: `"This backup is older than the current library. Pass force=True to restore it anyway."` The UI asks before any restore and offers a force path for older archives.
6. When `library` is restored, the current `library.json` is copied to `library.before-restore.json` first, and archived `settings.json` values are merged into the restored library's settings.
7. `media`/`plugins`/`themes`/`extension_data` members are written under the data directory with mode `0o600`, rejecting symlink destinations before and after intermediate `mkdir`s.

The CLI form is `python3 web_app.py --restore-backup <archive>`; the archive must be a real `.zip` inside the data directory or `backups/`.

## Inspect backups

`GET /api/backups` lists archives newest first with `name`, `path`, `size`, `created`, `items`, and `invalid: true` when the archive or manifest cannot be read. `GET /api/backup/manifest` returns the six selectable item keys.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| `"Close running games before creating a backup."` | A game session is active; close games first (Running dialog). |
| `"This backup is older than the current library. Pass force=True to restore it anyway."` | The archive predates the current library. Only force when you intentionally want the older state; the current library is saved to `library.before-restore.json` first. |
| `"Backup archive is invalid."` / `"Backup manifest is invalid."` | Not a ZIP or missing manifest. Only `OpenBoxBackup-*.zip` archives inside the data directory or `backups/` are accepted. |
| Restore fails on a symlink | Restore refuses symlinks anywhere in the archive or destination; re-create the archive from non-symlinked sources. |

## See also

- [Data and recovery](/reference/data-and-recovery/) — the state store and `.bak` recovery
- [Save archives](/reference/save-archives/) — per-game save backups
- [Library backups API reference](/reference/library-backups/) — full archive contract and limits
