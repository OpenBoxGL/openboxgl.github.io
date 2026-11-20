---
title: API 2.1 changes
description: The 2.1 contract — /api/v2-only dispatch, retired-surface 410 documents, the cursor jobs panel, and backup format 1 write retirement.
---

2.1 made the 2.0 contracts permanent. The public API is `/api/v2` only; unversioned `/api/*` paths are no longer dispatched, `/api/v1` is removed, and the legacy native-host names are gone. Backups write format 2 only, and the jobs panel reads the cursor-based v2 list.

## v2-only dispatch

| Request | Result in 2.1 and later |
| --- | --- |
| `/api/v2/*` | Dispatched. |
| `/api/host/*` | Dispatched to the native-window channel after the API-version guard. |
| `/api/v1/*` | `410 V1_API_REMOVED` with `detail.use` pointing at `/api/v2`. |
| `/api/launch`, `/api/shutdown`, `/api/native/capabilities` | `410 HOST_CHANNEL_RETIRED` with the replacement host path. |
| Any other `/api/*` path with a `/api/v2` twin | `410 API_VERSION_REQUIRED` with `detail.use` pointing at the v2 path. |
| Any other `/api/*` path with no v2 twin | `404 ROUTE_NOT_FOUND`. |

`OPENBOX_ENABLE_V1_API` is ignored with a startup warning. Retired paths authenticate before they return their `410`, so an unauthenticated caller still receives `403`.

## Jobs panel

`GET /api/v2/jobs` returns a cursor list, not the old job-name map:

```json
{
  "cursor": "",
  "next_cursor": "…",
  "jobs": [
    { "job_id": "…", "type": "metadata-sync", "state": "running", "…": "…" }
  ]
}
```

Query parameters: `limit` (default 50, max 100), `cursor`, `type` or `type_filter`, `state` or `state_filter`, `root_job_id`, and `group_by=root_job_id`. Per-operation rows are at `GET /api/v2/jobs/items?job_id=…`. `POST /api/v2/jobs/cancel`, `/retry`, and `/resume` return `202` with the updated job row. The legacy job-name map and `GET /api/jobs` are gone.

## Backups

Format 2 is the only writable format. Format 1 archives still restore. A new format 1 write returns `410 BACKUP_FORMAT_RETIRED` with the message "Backup format 1 is no longer written by OpenBox 2.1. Use a 2.0.x build to create a 1.19-compatible export." See [Library backups](/guides/sessions-saves-and-backups/library-backups/).

## Media manifest

`media_manifest_enabled` now controls record, verify, and repair. Turning it off skips manifest writes and media hashing; the integrity report says the manifest is disabled instead of reporting every file as untracked. See [Configuration](/reference/configuration/).

## Versioned asset routes

Covers, theme CSS, theme sounds, RetroAchievements badges, documents, platform videos, startup videos, and the reader use `/api/v2/*`. The unversioned request path is no longer a second way in.

## Related pages

- [API 2.0 changes](/reference/api/two-zero/)
- [API 3.0 changes](/reference/api/three-zero/)
- [Updating](/updating/)
