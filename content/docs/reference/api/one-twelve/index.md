---
title: API 1.12 additions
description: Request and response guidance for the Living Library v2 workflows shipped in OpenBox 1.12.0.
---

OpenBox 1.12.0 adds these authenticated, additive `/api/v2/*` workflows without changing the frozen v1 contract. The server still binds to loopback, chooses a random port at launch, and accepts `X-OpenBox-Token: TOKEN` on every protected route.

```bash
DATA_DIR="$HOME/.local/share/openbox-game-launcher"
TOKEN=$(cat "$DATA_DIR/server.token")
PORT=$(cat "$DATA_DIR/server.port")
BASE="http://127.0.0.1:$PORT"
```

Use the header form in scripts. The query-string token is accepted for the browser launch path but can leak into history and logs. POST bodies are JSON objects and are subject to the shared 65,536-byte body limit.

## Smart collections

A smart collection stores a Backlog Radio query — not a snapshot of results — so membership is re-evaluated against the canonical search path on every read and can never drift from the interpretation chips shown when it was saved. Collections live in `state["smart_collections"]` as `{name, query}` pairs, at most 50 entries; names cap at 80 characters and queries at 500. An unparsable saved query (grammar drift) evaluates to zero matches, never an error.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/collections` | List saved collections with live match counts: `{"items": [{name, query, count, ...}]}` |
| `POST` | `/api/v2/collections` | Create or replace a named collection. Body: `{"name": "...", "query": "short unplayed rpg"}`. Returns `{"ok": true, "saved": "..."}`. Invalid input returns `400` with code `COLLECTION_INVALID`. |
| `POST` | `/api/v2/collections/delete` | Remove a collection by `{"name": "..."}`; games are never touched. Unknown names return `404 COLLECTION_NOT_FOUND`. |

```bash
curl -s -X POST -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Short backlog", "query": "short unplayed rpg"}' \
  "$BASE/api/v2/collections"

curl -s -H "X-OpenBox-Token: $TOKEN" "$BASE/api/v2/collections"
```

The sidebar **Collections** section and the query bar's **Save as collection** chip use these routes; the grammar itself is the deterministic one documented in [Backlog Radio and query grammar](/guides/discovery/backlog-radio/).

## Game Story

`GET /api/v2/story?game_id=<id>` returns a pure read projection per game — nothing is written, so the timeline can never go stale. Events are derived from the game record, the session journal, and captured Moments: `added`, `first_played`, `session` (longest), `milestone`, `progress`, and `moment`, sorted chronologically.

```bash
curl -s -H "X-OpenBox-Token: $TOKEN" \
  "$BASE/api/v2/story?game_id=GAME_ID"
```

Response shape:

```json
{
  "game_id": "game-...",
  "name": "...",
  "platform": "...",
  "events": [{"kind": "added", "at": "...", "title": "Added to library", ...}],
  "totals": {"sessions": 12, "playtime_seconds": 43120, "moments": 3, "progress": "..."}
}
```

A missing or unknown game returns `400` with code `GAME_NOT_FOUND`. The detail pane **Story** tab renders this payload; see [Library overview](/guides/library/).

## Per-game launch environment and confirm

Two per-game fields complete the launch-options sheet (merge order stays game > platform > global):

| Field | Behavior |
| --- | --- |
| `launch_env` | `KEY=value` lines, validated at save time and merged over the spawn environment (after MangoHud) in `pkg/state/launch.py`. Invalid lines are rejected by the settings boundary. |
| `launch_confirm` | Boolean; when set, the client asks for confirmation before launch preflight. |

Both are edited from **Edit game → Launch** alongside the existing per-game launch command, profile, and gamescope preset overrides. They travel on the game record, so they are covered by the normal library read/write and export routes rather than a new endpoint family.

## Scheduled automatic backups

Three settings drive the opt-in weekly library backup (`auto_backup_due()` in `pkg/parity/parity_backup.py`, run on an hourly daemon tick):

| Setting | Default | Meaning |
| --- | --- | --- |
| `backup_auto_enabled` | `false` | Master switch for the weekly schedule |
| `backup_auto_keep` | `4` | Retention, 1–52 archives |
| `last_auto_backup` | `""` | Timestamp of the last automatic run; missing or unparsable counts as due |

Content and rotation reuse `create_backup` unchanged, so the archives are identical to the manual ones documented in [Library backups](/guides/sessions-saves-and-backups/library-backups/).

## SQLite read model default threshold

`GET /api/v2/library/search` continues to honor `OPENBOX_ENABLE_SQLITE_READ=1`. Since 1.12.0 the FTS read model also **self-enables at 5,000+ games** (`should_auto_enable()`, latched per process); an explicit `OPENBOX_ENABLE_SQLITE_READ=0`/`false`/`no` opt-out is never overridden. The response `source` field reports `sqlite` or `json`, so clients can tell which path answered. JSON remains the source of truth either way.

## Related pages

- [API overview and route groups](/reference/api/overview/)
- [Backlog Radio and query grammar](/guides/discovery/backlog-radio/), the grammar smart collections store
- [Library backups](/guides/sessions-saves-and-backups/library-backups/), the engine the weekly schedule reuses
- [API 1.11 additions](/reference/api/one-eleven/), the previous release's v2 surface
