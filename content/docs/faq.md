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

OpenBox targets **Linux** and **Windows x86_64** as of 1.13.0.

- **Linux:** desktops, laptops, Steam Deck systems, and handheld PCs on x86_64 and aarch64. Release artifacts are built for both architectures — pick the AppImage matching `uname -m`, and the built-in updater only offers the artifact matching the running architecture. Source installs require Python 3.10 or newer; the AppImage bundles its own Python runtime.
- **Windows:** x86_64 only, installed from the signed portable package with `install.ps1`. Windows PowerShell 5.1 is enough; the installer needs neither curl nor OpenSSL.

Linux stays the primary distro-integration target. See [Installation](/install/) and [Windows](/windows/).

## What are the requirements?

The runtime is dependency-free on both platforms: standard library only (plus `ctypes` on Windows), no `pip install`, no `requirements.txt`, and no virtualenv.

| Platform | Install | Requirements |
| --- | --- | --- |
| Linux | AppImage, Flatpak, or source | Python 3.10+ for source installs (the AppImage bundles its own); WebKitGTK for the native window |
| Windows | Signed portable package via `install.ps1` | Windows x86_64, Windows PowerShell 5.1; the WebView2 runtime for the native window (present on Windows 11 and most Windows 10 systems) |

## Does OpenBox run on Windows?

Yes, since 1.13.0. Windows x86_64 installs from the signed portable package using the published `install.ps1`, which verifies the release key, the archive checksum, and its Ed25519 signature before extracting to `%LOCALAPPDATA%\OpenBox`.

The launchers `openbox.cmd` and `openbox.ps1` start the app; `--web` forces the browser app window. The native window is WebView2 and is **built from source**, not shipped compiled: `powershell -File scripts/build_native_host_windows.ps1` builds `native_host.exe` from `native_host_win.c` and needs the MSVC toolchain with the C++ workload. Until that binary exists, the launchers open the same UI in a browser app window, so Windows works out of the box either way. Python is found as `python.exe` / `py.exe` on PATH or via `OPENBOX_PYTHON`.

Windows gains the same adapters and launch tooling as Linux, because every bundled emulator definition carries its Windows executable name. These stay Linux-only: gamescope and Steam Game Mode, AppImage and Flatpak packaging, XDG desktop entries, `sudo make install`, Steam Deck / handheld tuning, and Flathub-aware emulator management. See [Windows](/windows/).

## Is my data sent anywhere?

No. Nothing leaves your machine unless you explicitly trigger an integration: a metadata sync, a media download, a webhook delivery, statistics sync, or opt-in catalog sync to a folder you choose. There is no telemetry, no crash reporting, and no OpenBox account. The server binds to loopback only.

## Can I run it alongside Steam, Heroic, and Lutris?

Yes. OpenBox reads their manifests and launches through them (`steam -applaunch`, `heroic://`, `lutris:rungameid`), so Steam Input, overlays, and client features keep working. It does not replace them. On Windows the same applies to the storefront clients you already run there; the manifest-import adapters are unchanged.

## Where does my library live?

The default data directory is `~/.local/share/openbox-game-launcher` on Linux and `%LOCALAPPDATA%\openbox-game-launcher` on Windows. The layout is the same on both platforms: `library.json` with a last-known-good `.bak` beside it, written atomically with owner-only permissions, plus `server.token`, `server.port`, media, backups, themes, and logs.

Set `OPENBOX_DATA_DIR` before starting OpenBox to relocate it. A library directory moves between platforms unchanged: copy the folder and point `OPENBOX_DATA_DIR` at it, since the files are the same on both systems. See [Interfaces and data](/interfaces-and-data/).

## How do I get my saves backed up?

Use the **Save management** panel in a game's detail pane: scan for save locations, then back up. Versioned archives are stored under the game's folder in the data directory, with retention limits. Restore writes a safety backup first. See [Save discovery and restore](/guides/sessions-saves-and-backups/saves/).

## How do I add an emulator?

Open the **Emulators** dialog, pick one from the catalog, and choose **Install**. On Linux, OpenBox adds the Flathub remote if missing and writes the platform profiles when the install finishes. On Windows, install the Windows build of the emulator yourself; OpenBox detects the executable and writes the same platform profiles from the definition's Windows executable name. Native binaries on PATH are detected automatically on both platforms. See [Emulators and launching](/guides/emulators-and-launching/).

