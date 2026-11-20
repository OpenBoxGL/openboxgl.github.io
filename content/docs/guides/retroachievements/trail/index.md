---
title: Achievement Trail
description: Offline RetroAchievements analytics — velocity, ETAs, next-up queues, and milestones.
---

Achievement Trail (ADR 0110, 3.0) turns the local RetroAchievements cache into an offline analytics view. It never calls the RetroAchievements API to render the trail; it reads `cache/retroachievements/` and keeps a derived `cache/trail.json`.

## What it shows

- **8-week ISO velocity** — unlock counts per ISO week, so a burst and a dry spell are visible side by side.
- **Completion ETA** — a confidence-rated estimate based on your recent unlock rate.
- **Next 100-point milestone** — the achievement points total and the gap to the next round number.
- **Cheapest-first next-up queue** — remaining achievements ordered by points per unit of estimated effort.
- **Streaks** — consecutive active weeks.

## Refresh

The trail is stale-while-rebuild. When the cache changes, the UI keeps the previous trail and offers **Refresh**; a refresh is a cancellable background job.

```bash
curl -X POST -H "X-OpenBox-Token: $TOKEN" \
  http://127.0.0.1:$PORT/api/v2/ra/trail/refresh
```

`GET /api/v2/ra/trail` returns the current trail and `GET /api/v2/ra/trail/game?game_id=…` returns one game's detail.

## Cache behavior

- `cache/trail.json` is keyed by a signature of the RetroAchievements cache. A signature change rebuilds it; more than 250 changed files trigger a background rebuild.
- Older caches without `date_earned` or `date_earned_hardcore` degrade with an explicit notice instead of inventing dates.
- The trail is local and offline. Deleting `cache/trail.json` loses only the derived view; it rebuilds from `cache/retroachievements/`.

## Related pages

- [RetroAchievements](/guides/retroachievements/)
- [API 3.0 changes](/reference/api/three-zero/)
- [Data and recovery](/reference/data-and-recovery/)
