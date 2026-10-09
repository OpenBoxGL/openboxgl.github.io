---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release is **1.16.1**, a fix release on the **1.16.0 — Make it true** line:

- **Know which games will not launch, before you try them.** Library health gains **Check every game**: the Launch Doctor runs over your whole library in the background, and problems come back grouped by cause, so 412 games blocked by one missing emulator read as a single line with one **Install** button. See [Emulators and launching](/guides/emulators-and-launching/#check-every-game-v1160).
- **See what a restore will do before you do it.** Backups gain **Preview changes**: what the restore would remove, bring back, and overwrite field by field. The Restore button only appears after a preview loads. See [Sessions, saves, and backups](/guides/sessions-saves-and-backups/#preview-a-restore-before-you-restore).
- **Safer by default.** 1.16.0 closes five security defects, including an arbitrary `.json` read through a crafted request and a file write through a game's ROM name. They are **not** backported — if you are on 1.15.x or older, upgrading is the fix. See [Security](/policies/security/).
- **Imports you can trust.** Games the wizard is unsure about wait for your decision instead of being imported on a guess, your own `.m3u` playlists are never overwritten, and LaunchBox/ES-DE applies confirm with exact counts first.
- **Launch readiness everywhere (1.16.1).** Games that will not launch are badged on the grid, a group sharing one fix gets one button, a Flatpak folder grant is offered instead of "reinstall", and a game can pick its own RetroArch core.
- **Every system out of the box (1.16.1).** Launch definitions for 18 more systems, and the definition pack is signed and released with each tag.

Earlier milestones include 1.15.0 — Finish the surface (motion that respects `prefers-reduced-motion`, a readable light theme plus a sixth **High Contrast** theme, toasts that stay above dialogs, signed emulator definition updates, Time Machine compare, a Settings → About panel, a Windows uninstaller, and broader screen-reader and touch-target support), 1.14.0 — Library intelligence (the 0–100 library health score, the Artwork Doctor, missing-file repair and duplicate merge, offline Game DNA search, Plugins 2.0 with per-plugin trust and settings forms, backlog management with your own star ratings and manual playtime, effortless metadata after import, ScreenScraper ROM-hash confidence, the thumbnail chooser, the Big Box boot option and on-screen keyboard, and Steam Bridge artwork), 1.13.1 — Fixes (the sweep that made the Windows wizard, dialogs, and session handling usable), 1.13.0 — Windows (a signed portable `install.ps1`, the WebView2 native window shipped compiled, and a data directory at `%LOCALAPPDATA%\openbox-game-launcher`), 1.12.1 — Hardening, 1.12.0 — Living Library, 1.11.0 (Quick Resume, Moments, Time Machine, Backlog Radio, Arcade Room, Household, Steam Bridge, ES-DE import, SteamGridDB, and local trophies), 1.10.0 (review-first LaunchBox XML migration, manual shelf entries, causal catalog sync, and launch hardening), 1.9.0 (picker, Constellation, Wrapped, Timeline, Mastery, Game Night, video snaps, and Mood Match), 1.8.0, 1.7.x (Setup Center, Activity Center, Launch Doctor, and the additive v2 API), 1.5.1 (large-library write optimizations), 1.5.0 (Proton/Wine prefix management, Faugus Launcher, and Eden Switch), and 1.0.0 (native WebKitGTK window, Server-Sent Events, and the frozen v1 contract).

## Coming next

Two things are genuinely not shipped yet, and both are named in the application's own release notes rather than guessed at here:

- **Deck Builder for Game Night.** A deck builder for Game Night is still not shipped — the application's own plan records it as a third deferral, with the maintainer yet to confirm whether it is cancelled outright. Everything else in that mode — the couch queue, the wheel, the up-next strip, persistent rounds, and gamepad and keyboard control — is already in the current release; see [Big Box and handhelds](/guides/big-box-and-handhelds/).
- **Emulator definition updates, live.** The update channel, its verification, its UI, and the packaging script shipped in 1.15.0, and since 1.16.1 the release workflow builds, signs, and verifies `community-defs.tar.gz` and uploads it with its signature and `index.json` to the [`emulator-defs` release](https://github.com/vindeckyy/OpenBoxGL/releases/tag/emulator-defs), which OpenBox checks for updates. The first signed pack is published. Until one is available for your platform, the panel in Tools → Emulators says plainly that no pack has been published yet — that is a normal state, not an error.

Most of the rest of the previous list shipped: Time Machine compare, the Artwork Doctor, the sixth high-contrast theme, signed emulator-definition updates, missing-file repair, and duplicate merge are in 1.14.0 and 1.15.0 and are written up in the [changelog](/changelog/). Two items on that list are **not** shipped: household presence (nobody-is-playing-what-right-now) is deferred and needs a transport ADR and a privacy review, and there are no first-run tips — the What's New dialog and the Library Setup Center open only when you ask for them. The only one-time prompt that ships is "Mark as Playing?", an optional backlog-progress suggestion from 1.14.0 with a settings kill switch, not a first-run tip. The application repository's own planning documents, not this page, are where the deferred items are tracked.

Work in progress is tracked in the app repository: the [CHANGELOG](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/CHANGELOG.md) for shipped releases and [GitHub issues](https://github.com/vindeckyy/OpenBoxGL/issues) for planned work. New ideas come from the sources below.

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
