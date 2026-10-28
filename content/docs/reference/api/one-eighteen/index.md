---
title: API 1.18 additions
description: Request and response guidance for platform administration, media automation, plugin capability storage, and save manifests in OpenBox 1.18.0.
---

OpenBox 1.18.0 adds **49 method and path pairs across 43 routes**, all additive. No v1 route was removed, renamed, or re-mapped: the frozen contract still pins the same 61 `/api/v1/*` routes, and the route baseline's `retired` list is empty. The new routes either extend an existing base path (`/api/media/queue` now reports the durable queue in full) or add a local-workflow path under `/api` and `/api/v2`. None of them gained a `/api/v1/*` alias.

The additions cluster around seven jobs: administering platforms in one place, keeping media downloads and cache under control, making saves inspectable before a restore, giving achievements and plugins durable state, scanning storefronts and importing the long tail of formats, storing optional service credentials privately, and driving the emulator and native-host surfaces.

```bash
DATA_DIR="$HOME/.local/share/openbox-game-launcher"
TOKEN=$(cat "$DATA_DIR/server.token")
PORT=$(cat "$DATA_DIR/server.port")
BASE="http://127.0.0.1:$PORT"
```

Use `X-OpenBox-Token: TOKEN` in scripts. POST bodies are JSON objects and are subject to the shared 65,536-byte body limit. Routes that resolve a game accept a stable `game_id` first and fall back to a numeric `id` index when no stable id is present; a payload that cannot be resolved returns `400` with `"Game not found"`. On Windows the data directory is `%LOCALAPPDATA%\openbox-game-launcher`.

## Platform administration

Renaming or deleting a platform used to mean editing every game and every saved filter. These two routes do the whole migration in one state transaction.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/v2/platform/rename` | Rename a platform across games, profiles, settings, playlists, filters, emulator overrides, and optionally media. |
| `POST` | `/api/v2/platform/delete` | Move a platform's games to Trash and drop the platform's configuration. |

### `POST /api/v2/platform/rename`

```json
{ "old": "SNES", "new": "Super Nintendo", "migrate_media": false }
```

- Both names are trimmed, must be non-empty and at most 80 characters, and may not contain `/`, `\`, a NUL, CR, or LF. A bad name returns `400` naming the rule.
- `old` must be the platform of at least one game: `400 "Platform not found: SNES"`.
- `new` must not already be occupied. A game platform, a launch-profile key, a platform-keyed settings map, or an emulator platform override counts as occupied: `400 "Platform already exists: Super Nintendo"`. Renaming a platform to its own name is allowed and returns all-zero counts.
- `migrate_media` defaults to `false`. When `true`, the platform's media files are moved to the new platform directory and the games' media paths are rewritten. A media path that cannot be approved or lies outside `<data>/media/<old>` is skipped and counted in `media_skipped`. An actual move failure rolls back the moves already made and the state snapshots, and aborts the whole rename — there is no partial migration and no field update left behind.

Returns:

```json
{ "games": 42, "media_moved": 0, "media_skipped": 0 }
```

State effects, in one transaction: every matching game's `platform`; the `profiles` key; the platform-keyed settings maps (`platform_categories`, `theme_by_platform`, `image_group_by_platform`, `cover_model_by_platform`, `model_back_by_platform`, `model_case_by_platform`, `model_rotation_lock_by_platform`, `platform_documents`, `platform_videos`, `emulator_platform_settings`); per-platform emulator overrides under `emulator_settings`; filter playlists; and filter presets. Games that already use the new name are untouched.

### `POST /api/v2/platform/delete`

```json
{ "name": "SNES", "confirm": "SNES", "delete_media": false }
```

- `confirm` must equal `name` exactly, character for character (`400 "Type the platform name to confirm deletion."`).
- The platform must still have games: `400 "Platform not found: SNES"`.
- `delete_media` defaults to `false`. When `true`, `<data>/media/<platform>` is removed. A symlinked root or a path that escapes the media root is refused rather than followed.

Returns:

```json
{ "games": 42, "media_deleted": 0 }
```

State effects: each game is appended to the `trash` list with a `trashed_at` timestamp and removed from `games`, so it can be restored and keeps its playlist membership; the platform's entry is removed from `profiles`, from every platform-keyed settings map, and from emulator platform overrides. Other platforms are untouched.

## Media queue, cache, and presentation assets

The media queue is stored in `media-queue.json` and survives a restart. The read route now merges the persisted queue with the worker's in-process counters.

### Queue control

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/media/queue` | The durable queue plus worker state and per-state counts. |
| `POST` | `/api/media/queue/pause` | Ask the worker to stop taking new items. |
| `POST` | `/api/media/queue/resume` | Clear pause/cancel and start the worker if it is not alive. |
| `POST` | `/api/media/queue/cancel` | Cancel the current run without deleting queued items. |
| `POST` | `/api/media/queue/retry` | Requeue one failed item. |

