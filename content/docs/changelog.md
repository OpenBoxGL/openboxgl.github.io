---
title: Changelog
description: Release notes for OpenBox, from the latest AppImage back to the first build.
sidebar: false
---

# Changelog

OpenBox follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The full file lives in the repository at [`CHANGELOG.md`](https://github.com/vindeckyy/OpenBoxGL/blob/master/CHANGELOG.md). These are the highlights.

## Unreleased

**Added**

- Web UI surfaces for the persistent play queue, normalized game tags, Notification Center, and signed webhook settings.
- `/api/queue`, `/api/tags`, `/api/notifications`, and `/api/webhooks` contracts with bounded state, secret redaction, and destination validation.

These are implemented in `master` and documented across the guides and the [REST API](/reference/api/); they await a release tag.

## 0.8.1 (2026-08-09)

**Fixed**

- Launching a game with no launch command and no matching platform profile now fails with a clear error before anything runs, instead of silently spawning a process that exits on the spot and reporting a normal session end. Games whose file is not executable get the same message.
- The web UI shows the real outcome of a failed session. An immediate exit with a non-zero code reports "Session failed" with the exit code and a hint to check the launch command and emulator install, instead of the generic "Play time and history were saved" toast.
- Emulator installs no longer re-add the Flathub remote when it already exists, which previously made `flatpak remote-add --user` exit non-zero and abort the install.

## 0.8.0 (2026-08-07)

**Added**

- Handheld performance profiles: per-launch-profile TDP limits applied via `ryzenadj` at launch, with an optional restore limit when the session ends, gated by an `Apply handheld performance limits` setting (auto / always / off). `auto` applies only on Steam Deck / Bazzite game mode and battery-powered handhelds; a missing `ryzenadj` or permission error logs a warning and never blocks a launch.

## 0.7.0 (2026-08-02)

**Fixed**

- Backup restore merges archived settings back into `library.json` instead of a sidecar file the app never reads.
- Restoring an older backup over a newer library is refused unless explicitly forced, and restore re-validates symlink parents after `mkdir`.
- Save backups resolve relative `save_paths` against the game instead of the process working directory, and reject symlinked backup directories.
- Cloud sync propagates local deletions and resolves per-game conflicts by `last_played`.
- The plugin `library` hook is TTL-cached so `/api/library` no longer blocks up to 5 seconds per plugin per request.
- `openbox://` deeplinks reject foreign hosts and fail clearly when no server port is known.
- Gamescope guest detection also recognizes `STEAM_GAMESCOPE_RESTRICTED` sessions.

## 0.6.0 (2026-07-30)

**Added**

- LaunchBox-style advanced search in the Web UI: field terms, quoted values, status filters, and negative terms.
- Ordered manual playlists with parent grouping, notes, membership editing, and keyboard-friendly reorder controls, alongside existing filter playlists.
- Game context actions, Ctrl/Shift multi-selection, configurable status badges, richer platform/category/playlist detail panes, related-game reasons, artwork galleries, and per-game launch profile overrides.
- Backup archive listing, manifest summaries, restore actions, expanded artwork groups, and metadata fields for controller support, disc count, portable games, and broken entries.

**Changed**

- State persistence uses schema migrations, stable game identities with legacy aliases, last-known-good recovery, process-safe transactions, atomic writes, and corruption preservation.

## 0.5.0 (2026-07-30)

**Added**

- Steam Game Mode guest support for Steam Deck, Bazzite, and similar gamescope sessions. Big Box opens fullscreen while Steam retains Input, Quick Access Menu, and TDP controls.
- Settings can remove all Steam-imported library entries at once, keeping game files and media on disk.
- Local rotating diagnostic logs with a Settings copy button. Tokens and passwords are redacted.

## 0.4.x (2026-07-24 to 2026-07-30)

- **0.4.8, Steam Game Mode guest:** `--game-mode` opens Big Box fullscreen under gamescope on Steam Deck, Bazzite, and similar handheld images. Guest sessions are detected automatically, and Steam keeps Input, QAM, and TDP while OpenBox tags its UI and non-Steam launches for Steam's overlay path.
- **0.4.9, library reliability:** session playtime and Gameyfin installs update the correct library entry after deletes or reorders, Gameyfin downloads stage then replace and stream to disk, Lutris CLI failures return JSON errors.
- **0.4.10, AppImage desktop launches:** via Gear Lever and similar integrators no longer leak bundled `LD_LIBRARY_PATH` into host `xdg-open`/browsers.

## 0.1.0 to 0.3.0 (2026-07-23 to 2026-07-24)

The first public builds: the local web UI and native Tk interface, folder and storefront imports, emulator profiles, metadata and media downloads, session history, save discovery and backups, Big Box layouts, themes, plugins, and the token-authenticated REST API.

## Related pages

- [Installation](/install/)
- [Updating](/updating/)
- [Security policy](/policies/security/)
