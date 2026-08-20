---
title: Troubleshooting state recovery
description: Diagnose corrupt library state and recover from the backup copy.
---

OpenBoxGL writes library state atomically with a last-known-good backup, so a crash or bad edit cannot silently corrupt the library. When corruption does happen, recovery is explicit and safe.

## How to read the state

- The library is `library.json` (schema version 6) with a `.bak` last-known-good copy and a `.lock` file beside it. Writes are atomic and owner-only.
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
  "ok": true,
  "dry_run": true,
  "backup_exists": true,
  "backup_games": 42,
  "snapshots": [
    {
      "name": "library.json.20260817_120000.snap",
      "created_at": 1723896000,
      "size": 154200
    }
  ]
}
```

### Restoring state

- **Restore last-known-good backup**: `POST /api/state/recover` with `{}` loads `library.json.bak`, validates/normalizes it, and commits it atomically.
- **Restore specific snapshot**: `POST /api/state/recover` with `{"snapshot": "library.json.20260817_120000.snap"}` restores a point-in-time snapshot from `library.json.snapshots/` (retains the 5 most recent rolling snapshots).

Success returns `{"ok": true, "games": <count>}`.

| Message | Meaning |
| --- | --- |
| `"No last-known-good state exists at <bak path>."` | No `.bak` exists; there is nothing to recover from. |
| `"The last-known-good state is also unusable: <bak path>"` | Both primary and backup are bad; recovery fails clearly rather than guessing. |
| `"Snapshot not found: <name>"` | Specified snapshot filename does not exist in `library.json.snapshots/`. |

## Preventing data loss

- Back up the whole data directory before manual intervention: copy `library.json` and `library.json.bak` together.
- Rolling snapshots are automatically saved in `library.json.snapshots/` before schema migrations or major updates (capped at 5 rotating snapshots).
- Schema versions migrate in place on load from v1 through v6; a version above 6, below 1, or with no migration available raises `StateCorruptError` instead of guessing.
- The `.bak` is always at least as fresh as the primary commit that preceded the last write, because it is written before the swap.

## See also

- [Data and recovery](/reference/data-and-recovery/), full schema, write path, migration table, caps
- [API local administrator](/reference/api/local-admin/), `POST /api/state/recover`
- [Interfaces and data](/interfaces-and-data/), where the state files live
