---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release, 1.8.0, delivers keyboard and gamepad library navigation with hash routing, ScreenScraper per-ROM-hash scraping, custom user-defined gamescope presets with per-game override, library export to JSON/CSV, and aarch64 AppImage artifacts alongside x86_64. Previous milestones include 1.7.2 (full internationalization, an optional SQLite read model, gamescope deck presets with MangoHud toggle, BIOS SHA1 drift detection, a backup diff API, and a visual chip builder), 1.7.1 (Play Insights analytics, spacer-window grid virtualization, background search worker, FacetCache LRU, write coalescing, Launch Doctor fix actions), 1.7.0 (Library Setup Center with preview-before-commit, durable Activity Center operations, Launch Doctor preflight, additive v2 API, Flatpak packaging), 1.6.0 (modular state architecture, centralized launch tokens, accessible tools menu, dialog focus traps, CSP hardening), 1.5.1 (performance optimizations for large library state writes), 1.5.0 (Proton/Wine prefix management, Faugus Launcher, Eden Switch emulator), and 1.0.0 (native WebKitGTK window, Server-Sent Events, frozen v1 contract).

## In progress

Work in progress is tracked in the app repository: the [CHANGELOG](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/CHANGELOG.md) for shipped releases and [GitHub issues](https://github.com/vindeckyy/OpenBoxGL/issues) for planned work. New ideas come from the sources below.

## Where ideas come from

- GitHub issues, using the feature request template. The maintainer triages these directly.
- The [parity matrix](/reference/parity/), which tracks LaunchBox workflows and what is intentionally not replicated on Linux.
- The community: the project is open source (AGPL-3.0), and contributions that follow [Contributing](/project/contributing/) are welcome.

## What will not happen

A few things are ruled out by design, not just postponed: no OpenBox account, no cloud library, no telemetry, no subscription, and no bundling of games, ROMs, or BIOS files. If a request requires one of those, it will not be built.

## Related pages

- [Changelog](/changelog/)
- [Parity matrix](/reference/parity/)
- [Contributing](/project/contributing/)
- [Request a feature](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=feature_request.yml)
