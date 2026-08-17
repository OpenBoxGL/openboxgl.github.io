---
title: Troubleshooting metadata and media
description: Diagnose metadata database, media download, bezel, and duplicate cleanup problems.
---

Metadata and media work against local files and optional external providers. Start with the exact status/error and the diagnostic log.

## Metadata database

- `/api/metadata/search` and bulk media return `409` with `"Download the LaunchBox metadata database first."` until the database is downloaded (Metadata dialog, **Download database**).
- The first download can be large (up to 2 GiB allowed) and runs as a background job; poll the status endpoint until it reaches `done`.
- A missing database returns `409` from readiness-dependent routes.

## Media downloads

- Image downloads cap at 32 MiB per image (15 seconds for Steam covers) and require an `image/` content type; a wrong content type is a download error.
- Steam trailer/GOG media: responses read up to 4 MiB for JSON, downloads capped at 512 MiB.
- EmuMovies requires a licensed account and correct credentials; the service rejects unlicensed credentials.
- IGDB needs `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` in `~/.env`; missing credentials return `400` with the exact requirement.
- Check credentials and rate limits first; provider failures are logged with secrets redacted.

## Bezels

A corrupt bezel download never destroys the existing set, extraction stages into a temp directory and swaps only after full success. Re-run **Download bezel** after fixing the archive. Unknown platforms return `400`.

## Duplicate media cleanup

- **Find duplicate media** hashes cover, background, and screenshot files and groups byte-identical files; the dry-run reports the groups.
- **Delete duplicate media** deletes only files inside the OpenBox data directory, never symlinks, and prefers the copy inside the data directory.
- Run the scan, review the group count, then apply. Deletion bumps the media epoch so stale artwork disappears.

## Import-time media

- Import-time media jobs queue per game when a `launchbox_db_id` exists, respecting the **Media download limit during imports** (0 = unlimited, max 10000) and the **Auto-import media types** list (cover, background, screenshots).

## See also

- [Metadata and media](/guides/metadata-and-media/), the full workflow
- [Accounts and media](/integrations/accounts-and-media/), provider credentials and setup
- [API content and imports](/reference/api/content-and-imports/), metadata/media routes and errors
