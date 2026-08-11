---
title: OpenBoxGL
description: A local-first game library and launcher for Linux.
template: splash
---

# OpenBox Game Launcher for Linux

## One library for Steam, ROMs, and emulators.

OpenBoxGL brings mixed game collections into one searchable catalog. Keep library data on your machine, enrich it with artwork and metadata, then launch and track play from the same interface.

![The OpenBox Web UI: filter rail, cover grid, and game detail pane](/openbox-screenshot.png)

[Install OpenBoxGL](/install/) [Read the quick start](/getting-started/)

## What OpenBoxGL is {#what-it-is}

OpenBoxGL is an open-source Linux game library manager and launcher. It works with the game files, storefront clients, emulators, and folders you already use. No OpenBox account is required, and the library is stored locally under your control.

The application ships as two interfaces over the same local data:

| Interface | Entry point | What it is for |
| --- | --- | --- |
| Web UI | `python3 web_app.py` or `openbox` | Full feature set, REST API, Big Box mode |
| Native UI | `python3 openbox.py` or `openbox-native` | Lightweight desktop window |

When you start the Web UI, a local server starts on `127.0.0.1` and your browser opens to it. The server never listens on the network, and every request must carry a per-launch token, so the tab you open is the only client. The page is a three-column workspace: platform filters on the left, a searchable cover grid or list in the center, and a detail pane on the right where metadata, launch controls, saves, and history stay together.

OpenBoxGL is independent from the Openbox window manager and from LaunchBox and Unbroken Software, LLC. Those names appear only to describe compatibility and comparison boundaries.

## How it works {#how-it-works}

1. **Bring in your libraries.** Import Steam, Heroic, Lutris, Gameyfin, ROM folders, arcade sets, executables, and emulator collections. Imports scan local manifests or folders and add only entries that are not already present, so re-running an import never duplicates.
2. **Organize and enrich them.** Search, filter, tag, rate, group, edit metadata, download media, and build playlists. Metadata syncing and media downloads are optional and can be limited per import so large libraries stay responsive.
3. **Launch and track play.** Use profiles and tokenized commands, then keep session history, saves, queue state, and backups together. Every launch records a session with duration and exit status, unless you disable session history in Settings.

## What it does at a glance {#what-it-does}

Each area has its own guide. The list below says what you will find there.

- [Library](/guides/library/): grid and list browsing, search, filters, favorites, collections, playlists, health checks, and safe removal.
- [Imports](/guides/library/importing/): storefront manifests, ROM folders, arcade DAT files, standalone games, and local services.
- [Metadata and media](/guides/metadata-and-media/): matching, artwork, media audits, and bounded background jobs.
- [Launching](/guides/emulators-and-launching/): profiles, per-game overrides, archives, dependencies, and command tokens.
- [Big Box](/guides/big-box-and-handhelds/): fullscreen controller browsing, themes, screensavers, and gamescope support.
- [Saves and sessions](/guides/sessions-saves-and-backups/): play history, save discovery, backups, restore protection, and statistics sync.
- [Organization](/guides/library/queue-tags-notifications/): queue, normalized tags, notifications, and signed webhook automation.
- [RetroAchievements](/guides/retroachievements/): match ROMs to achievement sets and track hardcore, beaten, and mastered progress.
- [Plugins](/guides/plugins/): install local Python extensions that observe or change the library and launches.
- [Discovery](/guides/discovery/): recently added, never played, continue playing, and short-session views.
- [Storefront Manager](/guides/storefront-manager/): browse owned versus installed catalogs and automate imports.
- [Themes](/themes/): bundled CSS themes and local theme imports.

## Interfaces and data {#interfaces}

The full-featured Web UI provides library management, REST API access, and Big Box mode. The lightweight native Tk UI is also available. Both use the same local library data and launch configuration, and writes are process-safe, so both interfaces can run against the same `library.json`.

The default data directory is `~/.local/share/openbox-game-launcher`. Set `OPENBOX_DATA_DIR` before starting OpenBoxGL when the library should live elsewhere. The variable must be in the process environment at launch: the data directory is chosen at startup, before any `.env` file is read.

Inside the data directory, the library itself is `library.json` with a last-known-good `.bak` copy beside it. Writes are atomic, owner-only, and validated against a schema, so a crash or a bad edit cannot silently corrupt the library.

See [Interfaces and data](/interfaces-and-data/) for the full layout of both interfaces and every file OpenBoxGL keeps in the data directory.

## Integrations {#integrations}

OpenBoxGL fits around existing Linux tools. The documentation covers storefront imports, emulator profiles, RetroAchievements, IGDB, EmuMovies, Bezel Project, Gameyfin, OBS, MAME, Ludusavi, Hoard, mounted-folder sync, plugins, and signed webhooks.

Optional credentials can be supplied through the Settings dialog or through environment variables in a local `.env` file. See [Accounts and media](/integrations/accounts-and-media/) and [Configuration](/reference/configuration/).

## Your data {#your-data}

OpenBoxGL writes library state atomically and keeps recovery files beside the primary state. Credentials and session tokens are local configuration. API examples use placeholders such as `TOKEN`, `GAME_ID`, and `/path/to/game`.

- The Web UI token is generated per launch, written to `server.token` in the data directory, and deleted when the server stops. Prefer the `X-OpenBox-Token` header over a `token` query parameter in your own requests; query strings can end up in browser history and logs.
- The diagnostic log (`openbox.log`) rotates automatically and redacts tokens, passwords, and API keys. It can still contain game names and local file paths, so review it before sharing it.
- Library backups are archives stored in the `backups/` folder. Make one before major changes; see [Library backups](/reference/library-backups/) and [Data and recovery](/reference/data-and-recovery/).

## Start here {#start}

New to OpenBoxGL? Follow [Installation](/install/), then [Getting started](/getting-started/) for a local-folder import and first launch. If the app is already installed, start with [Library overview](/guides/library/).

## FAQ {#faq}

### Does OpenBoxGL include games or ROMs?

No. OpenBoxGL does not distribute games, ROMs, BIOS files, firmware, or DRM circumvention tools. You supply the files; OpenBoxGL catalogs, launches, and tracks them.

### Does it require an online account?

No OpenBox account is required. Optional integrations may have their own accounts, credentials, API terms, and rate limits. RetroAchievements and EmuMovies use your existing accounts, and metadata syncing talks to the public LaunchBox Games Database with your consent.

### What operating systems are supported?

OpenBoxGL targets Linux desktops, laptops, Steam Deck systems, and handheld PCs. Source installs require Python 3.10 or newer; the AppImage bundles its own Python runtime. The current requirements and package paths are listed in [Installation](/install/).
