---
title: Save archives
description: ZIP structure, per-file manifests, preview, selective restore, retention, and validation.
---

Per-game save backups are ZIP archives stored in `save-backups/` inside the data directory. This page documents the archive format, where backups live, the preview and selective-restore contract, retention, and the restore safety rules. The implementation is `saves.py` with contract coverage in `test_saves.py` and `test_parity_features.py`.

## Location and naming

- Root: `<data_dir>/save-backups/`.
- Each game has a hash directory derived from its identity: `game_backup_dir` = SHA-256 of `"<name>:<path>"`, first 16 hex chars.
- Archive names: `<timestamp>-<label>.zip` where the label is `manual`, `on-close`, or `before-restore`, and the timestamp is `YYYYMMDD-HHMMSS-ffffff`. Names sort newest-first, so `list_backups` returns the newest archive first.
- Labels are validated against `[A-Za-z0-9._-]{1,64}`; anything else raises `"Save backup label is invalid."`
- Backup directories are created with mode `0o700` and existing archives are restricted to `0o600`. Backups are written via a temp file and `os.replace`, then the directory is fsynced.

## Archive format

A save backup is a ZIP with DEFLATE compression:

- `manifest.json` at the root (capped at 1 MiB):
 ```json
 {
  "game": "Game Name",
  "label": "manual",
  "emulator_id": "retroarch",
  "core": "snes9x",
  "slot": "2",
  "roots": [
   {"path": "/home/you/.config/retroarch/saves", "file": false}
  ],
  "entries": [
   {
    "root": 0,
    "relative": "Game Name.srm",
    "archive": "roots/0/Game Name.srm",
    "size": 8192,
    "mode": 420,
    "mtime": 1760000000,
    "sha256": "0f3a…"
   }
  ]
 }
 ```
 `file` is true when the root is a single file rather than a directory. `label`, `emulator_id`, `core`, and `slot` record provenance for the backup list; `emulator_id` defaults to the game's adapter, and `core`/`slot` come from its recorded save source. All provenance strings are truncated to 64 characters.
- `roots/<index>/...` mirrors each configured save path: for a single-file root, `roots/<index>/<filename>`; for a directory root, `roots/<index>/<relative path>`.

### Manifest entry fields

Every regular file is described before it is archived:

| Field | Meaning |
| --- | --- |
| `root` | Index into `roots`, so `roots/<root>/` is the archive prefix |
| `relative` | Path relative to the root (the file name for a single-file root) |
| `archive` | Exact ZIP member name |
| `size` | File size in bytes |
| `mode` | Permission bits (`stat.S_IMODE`) |
| `mtime` | Modification time as integer epoch seconds |
| `sha256` | SHA-256 of the file contents |

Entries let a restore preview tell an unchanged file from one that would be overwritten, instead of guessing from timestamps. Archives written before 1.18.0 have no `entries` list; they still restore, but their preview cannot prove a file unchanged, so every present file is reported as an overwrite.

## What gets backed up

`backup_saves` uses the game's `save_paths` (configured paths, resolved with `expanduser().resolve()`), but only roots that currently exist. Prerequisites and errors:

- No configured path currently exists: `FileNotFoundError` `"No configured save paths currently exist."` — except for the automatic `before-restore` safety backup, which is skipped instead of aborting the restore.
- Any backup source path is a symlink: `ValueError` `"Save backup paths may not be symlinks."`
- Any file inside a directory root is a symlink: `ValueError` `"Save backup source contains a symlink: <path>"`
- Files are opened with `O_NOFOLLOW`, and anything that is not a regular file raises `"Save backup source is not a regular file: <path>"`.

Saves are also backed up automatically when **Back up saves when a game session ends** is enabled and the game has `save_paths`: each session close creates an `on-close` archive, then applies retention. Saving requires save management to be enabled (`save_management_enabled`, default on); when it is off, save routes return `{"enabled": false}` for reads and `"Save management is disabled."` for writes.

## Retention

After a backup, `enforce_backup_limit` trims the oldest archives beyond `settings.save_backup_limit` (default 10; validated 0..500). A limit of 0 disables trimming. Retention applies to all labels (manual, on-close, before-restore) since it counts every archive in the game's backup directory.

## Preview a restore

`POST /api/saves/restore/preview` with `{id | game_id, backup, selected?}` describes what a restore would change without writing anything:

