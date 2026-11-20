---
title: API 3.0 changes
description: The 3.0 API surface — the Rust server, Save Vault, Achievement Trail, Deal Radar, Time Capsules, Milestones, Backlog Itinerary, and changed response shapes.
---

OpenBox 3.0 serves the same `/api/v2` contract from the native Rust server `openbox-server`. All 417 endpoints (413 public `/api/v2/*` plus 4 `/api/host/*`) are implemented in the Rust workspace. The contract did not break: a 2.1 client keeps working. 3.0 adds five feature surfaces and changes a few response shapes.

## New routes

### Save Vault

| Route | Behavior |
| --- | --- |
| `GET /api/v2/saves/vault` | Lists snapshots for a game (`?game_id=`) or the vault index. |
| `GET /api/v2/saves/vault/status` | Vault enabled state, retention, disk use, and the 5 GiB warning. |
| `GET /api/v2/saves/vault/diff` | Compares a snapshot with the live saves. |
| `POST /api/v2/saves/vault/snapshot` | Creates a snapshot (`trigger`: `manual`, `session_close`, `auto`, or `pre-restore`). |
| `POST /api/v2/saves/vault/restore` | Restores a snapshot; takes a `pre-restore` safety snapshot first. |
| `POST /api/v2/saves/vault/delete` | Deletes one snapshot. |

Settings: `save_vault_enabled` (default true), `save_vault_keep` (default 5, 1-50), `save_vault_on_close` (default false), `save_vault_auto_days` (default 0, 0-365). Vault data lives under `<data-dir>/save-vault/` and is excluded from `BACKUP_ITEMS`.

### Achievement Trail

| Route | Behavior |
| --- | --- |
| `GET /api/v2/ra/trail` | Offline analytics over `cache/retroachievements/`: 8-week velocity, ETAs, next-up queue, milestones. |
| `GET /api/v2/ra/trail/game` | Per-game trail detail (`?game_id=`). |
| `POST /api/v2/ra/trail/refresh` | Queues a cancellable refresh job; `cache/trail.json` is signature-keyed. |

A date-less cache degrades with an explicit notice instead of inventing dates.

### Deal Radar

| Route | Behavior |
| --- | --- |
| `GET /api/v2/deals` | Watchlist, retained price history, and `last_notified_price_cents`. |
| `GET /api/v2/deals/search` | Steam store search for a candidate app id. |
| `POST /api/v2/deals/watch` | Adds a watched app id. |
| `POST /api/v2/deals/unwatch` | Removes a watch and purges its history. |
| `POST /api/v2/deals/entry` | Adds or updates a manual entry. |
| `POST /api/v2/deals/refresh` | Polls now; the scheduled poll is `deals_poll_hours`. |

Deal Radar is off by default (`deals_enabled=false`). Requests and HTTP redirects are restricted to `https://store.steampowered.com`; no accounts, cookies, or telemetry are used. Settings: `deals_poll_hours` (default 168, 24-720), `deals_min_drop_pct` (default 10, 1-90), `deals_store_cc` (default `us`).

### Time Capsules and Milestones

| Route | Behavior |
| --- | --- |
| `GET /api/v2/capsules` | Lists sealed notes/questions; locked bodies stay redacted. |
| `GET /api/v2/capsules/next` | The next capsule due to unlock. |
| `POST /api/v2/capsules` | Creates a capsule (`kind`: `note` or `question`, body up to 4,000 characters). |
| `POST /api/v2/capsules/open` | Opens a capsule after its local-midnight unlock date. |
| `POST /api/v2/capsules/delete` | Deletes a capsule. |
| `GET /api/v2/insights/milestones` | Nine deterministic milestone kinds with crossing dates. |

The hourly maintenance tick unlocks due capsules. Milestone cards export offline as 1200x630 PNGs.

### Backlog Itinerary

| Route | Behavior |
| --- | --- |
| `GET /api/v2/itinerary` | The active plan, capacity, entries, later list, and live statuses. |
| `GET /api/v2/itinerary/estimate` | Completion estimate for a game (IGDB, own history, default, RA refinement). |
| `POST /api/v2/itinerary/plan` | Builds a plan with `quick-wins`, `comeback`, or `raided`. |
| `POST /api/v2/itinerary/replan` | Replans from the current state; done entries stay pinned. |
| `POST /api/v2/itinerary/abandon` | Clears the active plan. |

The plan is stored in `state["itinerary"]`. Statuses are `done`, `on_track`, `behind`, and `stale`.

## Changed response shapes

| Route | Change |
| --- | --- |
| `GET /api/v2/version` | Adds `"runtime": "rust"`; `"python"` is now an empty string. |
| `POST /api/v2/shutdown` | Returns `{"ok": true, "shutting_down": true}`. The old `{"stopped", "forced"}` body is gone. |
| `GET /api/v2/jobs` | Cursor list (see [API 2.1 changes](/reference/api/two-one/)). |
| `GET /api/v2/diagnostic` | Returns a `report` string built by the Rust crash-report builder; `system.python` is `"rust-native"`. |
| `GET /api/v2/log` | Returns the last 64 KiB of `openbox.log` (previously 250 KB). |
| `POST /api/v2/games/delete-steam` | Adds `"left"` for Steam games kept because the trash cap was reached. |
| `GET /api/v2/metadata/status` | Adds `"match_job"` alongside `"job"`. |
| `POST /api/v2/backup/create` | Accepts `format`; any non-writable format returns `410 BACKUP_FORMAT_RETIRED`. |

## Removed and retired

- `POST /api/v2/setup/migration/rollback` returns `409 ROLLBACK_REMOVED`.
- Plugin API v1 is gone; manifests must declare `"api_version": 2` or they fail with `PLUGIN_API_RETIRED`.
- Unversioned `/api/*` and `/api/v1/*` remain retired (see [API 2.1 changes](/reference/api/two-one/)).

## OpenAPI

`docs/openapi.json` in the application repository carries 46 schemas, including the Save Vault, Deal Radar, Time Capsule, Itinerary, Milestone, and version surfaces. The route contract is `api_contracts.json` (format 2, app version 3.0.0).

## Related pages

- [API 2.1 changes](/reference/api/two-one/)
- [Save Vault](/guides/sessions-saves-and-backups/save-vault/)
- [Achievement Trail](/guides/retroachievements/trail/)
- [Deal Radar](/guides/discovery/deal-radar/)
- [Player's Log](/guides/library/player-log/)
- [Backlog Itinerary](/guides/library/itinerary/)
