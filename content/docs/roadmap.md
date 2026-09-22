---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release is **1.14.0 — Library Intelligence**:

- **Plugins 2.0:** a catalog browser tab with per-entry Install/Update, per-plugin checksum-bound trust (no global trust toggle; updates re-prompt), Android-style permission prompts at install/enable time, per-plugin settings forms generated from the manifest schema, a `library_source` importer hook that merges plugin games into the library with a source badge, a single `events` lifecycle hook, and palette integration listing plugin commands under the `>` prefix. The plugin API v1 surface is frozen.
- **Effortless metadata:** an "Automatically match metadata and download media after import" toggle in the setup wizard (default on) with opt-in provider checkboxes for ScreenScraper, IGDB, and SteamGridDB (all default off); dual-hash ROM confidence for ScreenScraper auto-application; and a thumbnail chooser on every LaunchBox, SteamGridDB, and ScreenScraper search result.
- **Backlog management:** every game gets a personal backlog layer — Unplayed/Playing states, personal 0–5 star ratings, manual playtime logging, dated notes, and an optional "Mark as Playing?" prompt on first launch.
- **Couch-ready Big Box:** a `--bigbox` CLI flag and "Start in Big Box mode" setting, a d-pad-navigable on-screen keyboard, and Steam Bridge copying cached SteamGridDB artwork into the Steam grid directory.
- **Library health score:** a 0–100 score across five weighted dimensions with per-dimension fix queues (dry-run preview first, every fix undoable), backed by the Artwork Doctor, a missing-file repair wizard, and duplicate merge with Trash-based reversibility.
- **Game DNA search:** offline smart search behind a Title | Smart toggle — BM25 plus a curated 151-concept lexicon in five languages, "why" explanation chips, and "More like this" everywhere including Big Box. No AI cloud, no downloads.

Earlier milestones include 1.13.1 — The Windows debut, made solid (regression fixes and hardening on the Windows port), 1.13.0 — Windows (native WebView2 host, verified `install.ps1`, portable zip layout, Windows emulator executables, and fixes carried with the port), 1.12.1 — Hardening (a harder update path, clearer errors, no silent skips), 1.12.0 — Living Library (smart collections, Game Story, per-game `launch_env` overrides and confirm-before-launch, weekly automatic backups, the SQLite read model at 5,000+ games), 1.11.0 (Quick Resume, Moments and Record That clips, Time Machine, Backlog Radio, the command palette, Arcade Room and Museum kiosk mode, Household, Steam Bridge, ES-DE import, SteamGridDB artwork, and local launcher trophies), 1.10.0 (review-first LaunchBox XML migration, manual shelf entries, causal catalog sync, indexed search, and launch hardening), 1.9.0 (picker, Constellation, Wrapped, Timeline, Mastery, Game Night, video snaps, and Mood Match), 1.8.0 (keyboard/gamepad navigation, ScreenScraper, custom gamescope presets, library export, and ARM64 packaging), 1.7.2 (internationalization, the optional SQLite read model, MangoHud, BIOS SHA1 drift detection, backup diff, and visual chip builder), 1.7.1 (Play Insights analytics, spacer-window grid virtualization, background search worker, FacetCache LRU, write coalescing, and Launch Doctor fixes), 1.7.0 (Library Setup Center, durable Activity Center operations, Launch Doctor preflight, additive v2 API, and Flatpak packaging), 1.6.0 (modular state architecture, centralized launch tokens, accessible tools menu, dialog focus traps, and CSP hardening), 1.5.1 (large-library write optimizations), 1.5.0 (Proton/Wine prefix management, Faugus Launcher, and Eden Switch), and 1.0.0 (native WebKitGTK window, Server-Sent Events, and the frozen v1 contract).

## Coming next: Solid Ground (unreleased)

The next feature release is in test, not shipped, and it is not tied to a version number yet: the 1.14.0 line shipped as the Library Intelligence release above. The theme: finish the features from the last wave, fix the sharp edges, and make very large libraries fast. Highlights:

- **Household presence** ("who's playing what right now"), plus a deterministic weekly challenge and wishlist shelf shares.
- **Game Night deck builder** with saved queues, theme presets, and seeded sharing.
- **Time Machine compare** between two dates, and save history with read-back verification and a test-restore drill.
- **Per-platform setup checklists** turn emulator problems into one-click fixes and green/red answers.
- **A sixth high-contrast theme**, first-run tips, auto-moment prompts, signed emulator-definition updates, and background AppImage updates that apply on restart.
- **Repair and cleanup:** session export, collection export/import, and undo for trash and purge.
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
