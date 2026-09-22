---
title: Backlog management
description: Track progress, personal ratings, playtime, and notes for every game.
---

Every game carries a personal backlog layer on top of its progress field: statuses, your own star rating, logged play sessions, and dated notes. All of it feeds pickers, filters, search grammar, and exports.

## Progress statuses

The progress field holds the canonical statuses, and an unset progress renders as **Unplayed** everywhere — cards, details, badges, explorer facets, and filters. `progress:unplayed` is a first-class search clause. The legacy single-string notes never silently change progress: the optional one-time **Mark as Playing?** prompt appears on first launch for unplayed games, with a settings kill switch and per-game prompted-once persistence — it never sets progress silently.

## Personal ratings

Your own star rating (`user_rating`, 0–5, where 0 is unrated) is separate from the metadata `rating` that comes from providers. Hover star widgets on cards and in the details pane set it; card badges show it, **My rating** is a sort option and a bulk-edit field, and the game picker weights highly-rated unplayed games with a composite reason (e.g. "rated 4 stars, never started it, ~12h to beat"). Search it with the smart grammar: `my 4 stars`, `unrated by me`, `myrating:4`.

## Manual playtime

Log sessions from the details pane with a date, seconds, and a note; entries can be edited or deleted. Playtime stats and totals include manual time, while streaks still count observed sessions only. Exports carry the manual fields.

## Dated notes

Notes are stored as timestamped `{ts, text}` entries — legacy single-string notes migrate to this shape on read, with no bulk rewrite. Add, edit, and delete notes from the details pane.

<Callout type="tip" title="Backlog data is API-addressable">

Progress, ratings, playtime, and notes all have v2 routes under `/api/v2/library/progress/*`, `/api/v2/library/rating/*`, `/api/v2/library/playtime/*`, and `/api/v2/library/notes/*`; the v1 surface is frozen. See [API reference](/reference/api/).

</Callout>