`GET /api/media/queue` returns:

```json
{
  "items": [],
  "queue": [],
  "running": false,
  "paused": false,
  "completed": 0,
  "failed": 0,
  "cancelled": false,
  "counts": { "total": 0, "queued": 0, "failed": 0, "completed": 0, "cancelled": 0 }
}
```

`items` and `queue` carry the same normalized entries. `failed` is the higher of the persisted queue count and the worker's in-process count, and `completed` comes from the worker, so a restarted server still reports queued work and the current run's totals.

The three control routes take no body and return the worker state:

```json
{ "running": true, "paused": true, "cancelled": false, "completed": 12, "failed": 1 }
```

Pause is cooperative: the in-flight download finishes and queued items stay queued. Cancel does not clear the queue; `resume` clears both the pause and cancel flags, and starts a worker when none is alive. Resuming an already-running worker is harmless.

`POST /api/media/queue/retry` takes `{"id": "<queue item id>"}`. It clears that item's attempts and error, starts the worker if it is idle, and returns `{"ok": true, "id": "<id>"}`. A missing id returns `400 "A queue item id is required."`; an id that is not in the queue returns `400 "Queue item not found."`.

### `POST /api/media/cache/cleanup`

```json
{ "days": 30 }
```

Deletes generated media-cache files under `<data>/cache/media` whose modification time is older than `days`. `days` defaults to 30 and is clamped to 1–3650; a value that cannot be converted to an integer returns `400 "days must be a whole number."`. Only regular files are removed — user media is never touched, and symlinks are skipped so the walk cannot escape the cache root.

Returns `{"root": "<data>/cache/media", "deleted": 12, "bytes": 1048576, "skipped": 1}`.

