---
title: Organizing
description: Use search, filters, collections, playlists, and safe library operations.
---

OpenBoxGL organizes a large catalog through favorites, collections, saved filters, ordered manual playlists, custom fields, ESRB filters, platform categories, and bulk edits.

<Callout type="tip" title="Bulk edit never deletes anything">

Bulk Edit changes only the fields you specify, missing keys are preserved unchanged. `favorite` and `hidden` must be booleans; `progress` must be a known status; `rating` is clamped to 0-5. Tags have their own replace/add/remove actions (see [Queue, tags, and notifications](/guides/library/queue-tags-notifications/)) because combining tag replacement with add or remove in one request would be ambiguous.

</Callout>

## Filters and views

The sidebar **View** selector covers All games, Favorites, Recently played, Never played, In progress, Completed, Installed only, Owned / not installed, Has saves, Hidden, and Missing files. The **ESRB** filter narrows to E, E10+, T, M, AO, RP, or Unrated. **Categories** group platforms into Nintendo, Sony, Microsoft, Computer, Arcade, Adventure, and Other by default, overridable in Settings. **Explorer** facets count and filter by genre, developer, publisher, platform, progress, and ESRB with up to 40 values per field; clicking a facet applies it, and an "Unset"/"Unrated" label covers empty values.

**Save Filter** stores the current platform, category, view, search query, ESRB, and progress as a playlist-style rule set. **Save Preset** does the same but keeps the rules as a **filter preset**, optionally pinned as a **Big Box quick preset** (marked with a star in the sidebar, selectable from the Big Box Filter and Sort menu). Both appear in the sidebar; presets restore their rules when clicked and can be deleted with the × button.

### Visual chip builder (v1.7.2+)

Filter presets render as **visual chips** — compact badges showing the field, operator, and value for each rule (e.g. `platform = SNES`, `genre contains RPG`, `favorite = true`). Chips are generated from the underlying JSON rules via `rules_to_chips()` and convert back via `chips_to_rules()` with round-trip fidelity, so editing a chip and saving produces the same rule structure as before. This makes complex collections with many rules easier to scan and edit at a glance.

## Playlists

Open the **Playlists** dialog for **New manual playlist** and **New filter playlist**. Manual playlists keep an exact ordered set of games; the manager shows each member with up and down buttons to reorder, plus notes and an optional parent playlist for grouping. Filter playlists store the same rule set as a saved filter and update membership automatically from their rules. Add games to a manual playlist from the context menu or the queue dialog. Deleting a playlist only removes the playlist, never the games.

## Fields, badges, and bulk edits

The **Edit metadata** dialog covers name, platform, genre, year, developer, publisher, series, region, play mode, sort title, progress, ESRB, rating (0 to 5, step 0.5), max players, Wikipedia and video URLs, alternate names, video snap/theme/trailer/recording paths, game path, cover/background/video/music paths, controller support, disc count, extended artwork (clear logo, fanart, banner, icon, box back, box spine, 3D box, title screen), screenshots, RetroAchievements Game ID, launch command override, launch profile override, archive extraction, Big Box hide, hidden, broken, portable, archive member, applications, alternate versions, documents, save paths, description, and private notes.

`collection` is a separate grouping field populated by imports (Steam, Heroic, Lutris, Gameyfin, Arcade, Xbox 360) and shown and filtered in the native window. It feeds the **Related Games** scorer (two games with the same `collection` score higher). The UI does not currently expose an editable `collection` control or a `collection:` search term, so its value is set by imports and surfaced through related-game reasons rather than by hand.

Custom fields are defined in Settings as `Name|Option1,Option2` lines (up to 20 fields, 50 options each). They appear as editable values on each game and can be bulk-applied.

**Bulk Edit** works on any multi-selection: platform, genre, progress, rating, favorite, hidden, and ESRB. Only supplied values change; rating must be 0 to 5, progress must be one of the known statuses, and favorite/hidden must be true or false. Tags can be replaced or adjusted per game (see [Queue, tags, and notifications](/guides/library/queue-tags-notifications/)).

Progress automation (Settings) can mark a game **Playing** after N minutes of play and **Paused** after N days idle, and a **Progress status on first play** setting stamps the first launch.

## Health audit and duplicates

The **Health** button runs a Library Audit over the whole library: duplicate identities, missing game files, missing box fronts, missing extras (applications, versions, documents), missing save paths, and ROMs without an emulator profile. Each issue lists the game and the specific problem, and clicking an issue selects that game. The audit's **Remove duplicate entries** removes only duplicate library entries; game files stay on disk.

**Media** opens the Media Manager: a per-platform audit (games, database matched, missing box front, missing background, missing screenshots), bulk media downloads, and duplicate-media cleanup with a separate dry-run and apply step. Duplicate detection hashes cover, background, and screenshot files; the apply step deletes only files inside the OpenBox data directory and never symlinks.

## Safe deletion

Removing a game asks twice: first to confirm removing the library entry, then whether to also delete the game's listed media files. Game files are never deleted. **Settings** has **Remove all imported Steam games** for wiping Steam entries only. The audit and duplicate tools also report before they change anything. Keep a backup when the operation affects files; see [Sessions, saves, and backups](/guides/sessions-saves-and-backups/).

Stable game IDs keep edits, session history, queue entries, and saves attached when library order changes. If two imported entries share an identity (for example the same Steam App ID), the health audit flags them as duplicates.
