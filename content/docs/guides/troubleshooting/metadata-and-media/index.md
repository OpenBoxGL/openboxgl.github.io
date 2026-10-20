---
title: Troubleshooting metadata and media
description: Diagnose metadata database, media download, bezel, and duplicate cleanup problems.
---

Metadata and media work against local files and optional external providers. Start with the exact status/error and the diagnostic log.

## Metadata database

- `/api/metadata/search` and bulk media return `409` with `"Download the LaunchBox metadata database first."` until the database is downloaded (Artwork & details dialog, **Download database**).
- The first download can be large (up to 2 GiB allowed) and runs as a background job; poll the status endpoint until it reaches `done`.
- An unreachable database fails the sync job with `"Could not reach the metadata database (<reason>). Check the connection and try again."` (`URLError`/`TimeoutError` during LBDB sync no longer leak raw socket messages into the job panel).
- A missing database returns `409` from readiness-dependent routes.

## Media downloads

- Every download validates HTTP status, content type, and payload before it is written. A wrong type fails with `"The remote server returned an unsupported content type: <type>"`; an HTTP error fails with `"The remote server returned HTTP <status>."`; an oversized response fails with `"The download is too large."` No partial file replaces a good one.
- Per-kind limits: images 64 MiB (`image/`), video 512 MiB (`video/`), music 32 MiB (`audio/` or `application/ogg`), manuals 64 MiB (`application/pdf`). LaunchBox Games Database images keep a 32 MiB cap (15 seconds for Steam covers).
- Steam trailer/GOG media: responses read up to 4 MiB for JSON, downloads capped at 512 MiB.
- EmuMovies requires a licensed account and correct credentials; the service rejects unlicensed credentials.
- IGDB needs `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` in `~/.env`; missing credentials return `400` with the exact requirement.
- Check credentials and rate limits first; provider failures are logged with secrets redacted.

## Media queue

Automatic imports and bulk actions feed one durable queue, saved to `media-queue.json` in the data directory, so closing OpenBox does not lose pending downloads.

- `GET /api/media/queue` returns `items` (also as `queue`), `running`, `paused`, `completed`, `failed`, `cancelled`, and `counts` (`total`, `queued`, `failed`, `completed`, `cancelled`).
- Each failed item keeps `last_error` (up to 500 characters) and its attempt count. `POST /api/media/queue/retry` with `{"id": "<item id>"}` resets the item and starts the worker if it is idle; an unknown id returns `"Queue item not found."`.
- Pause, resume, and cancel are separate routes; a cancelled run leaves the queued items in place for a later retry.
- Global and per-platform limits (`media_download_limit`, `media_download_limit_per_group`) apply per run; a limit hit ends the run cleanly and leaves the rest queued.

## Cache cleanup

`POST /api/media/cache/cleanup` with `{"days": N}` (1..3650, default 30) deletes generated cache files older than N days under `<data-dir>/cache/media`. It returns `{root, deleted, bytes, skipped}`. Only regular files inside that cache root are removed; symlinks are skipped, user media directories are never touched, and a file that cannot be unlinked counts in `skipped` rather than failing the request. An invalid `days` value returns `"days must be a whole number."`.

## Provider priority

- Settings define `metadata_provider_priority`, an ordered list of built-in and plugin providers. Searches run in that order, and each candidate records its `source` (and a display name for plugin sources).
- `plugin_metadata_priority` moves plugin providers ahead of built-ins; bulk media downloads can prefer the plugin result for a game.
- A provider listed in the priority but not configured is skipped, not fatal; a single provider failure is recorded and the search continues. Partial-word searches favour an exact title match and filter by platform.

## Bezels

A corrupt bezel download never destroys the existing set, extraction stages into a temp directory and swaps only after full success. Re-run **Download bezel** after fixing the archive. Unknown platforms return `400`.

## Duplicate media cleanup

- **Find duplicate media** hashes cover, background, and screenshot files and groups byte-identical files; the dry-run reports the groups.
- **Delete duplicate media** deletes only files inside the OpenBox data directory, never symlinks, and prefers the copy inside the data directory.
- Run the scan, review the group count, then apply. Deletion bumps the media epoch so stale artwork disappears.

## Import-time media

- Import-time media jobs queue per game when a `launchbox_db_id` exists, respecting **Media download limit during imports** (0 = unlimited, max 10000) and the **Auto-import media types** list (cover, background, screenshots by default).
- Poster, square, video, music, and manual downloads can also be queued by automatic imports, so the queue is fed by real imports rather than only bulk actions. Existing files are preserved unless overwrite is requested.
- A game removed from the library while its item is queued fails that item with `"Game is no longer in the library."`; it does not block the rest of the queue.

## See also

- [Metadata and media](/guides/metadata-and-media/), the full workflow
- [Accounts and media](/integrations/accounts-and-media/), provider credentials and setup
- [API content and imports](/reference/api/content-and-imports/), metadata/media routes and errors
