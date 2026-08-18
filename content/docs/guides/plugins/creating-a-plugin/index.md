---
title: Creating an OpenBox Plugin
description: Build, sandbox, and distribute plugins with lifecycle hooks using Bubblewrap.
---

OpenBox plugins extend launcher functionality through decoupled lifecycle hooks. Each plugin runs in an isolated Bubblewrap sandbox with explicit filesystem and network grants.

## Plugin Manifest (`plugin.yaml`)

Every plugin requires a `plugin.yaml` manifest placed in `~/.local/share/openbox-game-launcher/plugins/<plugin-name>/`:

```yaml
id: discord-rich-presence
name: Discord Rich Presence
version: 1.0.0
author: OpenBox Community
description: Updates your Discord status with game title, box art, and elapsed play time.
entrypoint: main.py
runtime: python3

hooks:
  - on_launch
  - on_session_tick
  - on_exit

permissions:
  network: true
  filesystem_read:
    - "{GamePath}"
    - "{DataDir}/media"
```

## Hook Lifecycles

OpenBox executes plugins asynchronously without blocking the launcher UI:

- **`on_launch`**: Invoked immediately before a game executable or emulator starts. Receives `{ "game_id": "...", "name": "...", "path": "...", "platform": "..." }`.
- **`on_session_tick`**: Dispatched every 60 seconds while a game process is running with updated duration.
- **`on_exit`**: Dispatched when the game process terminates, carrying exit code and session length.
- **`library_mutator`**: Dispatched during library syncs to attach custom metadata, tags, or badges.

## Minimal Python Plugin (`main.py`)

```python
#!/usr/bin/env python3
import sys
import json

def handle_hook(payload):
    hook_type = payload.get("hook")
    game = payload.get("game", {})
    
    if hook_type == "on_launch":
        print(f"Now playing: {game.get('name')} on {game.get('platform')}", file=sys.stderr)
    elif hook_type == "on_exit":
        print(f"Finished playing: {game.get('name')}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        data = json.loads(sys.argv[1])
        handle_hook(data)
```

## Testing Your Plugin

1. Place your folder in `~/.local/share/openbox-game-launcher/plugins/my-plugin/`.
2. Open OpenBox -> **Settings** -> **Plugins**.
3. Toggle your plugin to **Enabled**.
4. Test execution logs in `~/.local/share/openbox-game-launcher/logs/plugins.log`.