### Startup video and platform videos

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/api/bigbox/startup-video` | Streams `settings.bigbox_startup_video`. |
| `GET` | `/api/platform/videos` | Returns the per-platform video map. |
| `GET` | `/api/platform/video?platform=<name>` | Streams one platform's video. |
| `POST` | `/api/platform/videos` | Sets or clears one platform video. |

`GET /api/bigbox/startup-video` streams the configured file when it is an existing `.mp4`, `.webm`, `.ogv`, `.ogg`, or `.mkv`. An empty setting, a missing file, or an unsupported suffix returns `404 {"error": "Startup video not found"}`. The configured path is not echoed in the response.

`GET /api/platform/videos` returns `{"videos": {"SNES": "/absolute/path.mp4"}}`. A malformed stored value is reported as an empty map rather than an error. `GET /api/platform/video` requires `?platform=`; a missing platform, path, or file returns `404 {"error": "Platform video not found"}`.

`POST /api/platform/videos` accepts either shape:

```json
{ "platform": "SNES", "path": "/absolute/video.mp4" }
{ "platform": "SNES", "clear": true }
```

`platform` is required and capped at 80 characters (`400 "Platform is required."`). The path must be absolute, exist, and end in a supported video suffix (`400 "Platform video must be an existing video file."`). A clear removes the entry. Both forms return `{"platform": "SNES", "path": "<path or empty string>"}` and write `settings.platform_videos`.

### Theme sounds and audio assets

A theme may ship background music and interaction sounds next to its CSS. `GET /api/theme-sounds?name=<theme stem>` reads the optional `<theme>.json` sidecar:

```json
{
  "music": "music/theme.ogg",
  "sounds": { "move": "sounds/move.wav", "select": "sounds/select.wav", "back": "sounds/back.wav" }
}
```

Only relative `.ogg`, `.mp3`, and `.wav` paths of at most 300 characters that stay inside the theme folder are accepted. A missing theme, missing sidecar, sidecar larger than 64 KiB, malformed JSON, or non-object JSON returns empty values with HTTP `200` — a broken theme must not stop the UI from loading.

`GET /api/theme-asset?name=<theme stem>&path=<relative audio path>` streams one accepted asset. The path is contained to the theme folder, must be an existing `.ogg`, `.mp3`, or `.wav` no larger than 20 MiB, and is served with `Cache-Control: private, max-age=3600`. Every refusal — missing theme, non-audio suffix, path escape, oversized file — returns the same `404 {"error": "Theme sound asset not found."}`.

## Save manifests, restore previews, and resume slots

### `GET /api/saves/manifest`

Inspects one save backup without restoring it. Pass `?id=<index>` or `?game_id=<stable>`, plus `backup=<archive name>`.

```json
{
  "archive": "20261019-101500-manual.zip",
  "game": "",
  "files": [{ "archive": "1/root/0/save.srm", "path": "/home/me/.config/retroarch/saves/save.srm", "size": 8192 }],
  "manifest": {}
}
```

The archive is resolved strictly inside the game's backup directory; a traversal attempt or a missing archive returns `400` (`"Save backup not found."`), and a missing `backup` parameter returns `400 "A backup name is required."`. When `save_management_enabled` is off, the route returns `{"enabled": false}` with HTTP `200` and inspects nothing.

### `POST /api/saves/restore/preview`

Describes what a restore would do, without writing:

```json
{ "game_id": "game-abc123", "backup": "20261019-101500-manual.zip", "selected": ["1/root/0/save.srm"] }
```

`selected` is optional. When present it must be a non-empty list of archive member names, at most 50,000 entries, and every name must exist in the archive (`400 "Select at least one save file to restore."` or `400 "Save selection does not match the backup."`).

Returns:

```json
{
  "archive": "20261019-101500-manual.zip",
  "game": "",
  "add": [],
  "overwrite": [],
  "remove": [],
  "missing": [],
  "conflict": false,
  "unchanged": 7,
  "counts": { "add": 0, "overwrite": 0, "remove": 0, "missing": 0, "unchanged": 7 },
  "truncated": { "add": false, "overwrite": false, "remove": false, "missing": false }
}
```

- `add` files are absent on disk; `overwrite` files exist with a different SHA-256 than the manifest records (each carries `backup_sha` and `disk_sha`); `missing` lists manifest entries the current archive no longer contains.
- `remove` is always empty: a save restore never deletes local files. The key exists for wire compatibility.
- `conflict` is `true` exactly when something would be overwritten.
- Each bucket is capped at 200 entries; `counts` carries the true totals and `truncated` names the buckets that were cut.
- The route writes nothing, including no safety backup.

### `POST /api/v2/resume/slot`

Stores the per-game RetroArch save-state slot used by Quick Resume:

```json
{ "game_id": "game-abc123", "slot": "quick" }
```

`slot` is 1–32 letters, digits, `-`, or `_`. An empty string removes the override and restores the default capture slot. An invalid slot returns `400` with code `RESUME_SLOT_INVALID`. The write stores or removes `resume_slot` on the game record and invalidates the state cache. Returns `{"ok": true, "game_id": "game-abc123", "slot": "quick"}`.

## Achievements and high scores

### `POST /api/v2/achievements/refresh`

Refreshes one non-RetroAchievements achievement source for a game:

```json
{ "game_id": "game-abc123", "source": "steam" }
```

`source` is `steam` or `plugin:<plugin-id>:<source>`. RetroAchievements is rejected (`400 "Use the RetroAchievements route to match a ROM."`) because ROM matching happens through `POST /api/ra/game`. Steam requires `steam_app_id` on the game and saved Steam credentials; a plugin source refreshes that plugin's cached statistics.

Returns `{"ok": true, "game_id": "...", "source": "steam"}` and invalidates the state cache. Other `400`s: missing `game_id` or `source`, a game without a Steam app id, missing Steam credentials, a malformed plugin source (`"Plugin achievement sources must be plugin:<id>:<source>."`), and an unknown source.

### `POST /api/v2/achievements/override`

Writes or clears a manual achievement override:

```json
{ "game_id": "game-abc123", "source": "steam", "earned": 12, "total": 20, "mastered": false }
{ "game_id": "game-abc123", "source": "steam", "clear": true }
```

`source` is `retroachievements`, `steam`, `gog`, or `plugin:<id>`. Totals must be whole numbers satisfying `0 <= earned <= total <= 10000` (`400 "Achievement totals must satisfy 0 <= earned <= total <= 10000."`). `mastered` defaults to `earned == total` when `total` is greater than zero. A successful write returns the stored record:

```json
{ "source": "steam", "earned": 12, "total": 20, "mastered": false, "manual": true }
```

`clear: true` removes that source's override — and the game's empty override map — and returns `{"ok": true, "cleared": true}`. Overrides live in `achievement_overrides` keyed by game id and source.

### `GET /api/v2/highscores/table`

Parses a MAME high-score file for a game: `?id=<index>` or `?game_id=<stable>`. The ROM name comes from `rom_name` or the game path stem, and the matching `<rom>.hi` file is resolved inside MAME's `hi` directory with containment enforced. A missing game returns `404`.

Returns `{"source", "path", "name", "size", "label", "rom_name", "parsed", "scores", "message"}`. Parsing uses the optional `hi2txt` tool with a 10-second timeout; without it, or when no file matches, `parsed` is `false`, `scores` is empty, and `message` explains why. No binary layout is guessed. This is the same table the running-game panel and the library details pane show.

## Bulk find and replace

### `POST /api/v2/bulk/find-replace`

```json
{
  "ids": ["game-abc123", "game-def456"],
  "field": "name",
  "find": "Legend",
  "replace": "Legendary",
  "dry_run": true
}
```

- Editable fields are `name`, `platform`, `genre`, `developer`, `publisher`, `region`, `source`, `notes`, `progress`, and `esrb`. Any other field returns `400 "That field cannot be edited in bulk."`.
- `ids` must select between 1 and 50,000 games (deduplicated) — `400 "Select between 1 and 50,000 games."`.
- `find` is required (`400 "Find text is required."`), and `find` and `replace` are each capped at 500 characters (`400 "Find and replace text must be 500 characters or fewer."`).
- Replacement is literal. A `$` or `\` in the replacement is inserted as typed; the route never compiles a regular expression.
- `dry_run` defaults to `true`; only an explicit `false` writes. A non-dry run happens in one state transaction.

Returns:

```json
{
  "field": "name",
  "matched": 2,
  "games": [
    { "game_id": "game-abc123", "name": "Legend of X", "before": "Legend of X", "after": "Legendary of X" }
  ],
  "truncated": 0,
  "applied": false
}
```

`matched` is the number of games whose field contained the text, `games` lists at most 100 of them, and `truncated` is the number omitted. Games with no match are not listed and are not counted.

## Plugin credentials, data, statistics, and repair

These routes back the Plugins 2.0 capability services. Credentials and data are separate stores: a plugin's data bag is plugin-owned state, never a secret.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/plugins/credentials` | Credential key names and presence flags. |
| `POST` | `/api/v2/plugins/credentials` | Merge or clear credential values. |
| `GET` | `/api/v2/plugins/data` | Read one plugin's data bag. |
| `POST` | `/api/v2/plugins/data` | Shallow-merge a bounded patch into the data bag. |
| `GET` | `/api/v2/plugin-stats` | Cached statistics from enabled plugins. |
| `POST` | `/api/v2/plugin-stats/refresh` | Refresh one or more plugin statistics sources. |
| `POST` | `/api/v2/plugins/repair` | Reinstall a plugin from its catalog entry or recorded package. |

