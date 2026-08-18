---
title: Handheld Hardware Matrix
description: Compatibility, performance flags, and configuration recommendations for Steam Deck, ROG Ally, Legion Go, and Linux handhelds.
---

OpenBox is optimized for Linux gaming handhelds, offering full game-pad navigation, low power draw, and SteamOS / gamescope integration.

## Tested Devices

| Device | Display | OS / Distro | Recommended Mode | Notes |
| --- | --- | --- | --- | --- |
| **Steam Deck LCD** | 800p 60Hz | SteamOS 3.5+ | Big Box Kiosk | Add as Non-Steam Game with `--kiosk` flag |
| **Steam Deck OLED** | 800p 90Hz HDR | SteamOS 3.5+ | Big Box Kiosk | Native 90 FPS CoverFlow animations |
| **ASUS ROG Ally / X** | 1080p 120Hz VRR | Bazzite / Nobara | Big Box 1080p | Full controller and TDP mapping supported |
| **Lenovo Legion Go** | 1600p 144Hz | Bazzite / ChimeraOS | Big Box 1200p / 1600p | Touchscreen and gamepad hybrid navigation |
| **AYANEO / GPD Win** | 1080p 60Hz | Arch / Fedora / Ubuntu | Desktop / Big Box | Full Wayland and X11 controller support |

## Adding OpenBox to SteamOS Game Mode

To run OpenBox directly in Steam Deck Gaming Mode:

1. Switch to **Desktop Mode** on your Steam Deck.
2. Open Steam -> **Games** -> **Add a Non-Steam Game to My Library...**
3. Select `OpenBox-x86_64.AppImage` from your downloads or installation directory.
4. Right-click the shortcut in Steam -> **Properties**:
   - **Launch Options**: `--kiosk --fullscreen`
5. Switch back to **Gaming Mode**. OpenBox will launch with full Steam Deck controller and gamescope overlay support.

## Performance & Battery Tuning

OpenBox uses minimal idle CPU (under 0.5%) and ~65MB of RAM:
- **Frame Limiting**: OpenBox honors system refresh rates (60Hz / 90Hz / 120Hz).
- **GPU Acceleration**: Uses hardware WebGL and CSS 3D transforms for 60+ FPS cover navigation even at 3W TDP.
- **Sleep / Resume Safety**: OpenBox automatically pauses background scans and timers when the device suspends.
