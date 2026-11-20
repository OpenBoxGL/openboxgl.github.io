---
title: Command line and deep links
description: Launch OpenBox from a terminal, script backups, and drive the app with openbox:// deep links.
sidebar: false
---

# Command line and deep links

OpenBox is a local app, so the command line is a first-class surface. The shipped launchers (`openbox`, `openbox-native`, `openbox.cmd`, `openbox.ps1`) start the Rust `openbox-server` and the native window. This page covers the flags the current release accepts, the Python-fallback-only flags, and the `openbox://` URI scheme.

## Entry points

| Command | What it starts |
| --- | --- |
| `openbox` | The native window (default) |
| `openbox-native` | The native window (the same host) |
| `openbox --web` | The Rust server without a native window; prints a tokenless loopback URL |
| `openbox-server` | The Rust server directly (headless) |

The native window renders the same UI as the web fallback; both serve `index.html` over the loopback server. The launchers resolve `openbox-server` first (`OPENBOX_SERVER_BIN`, bundle/share, `target/release`, then `PATH`) and fall back to `python3 web_app.py` only when `OPENBOX_BACKEND=python` is set or no Rust binary exists.

On macOS, `openbox` is the launcher inside `OpenBox.app`, which `install-macos.sh` links into `~/.local/bin`. The native window is WKWebView, and `openbox --web` serves the same UI without a window.

## Flags

Flags marked **server** are implemented by `openbox-server`; pass them through `openbox --web` or invoke `openbox-server` directly. Flags marked **launcher** are handled by `openbox.sh` / the native host. Flags marked **Python fallback** work only when `OPENBOX_BACKEND=python` runs `web_app.py`.

| Flag | Behavior |
| --- | --- |
| `-h`, `--help` | **server** — print usage and exit. `openbox --help` is forwarded to the native host and does not print OpenBox usage; use `openbox --web --help` or `openbox-server --help`. |
| `--web` | **launcher** — start the server without a native window. The server prints `http://127.0.0.1:<port>/` (no token); open it with `?token=<server.token>` or send `X-OpenBox-Token`. |
| `--no-browser` | **server** — suppress browser auto-launch. The server is always headless; the native host passes this flag. The native window ignores it. |
| `--game-mode` | **server** — Steam Game Mode / gamescope guest mode. Linux only: on Windows and macOS the server exits with status 2 and prints `Game Mode needs gamescope and is only available on Linux.` The native window ignores the flag and detects gamescope from the environment. |
| `--play <id>` | **server** — launch a game by stable `game_id` or numeric library id. Without an id, prints usage and exits with status 2. |
| `--uri <openbox://...>` | **server** — dispatch a deep link against a running instance (or start one) and exit. A bare `openbox://...` positional argument is also accepted. |
| `--launcher` | **server** — run the keyboard quick launcher. The shipped `scripts/openbox-launcher.sh` still queries the retired unversioned paths (`/api/launcher/menu`, `/api/launch`); use the versioned routes directly until the helper is updated. |
| `--backup [--items a,b]` | **server** — create a backup archive and print its path. `--items` takes a comma-separated list of `library`, `settings`, `media`, `plugins`, `themes`, and `extension_data`; unknown names are ignored, and the default is `library,settings`. The CLI does not implement `--keep`; use the API `keep` field or the UI for rotation. |
| `--restore-backup <archive>` | **server** — restore a backup archive. The CLI accepts any readable archive path; the API/UI restore additionally restricts the path to the data directory or `backups/`. |
| `--check-library` | **server** — run the library integrity report and exit without starting a window. Exit 0 healthy, 1 warnings, 2 errors, 3 refused (server running, active sessions, invalid library), 4 usage error. |
| `--repair-library [--refresh-backup]` | **server** — rebuild the media manifest and prune expired trash, then exit. No confirmation prompt. Refuses with exit 3 while the server runs or the library is schema 6 or older. Also removes the derived `sqlite_readmodel.db` files. |
| `--migrate-library` | **server** — upgrade a schema 6 library to schema 7 and exit. Refuses while the server runs. Writes `library.v6.backup.json`, `migration-in-progress.json`, and `migration-report.json`. Schemas 1-5 must be opened once on OpenBox 2.1 first. |
| `--rollback-library` | **Removed in 3.0.** Prints `openbox --rollback-library was removed in 3.0. Use OpenBox 2.1.0 to restore library.v6.backup.json.` and exits 4. No file is changed. |
| `--dump-contracts` | **server** — emit canonical API, settings, state, and catalog contract JSON for the contract ratchets. |
| `--selftest` | **macOS native host only** — boot `openbox-server` in an isolated temporary data directory, verify `GET /api/host/capabilities`, and exit without opening a window. |
| `--bigbox` | **Python fallback** — open straight into Big Box mode by appending `&deeplink=bigbox`. Ignored by the Rust server and the native host. |
| `--app-window`, `--no-app-window` | **Python fallback** — web entry point only: open in a chrome-less app window or a normal tab. |
| `--fullscreen-width <W>` / `--width <W>`, `--fullscreen-height <H>` / `--height <H>`, `--resolution <WxH>` | **Python fallback** — customize the web viewport in kiosk/app-window modes. |

