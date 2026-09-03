---
title: Creating an OpenBox Plugin
description: Build, sandbox, and distribute plugins using standard JSON lifecycle hooks and Bubblewrap isolation.
---

OpenBox plugins extend launcher functionality through decoupled lifecycle hooks. Each plugin runs as an isolated subprocess in a Bubblewrap sandbox (`bwrap`) communicating via JSON over standard input and standard output.

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
| `id` | string | Unique plugin identifier (alphanumeric, hyphens, underscores). |
| `name` | string | Display name shown in Tools → Plugins. |
| `version` | string | Semantic version string (e.g. `1.0.0`). |
| `description` | string | Optional short summary of plugin capabilities. |
| `author` | string | Optional author or organization name. |
| `entry` | string | Entry point script path relative to the plugin directory (defaults to `plugin.py`). |
| `hooks` | array | List of subscribed lifecycle hooks (`before_launch`, `after_session`, `library`). |

## Hook Lifecycles & JSON Protocol

Plugin scripts are invoked as subprocesses: `python3 plugin.py <hook_name>`. The payload is provided as JSON on `sys.stdin`, and the plugin writes its JSON response to `sys.stdout`.

### Supported Hooks

1. **`before_launch`**: Invoked immediately before a game starts.
   - **Input Payload**: `{"game": {"id": 1, "name": "Chrono Trigger", "platform": "SNES", "path": "/roms/snes/ct.sfc", ...}, "command": ["retroarch", "..."]}`
   - **Output Result**: `{"env": {"KEY": "VALUE"}, "extra_args": []}` (optional environment variables or launch arguments to append).
2. **`after_session`**: Dispatched when a game process exits.
   - **Input Payload**: `{"game": {...}, "session": {"started_at": "...", "ended_at": "...", "duration_seconds": 1800, "exit_code": 0}}`
   - **Output Result**: `{}` (success acknowledgment).
3. **`library`**: Dispatched during library scans and enrichment.
   - **Input Payload**: `{"games": [...]}`
   - **Output Result**: `{"tags": {...}, "custom_fields": {...}}` (optional metadata tags or attributes).

## Minimal Python Plugin (`plugin.py`)

```python
#!/usr/bin/env python3
import sys
import json

def main():
    hook = sys.argv[1] if len(sys.argv) > 1 else ""
    try:
        payload = json.load(sys.stdin)
    except Exception:
        payload = {}

    result = {}

    if hook == "before_launch":
        game = payload.get("game", {})
        # Log to stderr (captured in plugin logs)
        print(f"[Notifier] Starting game: {game.get('name')}", file=sys.stderr)
        # Optionally return custom env vars
        result = {"env": {"GAME_LAUNCHED_BY": "OpenBox"}}

    elif hook == "after_session":
        game = payload.get("game", {})
        session = payload.get("session", {})
        duration = session.get("duration_seconds", 0)
        print(f"[Notifier] Finished {game.get('name')} (played {duration}s)", file=sys.stderr)
        result = {"status": "ok"}

    elif hook == "library":
        result = {"status": "ok"}

    # Write response to stdout
    json.dump(result, sys.stdout)

if __name__ == "__main__":
    main()
```

## Bubblewrap Sandboxing

OpenBox isolates plugin execution using **Bubblewrap** (`bwrap`) when available on Linux systems:
- Read-only root filesystem bind (`--ro-bind / /`)
- Isolated process namespace (`--unshare-all`)
- Private empty `tmpfs` mounts for `/home`, `/tmp`, `/run`, `/mnt`, `/media`
- Network isolation (disabled by default)

To bypass sandboxing on development setups, set `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` in your environment. To disable all plugin execution for troubleshooting, launch OpenBox with `OPENBOX_SAFE_MODE=1`.

## Installing & Testing

1. Create directory `~/.local/share/openbox-game-launcher/plugins/my-plugin/`.
2. Add `plugin.json` and `plugin.py`. Make `plugin.py` executable (`chmod +x plugin.py`).
3. Open OpenBox → **Tools** → **Plugins**.
4. Enable your plugin in the list.
5. Review plugin execution logs in `~/.local/share/openbox-game-launcher/logs/plugins.log`.
