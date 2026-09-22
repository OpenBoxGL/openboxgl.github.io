---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release is **1.13.1 — The Windows debut, made solid**:

- Windows 10 and 11 on x86_64 run OpenBox natively: a signed portable install (`install.ps1`) that pins the release key and verifies the SHA-256 checksum and Ed25519 signature before extracting, `openbox.cmd` / `openbox.ps1` / `openbox-native.ps1` launchers, library data in `%LOCALAPPDATA%\openbox-game-launcher`, the `openbox://` protocol handler, and emulator definitions that carry their Windows executable names.
- The WebView2 native window (`native_host_win.c`) mirrors the WebKitGTK host: one UI over the loopback server, the same native bridge, remembered window geometry, tray icon and minimize-to-tray, `openbox://` deeplinks, and one instance per data directory — with the browser app window as the no-toolchain fallback.
- The platform seam is `pkg/platform_compat.py`, so the runtime still needs nothing but the standard library on either platform.
- Fixes carried with the port: process liveness no longer uses a probe that terminates the process on Windows, stored references keep POSIX separators, and the metadata database closes cached SQLite handles before an atomic replace.

Earlier milestones include 1.12.1 — Hardening (a harder update path, clearer errors, no silent skips), 1.12.0 — Living Library (smart collections, Game Story, per-game `launch_env` overrides and confirm-before-launch, weekly automatic backups, the SQLite read model at 5,000+ games), 1.11.0 (Quick Resume, Moments and Record That clips, Time Machine, Backlog Radio, the command palette, Arcade Room and Museum kiosk mode, Household, Steam Bridge, ES-DE import, SteamGridDB artwork, and local launcher trophies), 1.10.0 (review-first LaunchBox XML migration, manual shelf entries, causal catalog sync, indexed search, and launch hardening), 1.9.0 (picker, Constellation, Wrapped, Timeline, Mastery, Game Night, video snaps, and Mood Match), 1.8.0 (keyboard/gamepad navigation, ScreenScraper, custom gamescope presets, library export, and ARM64 packaging), 1.7.2 (internationalization, the optional SQLite read model, MangoHud, BIOS SHA1 drift detection, backup diff, and visual chip builder), 1.7.1 (Play Insights analytics, spacer-window grid virtualization, background search worker, FacetCache LRU, write coalescing, and Launch Doctor fixes), 1.7.0 (Library Setup Center, durable Activity Center operations, Launch Doctor preflight, additive v2 API, and Flatpak packaging), 1.6.0 (modular state architecture, centralized launch tokens, accessible tools menu, dialog focus traps, and CSP hardening), 1.5.1 (large-library write optimizations), 1.5.0 (Proton/Wine prefix management, Faugus Launcher, and Eden Switch), and 1.0.0 (native WebKitGTK window, Server-Sent Events, and the frozen v1 contract).

## Coming next: Solid Ground (unreleased)

The next feature release is in test, not shipped, and it is not tied to a version number yet: the 1.13.0 line shipped as the Windows support release above. The theme: finish the features from the last wave, fix the sharp edges, and make very large libraries fast. Highlights:

- **Household presence** ("who's playing what right now"), plus a deterministic weekly challenge and wishlist shelf shares.
- **Game Night deck builder** with saved queues, theme presets, and seeded sharing.
- **Time Machine compare** between two dates, and save history with read-back verification and a test-restore drill.
- **Artwork Doctor** and **per-platform setup checklists** turn artwork and emulator problems into one-click fixes and green/red answers.
- **Plugin API v1**, a sixth high-contrast theme, first-run tips, auto-moment prompts, signed emulator-definition updates, and background AppImage updates that apply on restart.
- **Repair and cleanup:** missing-file repair, duplicate merge, session export, collection export/import, and undo for trash and purge.
- **Faster and safer:** library state is shared instead of copied (measured at 20,000 games: facets 774→46 ms, media manager 709→2 ms), refresh no longer stops running games, unsaved edits are protected, a damaged library file boots into recovery, and the coverage gates now actually run on pull requests.

The [changelog](/changelog/) has the full preview. Work in progress is tracked in the app repository: the [CHANGELOG](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/CHANGELOG.md) for shipped releases and [GitHub issues](https://github.com/vindeckyy/OpenBoxGL/issues) for planned work. New ideas come from the sources below.

## Where ideas come from

- GitHub issues, using the feature request template. The maintainer triages these directly.
- The [parity matrix](/reference/parity/), which tracks LaunchBox workflows and what is intentionally not replicated on Linux and Windows — gamescope and Game Mode, AppImage and Flatpak packaging, XDG desktop integration, and Flathub-aware emulator management stay Linux-only.
- The community: the project is open source (AGPL-3.0), and contributions that follow [Contributing](/project/contributing/) are welcome.

## What will not happen

A few things are ruled out by design, not just postponed: no OpenBox account, no vendor-hosted cloud library, no telemetry, no subscription, and no bundling of games, ROMs, or BIOS files. Local mounted-folder statistics and opt-in catalog synchronization remain available without a vendor account. If a request requires one of those ruled-out services, it will not be built.

## Related pages

- [Changelog](/changelog/)
- [Parity matrix](/reference/parity/)
- [Contributing](/project/contributing/)
- [Request a feature](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=feature_request.yml)
