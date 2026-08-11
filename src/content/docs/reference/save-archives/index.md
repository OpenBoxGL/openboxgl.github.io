---
title: Save archives
description: ZIP structure, manifests, roots, retention, and restore validation.
---

Per-game save backups are ZIP archives stored in `save-backups/` inside the data directory. This page documents the archive format, where backups live, retention, and the restore safety rules. The implementation is `saves.py` with contract coverage in `test_saves.py` and `test_parity_features.py`.

## Location and naming

- Root: `<data_dir>/save-backups/`.
- Each game has a hash directory derived from its identity: `game_backup_dir` = SHA-256 of `"<name>:<path>"`, first 16 hex chars.
- Archive names: `<timestamp>-<label>.zip` where the label is `manual`, `on-close`, or `before-restore`, and the timestamp is `YYYYMMDD-HHMMSS-ffffff`. Names sort newest-first, so `list_backups` returns the newest archive first.
- Backups are written via a temp file and `os.replace`, then the directory is fsynced.

## Archive format

A save backup is a ZIP with DEFLATE compression:

- `manifest.json` at the root:
  ```json
  {
    "game": "Game Name",
    "roots": [
      {"path": "/home/you/.config/retroarch/saves", "file": false}
    ]
  }
  ```
  `file` is true when the root is a single file rather than a directory.
- `roots/<index>/...` mirrors each configured save path: for a single-file root, `roots/<index>/<filename>`; for a directory root, `roots/<index>/<relative path>`.

The manifest is what restore uses to verify the archive matches the game's current `save_paths`.

## What gets backed up

`backup_saves` uses the game's `save_paths` (configured paths, resolved with `expanduser().resolve()`). Prerequisites and errors:

- No configured path currently exists: `FileNotFoundError` `"No configured save paths currently exist."`
- Any backup source path is a symlink: `ValueError` `"Save backup paths may not be symlinks."`
- Any file inside a directory root is a symlink: `ValueError` `"Save backup source contains a symlink: <path>"`

Saves are also backed up automatically when `backup_on_close` is enabled and the game has `save_paths`: each session close creates an `on-close` archive, then applies retention. Every restore first creates a `before-restore` archive of the current state.

## Retention

After a backup, `enforce_backup_limit` trims the oldest archives beyond `settings.save_backup_limit` (default 10; validated 0..500). A limit of 0 disables trimming. Retention applies to all labels (manual, on-close, before-restore) since it counts every archive in the game's backup directory.

## Restore validation

`restore_saves` refuses anything unsafe, in this order:

1. The backup name resolves strictly inside the game's backup directory: `"Save backup not found."` otherwise (no path traversal).
2. A `before-restore` backup of the current state is created first.
3. `manifest.json` must decode: `"Save backup manifest is invalid."` otherwise.
4. The manifest roots must match the game's current `save_paths` in count and order (compared by expanded absolute path): `"Save backup roots do not match this game."` This is why editing a game's save paths after a backup makes that backup un-restorable until the paths match again.
5. Every member is validated: no NUL bytes, no absolute paths, no `..`, no duplicates, per-member cap 4 GiB (`MAX_SAVE_ARCHIVE_MEMBER_BYTES`), total cap 32 GiB (`MAX_SAVE_ARCHIVE_TOTAL_BYTES`).
6. The destination tree is checked for symlinks before and after each `mkdir`, so a symlink planted at a missing intermediate directory cannot redirect the write.
7. Files are restored with mode `0o600` via `atomic_copy_stream`.

Restores write files, so they are destructive: the automatic `before-restore` archive is your safety copy. `test_saves.py` covers single-file roots, directory roots, relative save paths (resolved against the game, not the process cwd), and the automatic pre-restore snapshot.

## Related

- [API saves and operations](/reference/api/saves-and-operations/) for the routes (`/api/saves/backup`, `/api/saves/restore`, retention)
- [Library backups](/reference/library-backups/) for whole-library archives
- [Data and recovery](/reference/data-and-recovery/) for the state store