| Key | Meaning |
| --- | --- |
| `add` | Backup files that do not exist on disk |
| `overwrite` | Files present on both sides whose SHA-256 differs |
| `missing` | Manifest entries that the archive no longer contains |
| `remove` | Always empty: a restore never deletes local files |
| `unchanged` | Count of files whose SHA-256 matches the backup |
| `counts` | Untruncated totals for `add`, `overwrite`, `remove`, `missing`, `unchanged` |
| `conflict` | True when at least one file would be overwritten |
| `truncated` | Per-bucket flags when a list was cut |

Each bucket is capped at 200 rows (`PREVIEW_BUCKET_LIMIT`), while `counts` always reports the real total. `add` rows carry `archive`, `path`, `size`, and `sha256`; `overwrite` rows carry both `backup_sha` and `disk_sha`. `selected` narrows the preview to a list of archive member names.

The preview and the restore validate the same selection rules: the list must be non-empty, at most 50,000 members, and every name must exist in the archive (`"Select at least one save file to restore."` / `"Save selection does not match the backup."`).

## Selective restore and dry run

`POST /api/saves/restore` accepts `{id | game_id, backup, selected?, dry_run?, confirm_conflict?}` and queues the work as a durable job (`202` with `job_id`).

- **Dry run.** `dry_run: true` makes the queued job return `{archive, dry_run: true, files: [{archive, path}]}` without writing or creating a safety backup.
- **Selective restore.** `selected` restores only the listed archive members; omitted, it restores every member.
- **Conflict confirmation.** For a real restore the handler re-runs the preview. When `conflict` is true and `confirm_conflict` is not set, it returns `409` with `"Restoring this backup would overwrite local save files."` and the preview, so an API caller cannot silently overwrite files. The UI asks first and sends `confirm_conflict` after you approve.
- **Safety backup.** A `before-restore` archive of the current state is created before writing; it is skipped when no configured save root exists.

## Restore validation

`restore_saves` refuses anything unsafe, in this order:

1. The backup name resolves strictly inside the game's backup directory: `"Save backup not found."` otherwise (no path traversal).
2. Archive members are validated: at most 50,000, per-member cap 4 GiB (`MAX_SAVE_ARCHIVE_MEMBER_BYTES`), total cap 32 GiB (`MAX_SAVE_ARCHIVE_TOTAL_BYTES`), no NUL bytes, absolute paths, `..`, or duplicates.
3. `manifest.json` must decode within 1 MiB: `"Save backup manifest is invalid."` / `"Save backup manifest is too large."` otherwise.
4. The manifest roots must be a **subset** of the game's current `save_paths`, matched by expanded absolute path in manifest order. That is why a backup taken when only some save locations existed still restores; a path that is no longer configured, a duplicate, or a live root whose file/directory type no longer matches raises `"Save backup roots do not match this game."` / `"Save backup root type does not match this game."` Symlinks in a configured root are rejected.
5. The automatic `before-restore` safety backup runs.
6. The destination tree is checked for symlinks before and after each `mkdir`, so a symlink planted at a missing intermediate directory cannot redirect the write. Out-of-root destinations raise `"Save backup contains an unsafe path."`; a symlink destination raises `"Save restore destination contains a symlink."`
7. Files are restored with mode `0o600` via `atomic_copy_stream`, capped at 4 GiB per member.

Restores write files, so they are destructive: the automatic `before-restore` archive is your safety copy. `test_saves.py` covers single-file roots, directory roots, relative save paths (resolved against the game, not the process cwd), selective restores, dry runs, and the automatic pre-restore snapshot.

## Listing and inspection

- `GET /api/saves?id=<id>` returns `{backups: [...]}` newest first, capped at 200 entries. Each row carries `name`, `size`, `mtime`, `label`, `emulator_id`, `core`, and `slot`. The manifest is read best-effort: a corrupt or pre-1.18 archive still returns its file name, size, and a label parsed from the archive name.
- `GET /api/saves/manifest?id=<id>&backup=<name>` returns `{archive, game, files, manifest}` where `files` lists each archive member with its destination `path` and `size`. The restore dialog uses this listing to let you check individual files.
- `GET /api/saves/discover` lists candidate save locations; `POST /api/saves/scan/apply` applies them library-wide.

## Related

- [API saves and operations](/reference/api/saves-and-operations/) for the routes (`/api/saves/backup`, `/api/saves/restore`, retention)
- [Library backups](/reference/library-backups/) for whole-library archives
- [Data and recovery](/reference/data-and-recovery/) for the state store
