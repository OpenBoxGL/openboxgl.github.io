---
title: Handheld Hardware Matrix
description: Compatibility, performance flags, and configuration recommendations for Steam Deck, ROG Ally, Legion Go, and Linux handhelds.
---

OpenBox supports Linux gaming handheld workflows with gamepad navigation and SteamOS / gamescope integration. The profiles below are configuration guidance, not a performance guarantee for every device or image.

## Validation profiles

Release CI validates both x86_64 and aarch64 AppImages and the gamescope/native-host integration. The profiles below are configuration guidance for common Linux handhelds; they are not a claim that each physical model has been tested by the maintainer.

| Device | Display | OS / Distro | Recommended Mode | Notes |
| --- | --- | --- | --- | --- |
| **Steam Deck LCD** | 800p 60Hz | SteamOS 3.5+ | Big Box | Add the AppImage as a Non-Steam Game; use `--game-mode` when forcing guest behavior |
| **Steam Deck OLED** | 800p 90Hz HDR | SteamOS 3.5+ | Big Box | Use the installed display profile and validate refresh behavior locally |
| **ASUS ROG Ally / X** | 1080p 120Hz VRR | Bazzite / Nobara | Big Box 1080p | Configuration target; validate controller and TDP behavior on the installed image |
| **Lenovo Legion Go** | 1600p 144Hz | Bazzite / ChimeraOS | Big Box 1200p / 1600p | Touchscreen and gamepad hybrid navigation |
| **AYANEO / GPD Win** | 1080p 60Hz | Arch / Fedora / Ubuntu | Desktop / Big Box | Configuration target; validate Wayland/X11 controller behavior on the installed image |

## Adding OpenBox to SteamOS Game Mode

To run OpenBox directly in Steam Deck Gaming Mode:

1. Switch to **Desktop Mode** on your Steam Deck.
2. Open Steam -> **Games** -> **Add a Non-Steam Game to My Library...**
3. Select the AppImage matching the device architecture (`OpenBox-x86_64.AppImage` or `OpenBox-aarch64.AppImage`) from your downloads or installation directory.
4. Right-click the shortcut in Steam -> **Properties**:
   - **Launch Options**: `--game-mode`
5. Switch back to **Gaming Mode**. OpenBox will launch with full Steam Deck controller and gamescope overlay support.

## Performance & Battery Tuning

Power, frame pacing, and memory use depend on the installed image, browser/native host, display mode, library size, and running integrations. Use the [configuration guidance](/reference/configuration/) and [Handheld performance](/guides/big-box-and-handhelds/performance/) pages, then validate the result with the handheld's own TDP/FPS tools:
- **Display sizing**: use `--resolution <WxH>` or the supported fullscreen width/height options for a web/app-window launch when the viewport needs an explicit size.
- **Game Mode**: `--game-mode` selects the gamescope guest behavior; it is not a generic `--kiosk` or `--fullscreen` flag.
- **Sleep / resume safety**: confirm behavior on the installed host, especially while a game, capture job, or background import is active.
