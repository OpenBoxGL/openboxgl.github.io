---
title: Plugin hooks reference
description: The base hook payloads, capability hooks, service requests, and response rules.
---

A plugin's entry module exports one function per declared hook: `def library(payload)`, `def before_launch(payload)`, `def after_session(payload)`, `def command(payload)`, `def library_source(payload)`, `def events(payload)`, and the capability hooks `def storefront(payload)`, `def metadata(payload)`, `def media(payload)`, `def stats(payload)`, `def emulator(payload)`, and `def discovery(payload)`. The runner loads the module by path, calls the matching function with the decoded JSON payload, and writes the returned dict back to stdout as JSON. If the module does not export the hook function, the payload passes through unchanged.

## Payloads common to every hook

- `plugin_data` is always present: the plugin's bounded data bag (1 MiB, four levels deep).
- `settings` is present only when the manifest declares a `settings` schema. Base hooks never see password-format values.
- `credentials` is present only for capability hooks: values from the capability credential store, never password-format settings.

## `library`

Payload: `{"games": [<public game objects>]}`. The games are the full public projection (every field from `GET /api/library`, including computed flags like `path_exists`, `has_saves`, `game_id`, and the numeric `id`).

Contract:

- Return a dict with a `games` list, or the input unchanged.
- The final response uses the last plugin's output only when it is a dict with a `games` list of the same length as the input, and every element is a dict. Otherwise, the pre-plugin games win.
- The result is cached for 30 seconds (`PLUGIN_LIBRARY_TTL`) and invalidated on state changes. While the cache is stale, the previous result is served immediately and a refresh runs in the background; only the first call — or a call after a state change — blocks until the fresh result is ready.

Example:

```python
def library(payload):
  for game in payload.get("games", []):
    game["notes"] = (game.get("notes") or "") + " [plugin]"
  return payload
```

## `before_launch`

Payload: `{"game": <game record>, "args": [<argv parts>], "cwd": "<working directory>"}`. `game` is the raw library record; `args` is the fully resolved launch command (tokens already substituted, archive already extracted); `cwd` is the resolved working directory.

Contract:

