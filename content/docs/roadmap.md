---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release, 1.7.1, delivers local-first Play Insights analytics (366-day heatmap, streaks, momentum), DOM spacer-window grid virtualization with smooth 60 FPS scrolling for 20,000 games, background search worker offloading, FacetCache LRU, write coalescing, structured Launch Doctor `fix_action` buttons, and 9 new theme tokens. Previous milestones include 1.7.0 (Library Setup Center with preview-before-commit, durable Activity Center operations backed by `operations.json`, Launch Doctor preflight, additive v2 API, and Ubuntu 22.04 / Flatpak 25.08 packaging), 1.6.0 (modular state architecture decomposition, centralized launch tokens, accessible tools menu, dialog focus traps, CSP hardening), 1.5.1 (performance optimizations for large library state writes), 1.5.0 (Proton/Wine prefix management, Faugus Launcher, Eden Switch emulator), and 1.0.0 (native WebKitGTK window, Server-Sent Events, frozen v1 contract).

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
