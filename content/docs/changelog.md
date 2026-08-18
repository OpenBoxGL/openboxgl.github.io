---
title: Changelog
description: Release notes for OpenBox, from the latest AppImage back to the first build.
sidebar: false
---

## 1.5.0 (2026-08-18)

### Changed

- **Proton & Wine Prefix Manager**: Integrated Wine prefix and Proton discovery and assignment (`parity_wine.py`, `handlers/wine.py`, `GET /api/wine/prefixes`, `GET /api/wine/protons`, `GET /api/wine/prefix-for-game`), with UI integration in game settings and auto-detection for Windows titles.
- **Faugus Launcher Integration**: Added Faugus game discovery and import handlers (`parity_faugus.py`, `handlers/faugus.py`, `GET /api/faugus/status`, `GET /api/faugus/scan`, `POST /api/faugus/import`) with automated UMU prefix detection.
- **Eden Nintendo Switch Emulator**: Added emulator definitions and profile mapping for Eden (`emulator_defs/eden.yaml`) supporting NSP, XCI, NCA, and NRO packages.
- **Canonical Identity & Cross-Source Deduplication**: Added canonical identity resolver (`parity_identity.py`, `POST /api/health/dedupe`) to deduplicate cross-source titles accurately across Steam, Heroic, Lutris, Faugus, and local ROM libraries.
- **Game Dialog Next & Previous Navigation**: Added Previous (`← Prev`) and Next (`Next →`) navigation buttons directly to the Game Edit modal, allowing users to rapidly cycle and edit adjacent games in the active filtered and sorted library without closing the dialog.
- **Platform-Scoped Media Cleanup**: The media manager and `POST /api/media/cleanup` now accept an optional `platform` parameter, enabling duplicate media auditing and cleanup targeted to a single platform or across the entire collection.
- **Reset Play Statistics**: Added a "Reset play statistics" action to the game right-click context menu and the Bulk Edit dialog, resetting `play_count` (0), `playtime_seconds` (0), and `last_played` ("").
- **Smart Capability Playlist Rules**: Filter presets and smart filter playlists now support capability rules including `has_saves`, `has_achievements`, `has_missing_media`, and `has_highscores`.
- **Desktop Random Game Shortcut**: Added `Ctrl+Alt+Q` and `Ctrl+Alt+R` global desktop keyboard shortcuts to instantly pick, focus, and scroll to a random game in the active grid or list.
- **Acronym Title Search Matching**: Search and filter queries now recognize game title acronyms and initials (for example, `oot` matches *The Legend of Zelda: Ocarina of Time*, `mgs` matches *Metal Gear Solid*, `sotn` matches *Castlevania: Symphony of the Night*, `ff` matches *Final Fantasy*).
- **Expanded Launch Variables**: Emulator startup templates and per-game command overrides now expand `{ImagePath}`, `{dir}`, `{Dir}`, `{file}`, `{File}`, `{stem}`, `{FileNameWithoutExtension}`, `{Platform}`, `{EmulatorDir}`, and `{DataDir}`.
- **Window Resolution CLI Options**: Added `--fullscreen-width <W>`, `--fullscreen-height <H>`, and `--resolution <WxH>` CLI flags to customize viewport dimensions for kiosk and app window modes.

### Fixed

- Background job manager futures are now popped and cleaned up synchronously when worker jobs finish, preventing latent callback latency races in multi-threaded test and runtime environments.

### Hardened

- Standardized all newly added parity integration modules under `pkg/parity/` with root compatibility shims, adhering strictly to the frozen v1 contract.

## 1.4.0 (2026-08-17)

### Fixed

- AppImage and Flatpak builds now bundle every static JavaScript module (`util.js`, `state.js`, `library.js`, and related ES modules), preventing 404 errors during client-side navigation.
- AppImage packaging scripts now ensure parent directories are created for `pkg/parity` modules.
- Hardened background job manager queue slot cleanup on worker replacement, preventing in-flight job leakages.
- Handled non-standard filesystem mounts in `fsync_directory` and protected snapshot rotation against concurrent file removals.
- Resolved Big Box mode switch exit response hang and ensured full controller dropdown navigation.

