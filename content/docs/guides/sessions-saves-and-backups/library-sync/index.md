---
title: Library catalog sync
description: Sync game catalog metadata across machines through a mounted folder with preview, conflict review, and recovery.
---

OpenBoxGL can synchronize your **game catalog** — names, platforms, metadata, store IDs, tags — between machines through any mounted folder (Syncthing, Dropbox, Nextcloud, a network share, or a plain local path). This is the opt-in v3 sync added in 1.10.0, separate from [statistics sync](/guides/sessions-saves-and-backups/statistics-sync/), which only merges play data.

<Callout type="note" title="What catalog sync never shares">

Only an explicit allowlist of catalog fields travels: names, sort titles, alternate names, platform, genre, year, developer, publisher, series, region, ESRB, max players, description, notes, store/provider IDs (Steam, Heroic, Lutris, Gameyfin, IGDB, RetroAchievements, LaunchBox), disc count, ROM name, set type, manual-entry flag, and tags. **File paths, launch commands, install configuration, credentials, play statistics, and unknown custom fields always stay local.** Syncing a catalog does not copy games, ROMs, saves, or media — a game that arrives from another machine needs its own local launch setup.

</Callout>

## Set it up

1. In **Settings** → **Integrations**, set the **mounted cloud folder** to the absolute path of a folder that is mounted and writable on every participating machine.
2. Check **Enable opt-in library catalog sync**. The setting refuses to save without a folder.
3. Repeat on each machine that should share the catalog. Each device generates its own persistent device ID on first use.

Sync is fully manual and explicit — there is no background scheduling. The workflow is: publish your changes, let the folder replicate, then preview and apply on the other machine.

## The preview → review → apply workflow

The **Library catalog sync** card in Settings has three buttons:

- **Preview catalog changes** (`POST /api/v2/library/sync/preview`) reads the remote event objects in the folder and shows what would change: `additions · updates · deletions · conflicts`, plus a per-game change list. Preview is read-only — it writes nothing.
- **Apply reviewed changes** stays disabled until a preview succeeds and every conflict has a chosen value. Applying first writes a private recovery snapshot of your library, then commits against current state in one transaction.
- **Publish local changes** (`POST /api/v2/library/sync/publish`) writes your local catalog edits as new event objects so other machines can see them.

If the library or the remote folder changes between preview and apply, the preview is rejected as **stale** — run preview again to rebind it to the current state. Apply cannot run on a stale plan.

## Conflicts and deletions

When both sides changed the same catalog field incompatibly, or one side edited while the other deleted, the preview lists each conflict with a **Keep local** / **Keep remote** dropdown per field. Nothing is applied until every conflict has an explicit choice — OpenBoxGL never silently picks a side by timestamp. Choosing a value records a new event that descends from both alternatives, so the review is preserved in history.

Deletions are durable events, not missing records: a game deleted on one machine stays deleted on others after they apply, and a stale device cannot resurrect it by publishing an old copy.

## How it works under the folder

Remote machines communicate through an `openbox-library-v3/` directory inside the mounted folder containing immutable, content-addressed event files — one per change, each naming its device, record, and parent events. Because every device publishes separate objects rather than overwriting a shared file, independently replicating folders cannot lose each other's unpublished changes. Incoming events are validated (size, shape, hashes, identities, causal graph) before merging; invalid input is left untouched and reported as an error.

Older `openbox-library.json` (format 2) files are preserved untouched. The pre-1.10.0 full-library publish/pull routes still exist but now return `503 LIBRARY_SYNC_UNAVAILABLE` before any mutation — the legacy protocol could lose data, so it fails closed rather than silently corrupting a library.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| `Choose a mounted cloud folder before enabling library catalog sync` | The folder field is empty — set it in Settings → Integrations first. |
| `Library sync preview is stale; review incoming changes again` | Local state or the remote folder changed since preview; run **Preview catalog changes** again. |
| Apply button stays disabled | Conflicts are unresolved — pick Keep local or Keep remote for every listed field. |
| `503 LIBRARY_SYNC_UNAVAILABLE` on publish/pull | The legacy (pre-1.10.0) routes are intentionally disabled; use preview/apply/publish. |
| A synced game won't launch | Only catalog metadata syncs — set the game's path and emulator profile on each machine. |

## See also

- [Statistics sync](/guides/sessions-saves-and-backups/statistics-sync/), merging play counts, playtime, and ratings
- [Sessions, saves, and backups](/guides/sessions-saves-and-backups/), the parent guide
- [API overview](/reference/api/overview/), the `/api/v2/library/sync/*` endpoints
