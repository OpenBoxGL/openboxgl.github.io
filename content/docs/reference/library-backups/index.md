---
title: Library backups API reference
description: Selected archive items, limits, rollback files, and restore rules.
---

Whole-library backups are ZIP archives in `backups/` that can include settings, the library, media, plugins, themes, and extension data. This page documents items, limits, rotation, and restore safety. The implementation is `parity_backup.py` with contract coverage in `test_parity_playnite.py` and `test_parity_api.py`.

## Archive location and naming

- Directory: `<data_dir>/backups/`.
- Name: `OpenBoxBackup-%Y-%m-%d-%H-%M-%S-%f.zip` (with microsecond timestamp).
- Written via a temp file and `os.replace`, then the directory is fsynced.

## Selectable items

| Key | Archive member |
| --- | --- |
| `settings` | `settings.json` (serialized snapshot of `state["settings"]`) |
| `library` | `library.json` (the full state object) |
| `media` | `media/` (the media directory tree) |
| `plugins` | `plugins/` (installed plugin packages) |
| `themes` | `themes/` (user themes) |
| `extension_data` | `extension-data/` |

Every archive contains `manifest.json`:

```json
{
 "items": ["library", "settings"],
 "created": "2026-08-11T12:00:00",
 "redacted_secrets": true
}
```

When no items are given, the default is `["library", "settings"]` (also used by the CLI `--backup`). Backups automatically redact sensitive API keys/passwords, and local credentials are automatically preserved and remerged on restore. Unknown or empty item lists raise `"Select at least one backup item."` Item names are case-folded and deduplicated.

## Limits

| Limit | Value |
| --- | --- |
| Members | 50,000 (`MAX_BACKUP_MEMBERS`) |
| Member size | 4 GiB (`MAX_BACKUP_MEMBER_BYTES`) |
| Total expanded size | 32 GiB (`MAX_BACKUP_TOTAL_BYTES`) |

Symmetric limits apply on create and restore. Symlinks anywhere in the backup sources raise `"Backup source is a symlink: ..."` / `"Backup source contains a symlink: ..."`.

## Rotation

`rotate_backups(folder, keep)` keeps the newest `keep` archives and deletes the rest. `keep` must be at least 1 (`"Backup retention must be at least 1."`). The API `POST /api/backup/create` accepts `keep` (default 0 = no rotation).

## Restore rules

`restore_backup` refuses unsafe and surprising restores:

1. Refuses while any game is running: `"Close running games before restoring a backup."` (same check on create).
2. The data directory must not be a symlink.
3. Every member is validated before any write: no empty names, NUL bytes, absolute paths, `..`, duplicates, or symlink/device modes; member and total caps apply.
4. The archive must decode; a non-ZIP file raises `"Backup archive is invalid."`; a bad manifest raises `"Backup manifest is invalid."`
5. **Stale-backup guard**: when restoring `library` and the archive's `created` time is older than the current `library.json` modification time, restore is refused unless `force: true`: `"This backup is older than the current library. Pass force=True to restore it anyway."`
6. When `library` is restored, the current `library.json` is copied to `library.before-restore.json` first, and archived `settings.json` values are merged into the restored library's settings (so settings always come back with the library).
7. `media`/`plugins`/`themes`/`extension_data` members are written under the data directory with mode `0o600`, rejecting symlink destinations before and after intermediate `mkdir`s.

The CLI form is `python3 web_app.py --backup [--items a,b] [--keep N]` for creation and `python3 web_app.py --restore-backup <archive>` (the archive must be a real `.zip` inside the data directory or `backups/`).

## Listing and inspection

`GET /api/backups` lists archives newest first with `name`, `path`, `size`, `created` and `items` from the manifest, and `invalid: true` when the ZIP or manifest cannot be read. `GET /api/backup/manifest` returns the six selectable item keys.

## Backup diff (v1.7.2+)

`GET /api/v2/backup/diff?archive=<name>` compares the current library against a backup archive without restoring it. Returns:

- `added`: game IDs present in the current library but not in the backup.
- `removed`: game IDs present in the backup but not in the current library.
- `changed`: game IDs present in both but with differing fields.
- `settings_changed`: boolean indicating whether app settings differ.
- `summary`: counts (`added`, `removed`, `changed`).

Invalid or missing archive returns `404`. This is useful for reviewing what changed since a backup before deciding whether to restore.

### Restore preview (v1.16.0+)

The three flat lists above are named relative to the **current library**, which is the 1.7.2 contract. Alongside them, the same response carries a `restore` block named from the point of view of someone about to restore — the only block the UI reads:

- `restore.will_remove`: games you have now that the backup lacks. What a restore would delete.
- `restore.will_add`: games in the backup that you no longer have. What a restore would bring back.
- `restore.will_change`: games in both whose fields differ, each row carrying per-field `from` / `to` (a game you marked Beaten since the backup would go back to Playing).

Each of the three is `{"total": <true count>, "truncated": <bool>, "rows": [...]}` and rows include display names, so a long difference can be capped for transport without understating the number.

Settings are reported as an object: `settings.restored` is what a restore would act on, `settings.present` is what the archive physically holds, and `settings.would_change` is the question the UI asks — would this restore move my settings? It can be `false` while `settings.differs` is `true`, because a library-only backup can differ without the restore being able to act on it. `truncated` names which list lost rows.

In the Backups dialog this renders as **Preview changes**: the Restore button is built only from a successful diff, and a failed diff offers a retry and no way to restore, so a restore can never happen unseen. See [Sessions, saves, and backups](/guides/sessions-saves-and-backups/#preview-a-restore-before-you-restore).

## Security notes

- Restoring `library` replaces your current library (after the automatic `library.before-restore.json` copy). Keep both copies safe.
- Media restores bump the media epoch so the UI refreshes artwork URLs.
- Archives contain exported library data and local paths; treat them as sensitive.

## Related

- [API saves and operations](/reference/api/saves-and-operations/) for the backup routes
- [Save archives](/reference/save-archives/) for per-game save backups
- [Data and recovery](/reference/data-and-recovery/) for the state store
