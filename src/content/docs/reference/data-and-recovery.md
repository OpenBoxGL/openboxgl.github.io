---
title: Data and recovery
description: Understand schema version 4 state files and recovery behavior.
---

The library is one schema-versioned JSON file with a last-known-good sidecar, cross-process locking, and atomic owner-only writes. This page documents the exact layout, the migration path, stable IDs, caps, and recovery.

## File layout

Inside the data directory (default `~/.local/share/openbox-game-launcher`, or `OPENBOX_DATA_DIR`):

| Path | Purpose |
| --- | --- |
| `library.json` | The primary state: `schema_version`, `games`, `profiles`, `history`, `settings`, `playlists`, `queue`, `notifications` |
| `library.json.bak` | Last-known-good copy, rewritten before every commit |
| `.library.json.lock` | Cross-process `flock` lock coordinating concurrent writers |
| `server.token`, `server.port` | Per-launch credentials for the running Web UI; deleted on exit |

## Write path

`JsonStateStore` (`state_store.py`) commits like this:

1. Serialize with compact JSON when the payload exceeds 1 MiB (`COMPACT_JSON_THRESHOLD`), pretty-printed below it; always write a trailing newline.
2. Write to a temp file in the same directory, `fsync` it, chmod `0o600`.
3. Copy the temp to `library.json.bak` first (so a failure cannot leave a fresh primary paired with a stale backup), chmod `0o600`.
4. `os.replace` the temp over `library.json`, chmod `0o600`, then `fsync` the directory.

Every read and write happens under the file lock, so two OpenBoxGL processes (Web UI and native UI) can share one library safely. The last writer wins per transaction, not per file. Loaded state is deep-copied per request, so callers cannot mutate the cache by accident.

## Schema versions and migration

The current schema is version 4 (`STATE_SCHEMA_VERSION`). Older files migrate in place on load:

| From | Migration |
| --- | --- |
| v1 (bare game list) | Wrapped into a state object, gains `profiles`, `history`, `settings`, `playlists` |
| v2 | Index-suffixed IDs (`game-<24 hex>-<n>`) are replaced by stable IDs; the old ID moves into `legacy_game_ids` as an alias |
| v3 | Gains `queue` and `notifications`, capped at 500 and 200 entries; non-list game `tags` become `[]` |

Unknown fields survive migration; only known collections are normalized. A schema version above 4, below 1, or with no migration available raises `StateCorruptError` instead of guessing. A complete v4 object takes a fast path without normalization.

## Stable game IDs

`game_id` is derived from game identity, never list position: SHA-256 over a sorted JSON payload of `path` (normalized), `platform`, `steam_app_id`, `heroic_app_id`, `lutris_id`, `gameyfin_id`, `launchbox_db_id`, or `name` when no store id exists, truncated to 24 hex characters and prefixed `game-`. Collisions append `-2`, `-3`, ... Deterministic from identity, so reordering, deleting other games, and re-importing do not change which entry a queue item, save backup, or history entry points at. Legacy indexed IDs are retained as `legacy_game_ids` aliases and accepted by the API.

## Caps

- `queue`: at most 500 entries; oversized or non-list values are capped/replaced on load.
- `notifications`: at most 200 entries, newest first.
- `history`: capped at the last 500 sessions when session history is enabled.
- Per-game `tags`: 50 tags, 64 characters each (see [API automation](/reference/api/automation/)).

## Corruption and recovery

If `library.json` fails to decode (invalid JSON, wrong type, game without identity, invalid games collection), the original file is preserved untouched and `StateCorruptError` is raised. The API answers `503` with `{"error":"OpenBox library data needs recovery before this operation can continue."}` until you recover.

Recovery (`/api/state/recover` or `recover_state()`) requires authentication and replaces the primary with the `.bak` copy:

- If no `.bak` exists: `"No last-known-good state exists at <bak path>."`
- If the backup is also unusable: `"The last-known-good state is also unusable: <bak path>"`
- Otherwise the backup is normalized, written through the same atomic path, and the API returns `{"ok": true, "games": <count>}`.

The `.bak` is always at least as fresh as the primary commit that preceded the last write, because it is written before the swap.

## Security notes

- All state files are owner-only (`0o600`), including the backup and lock.
- Back up the whole data directory (not just `library.json`) before manual intervention: the sidecar, media, backups, and settings move together.
- Exported library data and local paths are sensitive; keep `library.json` exports private.
- The application state store (`state_store.py`) and `test_state_v4.py` are the maintenance sources.