### Credentials

`GET /api/v2/plugins/credentials?id=<plugin id>` returns key names only:

```json
{ "id": "my-plugin", "credentials": { "keys": ["api_key"], "set": { "api_key": true } } }
```

Values are stored in a `0o600` file and never travel back to the browser. A missing or malformed store yields empty keys.

`POST /api/v2/plugins/credentials` merges values:

```json
{ "id": "my-plugin", "values": { "api_key": "secret" }, "clear": ["old_key"] }
```

An empty string or `null` value deletes that key, as does an entry in `clear`. Names are non-empty strings of at most 128 characters, values are strings of at most 4,096 characters, and a plugin may store at most 128 credentials (`400 "Plugins may store at most 128 credentials."`). Returns the same key-name shape as the `GET`; values are never echoed.

### Plugin data

`GET /api/v2/plugins/data?id=<plugin id>` returns `{"id": "...", "data": {...}}`. A missing or invalid store yields `{}`.

`POST /api/v2/plugins/data` shallow-merges `{"id": "...", "values": {...}}` into the bag. Keys must be non-empty strings of at most 128 characters, and the merged bag must stay under 1 MiB and four levels deep; a violation raises `400` and writes nothing. Returns `{"id": "...", "data": {...}}` with the merged bag.

### Plugin statistics