### Changed

- Reorganized repository structure: documentation moved to `docs/`, tests to `tests/`, and parity integrations to `pkg/parity/` with backward-compatible shims at root.
- CI workflows, test runners, coverage gates, and token checkers updated to support both flat and packaged layouts.

## 1.3.0 (2026-08-16)

### Hardened

- Plugin execution now uses bubblewrap with isolated namespaces, no network access, and temporary mounts for home, temporary, runtime, and removable-media paths when the host supports it. If the sandbox cannot be created, enabled plugins are skipped by default; `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` is an explicit opt-in for trusted local plugins.
- Gamescope regression tests now launch in their own process groups and terminate the full group on timeout, preventing nested gamescope processes from surviving the test gate.

### Changed

- Cloud sync, save and backup restore, launch handling, settings validation, metadata application, Lutris import, 7z validation, webhook validation, filter matching, and game resolution were split into focused helpers, keeping the security-sensitive paths easier to audit and test.
- The background job manager now has dedicated coverage for retries, cancellation, queue and name limits, bounded results, shutdown, and completed-future cleanup.
- Dead backend code and obsolete browser, screenshot, migration, and performance-capture scripts were removed.
- From-source setup documentation now explains the tokenized UI URL and the supported `OPENBOX_ENV_FILE`, data-directory, home-directory, and user-config locations.
- CI and release tooling now use the refreshed GitHub Actions and JavaScript dependencies, with CodeQL action components kept on one version and grouped Dependabot updates for future changes.

## 1.2.0 (2026-08-15)

**Security and SteamOS**

- SteamOS AppImages no longer export bundled libraries into the host shell, fixing startup failures where `/bin/bash` could not resolve `rl_print_keybinding`.
- Webhook delivery rejects non-public destinations, pins validated DNS results, disables proxies and redirects, and bounds response reads.
- Library and save backups use private atomic files, reject unsafe archive entries, and protect restore paths against symlinks and archive replacement races.
- Native bridge authorization now requires the exact OpenBox origin, including its dynamic port.
- Gameyfin validates IDs before path construction, keeps filesystem operations under the install root, requires HTTPS, and verifies supplied checksums.
- 7z extraction rejects links, operates on a bounded snapshot, and validates the staging tree before promotion.
- Media and document reads enforce approved roots, including symlinked parent checks.
- Environment loading accepts only owner-controlled files and supported keys, and no longer searches the current directory.
- Job and SSE queues have explicit capacity, expiry, cleanup, and slow-client behavior.

**Release hardening**

- Release artifacts require Ed25519 signatures against the pinned production public key.
- Release jobs separate build, provenance attestation, and publication permissions, and refuse asset overwrites.
- Build and CI inputs are pinned, the SBOM is generated from the completed AppImage, and Puppeteer 25.7.0 resolves the audited npm dependency issues.
- Plugin catalogs require a pinned digest, HTTPS package URLs, and package checksums.

## 1.1.0 (2026-08-15)

**Fixed**

- Cloud sync: the local-wins merge branch contained a dead condition (`remote_played > local_played` can never be true there), so newer per-field remote values were silently dropped.
- State backup now mirrors the latest committed primary, staged atomically, instead of aliasing the brand-new write.
- Plugin environment filtering fixed a typo (`GAMEFYIN_` -> `GAMEYFIN_`), so correctly spelled Gameyfin variables are stripped from plugin subprocesses.
- Play queue: skip flags recorded while advancing are written back to state before a valid item is returned, so they can no longer silently disappear.
- Queue `path_exists` checks the filesystem instead of reporting any nonempty path string as existing.
- OBS status: `recording` now requires a recording file produced within the last two minutes instead of reporting any running OBS process as actively recording.
- Steam and Lutris imports verify the Flatpak app is actually installed (`flatpak info`) before building a `flatpak run` command.
- IGDB: time-to-beat came from a nonexistent `time_to_beat` field on the games endpoint; it now queries the separate `game_time_to_beats` endpoint and converts its seconds value to hours.
- Gameyfin: the catalog requests the provider list once, raw responses are returned open and closed by the caller, and the tautological `str(folder) if installed else str(folder)` is gone.
- Job manager: completed futures are released via a done callback so job bookkeeping cannot accumulate indefinitely.
- Webhook retry: the injected clock now measures the sleep duration and warns when the wall-clock sleep overshoots.
- The emulator-defs YAML fallback parser no longer decides a key is a list based on whether its name ends in "s"; indented values build sequences from the actual shape.
- Native dialog bridge: selected paths are now JSON-quoted strings, so paths with spaces or quotes produce valid JSON and no longer leak the `g_strescape` allocation.
- Ed25519 point decoding rejects out-of-range coordinates, small-order points, and off-curve values in both `updates.py` and `scripts/verify_release.py`, and checks the canonical scalar before point arithmetic.
- `remove_exclusion` returns the number of removed entries; the API route reports `removed` truthfully.
- `sanitize_settings` no longer iterates a non-dict input into garbage dropped-key lists.
- The 7z archive validator counts a final member even when the listing omits the trailing blank separator.
- Screenshot capture: the previously ignored `window_hint` now selects active-window flags for gnome-screenshot, spectacle, and scrot.