- Return a dict with `args` (list of non-empty strings) and `cwd` (string), or `{"cancel": true, "error": "..."}` to abort the launch with that message.
- The hook may adjust arguments, but it must not swap the binary (`args[0]` must stay the same executable) or move the working directory outside the game or data directories.
- A non-dict return falls back to the input payload (the runner echoes it); structurally invalid `args`/`cwd` (missing keys, empty argv, non-string parts, swapped binary, out-of-bounds `cwd`) is discarded with a logged warning and the host launches with the original command instead.
- `{"cancel": true}` raises `"Launch canceled by a plugin."` (or the plugin's `error` text) and aborts the launch.
- Plugins run in sorted order; each sees the previous plugin's `args`/`cwd` output.

Example:

```python
def before_launch(payload):
  payload["args"].append("--plugin-worked")
  return payload
```

## `after_session`

Payload: the session record as a dict with `game`, `started`, `seconds`, and `exit_code`.

Contract: return any dict; the result is discarded. Exceptions are caught by the runner, so a failing `after_session` plugin never breaks session bookkeeping. `after_session` is skipped entirely in safe mode.

Example:

```python
def after_session(session):
  print("played", session["game"], "for", session["seconds"], "seconds")
  return session
```

## `command`

Payload: `{"command": "<command id>", "library": [...], "settings"?: {...}}`. The `library` list is **bounded** to 500 entries and carries only `game_id`, `name`, `platform`, `progress`, `favorite`, and `playtime_seconds` — unlike the `library` hook, a command never sees the full game projection. `settings` is present only when the manifest declares a `settings` schema.

Contract:

- Return a JSON object. A `notification` key is rendered by the host: `{"notification": {"level": "info"|"success"|"warning"|"error", "message": "..."}}`.
- Commands are surfaced in the command palette under the `>` prefix, from `GET /api/v2/plugins/commands`; running one posts `{plugin_id, command}` to `POST /api/v2/plugins/command`. The palette re-reads the command list every time it opens.
- Palette commands are the one hook family whose errors **surface to the caller** instead of being silently discarded; the other chained hooks log and continue.

Example:

```python
def command(payload):
    games = payload["library"]
    return {"notification": {"level": "success", "message": f"{len(games)} games"}}
```

## `library_source`

Payload: `{"api_version": 1, "settings"?: {...}}`. Declaring this hook makes the plugin a **library importer**.

Contract:

- Must return `{"games": [...]}`. A bare list or any other shape is rejected with a logged warning and the plugin contributes nothing on that build.
- Returned entries are validated like folder imports, namespaced as `plugin:<plugin_id>:<their_id>`, and merged into the public library on every state build with `plugin_source` / `plugin_source_name` provenance so the UI can show a source badge.
- The list is capped at the same 500-entry library limit used by the `command` hook.
- Disabling or removing the plugin deletes its imported games and drops them from the public library.

Example:

```python
def library_source(payload):
    return {"games": [{"id": "demo", "name": "Plugin Title", "path": "/games/demo.iso"}]}
```

## `events`

One hook function receives every lifecycle event (ADR 0057). The stdin payload always carries an `event` field plus a small bounded payload:

| Event | Payload fields |
| --- | --- |
| `app_startup` | — |
| `app_shutdown` | — |
| `scan_finished` | `folder`, `added`, `scanned` |
| `playtime_milestone` | `game_id`, `name`, `hours`, `playtime_seconds` |
| `game_added` | `game_ids` (up to 500 ids) |
| `game_removed` | `game_ids` (up to 500 ids) |
| `game_updated` | `changes` (up to 100 `{game_id, changed: [...]}` entries) |

`game_updated` compares only a fixed field set (`name`, `platform`, `progress`, `favorite`, `hidden`, `rating`, `playtime_seconds`) and sends changed field **names** only, never full objects, so the payload stays well inside the 2 MiB cap.

Contract: all emission is best-effort and bounded by the standard per-plugin timeout; a failing `events` hook is logged and never breaks the operation that emitted it (imports, session bookkeeping, shutdown). Safe mode suppresses emission entirely.

Example:

```python
def events(payload):
    if payload["event"] == "playtime_milestone":
        return {"notification": {"level": "success", "message": f"{payload['hours']}h in {payload['name']}!"}}
    return {}
```

## Capability hooks

Capability hooks run only when the manifest declares both the hook and the matching capability. Storefront, metadata, media, and stats require a declared and granted `network` permission; without it the host refuses before spawning the plugin (`"Grant network access to this plugin first."`).

Each capability hook may return `data` (shallow-merged into the data bag), `notification`, and `service_requests` (see below). The host dispatches a capability hook directly — it is not chained with other plugins.

### `storefront`

Payload: `{"action": "catalog" | "import", "cursor": "<cursor>", "settings": {...}, "installed_only": bool, "uninstalled_only": bool}`.

Contract:

- Return `{"entries": [...]}` for `catalog` and `{"games": [...]}` for `import` (the host also accepts the other collection name). Each page may add `next_cursor`; pagination stops on an empty or repeated cursor, after 20 pages, or at 2,000 entries. A repeated cursor raises `"Plugin storefront pagination repeated a cursor."`
- Entry fields: `id` (required), `name` (required), `platform`, `path`, `launch`, `install_dir`, `install_uri`, `repair_uri`, `installed`. `install_uri`/`repair_uri` must be HTTPS without credentials. Malformed entries are skipped; a malformed page or hook failure raises.
- Catalog and import share the same manifest, grant, and pagination rules. Catalog results are returned as entries; import results are cleaned and merged like folder imports, carry `plugin:<plugin_id>` provenance, and appear through the shared storefront UI.

### `metadata`

Payload for a search: `{"action": "search", "game": <public game summary>, "limit": <n>}`.

Return `{"candidates": [...]}`. A candidate carries `id`, `name`, optional `platform`, `year`, `fields` (known library metadata fields), and `media` (kind → HTTPS URL or list of URLs). The host adds `source`/`provider` from the capability name. Malformed candidates and unsafe media URLs are dropped; a hook failure yields an empty list so other providers still run.

Apply: `{"action": "apply", "game": ..., "candidate_id": "..."}` returns `{"fields": {...}, "media": {...}}`. Only known library fields are written, the source is recorded as `plugin:<plugin_id>`, and media URLs are **queued** for download rather than written into a media field.

### `media`

Payload: `{"action": "search", "game": <public game summary>, "kind": "<media kind>", "limit": <n>}`.

Return `{"candidates": [{"url": "https://…", "kind": "...", "title"?, "width"?, "height"?}]}`. The requested kind must be declared in the capability's `media_kinds`; otherwise the host raises `"Plugin does not provide the <kind> media kind."` Unsafe or non-HTTPS URLs are skipped.

### `stats`

Payload: `{"action": "fetch", "games": [{"game_id", "name", "platform", "steam_app_id"?, "gog_id"?, "ra_game_id"?, "source"?, "playtime_seconds"?}]}` — at most 500 games.

Return `{"games": [{"game_id", "playtime_seconds"?, "last_played"?, "achievements"?}]}`:

- `playtime_seconds` merges monotonically (`max` with the current value).
- `last_played` must be an ISO-8601 timestamp and only moves forward.
- `achievements` is one source object or a list of up to 8. A source has `source` (or `id`), optional `name`, `earned`, `total` (0-10,000), and `items` (up to 500). An item has `id`, `title`, `earned`, and optional `description`, `points`, `icon_url` (HTTPS).
- Source names `retroachievements` and `steam` are reserved and rejected. Sources are stored as `plugin:<plugin_id>:<source>` and appear in the achievement tabs.

The cache is written to `<data>/plugin-stats/<plugin_id>.json` with mode `0600`; disabled and removed plugins' caches stop merging. `POST /api/v2/plugin-stats/refresh` refreshes up to 64 sources.

### `emulator`

Payload: `{"action": "apply", "emulator_id": "<id>", "platform": "<platform>", "values": {...}, "argv": [...]}`.

The host calls this only for an enabled plugin section that is marked managed, and only for `mame` or `retroarch` launches. `values` are the validated settings from the capability schema at the effective scope (global or per-platform).

Return `{"args": [...], "env": {...}}`. Arguments are inserted before the ROM path; environment entries are merged into the launch environment. Malformed args or env are rejected with a warning and the launch continues without that section. Settings are saved through `POST /api/v2/emulators/settings` with `{plugin_id, emulator_id, platform?, values, managed?, reset?}`; `GET /api/v2/emulators/settings` lists the effective global values and plugin sections. The declared `scopes` decide whether global and/or per-platform values are accepted.

### `discovery`

Payload: `{"limit": <n>}` (1-50, default 50).

Return `{"lists": [{"id": "...", "name": "...", "game_ids": ["..."]}]}`:

- At most 10 lists; a list id is slugged to `[a-z0-9._-]`, and `name` is required.
- At most 50 ids per list. Unknown ids and duplicates are dropped rather than inventing games.
- Keys become `plugin:<plugin_id>:<list_id>`. The merged `/api/discovery` response gains one top-level list per key (the same index rows built-in lists use) plus a `discovery_names` entry for its label, so the Discovery Center renders them as shelves with no second payload shape.
- `truncated` is true when the list count or an id list exceeded the cap. A failing optional plugin is skipped instead of breaking the Discovery Center.

## Service requests

A capability hook may return `service_requests` instead of (or alongside) its normal result:

```json
{"service_requests": [{"id": "lib", "action": "library.query", "params": {"limit": 50}}]}
```

The host executes at most 8 requests, keyed by unique short ids, against the read-only services in the [API overview](/reference/plugins/overview/#capability-services), then invokes the same hook **once** more with `service_results` added to the payload. Data and notifications from the first result are never merged. A second `service_requests` list is ignored with a logged warning. Only capability hooks may use services; from a base hook the result is discarded with `"service_requests are only available to capability hooks."`

## Notifications and localization

A hook notification is either `{"level": ..., "message": "..."}` or a message-table reference:

```json
{"level": "success", "key": "sync_done", "params": {"count": 12}}
```

`level` is one of `info`, `success`, `warning`, `error`; an unknown level becomes `info`. The host resolves the active locale, then English, then the raw key. A formatting failure falls back to the raw template. Resolved messages are capped at 2,000 characters. A returned `credentials` key is stripped and logged — hooks cannot write the credential store.

## Chaining and non-chained hooks

`library` and `before_launch` are **chained**: plugins execute in sorted directory order (alphabetical by plugin id) and each plugin's output feeds the next plugin's input. One failing or timing-out plugin is skipped with a warning and the chain continues with the last good payload.

`command`, `library_source`, `events`, and all capability hooks are **not** chained. They run once with a purpose-built payload, and `emit_plugin_event` fans an event out independently to every enabled `events` plugin.

## Related

- [Plugin processes and errors](/reference/plugins/process-and-errors/) for timeouts, size caps, and environment
- [Plugin manifest reference](/reference/plugins/manifest/) for capabilities and message tables
- [API library and settings](/reference/api/library-and-settings/) for the game field reference
