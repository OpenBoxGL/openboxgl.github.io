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
  "description": "Sends local desktop notifications when games start and finish.",
  "author": "OpenBox Community",
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
| `author` | string | Optional author or organization name. |
| `entry` | string | Entry point Python file inside the package (defaults to `plugin.py`; must resolve inside the package, no symlinks or `..`). |
| `hooks` | array | List of subscribed lifecycle hooks (`before_launch`, `after_session`, `library`). |

## Hook Lifecycles & JSON Protocol

OpenBox runs each hook as a child process: `python3 plugin_runner.py <entry> <hook>` (wrapped in `bwrap` when available). The runner loads the entry file as a module and calls the function named after the hook: `def library(payload)`, `def before_launch(payload)`, or `def after_session(payload)`. The payload arrives as one decoded JSON dict argument, and the function's return value (a dict) is written to stdout as JSON. If the module does not define the hook function, the payload passes through unchanged.

### Supported Hooks

1. **`before_launch`**: Invoked at launch, after profile and archive resolution.
   - **Input Payload**: `{"game": {"id": 1, "name": "Chrono Trigger", "platform": "SNES", "path": "/roms/snes/ct.sfc", ...}, "args": ["retroarch", "-L", "core.so", "/roms/snes/ct.sfc"], "cwd": "/roms/snes"}`
   - **Output Result**: `{"args": [...], "cwd": "..."}` to rewrite the launch argv/working directory, or `{"cancel": true, "error": "why"}` to abort the launch with that message. Structurally invalid output (empty argv, nonexistent `cwd`, or a different executable in `args[0]`) raises a launch validation error.
2. **`after_session`**: Dispatched when a game process exits.
   - **Input Payload**: the session record itself, `{"game": "Chrono Trigger", "started": "...", "seconds": 1800, "exit_code": 0, ...}`
   - **Output Result**: any dict; the result is discarded. Exceptions are caught by the runner, so a failing plugin never breaks session bookkeeping.
3. **`library`**: Dispatched on library reads (cached 3 seconds, invalidated on state changes).
   - **Input Payload**: `{"games": [...]}` — the full public game projection.
   - **Output Result**: `{"games": [...]}` — a dict whose `games` list has the same length as the input, every element a dict. Anything else is ignored and the pre-plugin list wins.

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

When the sandbox cannot be created, enabled plugins are **skipped** with a warning. To run trusted local plugins without the sandbox, set `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` in the process environment (not `.env`). To disable all plugin execution for troubleshooting, launch OpenBox with `OPENBOX_SAFE_MODE=1`.

## Installing & Testing

1. Create directory `~/.local/share/openbox-game-launcher/plugins/my-plugin/`.
2. Add `plugin.json` and `plugin.py`.
3. Open OpenBox → **Tools** → **Plugins**.
4. Enable your plugin in the list.
5. Check the diagnostic log at `~/.local/share/openbox-game-launcher/openbox.log` for plugin warnings (skipped plugins, timeouts, oversized output, and the last 400 bytes of stderr on a nonzero exit). **Settings → Copy diagnostic log** copies a redacted summary to the clipboard.
