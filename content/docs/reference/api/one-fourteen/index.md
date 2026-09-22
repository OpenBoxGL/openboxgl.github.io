---
title: API 1.14 additions
description: Request and response guidance for the Plugins 2.0, Game DNA, library health score, backlog, and effortless metadata workflows shipped in OpenBox 1.14.0.
---

OpenBox 1.14.0 adds these authenticated, additive `/api/v2/*` workflows without changing the frozen v1 contract. The server still binds to loopback, chooses a random port at launch, and accepts `X-OpenBox-Token: <redacted> The v1 surface stays frozen; everything new lives under `/api/v2`.

```bash
DATA_DIR="$HOME/.local/share/openbox-game-launcher"
TOKEN=<redacted>
PORT=$(cat "$DATA_DIR/server.port")
BASE="http://127.0.0.1:$PORT"
```

Use the header form in scripts. The query-string token is accepted for the browser launch path but can leak into history and logs. POST bodies are JSON objects and are subject to the shared 65,536-byte body limit.

## Game DNA search

Offline semantic search over the library: BM25 plus a 151-concept lexicon (English with German, Spanish, French, and Portuguese overlays). The index is a background artifact; searches degrade gracefully to title fallback when the index is missing, building, or stale.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/library/dna/status` | Index health: `{"indexed", "total", "coverage_pct", "index_version", "lexicon_version", "build_ms", "state"}` where `state` is `ready`, `stale`, `building`, or `missing`. Querying a missing index on a large library queues a rebuild automatically. |
| `POST` | `/api/v2/library/dna/search` | Smart search. Body: `{"query": "...", "limit": 20, "filters": {...}}` (`limit` 1–100, default 20; `query` required). Returns `{"results": [{"game_id", "name", "score", "why": ["chips"]}], "parse", "branch", "anchor", "degraded"}`. `degraded: true` means the title fallback served the request (index missing/building) or the index is stale. |
| `POST` | `/api/v2/library/dna/index/rebuild` | Full index rebuild as a background job. Returns `202 {"state", "job_id"}`; track progress and cancel through the [durable jobs routes](/reference/api/saves-and-operations/). |

```bash
curl -s -X POST -H "X-OpenBox-Token: <redacted> \
  -H "Content-Type: application/json" \
  -d '{"query": "short unplayed rpg", "limit": 10}' \
  "$BASE/api/v2/library/dna/search"
```

The search bar's **Title | Smart** toggle calls these routes; see [Game DNA smart search](/reference/search-syntax/) for the query behavior.

## Library health score

