---
title: Library navigation
description: Keyboard and gamepad navigation across the library grid and list, hash routing for shareable links, and the screenshot lightbox.
---

OpenBox 1.8.0 adds full keyboard and gamepad navigation across the library grid and list view, plus hash routing so any library view can be shared or bookmarked.

## Keyboard navigation

- **Arrow keys / Home / End / Page Up / Page Down** move the focus across the grid or list; scrolling is virtualization-aware, so focus reveal works in 20k-game libraries.
- **`f`** toggles favorite on the focused game; **Escape** clears the current selection.
- **Enter** opens the focused game's detail pane.

## Gamepad and the controller map

Gamepad input runs through a configurable controller map (Settings → Controller). Each mapped action (`play`, `back`, `favorite`, `random`, `page_left`, `page_right`, `pause`, `menu`) can be bound to a button number (0–31) with edge detection, so held buttons don't repeat. The controller bench tab visualizes live gamepad input so you can verify bindings without launching a game.

## Hash routing

The library view is encoded in the URL as `#/key/value` hash fragments — platform, playlist, gamescope preset, search query, selection, and sort state. Refreshing restores exactly where you were, and copying the address bar gives someone a link that opens the same view. No server round-trip is involved; the fragments are read and written locally.

## Sortable list columns

In list view, click a column header (Title, Platform, Genre, ESRB, Progress, Plays, Rating) to cycle the sort direction. The choice persists via the `list_sort` and `list_sort_dir` settings.

## Screenshot lightbox

Open a game's screenshots to view them in a lightbox with previous/next navigation, zoom, and a position counter. Cover art shows a skeleton shimmer while loading.

## See also

- [Library overview](/guides/library/) for browsing and filters
- [Big Box and handhelds](/guides/big-box-and-handhelds/) for fullscreen controller use
- [Shortcuts reference](/reference/shortcuts/) for Big Box bindings
