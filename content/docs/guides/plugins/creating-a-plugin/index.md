---
title: Creating an OpenBox Plugin
description: Build, sandbox, and distribute plugins using standard JSON lifecycle hooks and Bubblewrap isolation.
---

OpenBox plugins extend launcher functionality through decoupled lifecycle hooks. Each hook invocation runs as an isolated subprocess in a Bubblewrap sandbox (`bwrap`) when available, communicating via one JSON object on standard input and one on standard output.

## Plugin Manifest (`plugin.json`)

Every plugin requires a `plugin.json` manifest placed in its directory under `~/.local/share/openbox-game-launcher/plugins/<plugin-id>/`:

```json
{
  "id": "play-notifier",
  "name": "Play Session Notifier",
  "version": "1.0.0",
  "api_version": 1,
  "description": "Sends local desktop notifications when games start and finish.",
  "entry": "plugin.py",
  "hooks": [
    "before_launch",
    "after_session",
    "library"
  ]
}
```

### Manifest Fields

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Unique plugin identifier matching `^[a-z0-9][a-z0-9._-]{1,63}$` (lowercase start, 2-64 characters). This is the install directory name. |
| `name` | string | Display name shown in the Plugins dialog. |
| `version` | string | Non-empty version string (e.g. `1.0.0`). |
| `description` | string | Optional short summary of plugin capabilities. |
| `author` | string | Ignored by the runtime — it is not read by OpenBoxGL; keep it only for your own tooling. |
| `entry` | string | Entry point Python file inside the package (defaults to `plugin.py`; must resolve inside the package, no symlinks or `..`). |
| `hooks` | array | List of subscribed lifecycle hooks (`before_launch`, `after_session`, `library`, `command`, `library_source`, `events`). |
| `api_version` | integer | Plugin API version targeted (defaults to `1`); newer versions are refused. |
| `commands` | array | Up to 32 `{id, label, description?}` entries, exposed in the command palette under the `>` prefix. |
| `permissions` | array | Declared permissions; in 1.14.0 only `network`, granted by the user in the Plugins manager at install/enable time. |
| `settings` | object | JSON Schema subset for per-plugin settings; the Plugins manager renders a form and injects stored values into hook payloads. |

## Hook Lifecycles & JSON Protocol

OpenBox runs each hook as a child process: `python3 plugin_runner.py <entry> <hook>` (wrapped in `bwrap` when available). The runner loads the entry file as a module and calls the function named after the hook: `def library(payload)`, `def before_launch(payload)`, `def after_session(payload)`, `def command(payload)`, `def library_source(payload)`, or `def events(payload)`. The payload arrives as one decoded JSON dict argument, and the function's return value (a dict) is written to stdout as JSON. If the module does not define the hook function, the payload passes through unchanged.

### Supported Hooks

1. **`before_launch`**: Invoked at launch, after profile and archive resolution.
   - **Input Payload**: `{"game": {"id": 1, "name": "Chrono Trigger", "platform": "SNES", "path": "/roms/snes/ct.sfc", ...}, "args": ["retroarch", "-L", "core.so", "/roms/snes/ct.sfc"], "cwd": "/roms/snes"}`
   - **Output Result**: `{"args": [...], "cwd": "..."}` to rewrite the launch argv/working directory, or `{"cancel": true, "error": "why"}` to abort the launch with that message. Structurally invalid output (empty argv, nonexistent `cwd`, or a different executable in `args[0]`) raises a launch validation error.
2. **`after_session`**: Dispatched when a game process exits.
   - **Input Payload**: the session record itself, `{"game": "Chrono Trigger", "started": "...", "seconds": 1800, "exit_code": 0, ...}`
   - **Output Result**: any dict; the result is discarded. Exceptions are caught by the runner, so a failing plugin never breaks session bookkeeping.
3. **`library`**: Dispatched on library reads (cached 30 seconds, invalidated on state changes).
   - **Input Payload**: `{"games": [...]}` — the full public game projection.
   - **Output Result**: `{"games": [...]}` — a dict whose `games` list has the same length as the input, every element a dict. Anything else is ignored and the pre-plugin list wins.