A 0–100 score over five weighted dimensions — `file_integrity` (35), `duplicates` (20), `artwork` (20), `metadata` (15), `launch_readiness` (10) — with a deduction ledger per game. The snapshot is cached and cheap; only the scan recomputes. Fixes run as preview-then-execute with an undo journal. The **Artwork Doctor** (missing-artwork hygiene) is the `artwork` dimension of this flow: preview issues with `health/issues?dimension=artwork`, fix them with `health/fix`, and roll back with `health/undo`.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/library/health` | Cached score snapshot: `{"score", "dimensions", "deductions", "game_count", "computed_at", "recomputed"}`. Never scans. |
| `POST` | `/api/v2/library/health/scan` | Enqueue a background full recompute (duplicate submissions collapse). Returns `202 {"state": "queued", "job_id"}`. |
| `GET` | `/api/v2/library/health/issues` | Paginated issue list: `?dimension=&limit=&offset=` (`limit` 1–500, default 50). Unknown dimension returns `400`. Returns `{"scanned", "issues": [{"game_id", "index", "name", "dimension", "code", "reason", "detail", "points"}], "total", "limit", "offset", "dimension"}`. |
| `POST` | `/api/v2/library/health/fix` | Fix plan or execution. Body: `{"dimension": "...", "issue_ids": "all" \| [...], "dry_run": true}` (`dimension` required). Dry run returns `200 {"dry_run": true, "dimension", "issue_count", "base_token", "plan"}`. To execute, send `{"dimension", "issue_ids", "dry_run": false, "base_token": "<from a fresh preview>"}` — a stale preview is rejected, so re-run the preview if the library changed. Executable dimensions are `duplicates`, `artwork`, and `file_integrity`; `metadata` and `launch_readiness` return a plan with `executed: false`. Success returns `{"dry_run": false, "dimension", "fix_id", "summary", "undo": {"kind", "fix_id"}}`. |
| `POST` | `/api/v2/library/health/undo` | Undo a fix from the journal. Body: `{"fix_id": "..."}` (required). Unknown or already-undone fixes return `400`. |

```bash
# Preview, then execute with the preview token
PREVIEW=$(curl -s -X POST -H "X-OpenBox-Token: <redacted> \
  -H "Content-Type: application/json" \
  -d '{"dimension": "duplicates", "dry_run": true}' \
  "$BASE/api/v2/library/health/fix")
TOKEN2=$(echo "$PREVIEW" | python3 -c 'import json,sys; print(json.load(sys.stdin)["base_token"])')
curl -s -X POST -H "X-OpenBox-Token: <redacted> \
  -H "Content-Type: application/json" \
  -d "{\"dimension\": \"duplicates\", \"dry_run\": false, \"base_token\": \"$TOKEN2\"}" \
  "$BASE/api/v2/library/health/fix"
```

## Backlog management

Per-game backlog state: progress (`"Unplayed"` stores as unset `""`), a 0–5 personal rating (0 clears), dated notes (legacy plain-string notes migrate on read), and manual playtime entries that fold into totals badged as manual. Every route below takes `game_id` in the POST body.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/v2/library/progress/set` | Set progress. Body: `{"game_id", "progress"}`. `"Unplayed"` stores as `""` (unset); a deliberate choice ends the auto-suggest. Unknown values return `400`. |
| `POST` | `/api/v2/library/rating/set` | Set the personal star rating. Body: `{"game_id", "user_rating"}` (0–5; 0 clears). |
| `POST` | `/api/v2/library/notes/add` | Append a dated note. Body: `{"game_id", "text"}` (required, max 2000 characters). |
| `POST` | `/api/v2/library/notes/update` | Replace one note's text by index (keeps its timestamp). Body: `{"game_id", "index", "text"}`. |
| `POST` | `/api/v2/library/notes/delete` | Delete one note by index. Body: `{"game_id", "index"}`. |
| `POST` | `/api/v2/library/playtime/log` | Append a manual playtime entry. Body: `{"game_id", "seconds", "date"?, "note"?}`. Returns `{"ok", "game_id", "entry"}`. |
| `POST` | `/api/v2/library/playtime/update` | Replace one manual playtime entry by index. Body: `{"game_id", "index", "seconds", "date"?, "note"?}`. |
| `POST` | `/api/v2/library/playtime/delete` | Delete one manual playtime entry by index. Body: `{"game_id", "index"}`. |

## Duplicate detection and merge

Identity-based duplicate groups across the library (title plus cross-source identity matching). Merge plans are previewed before anything moves; the merge trashes the losing records reversibly.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/library/duplicates` | Find duplicate groups. `?title=0` skips title matching. |
| `POST` | `/api/v2/library/duplicates/preview` | Merge plan for a group. Body: `{"ids": [...]}` (list of game indexes; required). |
| `POST` | `/api/v2/library/duplicates/merge` | Execute the merge. Body: `{"ids": [...]}` (at least two). Losers move to the trash, so the merge is reversible. |

## Missing-file repair wizard

Games whose files (or media) no longer exist at their recorded paths can be relinked by matching missing basenames against a user-picked folder. The apply replans inside the state transaction and only touches rows that are still missing.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/library/repair` | Scan for missing paths. `?media=0` skips media. Returns `{"items", "count"}`. |
| `POST` | `/api/v2/library/repair/preview` | Dry-run a relink plan. Body: `{"folder": "..." (required), "fields"?: [...], "include_media"?: true}`. Returns `{"folder", "scanned", "candidates", "matches"}`. |
| `POST` | `/api/v2/library/repair/apply` | Apply the relink. Body: `{"folder": "..." (required), "fields"?: [...], "include_media"?: true, "selection"?: [[id, field], ...] \| [ids]}`. |

## Effortless metadata

Auto-scrape after import (master toggle plus per-provider opt-ins) and the thumbnail chooser backing route. The four scrape settings live in raw state settings and never touch the settings-handler normalization.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/metadata/media-candidates` | Image candidates for one LaunchBox database id (thumbnail chooser). `?database_id=` (required). Returns `{"database_id", "candidates": [{"kind", "type", "url", "region"}]}`. Requires the metadata database (`409` before it is downloaded). |
| `GET` | `/api/v2/metadata/scrape-settings` | Read the auto-scrape master toggle and provider opt-ins: `scrape_after_import` (default `true`), `scrape_screenscraper_enabled`, `scrape_igdb_enabled`, `scrape_steamgrid_enabled` (default `false`). |
| `POST` | `/api/v2/metadata/scrape-settings` | Persist the four known keys (bool-coerced; anything else ignored). Body: any subset of the four keys. |
| `POST` | `/api/v2/metadata/auto-scrape` | Queue the match + media auto-scrape jobs for one import batch. Body: `{"import_batch_id": "..." (required), "media_types"?, "overwrite"?: false}`. Returns `202 {"queued": true, "import_batch_id", "match_job_id", "media_job_id", "preview_id"}`, or `200 {"queued": false, "reason": "scrape_after_import is disabled"}` when the master toggle is off. |

## Plugins 2.0

Checksum-bound per-plugin trust, Android-style permission prompts, settings forms from a manifest JSON Schema subset, a community catalog joined with installed state, palette commands, and the plugin command runner. The v1 surface stays frozen; everything new lives under `/api/v2`. The plugin id travels in the query string for GET and the JSON body for POST.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/plugins/catalog` | Community catalog joined with installed state. Returns `{"catalog": [{...entry, "installed", "installed_version", "update_available"}], "sandbox"}` — `sandbox` is top-level. |
| `GET` | `/api/v2/plugins/commands` | Palette commands declared by enabled plugins plus host builtins. Returns `{"api_version": 1, "sandbox", "commands"}`. |
| `POST` | `/api/v2/plugins/command` | Run one palette command through the sandboxed plugin runner. Body: `{"plugin_id", "command"}` (both required; the command must be declared in the manifest). The `command` hook receives `{"command", "library"}` where `library` is a 500-entry, six-field projection. Invalid output surfaces as an error. Returns `{"ok", "plugin_id", "command", "result", "notification"}`. |
| `GET` | `/api/v2/plugins/trust` | Trust status for one plugin: `?id=`. Returns `{"id", "granted", "checksum", "match"}`. |
| `POST` | `/api/v2/plugins/trust` | Grant or revoke unsandboxed-execution trust for one plugin. Body: `{"id", "trusted"}` (`trusted` required). Trust is checksum-bound: updating the plugin re-prompts. Returns `{"id", "trusted"}`. |
| `POST` | `/api/v2/plugins/permissions` | Record a user permission grant for one plugin (Android-style prompts). Body: `{"id", "permissions": [...]}`. Returns `{"id", "permissions"}`. |
| `GET` | `/api/v2/plugins/settings` | Settings schema plus current values for one plugin: `?id=`. Returns `{"id", "schema"?, "values"}`. |
| `POST` | `/api/v2/plugins/settings` | Validate and store per-plugin settings. Body: `{"id", "values": {...}}`. Returns `{"id", "values"}`. |

The plugin hook contract (stdin/stdout shapes, the `events` lifecycle hook, the `library_source` importer hook) is documented in [Plugins](/reference/plugins/). The base-only `GET /api/plugins` and `GET /api/plugins/catalog` routes remain documented under [Local administrator](/reference/api/local-admin/).

## Related pages

- [API overview and route groups](/reference/api/overview/)
- [API 1.12 additions](/reference/api/one-twelve/), the previous release's v2 surface
- [Game DNA smart search](/reference/search-syntax/), the query behavior the DNA routes back
- [Plugins](/reference/plugins/), the manifest and hook contract