**Changed**

- `_tdp_args` returns only the argument list; the unused milliwatt value is gone.

## 1.0.1 (2026-08-15)

**Fixed**

- Big Box hybrid mode: platform buttons were emitting a broken `data-bigbox-AppState.platform` attribute that the click handler never matched, so switching platforms did nothing. The attribute now matches the selector.
- IGDB search sent a malformed `&AppState.platform =` query parameter instead of `platform=`, dropping the platform hint from searches.
- Custom-field keys in the details pane were rendered without escaping; a crafted key could inject HTML. Keys and values are now both escaped.
- The session token stayed in the browser address bar after load. It is now scrubbed from history immediately, with deeplink parameters preserved.

**Changed**

- CSP tightened: `script-src 'self'` without `'unsafe-inline'`, plus `object-src 'none'` and `base-uri 'none'`.
- Requests without a Host header are now rejected instead of bypassing the loopback check.
- The SSE stream now carries the same security headers as every other response.
- The startup URL printed to stdout no longer contains the session token.
- The updater verifies an Ed25519 signature when a release publishes one, and skips with a loud warning while the public key is still the placeholder.
- WebKit rendering defaults changed: dmabuf renderer disabled unless `OPENBOX_ENABLE_DMABUF` is set (fixes silent window failures on AMD GPUs, including Steam Deck), and hardware acceleration switched to on-demand.

**Hardened**

- The native host now validates full URIs (scheme, host, no userinfo, no control characters) before handing anything to the default handler.
- Reveal-in-folder is restricted to paths under the data directory or home directory.
- The native bridge rejects suspicious payloads instead of evaluating them.
- Plugin catalog downloads now require a valid sha256 checksum; entries without one are refused.
- Plugin subprocess environments are scrubbed of token, password, secret, and API-key variables.
- `before_launch` plugin hooks can no longer swap the launch binary or move the working directory outside the game or data directories; tampered results fall back to the original command.

**Fixed (launch reliability)**

- AppImage launches now route through the fallback ladder instead of exec-ing the native host directly, and all launch failures are written to `~/.local/share/openbox-game-launcher/openbox-launch.log` instead of vanishing on a double-click.
- The native host writes its own log and the single-instance message is no longer invisible.
- Game Mode with no kiosk browser installed now prints the server URL instead of failing silently.

**Verification**

- `./run_all_tests.sh`: 47 test files, 0 failures (now 49 with the sandbox and hardening coverage).
- `make check`: lint, compile checks, coverage floors green (now `55%` total and `44%` `web_app.py`, see `scripts/check_tests.py`).
- CI smoke test now covers Big Box platform switching and IGDB search parameters; JS linting runs in CI; Dependabot watches GitHub Actions and npm.

## 1.0.0 (2026-08-14)

**Native-first**