`GET /api/v2/plugin-stats` returns `{"sources": [...]}` — one bounded summary row per cached source belonging to an enabled plugin, shaped as `{"source": "plugin:<id>:<name>", "name", "games", "updated_at"}`. A plugin that has never refreshed reports no rows rather than an error.

`POST /api/v2/plugin-stats/refresh` accepts either `{"plugin_ids": ["<id>", ...]}` (at most 64) or the single-key shorthand `{"plugin_id": "<id>"}`. Each hook is bounded to 15 seconds. Failures are collected per id in `{"results": [...]}` so one plugin cannot abort the batch; a successful refresh invalidates the state cache.

### `POST /api/v2/plugins/repair`

```json
{ "id": "my-plugin" }
```

Reinstalls one installed plugin from its catalog entry, or from the local package recorded at install time when the catalog entry is local-only or unavailable. The plugin's settings, trust grant, permissions, data, credentials, and stats are not touched. A missing id returns `400 "Plugin id is required."`; an id that is not an installed package fails manifest validation; a local package that is no longer available returns `400`. Returns `{"plugin": {...manifest...}, "repaired": true}`.

## Storefront scanning and plugin storefronts

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/storefronts` | Built-in and plugin storefronts. |
| `GET` | `/api/v2/storefront/status` | Last per-source scan status. |
| `POST` | `/api/v2/storefront/scan` | Queue an installed-state refresh without deleting games. |
| `POST` | `/api/v2/storefronts/plugin/catalog` | Page through one plugin storefront's catalog. |
| `POST` | `/api/v2/storefronts/plugin/import` | Import one plugin storefront. |

`GET /api/v2/storefronts` lists the built-in sources this host can import from: `steam` and `gameyfin` always; `heroic` on Linux and Windows; `lutris` on Linux; and `gog`, `ea`, and `ubisoft` on Windows. Each entry has `id`, `name`, `kind: "builtin"`, and `installed: true`. Enabled plugin storefronts follow with `kind: "plugin"`, their capability `id`, `name`, `platform`, redacted `settings_values`, `settings_schema`, and `permission_granted`. Returns `{"storefronts": [...]}`. See [API 1.19 changes](/reference/api/one-nineteen/).

`GET /api/v2/storefront/status` returns `{"sources": [...]}` from the persisted scan report; a missing or malformed report is an empty list. Each source keeps its own result, so one provider failure never erases an earlier successful scan.

`POST /api/v2/storefront/scan`:

```json
{ "sources": ["steam", "heroic"], "include_uninstalled": true }
```

- `sources` is optional. When omitted it defaults to the four built-in sources (`steam`, `heroic`, `lutris`, `gameyfin`) plus enabled plugin sources. When given it must be a list of at most 20 known ids; an unknown or blank id returns `400 "Unknown storefront source: …"`, and an empty list returns `400 "At least one storefront source is required."`.
- `include_uninstalled` defaults to `true`.
- Each source is scanned in a child process with a 30-second budget. A timeout or provider error records that source and leaves its games untouched; sources that finished stay applied. A source is skipped only when it is neither installed nor represented in the library — an installed source is scanned even when it has no library games.
- Returns `202 {"job_id": "...", "sources": [...]}`. Poll `GET /api/v2/jobs`.

`POST /api/v2/storefronts/plugin/catalog` takes `{"plugin_id": "<id>", "installed_only": false, "uninstalled_only": false}`. The plugin must be installed, enabled, declare the `storefront` capability, and declare the `network` permission with that permission granted — otherwise the request fails with `400 "Plugin does not declare network access."` or `400 "Grant network access to this plugin first."`. The hook is called with the stored settings. At most 2,000 validated entries are returned; malformed entries are skipped, and a hook failure or missing capability raises `400`. Returns `{"plugin_id": "...", "entries": [...]}`.

`POST /api/v2/storefronts/plugin/import` takes the same payload. Entries are validated and merged by plugin id and game id, and existing games are never deleted. Returns `{"added", "found", "imported", "plugin_id"}`: `found` is the number of entries the hook returned, `imported` the number that produced a valid game, and `added` the number that were new after merging.

## Integration tokens and Steam

### Per-provider tokens

Optional provider keys are stored outside the public settings projection and are returned only masked.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/integration-tokens` | Supported providers and a masked view of saved tokens. |
| `POST` | `/api/v2/integration-tokens` | Save one provider token. |
| `POST` | `/api/v2/integration-tokens/remove` | Remove one provider token. |

