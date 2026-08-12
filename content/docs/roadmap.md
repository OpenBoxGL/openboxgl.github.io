---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The headline pieces in 0.8.x are the failed-launch clarity (a game with no command or a missing executable fails before anything runs, and the UI reports the real session outcome), emulator installs that no longer abort on an existing Flathub remote, and handheld performance profiles that apply TDP via `ryzenadj` on Deck and battery-powered handhelds.

## In progress

The Unreleased section of the app changelog tracks the next batch. Right now that is the web UI surfaces for the persistent play queue, normalized game tags, the Notification Center, and signed webhook settings, plus the `/api/queue`, `/api/tags`, `/api/notifications`, and `/api/webhooks` contracts with bounded state, secret redaction, and destination validation.

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