- OpenBox now opens in a native WebKitGTK window by default, rendering the same library UI as the web app instead of a browser tab or the removed Tk interface. The C host (`native_host.c`) owns server lifecycle, single instance, window geometry, minimize-to-tray, and a fallback ladder to the system-browser app window (then your default browser) when WebKitGTK is missing; `openbox --web` remains the development opt-out.
- The `ui_window` app/browser split is removed; the Tk interface no longer ships, and AppImage dependencies drop python3-tk/tcl/tk for WebKitGTK 4.1. CI compiles the native host on every pull request.
- Native IPC: `/api/native/*` routes report host capabilities dynamically, and a JS↔C bridge drives native dialogs, external opens, reveal-in-file-manager, and Big Box fullscreen.
- Batch metadata auto-match binds every unmatched game whose title exactly matches the LaunchBox Games Database in one action, instead of matching one game at a time. Only exact normalized-title hits qualify; ambiguous titles are left unmatched.

**State and API contract**

- Schema v5 adds a host-owned `ui_state` block; existing games, settings, playlists, and history migrate untouched.
- The v1 API contract freezes (`contracts.py` + `v1_contracts.json`, 46 routes) with a CI check that fails when the contract drifts.

**Frontend**

- The topbar regroups into Library, Actions, and Tools zones; session and job events stream over Server-Sent Events with polling kept as a fallback.
- Grid covers group by aspect ratio by default (persisted as `cover_grouping`), and the dialog manager traps focus and closes on Escape.
- Scroll-lag fixes: rAF-coalesced grid rendering, backdrop blur removed from the base scroll path, hover-gated cover transitions, and a constrained workspace row.

**Under the hood**

- The 260-method `Handler` class splits into capability mixins under `handlers/` (library, media, imports, sessions, settings, extensions, health, emulators, native, data); `web_app.py` drops from 3,755 to 1,628 lines while response bytes and route wiring stay identical.
- `docs/adr/0001-native-host.md` and `docs/native-host-contract.md` document the host/server split and IPC contract.

**Verification**

- 47 test files, 0 failures at that tag (now 49); `make check` gates (lint, compile, tests, coverage floors of `59%` total and `65%` `web_app.py` at that tag, now `55%` total and `44%` `web_app.py` per `scripts/check_tests.py`) pass; the UI smoke test drives a real server and asserts the Tools menu opens under every stock theme.

## 0.9.0 (2026-08-12)


**LaunchBox media catalog and archive manuals**

- Media downloads now cover box backs, box spines, 3D boxes, clear logos, fanart, banners, title screens, cart fronts, cart backs, discs, and advertisement flyers, beyond covers, backgrounds, and screenshots. Every media surface (metadata dialog, bulk download, media audit, artwork gallery, image groups, auto-import) accepts the expanded set.
- Manuals are not in the LaunchBox feed, so the manual option pulls a PDF or text manual out of the game's own archive, ranking `manual.pdf` first and reporting a "no manual in this archive" note when nothing is found.
- Platform name mapping ranks exact LaunchBox matches first: `Game Boy` to `Nintendo Game Boy`, `PlayStation` to `Sony Playstation`, `GameCube` to `Nintendo GameCube`, `Xbox` to `Microsoft Xbox`, across 26 aliases.

**Engineering foundation**

- `make check` runs lint, compile checks, the full test suite under coverage, and coverage floors in one command. CI enforces it on push, pull requests, and weekly, and a version-sync check fails when `updates.py` disagrees with any published version spot.
- The 613-line GET and 195-line POST dispatch chains became a route registry (`routes.py`) with 104 GET and 124 POST entries (including v1 aliases, on top of 80 GET and 95 POST base routes), each mapped to a named handler (five via dotted `handlers.native.*` specs).
- Structured errors carry stable machine codes (`GAME_NOT_FOUND`, `MEDIA_JOB_RUNNING`, ...) plus a per-request id that appears in the UI and the diagnostic log; POST validation errors become `400 BAD_REQUEST` instead of leaking to the generic 500 path.
- A versioned `/api/v1` surface aliases the stable routes; legacy paths keep working.
- The library payload is gzip-compressed once per state change and served with conditional GET: 5,000 games serve in about 2 ms at 638 KB instead of 13.8 MB.
- Settings saves drop unknown keys against a 72-key whitelist instead of persisting junk. (The registry in `settings_schema.py` currently defines 72 known keys.)

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
