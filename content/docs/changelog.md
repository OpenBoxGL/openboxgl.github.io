---
title: Changelog
description: Release notes for OpenBox, from the latest AppImage back to the first build.
sidebar: false
---

# Changelog

## 1.0.0 (2026-08-13)

**Native-first**

- OpenBox now opens in a native WebKitGTK window by default, rendering the same library UI as the web app instead of a browser tab or the removed Tk interface. The native host owns server lifecycle, single instance, window geometry, minimize-to-tray, and a fallback to the system-browser app window when WebKitGTK is missing.
- Batch metadata auto-match binds every unmatched game whose title exactly matches the LaunchBox Games Database in one action, instead of matching one game at a time. Only exact normalized-title hits qualify; ambiguous titles are left unmatched.
- The topbar regroups into Library, Actions, and Tools zones; session and job events stream over Server-Sent Events with polling kept as a fallback.
- The `ui_window` app/browser split is removed; native is the default and `--web`/`--app-window` remain for contributors.

## 0.9.0 (2026-08-12)


**LaunchBox media catalog and archive manuals**

- Media downloads now cover box backs, box spines, 3D boxes, clear logos, fanart, banners, title screens, cart fronts, cart backs, discs, and advertisement flyers, beyond covers, backgrounds, and screenshots. Every media surface (metadata dialog, bulk download, media audit, artwork gallery, image groups, auto-import) accepts the expanded set.
- Manuals are not in the LaunchBox feed, so the manual option pulls a PDF or text manual out of the game's own archive, ranking `manual.pdf` first and reporting a "no manual in this archive" note when nothing is found.
- Platform name mapping ranks exact LaunchBox matches first: `Game Boy` to `Nintendo Game Boy`, `PlayStation` to `Sony Playstation`, `GameCube` to `Nintendo GameCube`, `Xbox` to `Microsoft Xbox`, across 26 aliases.

**Engineering foundation**

- `make check` runs lint, compile checks, the full test suite under coverage, and coverage floors in one command. CI enforces it on push, pull requests, and weekly, and a version-sync check fails when `updates.py` disagrees with any published version spot.
- The 613-line GET and 195-line POST dispatch chains became a route registry (`routes.py`) with 88 GET and 118 POST entries (including v1 aliases), each a named handler.
- Structured errors carry stable machine codes (`GAME_NOT_FOUND`, `MEDIA_JOB_RUNNING`, ...) plus a per-request id that appears in the UI and the diagnostic log; POST validation errors become `400 BAD_REQUEST` instead of leaking to the generic 500 path.
- A versioned `/api/v1` surface aliases the stable routes; legacy paths keep working.
- The library payload is gzip-compressed once per state change and served with conditional GET: 5,000 games serve in about 2 ms at 638 KB instead of 13.8 MB.
- Settings saves drop unknown keys against a 72-key whitelist instead of persisting junk.

**Reliability**

- Rolling state snapshots keep the last 5 committed states for point-in-time recovery; `/api/state/recover` gained dry-run preview and snapshot restore modes.
- Background jobs keep a 50-entry finished history at `/api/jobs`, rendered in the Library Audit dialog.
- Ctrl-C / SIGTERM stops running sessions and drains webhooks gracefully; the session poll drops to every 10 s when idle.
- Log redaction now covers RetroAchievements keys and `client_secret` shapes, and `/api/diagnostic` packages a redacted report for bug reports.

**Frontend**

- `index.html` shrank from 3,117 lines to a 485-line shell; JS and CSS serve from `/static/*` with cache headers.
- All 30 browser state globals moved into one `AppState` object; UI preferences persist through `localStorage`.
- Server errors surface in a dismissible banner with a "Copy details" action that includes the request id.
- Dialogs are `aria-modal`, toasts and lifecycle messages are live regions, and the label floor rose to 12px.
- The interface language selector is honestly English-only until real localization lands.
- A UI smoke test drives a real server with puppeteer and fails on page errors.

**Release and supply chain**

- CycloneDX 1.4 SBOM generation, Ed25519 release signing with a pure-stdlib verifier, and a release pipeline script that runs everything up to the human publish step.
- A 23-scenario reliability catalog (`docs/reliability.md`), a support matrix (`SUPPORT.md`), and a triage policy (`TRIAGE.md`).

**Fixed**

- Duplicate media cleanup now scans every media field, not just covers and backgrounds.
- Latent undefined names in `web_app.py` that would have crashed their code paths on first use.
- Lint debt across the gate rule set: default-argument calls, loop-variable closures, unused variables, lambda assignments, missing `check=` on `subprocess.run`, shebangs, and import placement.

**Verification**

- Ran `./run_all_tests.sh`: 45 test files, 0 failures.
- Ran `make check`: lint, compile, tests, and coverage gates pass (56% total, 44% `web_app.py`).
- UI smoke test boots a real server and drives the grid with no page errors.
- Perf bench at 5,000 games: gzip library 1.9ms / 638KB vs 13.7ms / 13.8MB plain.

## 0.8.2 (2026-08-12)

**Fixed**

- Box art now keeps its natural aspect ratio in the library grid, Big Box Stage, and CoverFlow views instead of being force-cropped into a single ratio, so games with non-standard artwork (for example SNES titles) display uncropped. Title-only covers keep the standard portrait box.

**Added**

- Web UI surfaces for the persistent play queue, normalized game tags, Notification Center, and signed webhook settings.
- `/api/queue`, `/api/tags`, `/api/notifications`, and `/api/webhooks` contracts with bounded state, secret redaction, and destination validation.

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
