---
title: Plugin hooks reference
description: The library, before_launch, and after_session hook payloads.
---

A plugin's entry module exports one function per declared hook: `def library(payload)`, `def before_launch(payload)`, or `def after_session(payload)`. The runner loads the module by path, calls the matching function with the decoded JSON payload, and writes the returned dict back to stdout as JSON. If the module does not export the hook function, the payload passes through unchanged.

## `library`

Payload: `{"games": [<public game objects>]}`. The games are the full public projection (every field from `GET /api/library`, including computed flags like `path_exists`, `has_saves`, `game_id`, and the numeric `id`).

Contract:

- Return a dict with a `games` list, or the input unchanged.
- The final response uses the last plugin's output only when it is a dict with a `games` list of the same length as the input, and every element is a dict. Otherwise the pre-plugin games win.
- The result is cached for 3 seconds (`PLUGIN_LIBRARY_TTL`) and invalidated on state changes.

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

- Return a dict with `args` (list of non-empty strings) and `cwd` (string pointing at an existing directory), or `{"cancel": true, "error": "..."}` to abort the launch with that message.
- Any other shape (missing keys, empty argv, non-string parts, nonexistent cwd) raises a launch validation error: `"A plugin returned an invalid launch response."`, `"A plugin returned an invalid launch command."`, or `"A plugin returned an invalid working directory."`
- A `cancel` result raises `"Launch canceled by a plugin."` (or the plugin's `error` text).
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

## Hook chaining

Plugins execute in sorted directory order (alphabetical by plugin id). Each plugin's output feeds the next plugin's input for `library` and `before_launch`. One failing or timing-out plugin is skipped with a warning and the chain continues with the last good payload.

## Related

- [Plugin processes and errors](/reference/plugins/process-and-errors/) for timeouts, size caps, and environment
- [API library and settings](/reference/api/library-and-settings/) for the game field reference
