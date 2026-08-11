---
title: API library and settings
description: Library, settings, profiles, running sessions, history, launch, and CRUD routes.
---

Read and write the library, settings, profiles, launch configuration, and game records. All routes require `X-OpenBox-Token: TOKEN`; all POST bodies are JSON objects.

## Library and state

### `GET /api/library`

Returns the full public library projection, cached until the library file, media epoch, or plugin epoch changes. Top-level keys:

- `games`: array of game objects. Each game includes every editable field (with `""` defaults), plus computed flags: `id` (numeric index), `game_id` (stable id), `favorite`, `hidden`, `hide_in_bigbox`, `last_played`, `play_count`, `playtime_seconds`, `path_exists`, `has_cover`, `has_background`, `has_clear_logo`, `has_fanart`, `has_banner`, `has_icon`, `has_box_back`, `has_box_spine`, `has_box_3d`, `has_title_screen`, `has_video`, `active_video_field`, `has_music`, `has_saves`, `has_documents`, `has_versions`, `has_achievements`, `has_highscores`, `has_missing_media`, `extract_archive`, `applications`, `versions`, `documents`, `save_paths`, `screenshots`, `alternate_names`, `available_screenshots`, `esrb`, `custom_fields`, `platform_category`, `tags`, `store_catalog`, `store_installed`, `owned`, `installable`, `gameyfin_id`.
- `playlists`, `filter_presets`, `ra_configured`, `settings`, `discovery`, `media_epoch`.

In safe mode the `library` hook is skipped; otherwise plugin `library` hooks can transform the games list before it is returned.

### `POST /api/game`

Create or update one game. Locate by `id` (numeric) or `game_id` (stable) for updates; omit both to create. Validation:

- `name` required and non-empty.
- `path` must point to an existing local file (creation and updates).
- `progress` must be one of `""`, `Playing`, `Paused`, `Beaten`, `Completed`, `Mastered`, `Abandoned`.
- `rating` is a float between 0 and 5.
- `disc_count` is a non-negative integer.
- `save_paths` capped at 50 entries, `screenshots` at 100, `alternate_names` at 20 (string input splits on `;`).
- `applications`, `versions`, `documents` are lists capped at 100 entries each; extras need a `path`, get a `name` (defaults to the path stem), and applications/versions may carry a `command`.
- `custom_fields` are normalized against the defined custom field defs.

Returns `{"ok": true}`.

### `POST /api/game/delete`

Remove a game by `id` or `game_id`. With `delete_media: true`, associated media files (cover, background, screenshots, and all media fields) are removed only when they are safe files inside the data directory; media deletions bump the media epoch. Returns `{"removed": "<name>"}`.

### `POST /api/games/delete-steam`

Remove every game with `source` equal to `Steam` (case-insensitive). Returns `{"removed": <count>}`.

### `POST /api/games/bulk`

Apply the same change to many games. Body: `{"ids": [...], "changes": {...}}`. Allowed change keys: `platform`, `genre`, `progress`, `rating`, `favorite`, `hidden`, `esrb`, `custom_fields`, `tags`, `tags_add`, `tags_remove`. Rules:

- `ids` accept numeric indexes or stable game ids (including legacy aliases).
- `tags` cannot be combined with `tags_add`/`tags_remove`; a tag cannot be added and removed in the same request.
- `favorite`/`hidden` must be booleans; `progress` must be a known value; `rating` between 0 and 5.
- Returns `{"updated": <count>}`.

### `POST /api/games/bulk-wizard`

Same as bulk edit but validates against the bulk wizard fields (`platform`, `genre`, `progress`, `rating`, `favorite`, `hidden`, `esrb`, `custom_fields`). Returns `{"updated": <count>, "fields": [...]}`.

### `POST /api/favorite`

Toggle a game's favorite flag by `id` or `game_id`. Returns `{"favorite": <bool>}`.

## Settings

### `GET /api/settings`

Returns the public settings projection: every validated setting key with defaults, plus `save_tools` (ludusavi/hoard presence), `safe_mode`, `version`, `appimage`, `gamescope_guest`, and `premium_features_free: true`. Secrets are never included; credential presence is exposed as booleans (`gameyfin_password_set`, `emumovies_configured`).

### `POST /api/settings`

Partial save: merge the posted keys into existing settings and validate. See [Configuration](/reference/configuration/) for the full validation table. Empty `gameyfin_password` keeps the stored password. Returns the new public settings.

## Profiles

### `GET /api/profiles`

