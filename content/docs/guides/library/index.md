---
title: Library overview
description: Browse, search, and safely maintain a mixed Linux game library.
---

OpenBoxGL presents imported games in a searchable grid or list. Select a card to open its detail pane, where metadata, artwork, launch, saves, and history stay together. The top bar is grouped into three zones. The **Library** zone holds **Library**, **Add Game**, and **Import Folder**. The **Actions** zone holds **Big Box**, **Running**, and **Queue**. The **Tools** menu holds the rest: **Import Steam**, **Import Heroic**, **Import Lutris**, **Import Arcade**, **Emulators**, **Settings**, **History**, **Themes**, **Save Filter**, **Save Preset**, **Playlists**, **Achievements**, **Plugins**, **Discovery**, **Storefronts**, **Media**, **Health**, **Bulk Edit**, **Backup**, **Fullscreen**, **Tags**, **Notifications**, and **Webhooks**.

<Callout type="tip" title="Why the library never gets broken by reordering">

Every entry carries a `game_id` derived from its identity (path, platform, store ids), not its position in the list. Reorder cards, delete others, re-import, your sessions, queue entries, save links, and tags all point at the same id. This is also why a second import of the same folder does not duplicate: OpenBoxGL computes the same hash and recognizes the existing game before creating anything new. See [How OpenBoxGL works](/reference/how-it-works/#the-state-store).

</Callout>

## Browse and search

The sidebar offers, from top to bottom: a **Search** field, a **View** selector, an **ESRB** filter, **Categories**, **Platforms**, **Playlists**, **Filter presets**, and **Explorer**. The **View** selector includes: All games, Favorites, Recently played, Never played, In progress, Completed, Installed only, Owned / not installed, Has saves, Hidden, and Missing files.

Search supports field-targeted terms, quoted values, and negative terms. Prefix a term with `-` to exclude it:

- `title:hollow` matches names, sort titles, and alternate names.
- `platform:"PlayStation 2"` matches a literal platform value.
- `-tag:demo` excludes games carrying a `demo` tag.
- `dev:team` matches developer, `pub:` publisher, `series:`, `genre:`, `region:`, `notes:`, `source:`, `store:`, `progress:`, `rating:`, `favorite:`, `installed:`, `hidden:`, `broken:`, `portable:`, `controller:`, and `tag:` all work.
- `installed:yes` / `installed:no` and `favorite:yes` / `favorite:no` filter booleans.

Bare terms search name, sort title, alternate names, platform, genre, developer, publisher, series, region, notes, source, play mode, status, progress, controller support, and tags. Short bare terms also match title initials and acronyms (e.g. `oot` matches *Ocarina of Time*).

Sort options are **Title**, **Rating**, **Recently played**, **Recent activity**, **Play time**, **Date added**, **Platform**, and **Genre**. The **arrange bar** on the right edge jumps through the current sort's groups; it appears once the view has at least four groups. The **Surprise me** button (or `Ctrl+Alt+Q` / `Ctrl+Alt+R`) picks and focuses a random game from the current view.

The **image group** dropdown changes which artwork shows on cards: Box fronts, Backgrounds, Screenshots, Clear logos, Fanart, Banners, Box backs, Box spines, 3D boxes, and Title screens. The choice can be remembered per platform or per playlist from the dropdown's save action. **List view** shows Title, Platform, Genre, ESRB, Progress, Plays, and Rating columns.

Select multiple games by holding Ctrl or Shift while clicking cards. This enables **Bulk Edit**, which can change platform, genre, progress, rating, favorite, hidden, ESRB, and reset play statistics on every selected game at once. Right-click any card for the context menu: Play, Toggle favorite, Edit metadata, Mark progress, Reset play statistics, Add to playlist, New playlist from game, and Remove from library. The Edit Game dialog includes **Previous** and **Next** buttons to cycle through the filtered library without closing the modal.

## Game details

The detail pane shows a hero with background art, name and platform, a **PLAY** button (or **INSTALL** for owned-but-uninstalled Gameyfin entries), favorite toggle, **Edit metadata**, **Find metadata**, **Use Steam data** (for Steam entries), **Capture screenshot**, **Download bezel**, **Remove game**, and Gameyfin **Uninstall** where applicable. Below are Information facts (release date, developer, publisher, ESRB, source, category, custom fields, max players, controller support, disc count, play time, launches, last played, progress, rating, region, play mode, Wikipedia, video URL), description and notes, extras (applications, alternate versions, documents), video and music players, a screenshot gallery, extended artwork groups, **Related Games**, RetroAchievements, and **Save management** with save discovery, backups, Ludusavi and Hoard actions.

A platform selected in the sidebar shows a platform panel with statistics (games, completed, play time, launches, favorites, missing files), **Play random**, **Last played**, **Most played**, and an **Edit platform documents** list of manuals and reference files.

## Organize safely

Use [Importing](/guides/library/importing/), [Organizing](/guides/library/organizing/), and [Queue, tags, and notifications](/guides/library/queue-tags-notifications/) for focused procedures. The **Health** button runs a Library Audit that flags duplicate identities, missing game files, missing box fronts, missing extras (applications, versions, documents), missing save paths, and ROMs without an emulator profile. Audit issues list each entry with its problem; click one to jump to that game. **Remove duplicate entries** inside the audit deletes only the duplicate library entries, never game files.

**Media** opens the Media Manager with a per-platform audit (games, database matched, missing box front, missing background, missing screenshots), bulk downloads for matched games, and **Find duplicate media**, which separates a dry-run from **Delete duplicate media** and can be scoped to a single platform or the entire collection. Duplicate detection hashes cover, background, and screenshot files; deletion only touches files inside the OpenBox data directory, never symlinks.

Removing a game asks twice: first to confirm the library entry removal, then whether to also delete the game's listed media files. Game files are never deleted. **Settings** also offers **Remove all imported Steam games**, which removes only Steam entries and keeps files and media.

## Source and status

Capability status belongs to the [parity matrix](/reference/parity/), maintained from `PARITY.md`. Library data lives in `~/.local/share/openbox-game-launcher/library.json` unless `OPENBOX_DATA_DIR` points elsewhere. State is schema version 5, written atomically with a `.bak` last-known-good copy beside it; recovery is covered in [Data and recovery](/reference/data-and-recovery/).