`GET` returns `{"providers": ["igdb", "screenscraper", "steamgriddb", "gameyfin", "retroachievements"], "tokens": {"igdb": "abcd…yz"}}`. A saved token longer than eight characters is shown as its first four, an ellipsis, and its last two; a shorter token is shown as bullets. Full values never leave the host.

`POST /api/v2/integration-tokens` takes `{"provider": "igdb", "token": "<secret>"}`. The provider must be one of the five ids (`400 "Unknown integration provider."`); the token must be non-blank, at most 4,096 characters, and free of control characters (`400 "Integration token is invalid."`). The value is written to `settings.integration_tokens`, the state cache is invalidated, and the mutation is marked local-only so it does not enter catalog sync events. Returns `{"provider": "igdb", "saved": true}`.

`POST /api/v2/integration-tokens/remove` takes `{"provider": "igdb"}`. Removing an absent provider is a successful no-op. Returns `{"provider": "igdb", "removed": true}`.

### Steam credentials

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/integrations/steam` | Redacted credential status. |
| `POST` | `/api/v2/integrations/steam` | Merge Steam credentials. |
| `POST` | `/api/v2/integrations/steam/test` | Validate the saved key and id. |
| `POST` | `/api/v2/integrations/steam/refresh` | Queue a background statistics refresh. |

`GET /api/v2/integrations/steam` returns `{"configured": bool, "steam_id": "...", "key_set": bool}`. The API key itself is never returned.

`POST /api/v2/integrations/steam` merges `{"api_key": "...", "steam_id": "..."}` into `<data>/steam.json` (mode `0o600`). An omitted field keeps its stored value; an empty string clears it. Returns the same redacted status as `GET`.

`POST /api/v2/integrations/steam/test` fetches the owned-games list. Missing credentials return `400 "Save a Steam API key and Steam ID first."`; a key the provider rejects surfaces the provider's error. Returns `{"ok": true, "games": <count>}`.

`POST /api/v2/integrations/steam/refresh` queues a `steam.stats` durable job that merges owned-game statistics into matching library games. It applies the same credential check and returns `202 {"state": "queued", "job_id": "..."}`; poll `GET /api/v2/jobs`.

## PICO-8, MSU-1, and WHDLoad imports

Each route takes `{"folder": "/absolute/path"}` and reads the folder without modifying it.

| Method | Route | Imports |
| --- | --- | --- |
| `POST` | `/api/v2/import/pico8` | `.p8` carts and exported `.p8.png` cartridges. |
| `POST` | `/api/v2/import/msu1` | SNES ROMs that have a sibling `*.msu` audio-pack folder. |
| `POST` | `/api/v2/import/whdload` | Amiga WHDLoad installs (`.lha`, `.slave`, `.hdf`), skipping the WHDLoad system drawer. |

A missing or blank folder returns `400 "Folder path is required."`; a path that is not a directory returns `400 "Folder does not exist: <path>"`. PICO-8 games are imported as platform `PICO-8`, MSU-1 games as `SNES`, and WHDLoad installs as `Amiga`. All three return `{"added", "found", "errors": [...]}`: `found` is the number of discovered games, `added` the number that were new after merging by source label and path, and `errors` (at most 100) names an unreadable path, a folder with no matching ROM, or a malformed install. An error is reported and skipped; it never aborts the whole import. Re-running an import merges into the existing game rather than creating a duplicate.

## Emulator settings

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/emulators/settings` | The managed-emulator settings model. |
| `POST` | `/api/v2/emulators/settings` | Save global, per-platform, or plugin-declared emulator settings. |

