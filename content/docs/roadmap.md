---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release, 1.5.0, brings Proton and Wine prefix discovery and management, Faugus Launcher scanning and import, Eden Nintendo Switch emulator support, canonical identity deduplication across storefronts, expanded launch command variables (`{ImagePath}`, `{dir}`, `{EmulatorDir}`, etc.), Edit Game modal next/previous navigation, platform-scoped media cleanup, play statistics reset, smart capability playlist rules, and hardened synchronous background job lifecycle handling. Previous milestones include 1.4.0 (JavaScript module bundling and repository layout reorganization), 1.3.0 (bubblewrap plugin sandbox and refactored core helpers), 1.2.0 (Ed25519-signed artifacts, SteamOS startup fix, webhook/backup/7z/Gameyfin hardening), and 1.0.0 (native WebKitGTK window, batch metadata auto-match, Server-Sent Events, frozen v1 API contract, cover grouping), and releases continue shipping with complete SBOM and verification tooling.

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
