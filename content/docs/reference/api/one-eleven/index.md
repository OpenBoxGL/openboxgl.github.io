---
title: API 1.11 additions
description: Request and response guidance for the local-first v2 workflows shipped in OpenBox 1.11.0.
---

OpenBox 1.11.0 adds these authenticated, additive `/api/v2/*` workflows without changing the frozen v1 contract. The server still binds to loopback, chooses a random port at launch, and accepts `X-OpenBox-Token: TOKEN` on every protected route.

```bash
DATA_DIR="$HOME/.local/share/openbox-game-launcher"
TOKEN=$(cat "$DATA_DIR/server.token")
PORT=$(cat "$DATA_DIR/server.port")
BASE="http://127.0.0.1:$PORT"
```

Use the header form in scripts. The query-string token is accepted for the browser launch path but can leak into history and logs. POST bodies are JSON objects and are subject to the shared 65,536-byte body limit. Durable operations return `202` with a `job_id`; inspect them through the jobs endpoints documented in [Saves and operations](/reference/api/saves-and-operations/).

## Quick Resume and Moments

Quick Resume reports adapter capability and state freshness before loading a saved emulator state. Pass `allow_stale: true` only when you have reviewed the adapter or emulator-version mismatch.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/resume/status?game_id=GAME_ID` | Report whether the game is enabled, capable, available, or stale. |
| `POST` | `/api/v2/resume` | Resume a game from its captured state. Body: `game_id`, optional `allow_stale`. |
| `POST` | `/api/v2/resume/discard` | Delete the captured state and metadata. Body: `game_id`. |

Moments are bounded timeline records attached to one game. A capture can include a screenshot when the host supports it, but the note and trigger remain durable when capture is unavailable.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/moments?game_id=GAME_ID&limit=100` | List a game's newest moments. `limit` is 1–500. |
| `GET` | `/api/v2/moments?moment_id=MOMENT_ID` | Fetch one moment and its game id. |
| `POST` | `/api/v2/moments` | Create a moment. Body: `game_id`, optional `title`, `note`, and `trigger`. |
| `POST` | `/api/v2/moments/resume` | Launch the exact state linked to a moment. Body: `moment_id`, optional `game_id`. |
| `POST` | `/api/v2/moments/update` | Change `title` and/or `note`. Body: `moment_id`, optional `game_id`. |
| `POST` | `/api/v2/moments/delete` | Remove a timeline item. Body: `moment_id`, optional `game_id`. |
| `GET` | `/api/v2/sessions/recap` | Return the latest local session recap when recap tracking is enabled. |

Example:

```bash
curl -s -X POST "$BASE/api/v2/moments" \
  -H "X-OpenBox-Token: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"game_id":"GAME_ID","title":"Boss attempt","note":"Try the left route next time","trigger":"manual"}'
```

## Record That: clips and reels

The clip capture route uses the configured OBS replay buffer when enabled and falls back to a local screenshot clip when OBS is unavailable. Returned clip paths are approved local media paths, not arbitrary file reads.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/clips?game_id=GAME_ID` | List the bounded clip collection for a game. |
| `POST` | `/api/v2/clips/capture` | Capture a replay or screenshot fallback. Body: `game_id`, optional `launch_id`. |
| `GET` | `/api/v2/reels?game_id=GAME_ID` | Build a deterministic reel manifest from the game's clips and moments. |
| `POST` | `/api/v2/reels/create` | Queue local reel creation. Body: `game_id`, optional `year`. |

## Time Machine and query grammar

Time Machine is journal-backed and bounded. Reads do not mutate the library. Reverts are preview-first: the response contains a plan and `base_token`; send that reviewed plan back with `apply: true` and the current base token. A stale plan returns `409` and must be previewed again.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/library/time-machine/events` | Page journal events. Optional query: `days`, `kind`, `game_id`, `offset`, `limit`. |
| `GET` | `/api/v2/library/time-machine/as-of?date=YYYY-MM-DD` | Materialize the bounded library view at a date. |
| `POST` | `/api/v2/library/time-machine/revert` | Preview or apply a revert. Body: `event_id`, optional `game_id`, `fields`, `undo`; add `apply: true` and the returned `base_token` to apply. |
| `POST` | `/api/v2/library/query/parse` | Parse a natural-language query into deterministic filters without changing library state. |
| `GET` | `/api/v2/library/trash` | List soft-deleted library entries. |
| `POST` | `/api/v2/library/trash/restore` | Restore a reviewed trash entry. |
| `POST` | `/api/v2/library/trash/purge` | Permanently remove a trash entry. Treat this as destructive. |

Preview a revert before applying it:

```bash
curl -s -X POST "$BASE/api/v2/library/time-machine/revert" \
  -H "X-OpenBox-Token: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"event_id":"EVENT_ID"}'
```

## Backlog Radio and launcher trophies

Backlog Radio and Radar use local library and history data. They do not call a remote recommendation service.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/insights/radio` | Read or lazily refresh the managed recommendation playlist. |
| `POST` | `/api/v2/insights/radio/refresh` | Force a fresh local recommendation set. |
| `GET` | `/api/v2/insights/radar` | Return progress-oriented backlog candidates. |
| `POST` | `/api/v2/insights/radar/park` | Park one candidate. Body: `game_id`. |
| `GET` | `/api/v2/insights/trophies` | Return the local trophy case and current rule status. |
| `POST` | `/api/v2/insights/trophies/evaluate` | Evaluate and persist newly earned local trophies. |

Launcher trophies are deterministic OpenBox milestones over local library and history data. They are not RetroAchievements, do not require an account, and do not submit data to a service.

## Arcade Room and Museum kiosk

Arcade Room exposes the controller-first showroom state. The optional kiosk PIN is a convenience boundary for a local Museum presentation; it is not a replacement for the API session token or a security boundary.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/arcade/kiosk/status` | Report whether Museum kiosk mode is enabled and whether a PIN is set. |
| `POST` | `/api/v2/arcade/kiosk/pin` | Set or clear a PIN. Body: a 4–12 digit `pin`, or `clear: true`; `enabled` may be boolean. |
| `POST` | `/api/v2/arcade/kiosk/verify` | Verify a candidate PIN. Body: `pin`. |

