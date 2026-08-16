---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release, 1.3.0, is the plugin-sandbox and maintenance release: plugins run in bubblewrap with isolated namespaces and no network, falling back to opt-in `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` for trusted local plugins, while cloud sync, save/backup restore, launch, validation, and job handling were split into auditable helpers with new coverage. The 1.2.0 security and SteamOS release (Ed25519-signed artifacts, SteamOS startup fix, webhook/backup/7z/Gameyfin/media/environment hardening, exact-origin bridge) and the native-first work from 1.0.0 (native WebKitGTK window, batch metadata auto-match, Server-Sent Events, frozen v1 API contract, cover grouping) still underlie the app, and releases ship with SBOM and signing tooling.

## In progress

Work in progress is tracked in the app repository: the [CHANGELOG](https://github.com/vindeckyy/OpenBoxGL/blob/master/CHANGELOG.md) for shipped releases and [GitHub issues](https://github.com/vindeckyy/OpenBoxGL/issues) for planned work. New ideas come from the sources below.

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
