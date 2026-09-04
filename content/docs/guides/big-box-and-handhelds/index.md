---
title: Big Box and handhelds
description: Browse a library fullscreen with controller-oriented layouts.
---

Big Box is the fullscreen controller-oriented view of the app. Click **Big Box** in the top bar (or launch with `?deeplink=bigbox`; OpenBoxGL also opens Big Box automatically when it detects a gamescope guest session).

## Layouts

Settings, **Big Box layout**, chooses among three modes:

- **Stage**: one large cover and description with a big Play button.
- **Hybrid**: a platform rail on the left plus the current platform's games and a scoped **Search this platform** field.
- **CoverFlow**: a horizontal cover strip with jewel-case styling; the active cover straightens and scales.

The footer shows the control legend: `← → Browse`, `Enter / A Play`, `P Pause`, `M Filters`, `F / X Favorite`, `Esc / B Back`.

## Navigation and menus

Keyboard arrows (and gamepad left stick / d-pad, or a gamepad's mapped buttons) move through the list. The gamepad mapping is configurable in Settings (buttons 0-31 per action):

| Button Index | Xbox / Standard | PlayStation | Default Action |
| :--- | :--- | :--- | :--- |
| `0` | **A** | **Cross (✕)** | Play / Launch / Confirm |
| `1` | **B** | **Circle (○)** | Back / Cancel / Return |
| `2` | **X** | **Square (□)** | Toggle Favorite |
| `3` | **Y** | **Triangle (△)** | Random Game Shuffle (`R`) |
| `4` / `5` | **LB / RB** | **L1 / R1** | Page Left / Page Right (jumps 10 titles) |
| `8` | **Back / View** | **Share / Select** | Pause Menu / Session Overlay (`P`) |
| `9` | **Start / Menu** | **Options / Start** | Filter & Sort Dropdown Menu (`M`) |

### Filter and sort menu

Pressing **M** (or Start on gamepad) opens the Filter and Sort menu with 4 interactive select dropdowns navigateable via controller:
1. **Show**: All games, Installed, Owned, Favorites, In progress, Completed.
2. **Sort**: Title, Rating, Recently played, Recent activity, Play time, Shuffle.
3. **Quick preset**: Filter presets pinned in the desktop UI.
4. **Achievements**: All, RetroAchievements matched, Not matched.

### Controller prompt packs

Activating a controller media pack (`controller-xbox` or `controller-playstation`) via Settings or `POST /api/premium/media-packs/apply` automatically updates the on-screen button legend and prompts to match your physical gamepad layout (`controller_prompt_pack`). Toggle on-screen button hints with `controller_prompt_hint`.

The **screensaver / attract mode** shows a rotating random game after a delay. Settings has two related fields: **Big Box screensaver delay** (`screensaver_seconds`, default 90) and **Attract mode delay** (`attract_mode_seconds`). The screensaver reads `attract_mode_seconds`, which falls back to `screensaver_seconds` when unset, and the Settings dialog keeps both in sync with the same fallback. Both are 0-3600 seconds (0 disables; values 1-29 are rejected). Any control returns; Play launches the displayed game. The screensaver uses the game's background or cover and plays its video when present. An optional **Big Box startup video** plays on entry, and **Library background music** with an optional **Mix video audio with background music** toggle (lower music volume when mixing) plays in Big Box. Battery level and the controller prompt hint display in the Big Box status bar.

**Big Box shutdown commands** run when switching into Big Box; they are not run when leaving it.

## Themes and media packs

Big Box uses the same CSS themes as the desktop UI (see [Themes](/themes/)), including per-platform themes. Bundled media packs add platform clear logos, Xbox or PlayStation controller prompt packs (which also change the on-screen hint), and core status badges.

## Steam Game Mode (handhelds)

On Steam Deck, Bazzite, and other gamescope sessions, OpenBoxGL runs as a guest inside Steam's gamescope session so Steam Input, the Quick Access Menu (TDP/FPS), and MangoHud stay with Steam.

1. Install the AppImage (preferred on SteamOS, Bazzite, and other immutable images).
2. In Desktop Mode, add a non-Steam game pointing at the AppImage with launch options or target args including `--game-mode`.
3. Enable Steam Input for that shortcut if you want controller profiles in Big Box.
4. Return to Game Mode and launch OpenBox. It opens Big Box fullscreen.

Under gamescope, OpenBoxGL detects the guest via environment (`GAMESCOPE_WAYLAND_DISPLAY`, `STEAM_GAMESCOPE_RESTRICTED`, or a `gamescope` desktop name) and opens Big Box fullscreen in the native window. In the web fallback (`--web`, or when the native host is missing), the UI opens in a kiosk browser (Chromium, Chrome, Brave, or Edge, native or Flatpak), and OpenBoxGL marks that window with a dedicated `STEAM_GAME` id (`413091001`) so it is visible under gamescope. Steam titles launched from OpenBox still go through Steam (`steam -applaunch` / `steam://`), so Steam Input and overlays keep working. Non-Steam games get a stable synthetic `STEAM_GAME` id derived from their identity, in the range 700,000,000 to 899,999,999.

Do not wrap OpenBox in another `gamescope` while already in Game Mode. On a normal desktop, behavior is unchanged unless you pass `--game-mode`. The Flatpak build relies on host tools for the kiosk-browser window tagging, so prefer the AppImage for Game Mode.

<Callout type="note" title="How the guest session keeps Steam Input working">

OpenBoxGL detects the gamescope guest from the environment and opens Big Box fullscreen in the native window, so gamescope treats it as a real app window. In the web fallback (`--web`), it opens a kiosk browser and marks that window with a dedicated `STEAM_GAME` id (`413091001`) so gamescope treats it as a real app window too. Games you launch from inside OpenBox still go through Steam (`steam -applaunch` / `steam://`), so their Input profiles and overlays stay scoped to those titles. Non-Steam games get a stable synthetic `STEAM_GAME` id derived from their identity (range 700,000,000-899,999,999). The tagging is a window property only, it does not change how the game runs.

</Callout>

Steam Input profiles stay scoped to your shortcut; the STEAM_GAME tagging is only a window property. OpenBoxGL does not control TDP; use Steam's QAM or your image's handheld tools. Developers can approximate Deck/Bazzite Game Mode on a desktop with `./scripts/emulate_deck_gamemode.sh` (requires gamescope; runs a nested session with `SteamDeck=1` advertising).

See [Handheld performance](/guides/big-box-and-handhelds/performance/) for the TDP profile behavior supported by the current release.

## Gamescope presets (v1.7.2)

Settings → Controller includes a **gamescope preset** selector with 8 display profiles for handheld and desktop use:

| Preset | Resolution | Scaling |
|---|---|---|
| Steam Deck | 1280×800 | Integer |
| Steam Deck (HD) | 1920×1200 | Integer |
| 1080p Full HD | 1920×1080 | Fit |
| 1440p QHD | 2560×1440 | Fit |
| 4K UHD | 3840×2160 | Fit |
| Integer Scale | Native | Integer |
| Stretch to Fit | Native | Stretch |
| Borderless Window | Native | Borderless |

When a preset is selected, OpenBoxGL applies the corresponding gamescope command-line arguments on game launch. The preset does not affect the OpenBoxGL window itself — only the games it launches.

## Custom gamescope presets (v1.8.0)

Settings → Controller also supports **user-defined presets**: up to 16 custom presets with unique names and bounded integer arguments. A custom preset whose name matches a stock preset shadows it. A per-game `gamescope_preset` override (set in the game editor's Launch tab) wins over the global preset at launch.

## MangoHud performance overlay (v1.7.2)

Settings → Controller includes a **MangoHud** toggle. When enabled, `MANGOHUD=1` is set in the environment when launching games, causing the MangoHud on-screen performance overlay (FPS, CPU/GPU usage, frame pacing) to appear. MangoHud must be installed on your system separately.

## Controller bench (v1.7.2)

Settings → Controller includes a **controller bench** tab with a live SVG gamepad visualization. The bench reads `navigator.getGamepads()` and renders button presses, stick positions, and trigger values in real time, so you can verify controller connectivity and mapping without launching a game.

## Game Night party mode (v1.9.0)

**Game Night** (**Big Box → Game Night**) turns Big Box into a couch-multiplayer party screen: set players (2–8) and session length, build a queue of party-friendly games, spin the wheel to pick, launch, and advance rounds. The queue and round index persist across restarts. Control it with a gamepad or keyboard (arrows/Enter/N/Escape). Backed by `POST /api/v2/party/queue`, `GET /api/v2/party/queue`, and `POST /api/v2/party/next`.

## Video snaps in stage mode (v1.9.0)

Big Box stage mode plays looping gameplay videos behind the selected cover when a video is available, with a 600ms debounce so fast scrolling stays smooth, background-music ducking while video audio plays, and `prefers-reduced-motion` support. Without a video it falls back to the static cover.
