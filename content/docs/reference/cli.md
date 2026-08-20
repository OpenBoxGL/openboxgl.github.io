---
title: Command line and deep links
description: Launch OpenBox from a terminal, script backups, and drive the app with openbox:// deep links.
sidebar: false
---

# Command line and deep links

OpenBox is a local app, so the command line is a first-class surface. This page covers every flag the app entry point accepts and the `openbox://` URI scheme you can use to drive a running instance.

## Entry points

| Command | What it starts |
| --- | --- |
| `openbox` | The native window (default) |
| `openbox-native` | The native window (the same host) |
| `openbox --web` | The loopback web UI in a browser (development) |

The native window renders the same UI as the web fallback; both serve `index.html` over the loopback server. Flags below apply to the app entry point unless noted.

## Flags

| Flag | Behavior |
| --- | --- |
| `--no-browser` | Start the server without opening a window. Useful for remote or scripted starts; the printed URL still works. |
| `--game-mode` | Force gamescope guest behavior (Steam Deck / Bazzite Game Mode). On the web entry point this opens Big Box fullscreen in a kiosk browser; the native window detects gamescope guests from the environment and needs no flag. |
| `--uri <openbox://...>` | Dispatch a deep link against a running instance (or start one) and exit. |
| `--launcher` | Open the rofi/wofi/dmenu keyboard launcher against the running instance and exit. |
| `--backup [--items a,b] [--keep N]` | Create a library backup from the command line. Default items are `library,settings`. Prints the archive path. |
| `--restore-backup <archive>` | Restore a backup archive. The archive must be a real `.zip` inside the data directory or `backups/`. Prints the restored item names. |
| `--web` | Start the loopback web UI in a browser instead of the native window (development). |
| `--app-window` | Web entry point only: open the UI in a chrome-less app window (browser `--app=` mode) instead of a normal tab. The native window is unaffected. |
| `--no-app-window` | Web entry point only: open the UI in a normal browser window; overrides the chrome-less app window default there. The native window is unaffected. |
| `--fullscreen-width <W>` / `--width <W>` | Web entry point: customize the viewport width in kiosk and app window modes. |
| `--fullscreen-height <H>` / `--height <H>` | Web entry point: customize the viewport height in kiosk and app window modes. |
| `--resolution <WxH>` / `--resolution=<WxH>` | Web entry point: customize the viewport resolution (e.g. `--resolution 1920x1080`). |

`--backup` and `--restore-backup` act on the library before the server starts, so they work even when no instance is running. They read `OPENBOX_DATA_DIR` from the environment, like every startup path.

## Deep links

`openbox://` URIs address a running OpenBox instance. The parser rejects foreign hosts and fails cleanly when no server port is known, so a dead link never silently hits the wrong process.

| URI | Action |
| --- | --- |
| `openbox://start` | Open the running UI in the browser. A no-op if the server is already up. |
| `openbox://search/<query>` | Open the UI with the search field prefilled for `<query>`. |
| `openbox://showgame/<id>` (alias `game`) | Open the detail pane for a game by numeric library id. |
| `openbox://launch/<id>` | Launch a game by numeric library id. |
| `openbox://bigbox` (alias `fullscreen`) | Switch the running UI to Big Box mode. |
| `openbox://settings[/<panel>]` | Open Settings. A panel segment is parsed but not currently routed to a specific settings tab. |

Usage:

```bash
openbox --uri "openbox://search/chrono"
openbox --uri "openbox://launch/1234"
```

`--uri` dispatches against the running server using the token and port files, or boots a server if none is running. The same actions exist as `?deeplink=` query parameters on the UI URL (`?deeplink=bigbox`, `?deeplink=search&q=chrono`).

## Keyboard launcher

`openbox --launcher` (or `scripts/openbox-launcher.sh`) opens a rofi, wofi, or dmenu picker against the running instance. It queries `/api/launcher/menu`, which lists Big Box, Settings, Search, and up to 40 games. Selecting an entry dispatches it.

```bash
# picker auto-detected (rofi > wofi > dmenu)
openbox --launcher

# or run the helper directly with a specific picker
scripts/openbox-launcher.sh rofi
```

The launcher reads `server.port` and `server.token` from the data directory, so it only works while OpenBox is running. Bind a hotkey to `openbox --launcher` for a launch-anything menu.

## Related pages

- [Interfaces and data](/interfaces-and-data/), where `server.port` and `server.token` live
- [REST API](/reference/api/), the API the launcher calls under the hood
- [Library backups](/reference/library-backups/), the CLI backup flags in context
- [Big Box and handhelds](/guides/big-box-and-handhelds/), `--game-mode` behavior
