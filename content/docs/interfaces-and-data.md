---
title: Interfaces and data
description: Understand OpenBoxGL interfaces, local state, and environment selection.
---

OpenBoxGL ships one UI over two hosts that share one local library. This page explains what you see, how the pieces fit together, and exactly where your data lives so you can back it up, move it, or diagnose problems.

## One UI, two hosts

| Host | Entry point | What you see | Best for |
| --- | --- | --- | --- |
| Native window | `openbox` or `openbox-native` | A native WebKitGTK window rendering the same three-column workspace: filter sidebar, cover grid or list, detail pane | Default desktop use |
| Web UI | `openbox --web` or `python3 web_app.py` | The same UI in a chrome-less app window (falls back to your browser) | Development, debugging, REST API, Big Box mode |

Both hosts render the identical `index.html`, `app.js`, and `app.css` served by the loopback server, so there is no second presentation stack to drift. The native host is a small C shim that owns the window chrome and spawns the Python server as a child; it never contains application logic.

### Native host

Starting `openbox` (or `openbox-native`) does three things in order:

1. Acquires a single-instance lock; a second launch focuses the existing window and exits.
2. Spawns `web_app.py --no-browser` as a child and waits for it to write `server.port` and `server.token`.
3. Opens a WebKitGTK window at `http://127.0.0.1:PORT/?token=...`, restores the last window geometry, and registers a `window.openboxNative` bridge for native dialogs, external opens, reveal, and window chrome.

On window close the host shuts the server down cleanly. When WebKitGTK is missing, the launcher prints an install hint and falls back to the system-browser app window, so no install bricks.

### Web UI

Running `python3 web_app.py` starts the loopback server directly and opens the same UI in a chrome-less app window (falling back to the default browser). Pass `--no-browser` to drive the API yourself.

The server is loopback-only, so nothing is reachable from the network. The URL carries the per-launch token in the query string; the API also accepts the same value as an `X-OpenBox-Token` header. When the server stops, both files are deleted. The keyboard launcher (`scripts/openbox-launcher.sh`) and `openbox://` deep links read these two files to find and authenticate against the running server. See [Command line and deep links](/reference/cli/) for the full flag and URI reference.

## Where data lives

The default data directory is `~/.local/share/openbox-game-launcher`. Everything OpenBoxGL persists lives there:

| Path (inside the data directory) | Contents |
| --- | --- |
| `library.json` | The library: games, profiles, history, settings, playlists, queue, notifications |
| `library.json.bak` | Last-known-good copy, rewritten before every commit |
| `.library.json.lock` | Cross-process lock file coordinating concurrent writes |
| `server.token`, `server.port` | Per-launch credentials for the running app; deleted on exit |
| `native-host.lock`, `window-geometry`, `native-host-flags` | Native host single-instance lock, last window geometry, and tray flags |
| `backups/` | Library backup archives (`OpenBoxBackup-*.zip`) |
| `save-backups/` | Versioned per-game save backups with retention limits |
| `media/` | Downloaded artwork, screenshots, video, and metadata media, grouped by source |
| `themes/` | Stock themes plus locally imported CSS themes |
| `plugins/` | Installed local plugin packages |
| `metadata/` | The synced LaunchBox Games Database file |
| `cache/` | Archive extraction and RetroAchievements working files |
| `media-queue.json` | Pending media download jobs |
| `highscores/`, `bezels/` | MAME high-score exports and bezel downloads |

The library file itself is schema-versioned JSON with stable game IDs derived from game identity, never from list position. That is why playtime, queue entries, and save links survive reordering or deleting other entries.

### Changing the data directory

Set `OPENBOX_DATA_DIR` in the process environment before starting OpenBoxGL:

```bash
OPENBOX_DATA_DIR=/mnt/library openbox
```

<Callout type="caution" title="Moving an existing library">

Migrate by moving the **whole data directory**, including `library.json`, and pointing the variable at the new location. The sidecar (`.bak`, `.lock`), `media/`, `backups/`, `save-backups/`, `themes/`, `plugins/`, `metadata/`, and `cache/` should move with it because OpenBoxGL expects them all under the data directory. If you copy only `library.json`, media and saves will appear missing and backups will start fresh.

</Callout>

Two details matter:

- The variable is read at startup, before `.env` bootstrap. Putting it inside a discovered `.env` file is too late for this choice; export it in the shell, a desktop entry, or a systemd unit instead.
- If the directory does not exist, it is created on first write. Migrate an existing library by moving the whole data directory, including `library.json`, and pointing the variable at the new location; the sidecar, media, and backups should move with it.

### Legacy data

When `OPENBOX_DATA_DIR` is not set and no `library.json` exists yet, OpenBoxGL looks for the legacy path `~/.local/share/launchbox-linux/library.json` and copies it into the new data directory, so an earlier test install keeps its library.

## Configuring credentials

Credentials and tokens can come from three places, in order: the process environment, discovered `.env` files, and persisted application settings (Settings dialog). The `.env` search order is an explicit `OPENBOX_ENV_FILE` path if set, the data directory and its parent, your home directory (`~/.env`), and `~/.config/openbox-game-launcher/.env`. The current working directory is not searched. Values already in the environment are never overridden by `.env`.

Supported variables are documented in `.env.example` and [Configuration](/reference/configuration/); they cover RetroAchievements (`RETROACHIEVEMENTS_USERNAME`, `RETROACHIEVEMENTS_API_KEY`), EmuMovies, IGDB, and `GITHUB_TOKEN` for release-API rate limits. Keep these files private; the API and the diagnostic log redact the values, but a `.env` file itself is plaintext.

## Security model

- The server binds to loopback and requires the session token on every request. Prefer the `X-OpenBox-Token` header for API calls you write; a `token` query parameter can leak into browser history and server logs.
- Tokens, passwords, API keys, and authorization headers are redacted in the diagnostic log.
- Webhooks reject plain HTTP targets by default; `OPENBOX_ALLOW_HTTP_WEBHOOKS=1` enables them for trusted local tests only.
- No OpenBox account exists and no library data leaves your machine except what an integration you explicitly trigger sends.

## Backups and recovery

The state store writes atomically: it writes the backup copy from the temp file first, then swaps the primary into place, so a crash cannot pair a fresh primary with a stale backup. If the primary file ever fails to decode, OpenBoxGL preserves the original, raises a clear error, and recovery must be explicit. Restore paths and archive members are validated, symlink parents are rejected, and a pre-restore safety copy is created automatically.

Make a backup before major changes: Settings has a backup manager, and `python3 web_app.py --backup` creates an archive from the command line. See [Data and recovery](/reference/data-and-recovery/) and [Library backups](/reference/library-backups/).

## Troubleshooting orientation

- App starts but no browser: run from a terminal and open the printed URL, or pass `--no-browser` and drive the API yourself.
- App starts but the library looks empty: check `OPENBOX_DATA_DIR`; the server is reading a different directory than the one you edited.
- Launch fails: the detail pane names the missing piece (executable permission, launch command, platform profile, or path). Check the diagnostic log for the backend's view.

Related: [Configuration](/reference/configuration/), [Data and recovery](/reference/data-and-recovery/), [REST API](/reference/api/), [Troubleshooting](/guides/troubleshooting/).
