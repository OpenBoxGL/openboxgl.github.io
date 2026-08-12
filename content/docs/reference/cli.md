---
title: Command line and deep links
description: Launch OpenBox from a terminal, script backups, and drive the app with openbox:// deep links.
sidebar: false
---

# Command line and deep links

OpenBox is a local app, so the command line is a first-class surface. This page covers every flag the web UI entry point accepts and the `openbox://` URI scheme you can use to drive a running instance.

## Entry points

| Command | What it starts |
| --- | --- |
| `openbox` | The web UI (`python3 web_app.py` equivalent) |
| `openbox-native` | The lightweight Tk interface (`python3 openbox.py`) |
| `openbox --native` | The AppImage launches the Tk interface instead of the web UI |

The web UI is the full-featured interface. Flags below apply to it unless noted.

## Flags

| Flag | Behavior |
| --- | --- |
| `--no-browser` | Start the server without opening a browser. Useful for remote or scripted starts; the printed URL still works. |
| `--game-mode` | Force gamescope guest behavior (Steam Deck / Bazzite Game Mode). Opens Big Box fullscreen in a kiosk browser. |
| `--uri <openbox://...>` | Dispatch a deep link against a running instance (or start one) and exit. |
| `--launcher` | Open the rofi/wofi/dmenu keyboard launcher against the running instance and exit. |
| `--backup [--items a,b] [--keep N]` | Create a library backup from the command line. Default items are `library,settings`. Prints the archive path. |
| `--restore-backup <archive>` | Restore a backup archive. The archive must be a real `.zip` inside the data directory or `backups/`. Prints the restored item names. |
| `--native` | AppImage only: launch the Tk interface instead of the web UI. |

`--backup` and `--restore-backup` act on the library before the server starts, so they work even when no instance is running. They read `OPENBOX_DATA_DIR` from the environment, like every startup path.

## Deep links

`openbox://` URIs address a running OpenBox web UI. The parser rejects foreign hosts and fails cleanly when no server port is known, so a dead link never silently hits the wrong process.

| URI | Action |
| --- | --- |
| `openbox://start` | Open the running UI in the browser. A no-op if the server is already up. |
| `openbox://search/<query>` | Open the web UI with the search field prefilled for `<query>`. |
| `openbox://showgame/<id>` (alias `game`) | Open the detail pane for a game by stable id. |
| `openbox://launch/<id>` | Launch a game by stable id. |
| `openbox://bigbox` (alias `fullscreen`) | Switch the running UI to Big Box mode. |
| `openbox://settings[/<panel>]` | Open Settings. A panel segment is parsed but not currently routed to a specific settings tab. |

Usage:

```bash
openbox --uri "openbox://search/chrono"
openbox --uri "openbox://launch/1234"
```

`--uri` dispatches against the running server using the token and port files, or boots a server if none is running. The same actions exist as `?deeplink=` query parameters on the web UI URL (`?deeplink=bigbox`, `?deeplink=search&q=chrono`).

## Keyboard launcher

`openbox --launcher` (or `scripts/openbox-launcher.sh`) opens a rofi, wofi, or dmenu picker against the running instance. It queries `/api/launcher/menu`, which lists Big Box, Settings, Search, and up to 40 games. Selecting an entry dispatches it.

```bash
# picker auto-detected (rofi > wofi > dmenu)
openbox --launcher

# or run the helper directly with a specific picker
scripts/openbox-launcher.sh rofi
```

The launcher reads `server.port` and `server.token` from the data directory, so it only works while the web UI is running. Bind a hotkey to `openbox --launcher` for a launch-anything menu.

## Related pages

- [Interfaces and data](/interfaces-and-data/) — where `server.port` and `server.token` live
- [REST API](/reference/api/) — the API the launcher calls under the hood
- [Library backups](/reference/library-backups/) — the CLI backup flags in context
- [Big Box and handhelds](/guides/big-box-and-handhelds/) — `--game-mode` behavior