`--backup` and `--restore-backup` act on the library before the server starts, so they work even when no instance is running. They read `OPENBOX_DATA_DIR` from the environment, like every startup path.

There is no `--version` flag. Read the version from Settings → About or `GET /api/v2/version`.

## Deep links

`openbox://` URIs address a running OpenBox instance. The parser rejects foreign hosts and fails cleanly when no server port is known, so a dead link never silently hits the wrong process.

| URI | Action |
| --- | --- |
| `openbox://start` | Open the running UI in the browser. A no-op if the server is already up. |
| `openbox://search/<query>` | Open the UI with the search field prefilled for `<query>`. |
| `openbox://showgame/<id>` (alias `game`) | Open the detail pane for a game by numeric or stable id. |
| `openbox://launch/<id>` | Launch a game by numeric or stable id. `openbox --play <id>` and the tray's recent-game menu use this launch action. |
| `openbox://resume/<id>` | Resume a stored Quick Resume state for a game by numeric or stable id. The adapter must expose a compatible state and the stored state must not be stale unless the caller explicitly allows it through the API. |
| `openbox://moment/<id>` | Open a Moment deep link for its id in the running UI. |
| `openbox://clip/<id>` | Open a Record That clip deep link for its id in the running UI. |
| `openbox://bigbox` (alias `fullscreen`) | Switch the running UI to Big Box mode. |
| `openbox://settings[/<panel>]` | Open Settings. A panel segment is parsed but not currently routed to a specific settings tab. |

Arcade Room is opened from **Tools → 3D arcade room** or the Ctrl/Cmd-K command palette. The current URI parser and SPA do not register an `openbox://arcade` action.

Usage:

```bash
openbox --uri "openbox://search/chrono"
openbox --play "GAME_ID"
openbox --uri "openbox://resume/GAME_ID"
openbox --uri "openbox://moment/MOMENT_ID"
openbox --uri "openbox://clip/CLIP_ID"
```

`--uri` dispatches against the running server using the token and port files, or boots a server if none is running. The browser-facing actions currently wired by the SPA include `?deeplink=bigbox`, `?deeplink=search&q=chrono`, `?deeplink=showgame&id=GAME_ID`, `?deeplink=launch&id=GAME_ID`, `?deeplink=settings`, `?deeplink=recap`, `?deeplink=moment&id=MOMENT_ID`, and `?deeplink=clip&id=CLIP_ID`. The launch action is what the tray's recent-game menu uses. Resume is dispatched by the URI/CLI path to the authenticated API; Arcade Room remains a Tools/palette action.

## Keyboard launcher

`openbox --launcher` (or `scripts/openbox-launcher.sh`) opens a rofi, wofi, or dmenu picker against the running instance. The live routes are `GET /api/v2/launcher/menu` (Big Box, Settings, Search, and up to 40 games) and `POST /api/v2/launch`. The pickers are Linux programs.

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
