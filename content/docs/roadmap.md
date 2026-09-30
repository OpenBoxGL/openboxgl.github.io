---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release is **1.15.0 — Finish the surface**:

- **Motion that respects you.** Every duration and easing is a token and one `prefers-reduced-motion` block zeroes all of them, so a system setting makes the whole interface static rather than most of it. Dialogs animate out as well as in, a theme switch cross-fades, covers reserve their space and fade in, and typing in search no longer replays the whole grid's entrance. See [Themes](/themes/#motion-and-reduced-motion).
- **A light theme you can actually read,** and a sixth stock theme: **High Contrast**, at 21:1 body text. Every theme is now checked for readable contrast automatically instead of being trusted. See [Themes](/themes/).
- **Toasts that stay put,** above dialogs and Big Box rather than behind them, and an Undo that another message can no longer overwrite.
- **Emulator definition updates.** Tools → Emulators checks for, installs, and rolls back a signed community definition pack, and never overwrites a definition you edited. See [Emulators and launching](/guides/emulators-and-launching/#emulator-definition-updates).
- **Time Machine Compare** between two dates, a **Settings → About** panel, and a **Windows uninstaller** that removes the install and leaves your library alone. See [Library Time Machine](/guides/library/time-machine/#compare-two-points-in-time) and [Windows](/windows/).
- **Better for everyone.** Screen readers hear the real size of your library, Big Box announces itself properly, job progress is exposed, touch targets are larger, and high-contrast system modes are supported.

Earlier milestones include 1.14.0 — Library intelligence (the 0–100 library health score, the Artwork Doctor, missing-file repair and duplicate merge, offline Game DNA search, Plugins 2.0 with per-plugin trust and settings forms, backlog management with your own star ratings and manual playtime, effortless metadata after import, ScreenScraper ROM-hash confidence, the thumbnail chooser, the Big Box boot option and on-screen keyboard, and Steam Bridge artwork), 1.13.1 — Fixes (the sweep that made the Windows wizard, dialogs, and session handling usable), 1.13.0 — Windows (a signed portable `install.ps1`, the WebView2 native window shipped compiled, and a data directory at `%LOCALAPPDATA%\openbox-game-launcher`), 1.12.1 — Hardening, 1.12.0 — Living Library, 1.11.0 (Quick Resume, Moments, Time Machine, Backlog Radio, Arcade Room, Household, Steam Bridge, ES-DE import, SteamGridDB, and local trophies), 1.10.0 (review-first LaunchBox XML migration, manual shelf entries, causal catalog sync, and launch hardening), 1.9.0 (picker, Constellation, Wrapped, Timeline, Mastery, Game Night, video snaps, and Mood Match), 1.8.0, 1.7.x (Setup Center, Activity Center, Launch Doctor, and the additive v2 API), 1.5.1 (large-library write optimizations), 1.5.0 (Proton/Wine prefix management, Faugus Launcher, and Eden Switch), and 1.0.0 (native WebKitGTK window, Server-Sent Events, and the frozen v1 contract).

## Coming next

Two things are genuinely not shipped yet, and both are named in the application's own release notes rather than guessed at here:

- **Deck Builder for Game Night.** A deck builder for Game Night is a candidate for 1.16 — the application's own plan records it as a third deferral with the maintainer yet to confirm whether it defers to 1.16 or is cancelled outright. Everything else in that mode — the couch queue, the wheel, the up-next strip, persistent rounds, and gamepad and keyboard control — is already in the current release; see [Big Box and handhelds](/guides/big-box-and-handhelds/).
- **The first signed emulator-definition pack.** The update channel, its verification, its UI, and the packaging script all shipped in 1.15.0. Publishing the first pack is a maintainer step, because it needs the private half of the release key, and it is published separately from the application release. Until it exists, the panel in Tools → Emulators says plainly that no pack has been published yet — that is a normal state, not an error.

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
