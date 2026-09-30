---
title: Library Time Machine
description: Browse the local journal, inspect a bounded past view, and preview safe catalog reverts.
---

The **Time Machine** makes catalog history visible without replacing the canonical library. It reads the local journal, reconstructs bounded views, and turns a possible undo into a reviewable plan before anything is written.

## Open the timeline

Choose **Tools → Time Machine**, then use **Timeline** to browse retained events. Filter by days, event kind, or game. Events can include catalog edits, imports, deletes/restores, sessions, and Moments. The journal is local and may be enabled even when catalog synchronization is off.

History is bounded by the journal's retained snapshots and events. The journal keeps at most **25,000 events** (`JOURNAL_MAX_EVENTS`) over a **400-day retention window** (`JOURNAL_RETENTION_DAYS` in `pkg/parity/parity_time_machine.py:55-60`), compacting to a horizon when over budget. If compaction created a horizon, a gap, or a corruption marker, the UI reports that boundary; it does not invent the missing state. Use [Library backups](/reference/library-backups/) when you need a complete archive of files and settings.

## Browse as of a date

The **Browse as of** tab materializes a read-only catalog view for a date. It is useful for answering “what did my library look like then?” without changing the current library. The view reconstructs catalog metadata and history only; it does not restore media binaries, emulator installations, launch files, or save files.

## Compare two points in time

The **Compare** tab (v1.15.0) answers a different question from *Browse as of*: instead of showing you one point, it shows you the **difference between two**. Pick one date or two, and the tab lists:

- **Added** — games that exist at the later point and not the earlier one.
- **Removed** — games that existed at the earlier point and not the later one.
- **Changed** — games present at both points whose fields differ, listed field by field so you can see *what* moved rather than only that something did.

Truer numbers than the page shows: the response carries the real totals, so a truncated page reads "showing 200 of 1,340" rather than implying the 200 is everything. If you pick a start date that predates the kept history, the tab says so instead of presenting a partial diff as a complete one.

Compare is **read-only**. It writes nothing and cannot change the library; to go back to a past state you still use a reviewed revert, which stays exactly as bounded as it was.

The API equivalent takes the later date as `after` and accepts an optional earlier `before`, a `fields` list, and a `limit`:

```bash
curl -s -H "X-OpenBox-Token: $TOKEN" \
  "http://127.0.0.1:$PORT/api/v2/library/time-machine/compare?after=2026-09-22&before=2026-09-01"
```

## Preview a revert

From an event, choose the revert action and review the affected game and fields. The request accepts an `undo` flag to reverse an event's effect rather than re-apply named fields (`handlers/timemachine.py:60-108`). The API equivalent is a read-only request with `apply: false`:

```bash
curl -s -X POST \
  -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_id":"EVENT_ID","game_id":"GAME_ID","fields":["name","genre"],"apply":false}' \
  "http://127.0.0.1:$PORT/api/v2/library/time-machine/revert"
```

The response contains `preview: true` and a plan. An apply request must include the current `base_token` from the preview/plan and set `apply` to `true`:

```json
{
  "event_id": "EVENT_ID",
  "game_id": "GAME_ID",
  "fields": ["name", "genre"],
  "base_token": "TOKEN_FROM_CURRENT_PLAN",
  "apply": true
}
```

OpenBox rechecks the token and writes a new journal event; it does not rewrite history. If the library changed after the preview, the request stops with `TM_REVERT_STALE` and you must preview again. Malformed events, unsupported fields, and missing event ids stop before mutation.

## API surface

- `GET /api/v2/library/time-machine/events?days=90&kind=&game_id=&offset=0&limit=200` lists the bounded journal page (default 200, max **1,000** per `EVENT_PAGE_MAX`; `game` is accepted as an alias for `game_id`).
- `GET /api/v2/library/time-machine/as-of?date=YYYY-MM-DD` returns a read-only materialized view.
- `GET /api/v2/library/time-machine/compare?after=YYYY-MM-DD&before=YYYY-MM-DD&fields=&limit=` diffs the library between two journal points, read-only. `after` is required; `before` is optional, `fields` narrows which fields count as changed, and `limit` caps the returned rows. Added, removed, and per-field changed rows are returned separately, and the totals are true even when the page is truncated. (v1.15.0+)
- `POST /api/v2/library/time-machine/revert` previews or applies a field-level revert. The preview returns a plan with `base_token`; apply by sending the reviewed plan back with `apply: true` and the current `base_token`. A changed library stops the apply with `TM_REVERT_STALE` — preview again.

The related v2 trash routes (`GET /api/v2/library/trash`, `POST /api/v2/library/trash/restore`, and `POST /api/v2/library/trash/purge`) cover the soft-delete path. See [API 1.11 additions](/reference/api/one-eleven/) for the full request/response guidance and [Data and recovery](/reference/data-and-recovery/) for backup boundaries.
