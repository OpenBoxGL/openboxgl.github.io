---
title: Backlog Radio and query grammar
description: Ask the local library what to play with explainable recommendations, query chips, and the command palette.
---

OpenBox 1.11 adds three local ways to get from “I have too many games” to a defensible next action: **Backlog Radio**, the deterministic query bar, and the **Ctrl/Cmd-K command palette**.

## Backlog Radio

Backlog Radio appears in the local Insights/Discovery surface as a playlist of up to five games. Each pick carries reason chips derived from your library and recorded sessions. The model uses a bounded recent history window, session length, genres/platforms, completion patterns, freshness, and related-game signals; it does not call an online recommendation service.

The first recommendations are deliberately modest. The habit model needs enough recorded sessions before it claims to know your habits; otherwise the response carries a fallback notice and uses library freshness/rating signals. Completed, hidden, unavailable, and already selected entries are excluded from a normal backlog pick. Refreshing replaces the managed Backlog Radio selection rather than silently duplicating it.

Use **Refresh picks** when you want a new set, or call:

```bash
curl -H "X-OpenBox-Token: $TOKEN" \
  "http://127.0.0.1:$PORT/api/v2/insights/radio"

curl -X POST -H "X-OpenBox-Token: $TOKEN" \
  "http://127.0.0.1:$PORT/api/v2/insights/radio/refresh"
```

The response is `{"playlist": ...}` with the picks, explanations, and any honest fallback notice. The related abandonment radar is available as `GET /api/v2/insights/radar`; `POST /api/v2/insights/radar/park` parks a stalled game when you choose to stop seeing it in the radar.

## Query the collection

Type a short phrase in the library search bar. OpenBox parses the phrase with a small deterministic grammar and renders the interpretation as removable chips. Examples include:

| Query | Intended interpretation |
| --- | --- |
| `short unplayed rpg` | A game with a short estimate, backlog/never-played progress, and an RPG genre match |
| `recently played on Steam` | A recent play window plus the Steam source |
| `co-op for 4` | Multiplayer/player-count constraints where the metadata contains the data |
| `retro platformer` | A release-year ceiling plus a platformer genre match |

The grammar also understands typed terms such as `platform:PC`, quoted values, negative terms, ratings, progress, time/idle phrases, sources, tags, stores, ESRB, region, series, and player counts. Thresholds are intentionally simple: “short/quick” is at most 5 estimated hours, “long/epic” is at least 20, “highly rated” starts at 4.0, “top rated” at 4.5, and “retro/classic” uses a release year of 2000 or earlier. These are filters, not promises that metadata exists for every game.

Unknown words remain ordinary title/metadata text. A phrase is never promoted to a guessed filter just because it sounds plausible, and the chips are the source of truth for what the current query applies.

For an integration, parse without changing the library:

```bash
curl -s -X POST \
  -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"short unplayed rpg"}' \
  "http://127.0.0.1:$PORT/api/v2/library/query/parse"
```

The response includes the parsed rules/clauses/chips, leftovers/hint, `match_count`, and bounded `matched_game_ids`. It is read-only and accepts query text up to 2,000 characters.

## Command palette

Press **Ctrl-K** on Windows/Linux or **Cmd-K** on macOS. The palette searches games and exposes actions, settings, and What's New discovery. Its `?` view repeats the current shortcut table, so it is the quickest way to check controls without leaving the app. The palette is local UI over the existing API; it does not create a second search service.

See [Discovery](/guides/discovery/), [Keyboard & Controller Shortcuts](/reference/shortcuts/), and [API 1.11 additions](/reference/api/one-eleven/) for the surrounding UI and route contracts.
