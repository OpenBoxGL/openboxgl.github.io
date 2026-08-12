---
title: Discovery
description: Find something to play with the curated Discovery views.
---

The **Discovery** button (top bar) curates your library into ready-to-play views so you never stare at an empty grid. It works entirely from local library data — no account or network required.

<Callout type="note" title="How discovery recomputes automatically">

Discovery doesn't store pre-computed lists. Each click regenerates the six views by filtering and sorting against `play_count`, `playtime_seconds`, `last_played`, and rating — the same counters used for session tracking. That means a game moved from "Continue playing" to the bottom of "Highly rated" the moment it gets marked Completed, without any manual refresh. See [Sessions, saves, and backups](/guides/sessions-saves-and-backups/) for what feeds these counters.

</Callout>

## The views

| View | What it shows |
| --- | --- |
| Recently added | The newest imports |
| Never played | Games you have not launched yet |
| Continue playing | In-progress games you returned to recently |
| Highly rated | Top-rated games in your library |
| Short sessions | Games whose past sessions were short — good for a quick play |
| Random picks | A rotating set of surprise titles |

Each view lists up to 12 games and is regenerated as the library changes.

## Use it

1. Click **Discovery** in the top bar.
2. Pick a view that matches your mood — **Never played** and **Short sessions** are the two most useful for deciding what to launch.
3. Click any card to open its detail pane and play.

Because the views are computed from `play_count`, `playtime_seconds`, `last_played`, and rating, they get smarter as you play: titles you finish drop out of "Continue playing", and games you play briefly keep showing up in "Short sessions".

## See also

- [Library overview](/guides/library/) — browsing and filtering the full library
- [API content and imports](/reference/api/content-and-imports/) — `GET /api/discovery`
- [Sessions, saves, and backups](/guides/sessions-saves-and-backups/) — where play history comes from
