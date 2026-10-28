---
title: Library overview
description: Browse, search, and safely maintain a mixed-platform game library.
---

OpenBoxGL presents imported games in a searchable grid or list. Select a card to open its detail pane, where metadata, artwork, launch, saves, and history stay together. The top bar is grouped into three zones:

- The **Library** zone holds **Library** and one **Add games** menu (`#addMenuButton`) that gathers every way in: **Add one game…**, **Scan a folder…**, **Add a game without files…**, **Guided setup…**, and the store shortcuts **Steam**, **Heroic**, **Lutris**, and **More game stores…**. **Guided setup** opens the [Setup Center](/guides/library/setup-center/).
- The **Actions** zone holds **Big Box**, **Running now**, **Play queue**, and **Activity** (`#activityButton` with live running operation count).
- The **Tools** menu (`#toolsButton`) is organized into four accessible WAI-ARIA groups, each entry carrying a one-line hint:
  1. **Start here**: Artwork & details, Media files, Library checkup, Emulators & controllers, Themes, Settings, Help & shortcuts.
  2. **Library**: Game connections, Completion ranking, Bulk edit, Tags, Playlists, Backup, History, Library history, RetroAchievements account, Save current search, Save current view.
  3. **Imports & extras**: Game stores, Import Steam / Heroic / Lutris / GOG / EA app / Ubisoft Connect / Arcade / PICO-8 / MSU-1 / WHDLoad, 3D arcade room, Family sharing.
  4. **More**: Find something to play, Online play, Plugins, What's New, Fullscreen, Report a problem, Webhooks, Notifications.

Press `F1` or `?` — outside a text field and with no dialog already open — for **Help & shortcuts**: a four-step *Start here* path, a glossary of the words OpenBox uses (shelf entry, emulator, ROM, BIOS, metadata, artwork, launch profile, playlist, collection, Big Box, Quick Resume), and the real keyboard shortcut table. The same dialog holds **Report a problem**.

<Callout type="tip" title="Why the library never gets broken by reordering">

