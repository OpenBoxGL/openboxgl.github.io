---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release, 1.10.0, delivers review-first LaunchBox XML migration, manual shelf entries, opt-in causal catalog sync with preview/apply/recovery, indexed search and facets for large libraries, launch deduplication, the 1.9 discovery and Big Box features, and signed x86_64/aarch64 AppImages plus an x86_64 Flatpak. Previous milestones include 1.9.0 (picker, Constellation, Wrapped, Timeline, Mastery, Game Night, video snaps, and Mood Match), 1.8.0 (keyboard/gamepad navigation, ScreenScraper, custom gamescope presets, library export, and ARM64 packaging), 1.7.2 (internationalization, the optional SQLite read model, MangoHud, BIOS SHA1 drift detection, backup diff, and visual chip builder), 1.7.1 (Play Insights analytics, spacer-window grid virtualization, background search worker, FacetCache LRU, write coalescing, and Launch Doctor fixes), 1.7.0 (Library Setup Center, durable Activity Center operations, Launch Doctor preflight, additive v2 API, and Flatpak packaging), 1.6.0 (modular state architecture, centralized launch tokens, accessible tools menu, dialog focus traps, and CSP hardening), 1.5.1 (large-library write optimizations), 1.5.0 (Proton/Wine prefix management, Faugus Launcher, and Eden Switch), and 1.0.0 (native WebKitGTK window, Server-Sent Events, and the frozen v1 contract).

## In progress

Work in progress is tracked in the app repository: the [CHANGELOG](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/CHANGELOG.md) for shipped releases and [GitHub issues](https://github.com/vindeckyy/OpenBoxGL/issues) for planned work. New ideas come from the sources below.

## Where ideas come from

- GitHub issues, using the feature request template. The maintainer triages these directly.
- The [parity matrix](/reference/parity/), which tracks LaunchBox workflows and what is intentionally not replicated on Linux.
- The community: the project is open source (AGPL-3.0), and contributions that follow [Contributing](/project/contributing/) are welcome.

## What will not happen

A few things are ruled out by design, not just postponed: no OpenBox account, no vendor-hosted cloud library, no telemetry, no subscription, and no bundling of games, ROMs, or BIOS files. Local mounted-folder statistics and opt-in catalog synchronization remain available without a vendor account. If a request requires one of those ruled-out services, it will not be built.

## Related pages

- [Changelog](/changelog/)
- [Parity matrix](/reference/parity/)
- [Contributing](/project/contributing/)
- [Request a feature](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=feature_request.yml)