`GET` returns:

```json
{
  "emulators": [
    {
      "emulator_id": "mame",
      "app_id": "org.mamedev.MAME",
      "label": "MAME",
      "managed": true,
      "schema": {},
      "global": {},
      "platforms": { "Arcade": {} },
      "skip_update_check": false,
      "version": {
        "installed": true,
        "native": true,
        "flatpak": false,
        "version": "0.265",
        "latest_version": "",
        "update_available": false,
        "error": ""
      }
    }
  ],
  "plugins": []
}
```

`global` holds the **effective** values (stored override merged over schema defaults), while each `platforms` entry is the raw partial stored override for that platform. `version` is the probe result: installation source flags, the installed and latest Flathub version strings, an `update_available` flag, and any probe error. Probes run only `--version`/`flatpak info` with a timeout and are cached for 60 seconds. Two emulators are built in — MAME and RetroArch; `plugins` carries emulator sections declared by installed plugins.

`POST` takes one of:

```json
{ "emulator_id": "mame", "platform": "Arcade", "values": { "fullscreen": true } }
{ "emulator_id": "mame", "values": { "fullscreen": true } }
{ "emulator_id": "mame", "platform": "Arcade", "reset": true }
{ "emulator_id": "mame", "managed": false, "skip_update_check": true }
{ "plugin_id": "my-plugin", "emulator_id": "myemu", "values": {} }
```

- Omitting `platform` writes the global values; including it writes that platform's override.
- `reset: true` removes the named platform override, or every platform override when `platform` is omitted.
- `managed` controls whether OpenBox writes the emulator's config.
- `skip_update_check` adds or removes the emulator's app id in `emulator_update_checks`.
- Values are normalized against the emulator's schema before the state transaction, so an invalid option raises `400` and writes nothing. A platform name over 80 characters returns `400`.
- A `plugin_id` payload saves a plugin-declared emulator instead; the plugin must declare that emulator and scope.

Returns `{"emulator_id", "managed", "global", "platforms"}` with the updated effective `global` values and the updated stored platform overrides.

## Netplay lobby

### `GET /api/v2/netplay/lobby`

Read-only browser over the public RetroArch netplay lobby. Returns:

```json
{ "available": true, "rows": [{ "host": "1.2.3.4", "port": 55435, "nick": "player", "game": "Game", "core": "snes9x", "players": 2, "private": false }] }
```