4. **`command`**: Invoked from the command palette (`>` prefix) or `POST /api/v2/plugins/command` for a manifest-declared command.
   - **Input Payload**: `{"command": "<command id>", "library": [...]}` — the library summary is bounded to 500 entries with only `game_id`, `name`, `platform`, `progress`, `favorite`, and `playtime_seconds`.
   - **Output Result**: any dict; may include `{"notification": {"level": "info" | "success" | "warning" | "error", "message": "..."}}` to show a UI notification. Hook errors are surfaced to the caller.
5. **`library_source`**: Runs on every library state build, making the plugin a library importer.
   - **Input Payload**: `{"api_version": 1}` (plus `settings` when the manifest declares a settings schema).
   - **Output Result**: `{"games": [...]}` — a bare list or any other shape is rejected with a warning. Entries are namespaced as `plugin:<plugin_id>:<their_id>` and shown with a source badge; disabling or removing the plugin drops its games on the next rebuild.
6. **`events`**: Fan-out for lifecycle events — `app_startup`, `app_shutdown`, `scan_finished`, `playtime_milestone`, `game_added`, `game_removed`, `game_updated`.
   - **Input Payload**: `{"event": "<name>", ...}` with a small bounded payload (e.g. `game_added` carries `game_ids`, up to 500; `game_updated` carries `changes`, up to 100).
   - **Output Result**: any dict; failures never break the host operation.

## Minimal Python Plugin (`plugin.py`)

```python
import sys


def before_launch(payload):
    # Log to stderr (last 400 bytes are captured in the diagnostic log on failure)
    game = payload.get("game", {})
    print(f"[Notifier] Starting game: {game.get('name')}", file=sys.stderr)
    # Optionally rewrite the launch argv (args[0] must stay the same executable).
    # Use an option supported by the launched game or emulator, not an OpenBox
    # window flag.
    payload["args"].append("--game-specific-option")
    return payload


def after_session(session):
    print(f"[Notifier] Finished {session.get('game')} (played {session.get('seconds')}s)", file=sys.stderr)
    return session


def library(payload):
    for game in payload.get("games", []):
        game["notes"] = (game.get("notes") or "") + " [plugin]"
    return payload
```

The entry module is loaded by the runner, not executed directly, so it does not need a shebang or executable permissions.

## Bubblewrap Sandboxing

OpenBox isolates plugin execution using **Bubblewrap** (`bwrap`) when available on Linux systems:
- Read-only root filesystem bind (`--ro-bind / /`)
- Isolated process namespace (`--unshare-all`)
- Private empty `tmpfs` mounts for `/home`, `/tmp`, `/run`, `/mnt`, `/media`
- Network isolation (disabled by default)

When the sandbox cannot be created, enabled plugins are **skipped** with a warning. To run trusted local plugins without the sandbox, either trust the plugin in the Plugins manager (**Trust and run** — the grant is bound to the package's SHA-256, so updates re-prompt) or set `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` in the process environment (not `.env`). To disable all plugin execution for troubleshooting, launch OpenBox with `OPENBOX_SAFE_MODE=1`.

Windows has no `bwrap`, so plugin hooks cannot be isolated there: enabled plugins are **skipped** with the same warning until you trust them one by one in the Plugins manager or set `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1`. The runner then executes as an ordinary subprocess with your own user's access to the filesystem and network, so trust it only for plugin code you have read.

## Installing & Testing

1. Create directory `~/.local/share/openbox-game-launcher/plugins/my-plugin/` on Linux, or `%LOCALAPPDATA%\openbox-game-launcher\plugins\my-plugin\` on Windows.
2. Add `plugin.json` and `plugin.py`.
3. Open OpenBox → **Tools** → **Plugins**.
4. Enable your plugin in the list.
5. Check the diagnostic log (`openbox.log` beside that data directory) for plugin warnings (skipped plugins, timeouts, oversized output, and the last 400 bytes of stderr on a nonzero exit). **Settings → Copy diagnostic log** copies a redacted summary to the clipboard.
