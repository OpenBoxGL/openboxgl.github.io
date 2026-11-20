---
title: Backlog Itinerary
description: An advisory multi-week play schedule with quick-wins, comeback, and raided strategies.
---

Backlog Itinerary (ADR 0113, 3.0) turns an unfinished library into a capacity-bounded play schedule. It is advisory: it does not change progress or launch games for you.

## Build a plan

Open **Tools > Backlog Itinerary**, or call `POST /api/v2/itinerary/plan`. Inputs:

- **Horizon** — 7 to 365 days.
- **Pace** — 5 to 960 minutes per day.
- **Strategy** — `quick-wins` (shortest first), `comeback` (games you have already started), or `raided` (prioritize RetroAchievements progress).

The response returns `entries` (scheduled games with an estimate), `later` (games that did not fit), and `capacity_hours`.

## How estimates are made

1. **IGDB** time-to-beat, when the game has an IGDB match. The lookup is a bounded concurrency-2 job and is cached under `cache/igdb/`.
2. **Own history** median completion time, when you have at least 3 completed samples for comparable games.
3. **Labeled default** of 8.0 hours when neither is available.
4. **RetroAchievements progress** refines the remaining estimate when a matching cache exists.

The plan shows which source produced each estimate.

## Live status

Each entry is `done`, `on_track`, `behind`, or `stale`. The status is derived from elapsed days, your playtime since the plan started, and the estimate. A completed entry is pinned; **Replan** rebuilds around it.

```bash
curl -H "X-OpenBox-Token: $TOKEN" http://127.0.0.1:$PORT/api/v2/itinerary
curl -X POST -H "X-OpenBox-Token: $TOKEN" -H "Content-Type: application/json" \
  -d '{"horizon_days":42,"minutes_per_day":90,"strategy":"quick-wins"}' \
  http://127.0.0.1:$PORT/api/v2/itinerary/plan
```

**Abandon** clears the active plan. The plan is stored in `state["itinerary"]`; deleting it loses only the schedule, not progress.

## Related pages

- [Library](/guides/library/)
- [Backlog](/guides/library/backlog/)
- [API 3.0 changes](/reference/api/three-zero/)