## Do I need a LaunchBox subscription?

No. OpenBox is free and open source (AGPL-3.0). The workflows that LaunchBox gates behind Premium, like custom fields, ESRB filters, list view, media packs, and cloud statistics sync, ship free here. The capability matrix lives in [Parity](/reference/parity/).

## Can I use a gamepad?

Yes. Since 1.8.0 the library grid and list support full keyboard and gamepad navigation (arrows/Home/End/Page, `f` favorite, Escape clear) with a configurable controller map, and Big Box is controller-native. See [Library navigation](/guides/library/navigation/) and [Big Box and handhelds](/guides/big-box-and-handhelds/).

## Does it work on the Steam Deck?

Yes. The AppImage works on SteamOS and Bazzite, and `--game-mode` runs OpenBox as a guest inside Steam's gamescope session so Steam Input, the Quick Access Menu, and MangoHud stay with Steam. Steam Deck and handheld tuning are Linux-only: Windows has no gamescope, Game Mode, or handheld power/display tuning equivalent. See [Steam Game Mode](/guides/big-box-and-handhelds/#steam-game-mode-handhelds).

## How do I update OpenBox?

Linux builds update in place through the built-in updater, which verifies the release key, checksum, and signature and only offers the artifact matching the running architecture.

Windows updates use the same verification ladder in pure Python — no OpenSSL — download `OpenBox-<arch>-windows.zip`, and swap the installed tree; the previous tree stays at `<InstallDir>\share\openbox.previous` for rollback.

## Do I need Wine or Proton?

OpenBox does not require Wine or Proton on either platform. On Windows, games run natively. On Linux, Windows-only titles run through the compatibility layer you already use, such as Steam Play or a Lutris Wine profile, and OpenBox launches them through that client. OpenBox itself stays standard-library-only and bundles no compatibility layer of its own.

## Can I script or automate it?

Yes. A token-authenticated REST API covers library, launch, saves, backups, themes, plugins, and automation. Python plugins hook library loads, before_launch, and after_session. Webhooks deliver HMAC-signed events. See [REST API](/reference/api/), [Plugins](/guides/plugins/), and [Webhooks](/integrations/webhooks/).

## How is OpenBox related to LaunchBox or the Openbox window manager?

OpenBox is an independent open-source project. It is not affiliated with LaunchBox, Unbroken Software, LLC, or the Openbox window manager. Those names appear only to describe compatibility and comparison boundaries. See [Legal and trademarks](/policies/legal-and-trademarks/).

## What's new in 1.11 through 1.13?

**1.11 (Every Second Counts):** Quick Resume, Moments, clips/reels, Time Machine, Backlog Radio, Arcade Room/Museum kiosk, Household, Steam Bridge, ES-DE migration, SteamGridDB artwork, and local launcher trophies — see [API 1.11 additions](/reference/api/one-eleven/). **1.12 (Living Library):** smart collections, per-game Story timelines, per-game `launch_env`/`launch_confirm`, opt-in weekly backups, SQLite self-enable at 5,000 games, palette recents, and the Living Library overview on the [home page](/) — see [API 1.12 additions](/reference/api/one-twelve/). **1.13 (Windows support):** Windows x86_64 with the signed portable `install.ps1`, a WebView2 native window built from source, the same updater verification on Windows, and Windows executable names in every bundled emulator definition — see [Windows](/windows/) and the [release notes](/changelog/). Linux fixes in 1.13: process liveness no longer uses `os.kill(pid, 0)`, stored references use POSIX separators on Windows, and the metadata database closes cached SQLite handles before replacing the file.

## Where do I report a bug or request a feature?

Use the GitHub issue templates: [report a bug](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=bug_report.yml) or [request a feature](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=feature_request.yml). Include the diagnostic log from Settings > Copy diagnostic log; it redacts tokens and passwords but can include game names and file paths.

## Related pages

- [Installation](/install/)
- [Windows](/windows/)
- [Updating](/updating/)
- [Getting started](/getting-started/)
- [Troubleshooting](/guides/troubleshooting/)