Only connectable rooms with a valid host and port are included, capped at 500 rows. A timeout, provider error, or empty list returns `{"available": false, "error": "Netplay lobby is unavailable."}` with HTTP `200`; a successful non-empty result is cached for 60 seconds. No credentials are sent and the route never starts a connection. The same data feeds Tools > Online play.

## Native battery

### `GET /api/native/battery`

Reports battery state for the native window:

```json
{ "present": true, "percent": 87, "charging": false }
```

On Linux the first `BAT*` device under `/sys/class/power_supply` is read; on macOS `pmset -g batt` is read; on Windows `GetSystemPowerStatus` is read. `percent` is clamped to 0–100, and `charging` is true for `Charging` or `Full` on Linux. The device path is never exposed. A host with no battery, such as a desktop, returns `{"present": false, "percent": 0, "charging": false}`. The macOS and Windows readings are cached for 30 seconds. The route requires the token like every other `/api/native/*` route.

## Game store actions

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/v2/steam/action` | Open a Steam install or validate action by app id. |
| `POST` | `/api/game/store-action` | The same action resolved from a library game. |

`POST /api/v2/steam/action` takes `{"app_id": "440", "action": "install"}`. `action` is `install` or `repair`; `repair` opens Steam's validate dialog instead of the install dialog. The app id must be a positive integer below 100,000,000 (`400 "A numeric Steam app id is required."`); an unknown action returns `400 "Steam action must be install or repair."`. The handler opens `steam://install/<id>` or `steam://validate/<id>`; a missing or unopenable Steam handler returns `400` naming the OS error. Returns `{"app_id": "440", "action": "install"}`.

`POST /api/game/store-action` takes `{"game_id": "game-abc123", "action": "install"}`. The game must resolve and carry `steam_app_id` (`400 "This game has no Steam app id."`). It runs the same validation and returns `{"game_id", "app_id", "action"}`.

## Metadata candidate apply

### `POST /api/v2/metadata/candidates/apply`

Applies one reviewed metadata candidate to one game:

```json
{ "game_id": "game-abc123", "candidate": { "id": "12345", "name": "Game", "platform": "SNES" }, "overwrite": false }
```

`candidate` must be an object (`400 "candidate must be an object"`), and a non-object body returns `400`. A candidate carrying `plugin_id` is applied through that plugin's metadata provider; otherwise the built-in candidate shape is used. Only metadata fields are written: name, platform, genre, year, developer, publisher, series, description, ESRB, max players, rating, region, sort title, and the winning `metadata_provider`. With `overwrite: false` an existing non-empty field is kept; with `overwrite: true` the candidate wins. Empty candidate values never clear a field. A game that cannot be resolved returns `400`.

Returns `{"ok": true, "game_id": "game-abc123"}`. The write is a single state transaction, so a provider failure leaves the game unchanged.

## Compatibility notes

- Every addition is backward compatible. Existing paths keep their old contract; where a response gained keys (`GET /api/media/queue` gained `items`, `item` states, and `counts`), the previous keys remain.
- The new routes are local workflow routes, not part of the frozen v1 remote contract. A client that only speaks `/api/v1/*` sees no change.
- Credential-shaped values — integration tokens, Steam keys, plugin credentials — are never returned, and plugin data is deliberately separate from plugin credentials.
- Destructive or semi-destructive routes validate their inputs before mutating: platform names, archive names, selected save files, and emulator option values are all checked first, and failed validation leaves state untouched.

## Related pages

- [API overview and route groups](/reference/api/overview/)
- [API 1.17 additions](/reference/api/one-seventeen/)
- [Save archives](/reference/save-archives/) and [Background jobs](/reference/background-jobs/)
- [Plugins](/reference/plugins/) for the capability, data, credential, and statistics contracts
- [Storefront manager](/guides/storefront-manager/) and [Media providers](/guides/media-providers/)
- [Configuration](/reference/configuration/) for `save_management_enabled`, media limits, and credential storage
