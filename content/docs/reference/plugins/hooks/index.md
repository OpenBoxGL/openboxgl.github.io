---
title: Plugin hooks reference
description: The library, before_launch, after_session, command, library_source, and events hook payloads.
---

A plugin's entry module exports one function per declared hook: `def library(payload)`, `def before_launch(payload)`, `def after_session(payload)`, `def command(payload)`, `def library_source(payload)`, or `def events(payload)`. The runner loads the module by path, calls the matching function with the decoded JSON payload, and writes the returned dict back to stdout as JSON. If the module does not export the hook function, the payload passes through unchanged. The complete set is `before_launch`, `after_session`, `library`, `command`, `library_source`, and `events`; the first three are documented below and the three Plugins 2.0 hooks (1.14.0) follow.

## `library`

Payload: `{"games": [<public game objects>]}`. The games are the full public projection (every field from `GET /api/library`, including computed flags like `path_exists`, `has_saves`, `game_id`, and the numeric `id`).

Contract:

- Return a dict with a `games` list, or the input unchanged.
- The final response uses the last plugin's output only when it is a dict with a `games` list of the same length as the input, and every element is a dict. Otherwise the pre-plugin games win.
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
- Commands are surfaced in the command palette under the `>` prefix, from `GET /api/v2/plugins/commands`; running one posts `{plugin_id, command}` to `POST /api/v2/plugins/command`.
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
- Disabling or removing the plugin drops its games on the next rebuild.

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

## Chaining and non-chained hooks

`library` and `before_launch` are **chained**: plugins execute in sorted directory order (alphabetical by plugin id) and each plugin's output feeds the next plugin's input. One failing or timing-out plugin is skipped with a warning and the chain continues with the last good payload.

`command`, `library_source`, and `events` are **not** chained. They run once with a purpose-built payload, and `emit_plugin_event` fans an event out independently to every enabled `events` plugin.

## Related

- [Plugin processes and errors](/reference/plugins/process-and-errors/) for timeouts, size caps, and environment
- [API library and settings](/reference/api/library-and-settings/) for the game field reference
