---
title: Compare
description: OpenBoxGL compared to LaunchBox and Windows-first launchers on Linux and Windows.
---

# Compare

OpenBoxGL exists because LaunchBox is Windows first and gates useful workflows behind Premium. This page uses the same source as the docs parity matrix and the README comparison, with no invented claims.

Since 1.13.0 OpenBoxGL runs on **Linux and Windows x86_64**, so the comparison below covers both. Linux remains the primary distro-integration target; the Linux-only boundaries are named in the rows that follow.

## At a glance

| Topic | OpenBox 1.13.0 | LaunchBox |
| --- | --- | --- |
| License | AGPL-3.0, full source on GitHub | Proprietary |
| Cost | Free, no subscription | Premium paywall for advanced workflows |
| Platform | Linux x86_64 and aarch64; Windows x86_64 | Windows first, no Linux build |
| Install | AppImage, Flatpak, or source on Linux; signed portable package via `install.ps1` on Windows | Windows installer only |
| Data | Local JSON at `~/.local/share/openbox-game-launcher/library.json` on Linux, `%LOCALAPPDATA%\openbox-game-launcher\library.json` on Windows; no account | Cloud library for Premium |
| Game sources | Steam, Heroic, Lutris, Faugus, RetroArch, ROMs, Arcade, ScummVM, RPCS3, Vita3K, Eden | Windows-first imports |
| Native window | WebKitGTK on Linux; WebView2 on Windows, shipped compiled in the portable release (source checkouts build it with `scripts/build_native_host_windows.ps1`) | Windows-only desktop app |
| Automation | Local REST API on loopback with per-launch token auth | Limited external automation surface |
| Handheld | Big Box Stage, Hybrid, CoverFlow with controller mapping, AppImage on immutable systems, `--game-mode` guest under gamescope — Linux only | Big Box exists, handheld flows are secondary |
| Windows emulators | Every bundled emulator definition carries its Windows executable name, so adapter detection, resume state, and Launch Doctor work with Windows builds | Windows-native emulator support |

Linux-only, with no Windows equivalent: gamescope and Steam Game Mode, AppImage and Flatpak packaging, XDG desktop entries, `sudo make install`, Steam Deck / handheld tuning, and Flathub-aware emulator management. The Windows path is documented in [Windows](/windows/); install steps for both platforms are in [Installation](/install/).

See the full capability matrix with acceptance checks in [Parity matrix](/reference/parity/) and the source matrix at [OpenBoxGL/PARITY.md](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/PARITY.md).

## What ships free

Every LaunchBox Premium equivalent ships without a subscription in OpenBoxGL: custom fields, ESRB filters, list view, media packs, and cloud statistics sync. `premium_features_free: true` is set in settings and bundled media packs require no license gate. See [Parity matrix](/reference/parity/) for the evidence row.

## Intentionally not replicated

| LaunchBox feature | OpenBox decision |
| --- | --- |
| Windows shell replacement | Not applicable: OpenBox is a launcher, not a shell replacement on either platform |
| LEDBlinky and cabinet LED control | Use external arcade I/O tools instead of a bundled integration |
| Teknoparrot arcade launcher | Use Lutris and Wine launch profiles on Linux, or a per-game launch profile pointing at the title's own launcher |
| Native Xbox PC package scanning | Use Heroic and Lutris on Linux, or import the installed executable as a standalone game |
| Bundled proprietary media packs | Replaced by free bundled media packs in OpenBox |
| LaunchBox Premium cloud library | Replaced by OpenBox's local mounted-folder statistics sync and opt-in catalog sync plus local backups (no LaunchBox account involved) |
| LaunchBox online theme storefront | Replaced by local CSS theme import and open folder workflow |

## How to verify

- Check the current release tag at [Releases](https://github.com/vindeckyy/OpenBoxGL/releases/latest), currently v1.13.0.
- For Windows, the same release publishes `OpenBox-x86_64-windows.zip` with its `.sha256` and `.sig`, plus `install.ps1`; the installer verifies all three before extracting. The full path is in [Windows](/windows/).
- Open PARITY.md in the application repository and confirm the acceptance check for any row before relying on it.
- For pricing, LaunchBox Premium pricing is published by Unbroken Software. OpenBox cost is zero and source is AGPL-3.0 at [LICENSE](https://github.com/vindeckyy/OpenBoxGL/blob/master/LICENSE).