## Household records and sync

Household is local-first. It stores members, challenges, results, and opt-in shares in the local state and can exchange validated records through the configured mounted sync folder. It does not provide hosted accounts or real-time multiplayer.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/household?period=all_time` | Return records, challenge progress, sharing state, and a leaderboard. Periods: `daily`, `weekly`, `monthly`, `all_time`. |
| `GET` | `/api/v2/household/leaderboard?period=all_time` | Return the leaderboard projection for one period. |
| `POST` | `/api/v2/household/member` | Add or update a member. Body: `member_id`, `display_name`, optional `avatar_color`, `stats_shared`. |
| `POST` | `/api/v2/household/challenge` | Create a challenge. Body: `title`; optional `challenge_id`, `metric`, `target`, `description`, `game_id`, `deadline`, `participant_ids`. |
| `POST` | `/api/v2/household/challenge/result` | Record progress. Body: `challenge_id`, `member_id`, optional `value`, `completed`, `game_id`, `note`. |
| `POST` | `/api/v2/household/share` | Publish an opt-in stats share. Body: `member_id`, optional `period` and precomputed `stats`. |
| `POST` | `/api/v2/household/record` | Append one validated local record. Body: `record`. |
| `POST` | `/api/v2/household/merge` | Merge a validated record list. Body: `records`. |
| `POST` | `/api/v2/household/sync/publish` | Publish pending records to the configured folder. Optional `protocol`. |
| `POST` | `/api/v2/household/sync/pull` | Read and merge validated records from the configured folder. Optional `protocol`. |

## Steam Bridge and ES-DE migration

Both integrations are review-first and preserve foreign data. Preview responses include a plan or import decisions; apply only the reviewed plan against an unchanged source. A changed source returns a conflict instead of silently overwriting it. Steam Bridge reports a stale preview as HTTP `409` with `STEAMBRIDGE_PREVIEW_STALE`; ES-DE reports its stale-plan condition as HTTP `400` with `ESDE_STALE_PLAN`. In either case, preview again before applying.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/steambridge/status` | Inspect the discovered `shortcuts.vdf` path and OpenBox/foreign counts. |
| `POST` | `/api/v2/steambridge/preview` | Build a Steam Bridge plan. Optional body: absolute `path`, `game_ids`, `launcher_exe`. |
| `POST` | `/api/v2/steambridge/apply` | Apply a reviewed plan. Body: `plan`; `path` may also be supplied. |
| `POST` | `/api/v2/steambridge/remove/preview` | Preview removal of OpenBox shortcuts. Body: `targets`, optional `path`. |
| `POST` | `/api/v2/steambridge/remove` | Apply a reviewed removal plan. Body: `plan`; `path` may also be supplied. |
| `POST` | `/api/v2/import/esde/preview` | Parse an ES-DE `gamelist.xml`. Body: absolute `xml_path` (or `gamelist`), optional `options`. |
| `POST` | `/api/v2/import/esde/apply` | Apply a reviewed ES-DE plan after a source-digest check. Body: `xml_path`/`gamelist`, `plan`, and optional `preview_token`/`options`. |

## SteamGridDB artwork

SteamGridDB is optional. Set `STEAMGRIDDB_API_KEY` in `~/.env`, enable the provider in Settings, and restart OpenBox after changing the environment file. Search and apply use a bounded local cache; apply and bulk match return durable job IDs.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/steamgrid/status` | Report configuration, toggle, provider state, and cache information. |
| `GET` | `/api/v2/steamgrid/search?q=TITLE&limit=12` | Search SteamGridDB games. |
| `POST` | `/api/v2/steamgrid/test` | Probe the configured provider. |
| `POST` | `/api/v2/steamgrid/info` | Fetch normalized metadata and media for a result. Body: `steamgrid_id`. |
| `POST` | `/api/v2/steamgrid/apply` | Queue artwork/metadata for one game. Body: stable `id`; optional `steamgrid_id`, `fields`, `media`, `replace_existing`. |
| `POST` | `/api/v2/steamgrid/match` | Queue bounded bulk matching. Optional body: `ids` and `media`. Without `ids`, games missing a cover are selected. |

The supported media kinds are `cover`, `background`, `clear_logo`, `icon`, and `banner`. Provider artwork is written into OpenBox-managed media paths; credentials are never returned in API responses.

## Compatibility and error handling

All routes on this page are additive v2 routes. The frozen `/api/v1/*` surface remains unchanged. The shared API contract still applies:

- `403 {"error":"Unauthorized"}` means a known protected route received no valid token; an unknown route can resolve to `404` before auth.
- `409` is used for stale review plans or launch/state conflicts where the operation must be previewed or retried.
- `202 {"state":"queued","job_id":"…"}` means the local durable-operation manager accepted the work; query `/api/v2/jobs` for progress.
- `400` responses identify validation failures with the route's error message and, for structured errors, a stable `code`.
- `503` means local state or an explicitly required integration is unavailable; no destructive mutation should be inferred from the response.

See [REST API overview](/reference/api/overview/) for the request lifecycle, [REST API](/reference/api/) for group navigation, and the corresponding user guides for UI-level workflows.
