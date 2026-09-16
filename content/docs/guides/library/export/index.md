---
title: Library export
description: Export your library, or a platform/playlist scope of it, to JSON or CSV with shareable-by-construction field projection.
---

OpenBox can export your library to JSON or CSV — for migrations between machines, auditing your collection in a spreadsheet, or sharing a view of it.

## Queue an export

1. Open **Settings → Advanced → Export library** (or queue it through the API with `POST /api/v2/library/export`).
2. Pick the **format**: JSON (full field projection) or CSV (spreadsheet-friendly).
3. Pick the **scope**: the whole library (`all`), a single platform, or a playlist.
4. Optionally include **media paths** (off by default).

The export runs as a durable job in the Activity Center — you can cancel it, and it survives an app restart.

## Shareable by construction

Exports contain only the game-field projection. Settings, credentials, webhooks, and history are never included, so an export is safe to share as-is. Media paths are opt-in because they leak directory layout.

## Files and rotation

Exports land in `<data dir>/exports/` with collision-safe filenames. The newest **10** exports are kept; older ones are removed automatically. List them with `GET /api/v2/library/export/exports` (`handlers/export.py:24-27`), download them from the export dialog (validated by name regex and directory containment) or via `GET /api/v2/library/export/download?file=<name>` — note the export download uses `?file=`, while the backup diff below uses `?archive=`.

To compare the live library against a backup archive (not an export file), use `GET /api/v2/backup/diff?archive=<name>` (`handlers/health.py:112-131`): it reports `added`/`removed`/`changed` game ids plus `settings_changed` and a `summary`. Only `OpenBoxBackup-*.zip` archives inside the data directory or `backups/` are accepted.

## See also

- [API: ScreenScraper and export](/reference/api/screenscraper-and-export/) for the exact endpoints
- [Library backups](/guides/sessions-saves-and-backups/library-backups/) for whole-library archives (a different feature: backups restore, exports are for data-out)
- [Background jobs](/reference/background-jobs/) for the durable job lifecycle
