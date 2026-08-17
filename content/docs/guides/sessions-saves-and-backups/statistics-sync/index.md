---
title: Statistics sync
description: Merge play statistics across machines through a mounted cloud folder.
---

OpenBoxGL merges play statistics between machines through any mounted folder, Syncthing, Dropbox, Nextcloud, Drive, or a plain local path. The folder must be mounted and writable on every machine that should participate.

## Set it up

1. In **Settings**, set **Mounted cloud folder** to the absolute path of the mounted folder (for example `/mnt/cloud/openbox`).
2. Click **Sync statistics now** to run a merge immediately, or let it run automatically, sync runs automatically after each session ends, so play time propagates without manual action.
3. Configure the same folder on another machine to merge stats there.

## What syncs and how conflicts resolve

Sync reads and writes `openbox-statistics.json` (format 1) in the folder under a file lock. Per game:

| Field | Merge rule |
| --- | --- |
| `play_count`, `playtime_seconds` | By maximum |
| `last_played` | Newer timestamp wins |
| `progress`, `rating`, `favorite` | Whoever played last is authoritative; if neither side has played, the newer file wins |
| `generated_at` | Preserved when the remote was newer, bumped when local state is newer |

Deleted local games are **never resurrected**: games present only in the cloud file are dropped from the merged output, and only games that exist locally are written back. This keeps a removal on one machine from reappearing on another.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| `"Configure a mounted cloud sync folder first."` | No `cloud_folder` set in Settings; point it at a mounted, writable path. |
| Sync does nothing after a session | Check the folder is mounted and the file is writable; look for sync errors in the diagnostic log. |
| Stats reappear after deleting a game | Deletion does not remove the cloud file's entry for that game. Run a sync after deletion so the merged output drops it. |

## See also

- [Sessions, saves, and backups](/guides/sessions-saves-and-backups/), session recording and history
- [API saves and operations](/reference/api/saves-and-operations/), `POST /api/cloud/sync`
- [Data and recovery](/reference/data-and-recovery/), where local state lives
