---
title: Troubleshooting state recovery
description: Diagnose corrupt library state and recover from the backup copy.
---

OpenBoxGL writes library state atomically with a last-known-good backup, so a crash or bad edit cannot silently corrupt the library. When corruption does happen, recovery is explicit and safe.

## How to read the state

- The library is `library.json` (schema version 5) with a `.bak` last-known-good copy and a `.lock` file beside it. Writes are atomic and owner-only.
- Stable game IDs (`game-<hex>`) survive reordering; legacy index-suffixed IDs are kept as aliases (`legacy_game_ids`).

## When recovery is needed

If the primary file cannot be read, API operations return `503` with:

```
{"error":"OpenBox library data needs recovery before this operation can continue."}
```

The original file is preserved, never overwritten.

## Recover

Recovery (`POST /api/state/recover`) loads the `.bak` file, normalizes it, and writes it back through the same atomic path. Success returns `{"ok": true, "games": <count>}`.

| Message | Meaning |
| --- | --- |
| `"No last-known-good state exists at <bak path>."` | No `.bak` exists; there is nothing to recover from. |
| `"The last-known-good state is also unusable: <bak path>"` | Both primary and backup are bad; recovery fails clearly rather than guessing. |

## Preventing data loss

- Back up the whole data directory before manual intervention: copy `library.json` and `library.json.bak` together.
- Schema versions migrate in place on load (v1 → v5); a version above 5, below 1, or with no migration available raises `StateCorruptError` instead of guessing.
- The `.bak` is always at least as fresh as the primary commit that preceded the last write, because it is written before the swap.

## See also

- [Data and recovery](/reference/data-and-recovery/), full schema, write path, migration table, caps
- [API local administrator](/reference/api/local-admin/), `POST /api/state/recover`
- [Interfaces and data](/interfaces-and-data/), where the state files live