Returns `{"profiles": state.profiles, "detected": discover_profiles()}` where `detected` lists launchable platform defaults from binaries on `PATH` (DOSBox, Wine, MAME, Dolphin, PCSX2, PPSSPP, RPCS3, DuckStation).

### `POST /api/profiles`

Replace all profiles: `{"profiles": {"Platform": "command {path}", ...}}` (blank entries dropped). Returns `{"saved": <count>}`.

### `GET /api/perf_profiles` / `POST /api/perf_profiles`

Per-launch-profile TDP limits for handheld tuning. Each entry: `{"enabled": bool, "tdp_w": float, "restore_tdp_w": float}`; blank names and all-zero entries are dropped; non-numeric TDP raises `400`. Returns `{"saved": <count>}`.

## Running sessions and history

### `GET /api/running`

`{"running": [...], "events": [...], "last_event": <sequence>}`. Poll with `?after=<sequence>` to receive only new session lifecycle events (id, kind `started|stopped|paused|resumed`, launch_id, game, time, optional exit_code/seconds). In-memory event buffer holds the last 100 events.

### `POST /api/session/control`

`{"launch_id": "...", "action": "pause"|"resume"|"stop"|"restart"|"kill"}`. `stop`/`restart` send SIGTERM to the process group, `kill` sends SIGKILL; paused games are resumed first except for `kill`. A game that is no longer running raises `400`. Returns `{"ok": true, "action": action}`.

### `GET /api/history`

`{"history": [...], "enabled": <track_session_history>}`. Sessions are newest first; `?limit=` clamps to 1..500 (default 100). Each session: `game`, `started`, `seconds`, `exit_code`.

## Launch

### `POST /api/launch`

Start a game. Body: `{"id": <index>}` or `{"game_id": "<stable>"}` (or both). Resolution prefers `game_id`; a missing game raises `400`. Before launch: archive extraction (if configured), performance profile apply, then `before_launch` plugins (unless safe mode) which may rewrite `args`/`cwd` or cancel the launch with an error. The process starts in a new session; the response returns the running-session entry (`launch_id`, `pid`, `game`, `game_path`, `started`, and storefront ids). Launch validation errors include missing path, nonexistent path, non-executable file without a command, and plugin failures.

### `POST /api/extra/launch`

Launch an application/version/document extra: `{"id"|"game_id", "kind": "applications"|"versions"|"documents", "index": <n>}`. Documents open with `xdg-open`; extras with a `command` substitute `{path}`; others execute directly. Missing file or `xdg-open` raises `400`.

## Related games

### `GET /api/related`

`?id=<index>` returns `{"ids": [indexes]}` scored from local metadata only (genre overlap, series, collection, developer, platform, publisher). Unknown game returns `404`.

### `GET /api/related/rich`

`?id=<index>` returns `{"items": [{"id", "score", "reasons": [...]}]}` with human-readable reasons. `404` when the game is missing.

## Playlists

### `POST /api/playlists`

Save a playlist: `{"name", "type": "filter"|"manual", "rules": {...}, "members"|"ids": [...], "parent", "notes"}`. Filter playlists keep rules and drop members; manual playlists store stable `game_id`s in order (deduplicated, at most 100,000). Updating an existing name replaces it. Returns `{"saved": "<name>"}`.

### `POST /api/playlists/delete`

`{"name": "..."}` removes the playlist. Returns `{"deleted": "<name>"}`.

## Filter presets

### `GET /api/filter-presets`

`{"presets": [...], "bigbox_quick": [...]}` (at most 8 quick presets).

### `POST /api/filter-presets`

`{"name", "rules", "bigbox_quick": bool}`. Rules keys: `platform`, `view`, `query`, `esrb`, `progress`, `favorite`, `installed`, `platform_category`, `genre`, `developer`, `publisher`, `hidden`. At least one rule required. Returns `{"saved": "<name>"}`.

### `POST /api/filter-presets/delete`

`{"name"}` removes it; unknown names raise `400`.

## Image groups

### `POST /api/image-group`

`{"group": "default"|"cover"|"background"|"screenshot"|"clear_logo"|"fanart"|"banner"|"icon"|"box_back"|"box_spine"|"box_3d"|"title_screen", "scope": "global"|"platform"|"playlist", "name": "<platform or playlist>"}`. Global sets `image_group`; scoped sets/clears `image_group_by_platform` or `image_group_by_playlist`. Returns updated settings.

## Errors

All handlers return `{"error": "..."}`; unknown games, bad payloads, and validation failures surface as `400`, missing game lookups as `404`, corrupt state as `503`. See [REST API overview](/reference/api/overview/) for the shared envelope.
