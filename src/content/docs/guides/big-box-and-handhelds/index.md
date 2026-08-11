---
title: Big Box and handhelds
description: Browse a library fullscreen with controller-oriented layouts.
---

Big Box is the fullscreen controller-oriented view of the Web UI. Click **Big Box** in the top bar (or launch with `?deeplink=bigbox`; OpenBoxGL also opens Big Box automatically when it detects a gamescope guest session).

## Layouts

Settings, **Big Box layout**, chooses among three modes:

- **Stage**: one large cover and description with a big Play button.
- **Hybrid**: a platform rail on the left plus the current platform's games and a scoped **Search this platform** field.
- **CoverFlow**: a horizontal cover strip with jewel-case styling; the active cover straightens and scales.

The footer shows the control legend: `← → Browse`, `Enter / A Play`, `P Pause`, `M Filters`, `F / X Favorite`, `Esc / B Back`.

## Navigation and menus

Keyboard arrows (and gamepad left stick / d-pad, or a gamepad's mapped buttons) move through the list. The gamepad mapping is configurable in Settings (buttons 0-31 per action): Play (default button 0), Back (1), Favorite (2), Random game (3), Previous/Next page (4/5, jump 10 at a time), Running-game menu or pause (8), and Filter and sort menu (9). Page up/down and random also work from the keyboard (`R` shuffles).

**M** opens the Filter and Sort menu: Show (current library view, installed, owned, favorites, in progress, completed), Sort (title, rating, recently played, recent activity, play time, shuffle), Quick preset (filter presets pinned in the desktop UI), and Achievements filter (all, RetroAchievements matched, not matched). **P** opens the pause overlay for the running game with Resume/Pause, Exit game, read documents, and RetroAchievements access.

The **screensaver / attract mode** shows a rotating random game after a delay (Settings, **Attract mode delay**, 0-3600 seconds, default 90). Any control returns; Play launches the displayed game. The screensaver uses the game's background or cover and plays its video when present. An optional **Big Box startup video** plays on entry, and **Library background music** with an optional **Mix video audio with background music** toggle (lower music volume when mixing) plays in Big Box. Battery level and the controller prompt hint display in the Big Box status bar.

**Big Box shutdown commands** run when switching into Big Box; they are not run when leaving it.

## Themes and media packs

Big Box uses the same CSS themes as the desktop UI (see [Themes](/themes/)), including per-platform themes. Bundled media packs add platform clear logos, Xbox or PlayStation controller prompt packs (which also change the on-screen hint), and core status badges.

## Steam Game Mode (handhelds)

On Steam Deck, Bazzite, and other gamescope sessions, OpenBoxGL runs as a guest inside Steam's gamescope session so Steam Input, the Quick Access Menu (TDP/FPS), and MangoHud stay with Steam.

1. Install the AppImage (preferred on SteamOS, Bazzite, and other immutable images).
2. In Desktop Mode, add a non-Steam game pointing at the AppImage with launch options or target args including `--game-mode`.
3. Enable Steam Input for that shortcut if you want controller profiles in Big Box.
4. Return to Game Mode and launch OpenBox. It opens Big Box fullscreen.

Under gamescope, OpenBoxGL detects the guest via environment (`GAMESCOPE_WAYLAND_DISPLAY`, `STEAM_GAMESCOPE_RESTRICTED`, or a `gamescope` desktop name), opens the UI in a kiosk browser (Chromium, Chrome, Brave, or Edge, native or Flatpak), and marks its own window with a dedicated `STEAM_GAME` id (`413091001`) so it is visible under gamescope. Steam titles launched from OpenBox still go through Steam (`steam -applaunch` / `steam://`), so Steam Input and overlays keep working. Non-Steam games get a stable synthetic `STEAM_GAME` id derived from their identity, in the range 700,000,000 to 899,999,999.

Do not wrap OpenBox in another `gamescope` while already in Game Mode. On a normal desktop, behavior is unchanged unless you pass `--game-mode`. The Flatpak build relies on host tools for window tagging and kiosk mode, so prefer the AppImage for Game Mode.

:::note[How window tagging keeps Steam Input working]
OpenBoxGL marks its own browser window with a dedicated `STEAM_GAME` id (`413091001`) so gamescope treats it as a real app window. Games you launch from inside OpenBox still go through Steam (`steam -applaunch` / `steam://`), so their Input profiles and overlays stay scoped to those titles. Non-Steam games get a stable synthetic `STEAM_GAME` id derived from their identity (range 700,000,000–899,999,999). The tagging is a window property only — it does not change how the game runs.
:::

Steam Input profiles stay scoped to your shortcut; the STEAM_GAME tagging is only a window property. OpenBoxGL does not control TDP; use Steam's QAM or your image's handheld tools. Developers can approximate Deck/Bazzite Game Mode on a desktop with `./scripts/emulate_deck_gamemode.sh` (requires gamescope; runs a nested session with `SteamDeck=1` advertising).

See [Handheld performance](/guides/big-box-and-handhelds/performance/) for the TDP profile behavior supported by the current release.
