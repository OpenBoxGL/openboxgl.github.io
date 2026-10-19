---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release is **1.17.0 — More of your library, and what it cost**:

- **Your other Windows launchers, in the library.** GOG Galaxy, the EA app, and Ubisoft Connect games installed on Windows import from their registry entries and launcher manifests, merge by a stable provider id, and launch the way their launcher expects. GOG runs its executable directly; EA and Ubisoft use their registered URI handlers. Malformed entries are skipped with a reason instead of crashing the import. Imports are manual, and owned-but-uninstalled catalogs are not included. See [Import sources](/integrations/import-sources/) and [API 1.17 additions](/reference/api/one-seventeen/).
- **Game Night decks.** Save a setup — players, minute budget, and a filter query — under a name and reuse it. Up to 20 decks are kept. Every draw returns an eight-character seed, and the same seed and library reproduce the same queue on another device. See [Big Box and handhelds](/guides/big-box-and-handhelds/).
- **What the library cost.** A game can record a price paid and its currency. Play Insights groups totals by currency and shows cost per hour for played, priced games; the detail pane shows the price and rate; Bulk Edit can set or clear a price. No exchange-rate source is used and no conversion is performed. The new `currency` setting picks the default for new prices. See [Play Insights](/guides/library/insights/).
- **Notices in your language.** Cloud sync, launch-check changes, rejected definition packs, and webhook failures now carry translation keys and parameters, and the notification center renders them in all five locales. Notifications stored by older versions keep their English text.
- **ScreenScraper works again.** Requests now use the parameter names the API reads, the Test button calls the correct endpoint, and a ScreenScraper developer ID and password are documented as required. See [Configuration](/reference/configuration/).

Earlier milestones include 1.16.1 — Launch readiness everywhere (blocked and warning badges on the grid, one-button group fixes, Flatpak folder grants, a per-game RetroArch core, and launch definitions for 18 more systems); 1.16.0 — Make it true (the whole-library Launch Audit, restore preview, import decisions, and five security fixes that were not backported); 1.15.0 — Finish the surface (motion that respects `prefers-reduced-motion`, a readable light theme plus a sixth **High Contrast** theme, toasts that stay above dialogs, signed emulator definition updates, Time Machine compare, a Settings → About panel, a Windows uninstaller, and broader screen-reader and touch-target support); and 1.14.0 — Library intelligence (the 0–100 library health score, the Artwork Doctor, missing-file repair and duplicate merge, offline Game DNA search, Plugins 2.0, backlog management, effortless metadata after import, and the thumbnail chooser).

## Coming next

No feature is committed for the next release yet. The gaps named in 1.17.0's own release notes are the honest list of open work rather than a promise:

- **More storefront coverage.** Xbox PC package scanning and owned-but-uninstalled GOG, EA, and Ubisoft catalogs are not imported. The installed-game imports are manual and offline.
- **Portability limits.** Windows ARM64 and macOS remain out of scope. Price paid, provider ids, and Game Night decks stay local and do not cross the library-sync protocol; Time Machine does not journal price changes.
- **Launcher dependencies.** GOG games launch their executable directly, so Galaxy overlay and cloud saves are not started. EA and Ubisoft games need their launcher registered, and uninstalling it breaks those launches until it returns.
- **Household presence** (nobody-is-playing-what-right-now) remains deferred; it needs a transport ADR and a privacy review before it can be designed.

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