Every entry carries a `game_id` derived from its identity (path, platform, store ids), not its position in the list. Reorder cards, delete others, re-import, your sessions, queue entries, save links, and tags all point at the same id. This is also why a second import of the same folder does not duplicate: OpenBoxGL computes the same hash and recognizes the existing game before creating anything new. See [How OpenBoxGL works](/reference/how-it-works/#the-state-store).

</Callout>

## Browse and search

The sidebar offers, from top to bottom: a **Search** field, a **View** selector, an **ESRB** filter, **Categories**, **Platforms**, **Playlists**, **Collections**, **Filter presets**, and **Explorer**. **Settings → Library** can reorder those sections and hide **Explorer** entirely, so a small library is not buried under facet panels; an order saved by an older build still loads, and stale section ids are dropped rather than rejected. **Collections** (v1.12.0) lists named shelves saved from the query bar — a collection stores the query text, not a snapshot, so membership re-evaluates live as the library changes (see [Backlog Radio](/guides/discovery/backlog-radio/)). The **View** selector includes: All games, Favorites, Recently played, Never played, In progress, Completed, Installed only, Owned / not installed, Has saves, Hidden, and Missing files.

Each sidebar filter has its own behaviour. Platform and category entries are tri-state: click one once to **include** it, again to **exclude** it, and again to clear it. **Source** is a dropdown plus a separate **Exclude** checkbox, so it is included or excluded by that checkbox rather than cycled. A smart collection loads its saved query into the search box and has no exclude state. Excluded values render as "Not `<field>`: `<value>`" chips, are written to the URL hash so a refresh keeps them, and are saved with filter presets and playlists as an `exclude` block — an `exclude.source` rule is still available in presets and playlists even though the sidebar Source widget is a dropdown.

Search supports field-targeted terms, quoted values, and negative terms. Prefix a term with `-` to exclude it:

- `title:hollow` matches names, sort titles, and alternate names.
- `platform:"PlayStation 2"` matches a literal platform value.
- `-tag:demo` excludes games carrying a `demo` tag.
- `dev:team` matches developer, `pub:` publisher, `series:`, `genre:`, `region:`, `notes:`, `source:`, `store:`, `progress:`, `rating:`, `favorite:`, `installed:`, `hidden:`, `broken:`, `portable:`, `controller:`, and `tag:` all work.
- `installed:yes` / `installed:no` and `favorite:yes` / `favorite:no` filter booleans.

Bare terms search name, sort title, alternate names, platform, genre, developer, publisher, series, region, notes, source, play mode, status, progress, controller support, and tags. Short bare terms also match title initials and acronyms (e.g. `oot` matches *Ocarina of Time*).

Sort options are **Title**, **Rating**, **Recently played**, **Recent activity**, **Play time**, **Date added**, **Platform**, and **Genre**. The **arrange bar** on the right edge jumps through the current sort's groups; it appears once the view has at least four groups. The **Surprise me** button (or `Ctrl+Alt+Q` / `Ctrl+Alt+R`) selects/focuses a random game in the grid (the Surprise Me button / "Just surprise me" opens the picker), which scores the current view by available time, mood, familiarity, and players — with a "Just surprise me" fallback for a purely random pick. See [Discovery](/guides/discovery/).

The **image group** dropdown changes which artwork shows on cards: Box fronts, Backgrounds, Screenshots, Clear logos, Fanart, Banners, Box backs, Box spines, 3D boxes, Title screens, Icons, Cart fronts, Cart backs, Discs, Ads / flyers, and Manuals. The choice can be remembered per platform or per playlist from the dropdown's save action. **List view** shows Title, Platform, Genre, ESRB, Progress, Plays, and Rating columns.

A **Jump back in** hero card sits above the grid and headlines the most recently played game with **Play** and **View details**; it hides as soon as you filter by a platform or category, open a playlist or preset, search, or enter bulk mode. **Play Insights** now renders *below* the grid, so games are visible on the first screen instead of being pushed down by the dashboard. An empty library shows one illustrated card — **Scan a folder**, **Connect a game store**, **Add one game**, with **Walk me through setup** as a link and a reminder that you can drag a folder or game file anywhere on the window.

Select multiple games by holding Ctrl or Shift while clicking cards. This enables **Bulk Edit**, which can change platform, genre, progress, rating, favorite, hidden, and ESRB, and reset play statistics on every selected game at once. Bulk Edit also has a **find and replace** step: pick one metadata field, enter the literal text to find and its replacement, review the preview (which games, and the before/after value), then apply. Replacement is literal — no regular expressions — so a stray `$` or `\` cannot rewrite more than you typed. Right-click any card for the context menu: Play, Toggle favorite, Edit metadata, Mark progress, Reset play statistics, Add to playlist, New playlist from game, and Remove from library. The Edit Game dialog includes **Previous** and **Next** buttons to cycle through the filtered library without closing the modal.

## Game details

The detail pane shows a hero with background art, name and platform, a **PLAY** button (or **INSTALL** for owned-but-uninstalled Gameyfin entries), favorite toggle, **Edit metadata**, **Find metadata**, **Use Steam data** (for Steam entries), **Capture screenshot**, **Download bezel**, **Remove game**, and Gameyfin **Uninstall** where applicable. Below are Information facts (release date, developer, publisher, ESRB, source, category, custom fields, max players, controller support, disc count, play time, launches, last played, progress, rating, region, play mode, Wikipedia, video URL), description and notes, extras (applications, alternate versions, documents), video and music players, a screenshot gallery, extended artwork groups, **Related Games**, RetroAchievements, and **Save management** with save discovery, backups, Ludusavi and Hoard actions. The pane also carries detail tabs: **Overview**, **Moments**, and **Story** (v1.12.0) — the Story tab narrates the game's deterministic timeline (added, first played, longest session, playtime milestones, progress, captured Moments) served by `GET /api/v2/story`.

A platform selected in the sidebar shows a platform panel with statistics (games, completed, play time, launches, favorites, missing files), **Play random**, **Last played**, **Most played**, an **Edit platform documents** list of manuals and reference files, and the platform's emulator settings. It also carries **Rename platform** and **Delete platform**:

- **Rename platform** updates the platform on every game, launch profile, platform settings map (categories, themes, image group, 3D model choices, documents, videos), platform emulator settings, filter-playlist rules, and saved filter presets. Tick **move media** to relocate files already stored under the platform's media folder; unrelated files are never touched, and a failed move rolls back the whole batch.
- **Delete platform** requires typing the platform name back. Its games move to the **Trash** (so the delete is reversible), and its settings, profile, and emulator platform entries are removed along with its media folder if you ask for that.

When no game is selected, the details pane shows a dismissible three-step onboarding checklist — add games, find artwork, launch a game — with the progress counter, **Add games** and **Open setup** actions, and a **Dismiss** button that is remembered. It disappears once all three steps are done.

## Organize safely

Use [Importing](/guides/library/importing/), [Organizing](/guides/library/organizing/), and [Queue, tags, and notifications](/guides/library/queue-tags-notifications/) for focused procedures. **Library checkup** in the Tools menu opens the library audit, which carries a **health score** (v1.14.0): a 0–100 number built from five weighted dimensions — file integrity (35), duplicates (20), artwork (20), metadata (15), and launch readiness (10) — where every deduction names its games. The audit still flags duplicate identities, missing game files, missing box fronts, missing extras (applications, versions, documents), missing save paths, and ROMs without an emulator profile; click an issue to jump to that game. An issue table adds a **Source** column and per-source issue counts, and a source filter (with clickable count chips) narrows the table to one storefront, with plugin sources shown under their display names. The health card's breakdown dialog lists per-dimension issues with a **Fix all in this dimension** queue that shows a dry-run preview first and is undoable. A scheduled rescan (daily, weekly, on startup, or off; default weekly) skips active game sessions, and Big Box shows a health tile with re-scan.

**Artwork Doctor** scans for missing covers, missing files, low-resolution and wrong-aspect artwork, and duplicate images, then fixes all with SteamGridDB in one cancelable batch job — every replacement is attributable to its provider and undoable per batch. The **missing-file repair wizard** scans for missing game and media paths, matches them against a folder you pick, and relinks only the matches that are still missing, skipping anything that changed since the scan. Duplicate detection groups identity, path, and title collisions; the merge preview picks the record with the most play history, unions media and list fields, and moves absorbed entries to the Trash so merges are reversible — the health dialog's dedupe button opens the merge dialog. **Remove duplicate entries** inside the audit deletes only the duplicate library entries, never game files.

**Media** opens the Media Manager with a per-platform audit (games, database matched, missing box front, missing background, missing screenshots), bulk downloads for matched games, and **Find duplicate media**, which separates a dry-run from **Delete duplicate media** and can be scoped to a single platform or the entire collection. Duplicate detection hashes cover, background, and screenshot files; deletion only touches files inside the OpenBox data directory, never symlinks.

Removing a game asks twice: first to confirm the library entry removal, then whether to also delete the game's listed media files. Game files are never deleted. **Settings** also offers **Remove all imported Steam games**, which removes only Steam entries and keeps files and media.

## Source and status

Capability status belongs to the [parity matrix](/reference/parity/), maintained from `PARITY.md`. Library data lives in the platform data directory (`~/.local/share/openbox-game-launcher/library.json` on Linux, `~/Library/Application Support/openbox-game-launcher/library.json` on macOS, and `%LOCALAPPDATA%\openbox-game-launcher\library.json` on Windows) unless `OPENBOX_DATA_DIR` points elsewhere. State is schema version 6, written atomically with a `.bak` last-known-good copy beside it; recovery is covered in [Data and recovery](/reference/data-and-recovery/).

## Guides in this section

- [Setup Center](/guides/library/setup-center/) — the guided first-run workflow: a six-step quick path (sources, scan, decisions, readiness, confirm, finish) with the advanced steps behind a toggle.
- [Importing](/guides/library/importing/) — every import source, ambiguous platforms, playlists, and migration from LaunchBox or ES-DE.
- [Organizing](/guides/library/organizing/) — the health score and its per-dimension fixes, duplicate merge, and missing-file repair.
- [Queue, tags, and notifications](/guides/library/queue-tags-notifications/) — the play queue, tag filters, and how notifications behave.
- [Insights](/guides/library/insights/) — Play Insights, streaks, Wrapped, the Mastery Map, and the history timeline.
- [Backlog](/guides/library/backlog/) — progress statuses, your own star rating, manual playtime sessions, and notes.
- [Time Machine](/guides/library/time-machine/) — browse the library as it was on a past date, and revert safely.
- [Navigation](/guides/library/navigation/) — keyboard and controller navigation through the grid and detail pane.
- [Export](/guides/library/export/) — portable, redacted exports of your library for inspection or external tooling.

Large libraries (5,000+ games) self-enable the SQLite FTS read model unless `OPENBOX_ENABLE_SQLITE_READ=0` opts out, and an opt-in weekly automatic backup keeps 4 archives on a 7-day schedule — see [Organizing](/guides/library/organizing/#large-libraries-and-automatic-backups-v1120), [API 1.12 additions](/reference/api/one-twelve/), and [Library backups](/guides/sessions-saves-and-backups/library-backups/).
