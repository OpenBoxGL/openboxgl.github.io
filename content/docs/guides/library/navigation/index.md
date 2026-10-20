---
title: Library navigation
description: Keyboard and gamepad navigation across the library grid and list, hash routing for shareable links, and the screenshot lightbox.
---

Since OpenBox 1.8.0, the library grid and list view support full keyboard and gamepad navigation, plus hash routing so any library view can be shared or bookmarked.

## Keyboard navigation

- **Arrow keys / Home / End / Page Up / Page Down** move the focus across the grid or list; scrolling is virtualization-aware, so focus reveal works in 20k-game libraries.
- **`f`** toggles favorite on the focused game; **Escape** clears the current selection.
- **Enter** opens the focused game's detail pane.
- **`F1`** or **`?`** opens **Help & shortcuts** — Start here, the glossary, and the shortcut table — unless focus is in a text field or a dialog is already open.

## Gamepad and the controller map

Gamepad input runs through a configurable controller map (Settings → Controller). Each mapped action (`play`, `back`, `favorite`, `random`, `page_left`, `page_right`, `pause`, `menu`) can be bound to a button number (0–31) with edge detection, so held buttons don't repeat. The controller bench tab visualizes live gamepad input so you can verify bindings without launching a game.

## Hash routing

The library view is encoded in the URL as `#/key/value` hash fragments — platform, category, playlist, filter preset, search query (`q`), selected game, sort state, and the include/exclude filter pairs. Refreshing restores exactly where you were, including filters you excluded rather than selected, and copying the address bar gives someone a link that opens the same view. No server round-trip is involved; the fragments are read and written locally.

## Sidebar order and sections

Settings → Library has a **Sidebar section order** list with up/down buttons for search, view, filters, platforms, playlists, and explorer, so the parts you use can sit at the top, plus a **Hidden sidebar sections** fieldset of checkboxes; hiding **Explorer** removes the facet panel entirely. Both are saved as `sidebar_sections` and `hidden_sidebar_sections`, and an older saved order that still names a section a later build dropped is accepted instead of being rejected on save.

## Sortable list columns

In list view, click a column header (Title, Platform, Genre, Rating) to cycle the sort direction. ESRB, Progress, and Plays are static display columns. The choice persists via the `list_sort` and `list_sort_dir` settings.

## Screenshot lightbox

Open a game's screenshots to view them in a lightbox with previous/next navigation, zoom, and a position counter. Cover art shows a skeleton shimmer while loading.

## Mood Match adaptive theming (v1.9.0)

When `mood_match_enabled` is on, selecting a game tints the surrounding UI from its cover palette (`applyMoodForGame` in `static/mood.js:172`); Big Box follows only when its own mood toggle is also on. Without a cover — or with the toggle off — the theme stays neutral. See [Discovery](/guides/discovery/) for the picker surfaces that pair with it.

## See also

- [Library overview](/guides/library/) for browsing and filters
- [Big Box and handhelds](/guides/big-box-and-handhelds/) for fullscreen controller use
- [Shortcuts reference](/reference/shortcuts/) for Big Box bindings
