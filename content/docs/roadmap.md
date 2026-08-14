---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The headline pieces in 1.0.0 are the native-first release: a native WebKitGTK window that renders the same UI as the web app (no browser tab, no separate Tk interface), batch LaunchBox metadata auto-match, Server-Sent Events for session and job updates, a frozen v1 API contract, and cover grouping in the library grid. The desktop UI opens in the native window by default, and releases ship with SBOM and signing tooling.

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
