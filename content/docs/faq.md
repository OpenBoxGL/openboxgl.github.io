---
title: FAQ
description: Frequently asked questions about OpenBox, its data, and its limits.
sidebar: false
---

# Frequently asked questions

## Does OpenBox include games or ROMs?

No. OpenBox does not distribute games, ROMs, BIOS files, firmware, or DRM circumvention tools. You supply the files; OpenBox catalogs, launches, and tracks them.

## Does it require an online account?

No OpenBox account is required. Optional integrations may have their own accounts, credentials, API terms, and rate limits. RetroAchievements and EmuMovies use your existing accounts, and metadata syncing talks to the public LaunchBox Games Database with your consent.

## What operating systems are supported?

OpenBox targets Linux desktops, laptops, Steam Deck systems, and handheld PCs on **x86_64 and aarch64**. Release artifacts are built for both architectures — pick the AppImage matching `uname -m`, and the built-in updater only offers the artifact matching the running architecture. Source installs require Python 3.10 or newer; the AppImage bundles its own Python runtime. See [Installation](/install/).

## Is my data sent anywhere?

No. Nothing leaves your machine unless you explicitly trigger an integration: a metadata sync, a media download, a webhook delivery, or statistics sync to a folder you choose. There is no telemetry, no crash reporting, and no OpenBox account. The server binds to loopback only.

## Can I run it alongside Steam, Heroic, and Lutris?

Yes. OpenBox reads their manifests and launches through them (`steam -applaunch`, `heroic://`, `lutris:rungameid`), so Steam Input, overlays, and client features keep working. It does not replace them.

## Where does my library live?

The default data directory is `~/.local/share/openbox-game-launcher`. The library is `library.json` with a last-known-good `.bak` beside it, written atomically with owner-only permissions. Set `OPENBOX_DATA_DIR` before starting OpenBox to relocate it. See [Interfaces and data](/interfaces-and-data/).

## How do I get my saves backed up?

Use the **Save management** panel in a game's detail pane: scan for save locations, then back up. Versioned archives are stored under the game's folder in the data directory, with retention limits. Restore writes a safety backup first. See [Save discovery and restore](/guides/sessions-saves-and-backups/saves/).

## How do I add an emulator?

Open the **Emulators** dialog, pick one from the catalog, and choose **Install**. OpenBox adds the Flathub remote if missing and writes the platform profiles when the install finishes. Native binaries on PATH are detected automatically. See [Emulators and launching](/guides/emulators-and-launching/).

## Do I need a LaunchBox subscription?

No. OpenBox is free and open source (AGPL-3.0). The workflows that LaunchBox gates behind Premium, like custom fields, ESRB filters, list view, media packs, and cloud statistics sync, ship free here. The capability matrix lives in [Parity](/reference/parity/).

## Can I use a gamepad?

Yes. Since 1.8.0 the library grid and list support full keyboard and gamepad navigation (arrows/Home/End/Page, `f` favorite, Escape clear) with a configurable controller map, and Big Box is controller-native. See [Library navigation](/guides/library/navigation/) and [Big Box and handhelds](/guides/big-box-and-handhelds/).

## Does it work on the Steam Deck?

Yes. The AppImage works on SteamOS and Bazzite, and `--game-mode` runs OpenBox as a guest inside Steam's gamescope session so Steam Input, the Quick Access Menu, and MangoHud stay with Steam. See [Steam Game Mode](/guides/big-box-and-handhelds/#steam-game-mode-handhelds).

## Can I script or automate it?

Yes. A token-authenticated REST API covers library, launch, saves, backups, themes, plugins, and automation. Python plugins hook library loads, before_launch, and after_session. Webhooks deliver HMAC-signed events. See [REST API](/reference/api/), [Plugins](/guides/plugins/), and [Webhooks](/integrations/webhooks/).

## How is OpenBox related to LaunchBox or the Openbox window manager?

OpenBox is an independent open-source project. It is not affiliated with LaunchBox, Unbroken Software, LLC, or the Openbox window manager. Those names appear only to describe compatibility and comparison boundaries. See [Legal and trademarks](/policies/legal-and-trademarks/).

## Where do I report a bug or request a feature?

Use the GitHub issue templates: [report a bug](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=bug_report.yml) or [request a feature](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=feature_request.yml). Include the diagnostic log from Settings > Copy diagnostic log; it redacts tokens and passwords but can include game names and file paths.

## Related pages

- [Installation](/install/)
- [Getting started](/getting-started/)
- [Troubleshooting](/guides/troubleshooting/)
