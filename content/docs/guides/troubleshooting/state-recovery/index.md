---
title: Troubleshooting state recovery
description: Diagnose corrupt library state and recover from the backup copy.
---

OpenBoxGL writes library state atomically with a last-known-good backup, so a crash or bad edit cannot silently corrupt the library. When corruption does happen, recovery is explicit and safe.

## How to read the state

- The library is `library.json` (schema version 7) with a `.bak` last-known-good copy, a `.lock` file, and `sessions.json` for active sessions beside it. Writes are atomic and owner-only.
- Stable game IDs (`game-<hex>`) survive reordering; legacy index-suffixed IDs are kept as aliases (`legacy_game_ids`).

## When recovery is needed

If the primary file cannot be read, API operations return `503` with:

```
{"error":"OpenBox library data needs recovery before this operation can continue."}
```

The original file is preserved, never overwritten.

## Recover

Recovery (`POST /api/state/recover`) can inspect available backups or restore either the `.bak` file or a rolling snapshot:

### Dry-run inspection

Send `POST /api/state/recover` with `{"dry_run": true}` to inspect recovery options without modifying state:

```json
{
  "dry_run": true,
  "backup_available": true,
  "games": 42,
  "snapshots": [
    {
      "name": "20260823T153000123456Z-00000007-a1b2c3d4.json",
      "modified": 1723896000.0,
      "size": 154200
    }
  ]
}
```

Snapshot names embed the UTC timestamp to microseconds, a sequence number, and a random suffix (`<timestamp>-<sequence>-<hex>.json`). Listing is newest-first by that embedded timestamp and sequence, not by file mtime, so two snapshots written in the same clock tick still sort correctly. A hand-placed filename without that format falls back to mtime ordering.

### Restoring state

- **Restore last-known-good backup**: `POST /api/state/recover` with `{}` loads `library.json.bak`, validates/normalizes it, and commits it atomically.
- **Restore specific snapshot**: `POST /api/state/recover` with `{"snapshot": "20260823T153000123456Z-00000007-a1b2c3d4.json"}` restores a point-in-time snapshot from `library.json.snapshots/` (retains the 5 most recent rolling snapshots).

Success returns `{"ok": true, "games": <count>}`.

| Message | Meaning |
| --- | --- |
| `"No last-known-good state exists at <bak path>."` | No `.bak` exists; there is nothing to recover from. |
| `"The last-known-good state is also unusable: <bak path>"` | Both primary and backup are bad; recovery fails clearly rather than guessing. |
| `"Unknown snapshot: <name>"` | Specified snapshot filename does not exist in `library.json.snapshots/`. |

## Upgrading to 2.0

On the first start after a 2.0 upgrade, OpenBox migrates the library to format 7 and shows a **readiness gate** listing anything that needs a look before the migrated library is used — a theme with unknown tokens, a plugin API version this build does not serve, a missing sync folder, an archive with no format, a library over the formal scale, or a custom data directory. A `library`+`settings` backup can be written from the gate before the library opens. The migration writes `migration-report.json` and keeps `library.v6.backup.json`; `migration-in-progress.json` is a crash marker removed when the migration completes. `openbox --rollback-library` restores the v6 file, lists the edits made after the upgrade, and writes `rollback-report.json` (the replaced v7 file is kept as `library.v7.kept-<stamp>.json`).

## Preventing data loss

- Back up the whole data directory before manual intervention: copy `library.json` and `library.json.bak` together.
- Rolling snapshots are automatically saved in `library.json.snapshots/` before schema migrations or major updates (capped at 5 rotating snapshots).
- Schema versions migrate in place on load from v1 through v7; a version above 7 raises `StateFutureVersionError` (never rewritten or auto-recovered), and below 1 or with no migration available raises `StateCorruptError` instead of guessing. The v6→v7 upgrade keeps `library.v6.backup.json` and `openbox --rollback-library` restores it.
- The `.bak` is always at least as fresh as the primary commit that preceded the last write, because it is written before the swap.

## See also

- [Data and recovery](/reference/data-and-recovery/), full schema, write path, migration table, caps
- [API local administrator](/reference/api/local-admin/), `POST /api/state/recover`
- [Interfaces and data](/interfaces-and-data/), where the state files live
