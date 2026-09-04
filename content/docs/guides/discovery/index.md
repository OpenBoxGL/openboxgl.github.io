---
title: Discovery
description: Find something to play with the curated Discovery views.
---

The **Discovery** button (top bar) curates your library into ready-to-play views so you never stare at an empty grid. It works entirely from local library data, no account or network required.

<Callout type="note" title="How discovery recomputes automatically">

Discovery doesn't store pre-computed lists. Each click regenerates the six views by filtering and sorting against `play_count`, `playtime_seconds`, `last_played`, and rating, the same counters used for session tracking. That means a game moved from "Continue playing" to the bottom of "Highly rated" the moment it gets marked Completed, without any manual refresh. See [Sessions, saves, and backups](/guides/sessions-saves-and-backups/) for what feeds these counters.

</Callout>

## The views

| View | What it shows |
| --- | --- |
| Recently added | The newest imports |
| Never played | Games you have not launched yet |
| Continue playing | In-progress games you returned to recently |
| Highly rated | Top-rated games in your library |
| Short sessions | Games whose past sessions were short, good for a quick play |
| Random picks | A rotating set of surprise titles |

Each view lists up to 12 games and is regenerated as the library changes.

## Explorer rail

The **Explorer** panel in the sidebar breaks your library down by metadata facets:

- **Dimensions**: Genre, Developer, Publisher, Platform, Progress state, and ESRB rating.
- **Dynamic Counts**: Shows how many games match each value (e.g. `Platformer (24)`, `Capcom (12)`).
- **Compound Filters**: Clicking a facet immediately applies a scoped search query to your library view.
- **REST API**: Backed by `GET /api/explorer/facets?field=<field>`, returning the top 40 sorted facets.

## Related games and recommendations

When viewing any game's detail modal or pane, OpenBox dynamically computes the most relevant titles in your collection:

- **Scoring Engine**: Evaluates similarity weights across shared `series` (+5), `developer` (+3), `publisher` (+2), `genre` (+2), `collection` (+2), and `platform` (+1).
- **Reason Badges**: Badges explain why each game was recommended (e.g. *Same Series*, *Same Developer*, *Shared Genre*).
- **API Endpoint**: Accessible via `GET /api/related/rich?id=<index>` or `?game_id=<stable_id>`.

## See also

- [Library overview](/guides/library/), browsing and filtering the full library
- [API content and imports](/reference/api/content-and-imports/), `GET /api/discovery`
- [API local administrator](/reference/api/local-admin/), `GET /api/explorer/facets`
- [Sessions, saves, and backups](/guides/sessions-saves-and-backups/), where play history comes from

## What should I play? (Picker)

The **"What should I play?"** picker (replacing the old random "Surprise me" button) scores your library against your current constraints instead of picking blindly. Choose:

- **Available time** — only games that fit the session you have.
- **Mood** — action, chill, story, retro, or party.
- **Familiarity** — something new, or a favorite worth revisiting.
- **Players** — solo or couch-multiplayer options.

The top pick renders with an explanatory reason plus quick **Launch**, **Details**, and **Again** actions, and a "Just surprise me" fallback. Backed by `POST /api/v2/library/pick` (`pkg/parity/parity_picker.py`).

## Constellation

**Tools → Constellation** opens a full-screen, pan/zoomable relationship graph of your library. Nodes are games; edges link shared series, developers, publishers, genres, platform family, and co-play history, so clusters reveal what your collection is really about. Clicking a node selects it in the library. Backed by `GET /api/v2/library/constellation`.
