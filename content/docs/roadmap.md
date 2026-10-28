---
title: Roadmap
description: What is in the current release, what is in progress, and how to shape what comes next.
sidebar: false
---

# Roadmap

OpenBox is maintained by one person in the open, so the roadmap is short and honest: what is in the current release, what is being worked on, and where new ideas come from. There are no dates and no promises beyond that.

## In the current release

The [changelog](/changelog/) is the accurate record. The current release is **1.19.1 — Platform parity**. The highlights below cover the 1.19 platform work first, then the 1.18.0 library work:

- **OpenBox on macOS.** A signed universal app bundle runs OpenBox natively on macOS 11 or newer, with its own Python, a WKWebView window, the tray, native dialogs, `openbox://` deeplinks, and the verified updater. See [macOS](/macos/).
- **Platform parity.** One server-computed capability contract hides Linux-only controls on Windows and macOS, the Windows battery reports real values, and the storefront list matches each host. See [API 1.19 changes](/reference/api/one-nineteen/).
- **A clearer first run.** The top bar folds four add actions into one **Add games** menu. The setup dialog, **Set up your library**, opens on a six-step quick path with the longer optional steps behind an **advanced** toggle, and **Help & shortcuts** (`F1` or `?`) adds a glossary and the real shortcut table. The empty library is one illustrated card, the details pane carries a three-step onboarding checklist, a **Jump back in** card offers the most recently played game, and Themes shows a swatch gallery before you apply one. The default palette separates the orange action colour from the teal focus colour, and Play Insights now sits below the grid. See [Getting started](/getting-started/).
- **Fix the platform, not every game.** The platform view renames a platform across its games, launch profiles, filter playlists, platform settings, and platform media, or deletes it after you type its name; deletion moves the games to Trash. A bulk platform change can move each selected game's media with the field update and report `media_errors` for retry. See [Organizing the library](/guides/library/organizing/).
- **A media queue that survives a restart.** Automatic imports queue poster, square, video, music, manual, and other artwork with global and per-platform limits. The queue is saved to disk and supports pause, resume, cancel, retry, and per-item errors. EmuMovies joins the media sources, and metadata searches can mix built-in and plugin providers in a preferred order. See [Metadata and media](/guides/metadata-and-media/).
- **Backups describe every file, and restore is selective.** Each archived save records its size, mode, modification time, and SHA-256. A version-history dialog lists older backups with add, overwrite, and unchanged counts, and the restore dialog lists the archive contents, supports a dry run, and restores only the checked files after a safety backup. See [Saves](/guides/sessions-saves-and-backups/saves/).
- **Plugins declare capabilities and ask for scoped access.** Manifests declare storefront, metadata, media, stats, emulator-settings, and discovery capabilities, and hooks can request read-only library, achievement, profile, activity, leaderboard, catalog, metadata, and media services in one round. Installed plugins can be repaired from their catalog entry without losing settings, stats, or trust. See [Plugins](/guides/plugins/).
- **Emulators, controllers, and Big Box are managed, not just detected.** The **Emulators & controllers** tool gains per-emulator settings with a managed flag, per-platform overrides, and install/version status; MAME and RetroArch settings render into launch arguments or `--appendconfig`; Settings → Controller records keyboard shortcuts and controller types. Big Box gains pointer, trackball, and spinner navigation, controllable video and sound, a reader that remembers its theme and spread, and 3D cassette and jewel-case models. See [Emulators and launching](/guides/emulators-and-launching/) and [Big Box and handhelds](/guides/big-box-and-handhelds/).
- **Imports, achievements, and fixes.** Startup scans report progress per source, stop after 30 seconds, and keep partial state. PICO-8, MSU-1, and WHDLoad join the source list; Steam games record whether their install folder still exists and offer an Install handoff or **Verify Steam files**; Steam achievements and MAME high scores import; and the public RetroArch netplay lobby is reachable from **Online play** and the Big Box menu. See [Import sources](/integrations/import-sources/) and [API 1.18 additions](/reference/api/one-eighteen/).

Earlier milestones include 1.17.0 — More of your library, and what it cost (native installed-game imports for GOG Galaxy, the EA app, and Ubisoft Connect on Windows, Game Night decks with a reproducible seed, price paid with cost per hour, translated server notices, and the ScreenScraper fix); 1.16.1 — Launch readiness everywhere (blocked and warning badges on the grid, one-button group fixes, Flatpak folder grants, a per-game RetroArch core, and launch definitions for 18 more systems); 1.16.0 — Make it true (the whole-library Launch Audit, restore preview, import decisions, and five security fixes that were not backported); 1.15.0 — Finish the surface (motion that respects `prefers-reduced-motion`, a readable light theme plus a sixth **High Contrast** theme, toasts that stay above dialogs, signed emulator definition updates, Time Machine compare, a Settings → About panel, a Windows uninstaller, and broader screen-reader and touch-target support); and 1.14.0 — Library intelligence (the 0–100 library health score, the Artwork Doctor, missing-file repair and duplicate merge, offline Game DNA search, Plugins 2.0, backlog management, effortless metadata after import, and the thumbnail chooser).

## Coming next

No feature is committed for the next release yet. The known limits in the 1.19.1 changelog and release notes are the honest list of open work rather than a promise:

- **A translation pass for the new first-run surfaces.** The Tools, Add games, help, setup, onboarding, and Jump back in text is English in Spanish, German, French, and Portuguese for this release. Existing translations remain, and native copy follows in a later pass.
- **Backup coverage boundaries.** Plugin service credentials and blank password-format plugin settings are excluded from backups.
- **The settings migration window.** `storefront_auto_import` values are now `{enabled, platform, include_uninstalled}` objects; older boolean values are still read until the next settings save migrates them.
- **Platform boundaries.** Xbox PC package scanning remains unavailable, Windows ARM64 remains out of scope, and the macOS bundle is not yet notarized.
- **Storefront auto-import scope.** Native storefront auto-import targets installed games by default; owned-but-uninstalled imports are an explicit per-source option.

Work in progress is tracked in the app repository: the [CHANGELOG](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/CHANGELOG.md) for shipped releases and [GitHub issues](https://github.com/vindeckyy/OpenBoxGL/issues) for planned work. New ideas come from the sources below.

## Where ideas come from

- GitHub issues, using the feature request template. The maintainer triages these directly.
- The [parity matrix](/reference/parity/), which tracks LaunchBox workflows and what is intentionally not replicated on Linux, Windows, and macOS — gamescope and Game Mode, AppImage and Flatpak packaging, XDG desktop integration, and Flathub-aware emulator management stay Linux-only.
- The community: the project is open source (AGPL-3.0), and contributions that follow [Contributing](/project/contributing/) are welcome.

## What will not happen

A few things are ruled out by design, not just postponed: no OpenBox account, no vendor-hosted cloud library, no telemetry, no subscription, and no bundling of games, ROMs, or BIOS files. Local mounted-folder statistics and opt-in catalog synchronization remain available without a vendor account. If a request requires one of those ruled-out services, it will not be built.

## Related pages

- [Changelog](/changelog/)
- [Parity matrix](/reference/parity/)
- [Contributing](/project/contributing/)
- [Request a feature](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=feature_request.yml)
