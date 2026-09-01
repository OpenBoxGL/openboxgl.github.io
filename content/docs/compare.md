---
title: Compare
description: OpenBoxGL compared to LaunchBox and Windows-first launchers on Linux.
---

# Compare

OpenBoxGL exists because LaunchBox is Windows first and gates useful workflows behind Premium. This page uses the same source as the docs parity matrix and the README comparison, with no invented claims.

## At a glance

| Topic | OpenBoxGL 1.7.2 | LaunchBox on Linux |
| --- | --- | --- |
| License | AGPL-3.0, full source on GitHub | Proprietary, no Linux build |
| Cost | Free, no subscription | Premium paywall for advanced workflows |
| Data | Local JSON at `~/.local/share/openbox-game-launcher/library.json`, no account | Cloud library for Premium |
| Linux native | Steam, Heroic, Lutris, Faugus, RetroArch, ROMs, Arcade, ScummVM, RPCS3, Vita3K, Eden | Windows first, runs on Linux through compatibility layers |
| Automation | Local REST API on loopback with per-launch token auth | Limited external automation surface |
| Handheld | Big Box Stage, Hybrid, CoverFlow with controller mapping, AppImage on immutable systems, `--game-mode` guest under gamescope | Big Box exists, handheld flows are secondary |

See the full capability matrix with acceptance checks in [Parity matrix](/reference/parity/) and the source matrix at [OpenBoxGL/PARITY.md](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/PARITY.md).

## What ships free

Every LaunchBox Premium equivalent ships without a subscription in OpenBoxGL: custom fields, ESRB filters, list view, media packs, and cloud statistics sync. `premium_features_free: true` is set in settings and bundled media packs require no license gate. See [Parity matrix](/reference/parity/) for the evidence row.

## Intentionally not replicated

| LaunchBox feature | OpenBox decision |
| --- | --- |
| Windows shell replacement | Not applicable on Linux desktop environments |
| LEDBlinky and cabinet LED control | Use external Linux arcade I/O tools instead |
| Teknoparrot arcade launcher | Use Lutris and Wine launch profiles for supported titles |
| Native Xbox PC package scanning | Use Heroic, Lutris, and Xbox Cloud entries instead |
| Bundled proprietary media packs | Replaced by free bundled media packs in OpenBox |
| LaunchBox Premium cloud library | Replaced by mounted folder sync plus local backups |
| LaunchBox online theme storefront | Replaced by local CSS theme import and open folder workflow |

## How to verify

- Check the current release tag at [Releases](https://github.com/vindeckyy/OpenBoxGL/releases/latest), currently v1.7.2.
- Open PARITY.md in the application repository and confirm the acceptance check for any row before relying on it.
- For pricing, LaunchBox Premium pricing is published by Unbroken Software. OpenBox cost is zero and source is AGPL-3.0 at [LICENSE](https://github.com/vindeckyy/OpenBoxGL/blob/master/LICENSE).
