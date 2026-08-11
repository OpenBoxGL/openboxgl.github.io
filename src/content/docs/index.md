---
title: OpenBoxGL
description: A local-first game library and launcher for Linux.
template: splash
---

# OpenBox Game Launcher for Linux

## One library for Steam, ROMs, and emulators.

OpenBoxGL brings mixed game collections into one searchable catalog. Keep library data on your machine, enrich it with artwork and metadata, then launch and track play from the same interface.

[Install OpenBoxGL](/install/) [Read the quick start](/getting-started/)

## What OpenBoxGL is {#what-it-is}

OpenBoxGL is an open-source Linux game library manager and launcher. It works with the game files, storefront clients, emulators, and folders you already use. No OpenBox account is required, and the library is stored locally under your control.

OpenBoxGL is independent from the Openbox window manager and from LaunchBox and Unbroken Software, LLC. Those names appear only to describe compatibility and comparison boundaries.

## How it works {#how-it-works}

1. **Bring in your libraries.** Import Steam, Heroic, Lutris, Gameyfin, ROM folders, arcade sets, executables, and emulator collections.
2. **Organize and enrich them.** Search, filter, tag, rate, group, edit metadata, download media, and build playlists.
3. **Launch and track play.** Use profiles and tokenized commands, then keep session history, saves, queue state, and backups together.

## What it does at a glance {#what-it-does}

- [Library](/library/): grid and list browsing, search, filters, favorites, collections, playlists, health checks, and safe removal.
- [Imports](/importing/): storefront manifests, ROM folders, arcade DAT files, standalone games, and local services.
- [Metadata and media](/metadata-and-media/): matching, artwork, media audits, and bounded background jobs.
- [Launching](/emulators-and-launching/): profiles, per-game overrides, archives, dependencies, and command tokens.
- [Big Box](/big-box-and-handhelds/): fullscreen controller browsing, themes, screensavers, and gamescope support.
- [Saves and sessions](/sessions-saves-and-backups/): play history, save discovery, backups, restore protection, and statistics sync.
- [Organization](/queue-tags-notifications/): queue, normalized tags, notifications, and signed webhook automation.
- [Themes](/themes/): bundled CSS themes and local theme imports.

## Interfaces and data {#interfaces}

The full-featured Web UI provides library management, REST API access, and Big Box mode. The lightweight native Tk UI is also available. Both use the same local library data and launch configuration.

The default data directory is `~/.local/share/openbox-game-launcher`. Set `OPENBOX_DATA_DIR` before starting OpenBoxGL when the library should live elsewhere.

## Integrations {#integrations}

OpenBoxGL fits around existing Linux tools. The documentation covers storefront imports, emulator profiles, RetroAchievements, IGDB, EmuMovies, Bezel Project, Gameyfin, OBS, MAME, Ludusavi, Hoard, mounted-folder sync, plugins, and signed webhooks.

## Your data {#your-data}

OpenBoxGL writes library state atomically and keeps recovery files beside the primary state. Credentials and session tokens are local configuration. API examples use placeholders such as `TOKEN`, `GAME_ID`, and `/path/to/game`.

## Start here {#start}

New to OpenBoxGL? Follow [Installation](/install/), then [Getting started](/getting-started/) for a local-folder import and first launch. If the app is already installed, start with [Library overview](/library/).

## FAQ {#faq}

### Does OpenBoxGL include games or ROMs?

No. OpenBoxGL does not distribute games, ROMs, BIOS files, firmware, or DRM circumvention tools.

### Does it require an online account?

No OpenBox account is required. Optional integrations may have their own accounts, credentials, API terms, and rate limits.

### What operating systems are supported?

OpenBoxGL targets Linux desktops, laptops, Steam Deck systems, and handheld PCs. The current requirements and package paths are listed in [Installation](/install/).
