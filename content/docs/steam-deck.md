---
title: Steam Deck and handhelds
description: Run OpenBox on Steam Deck, Bazzite, and handheld PCs, in Game Mode or on the desktop.
sidebar: false
---

# Steam Deck and handhelds

OpenBox targets Steam Deck, Bazzite, and other Linux handheld PCs. On the desktop it behaves like any Linux app; in Steam Game Mode it runs as a guest inside Steam's gamescope session so Steam Input, the Quick Access Menu (TDP/FPS), and MangoHud stay with Steam.

## Install

Prefer the AppImage on SteamOS, Bazzite, and other immutable images. The AppImage bundles its own Python runtime, works without installing anything system-wide, and receives the built-in verified updater.

```bash
curl -fsSL https://raw.githubusercontent.com/vindeckyy/OpenBoxGL/master/scripts/install.sh | bash
```

See [Installation](/install/) for AppImage, Flatpak, and source options.

## Run in Steam Game Mode

1. Install the AppImage (preferred on SteamOS, Bazzite, and other immutable images).
2. In Desktop Mode, add a non-Steam game pointing at the AppImage, with launch options or target args including `--game-mode`.
3. Enable Steam Input for that shortcut if you want controller profiles in Big Box.
4. Return to Game Mode and launch OpenBox. It opens Big Box fullscreen.

Do not wrap OpenBox in another `gamescope` while already in Game Mode. On a normal desktop, behavior is unchanged unless you pass `--game-mode`. The Flatpak build relies on host tools for the kiosk-browser window tagging, so prefer the AppImage for Game Mode.

## How Game Mode works

OpenBox detects the gamescope guest via environment (`GAMESCOPE_WAYLAND_DISPLAY`, `STEAM_GAMESCOPE_RESTRICTED`, or a `gamescope` desktop name) and opens Big Box fullscreen in the native window. In the web fallback (`--web`, or when the native host is missing), the UI opens in a kiosk browser (Chromium, Chrome, Brave, or Edge, native or Flatpak), and OpenBox marks that window with a dedicated `STEAM_GAME` id (`413091001`) so it is visible under gamescope.

Steam titles launched from OpenBox still go through Steam (`steam -applaunch` / `steam://`), so Steam Input and overlays keep working. Non-Steam games get a stable synthetic `STEAM_GAME` id derived from their identity, in the range 700,000,000 to 899,999,999. The tagging is a window property only; it does not change how the game runs.

OpenBox does not control TDP; use Steam's QAM or your image's handheld tools. Developers can approximate Deck/Bazzite Game Mode on a desktop with `./scripts/emulate_deck_gamemode.sh` (requires gamescope; runs a nested session with `SteamDeck=1` advertising).

## Handheld performance profiles

Per-launch-profile TDP limits apply via `ryzenadj` at launch, with an optional restore limit when the session ends. The `Apply handheld performance limits` setting is auto / always / off. `auto` applies only on Steam Deck / Bazzite game mode and battery-powered handhelds; a missing `ryzenadj` or permission error logs a warning and never blocks a launch.

See [Handheld performance](/guides/big-box-and-handhelds/performance/) for setup, when limits apply, and failure behavior.

## Big Box on the couch

Big Box is the fullscreen controller-oriented view. Three layouts (Stage, Hybrid, CoverFlow), gamepad mapping, attract mode screensaver, startup video, and library BGM are covered in [Big Box and handhelds](/guides/big-box-and-handhelds/).

## Related pages

- [Big Box and handhelds](/guides/big-box-and-handhelds/)
- [Handheld performance](/guides/big-box-and-handhelds/performance/)
- [Installation](/install/)
- [Troubleshooting startup and browser](/guides/troubleshooting/startup-and-browser/#steam--game-mode-specifics)
