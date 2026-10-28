---
title: Big Box and handhelds
description: Browse a library fullscreen with controller-oriented layouts.
---

Big Box is the fullscreen controller-oriented view of the app. Click **Big Box** in the top bar (or launch with `?deeplink=bigbox`; OpenBoxGL also opens Big Box automatically when it detects a gamescope guest session).

## Starting in Big Box

Settings → Big Box has a **Start in Big Box mode** checkbox (`bigbox_start_at_launch`), and the `--bigbox` CLI flag (see [CLI reference](/reference/cli/)) opens the UI with `?deeplink=bigbox` — so a Deck or HTPC can boot straight into Big Box like Steam Big Picture.

## Layouts

Settings, **Big Box layout**, chooses among three modes:

- **Stage**: one large cover and description with a big Play button.
- **Hybrid**: a platform rail on the left plus the current platform's games and a scoped **Search this platform** field.
- **CoverFlow**: a horizontal cover strip; the active card renders the same CSS 3D cover model as the stage (see [3D cover models](#3d-cover-models-v1180)) and straightens and scales, while neighbouring cards show flat covers.

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

### Pointer, trackball, and spinner (v1.18.0)

Settings → Controller adds pointer navigation for a mouse, a trackball, or an arcade spinner. Those devices report as ordinary pointer and wheel input, so one set of controls covers all three:

| Setting | Key | Default | Range |
| :--- | :--- | :--- | :--- |
| **Pointer and wheel navigation** | `pointer_nav_enabled` | on | on / off |
| **Mouse wheel navigation** | `mouse_wheel_nav` | on | on / off |
| **Spinner sensitivity** | `spinner_sensitivity` | `6` | 1–20 |
| **Big Box wheel speed** | `bigbox_wheel_speed` | `1.0` | 0.25–3.0 |

- Drag with the left mouse button horizontally to step through games. The drag starts after about 10 px, a click that never moves activates the current game, and drags that begin on a button, link, or form field are left alone.
- The wheel scrolls the strip; holding **Shift** while scrolling turns a page (`←`/`→`) instead. Horizontal wheel deltas from a trackball also work.
- **Spinner sensitivity** scales both gestures: higher values need a shorter wheel turn or drag per step. **Big Box wheel speed** throttles repeated wheel steps (about 120 ms between steps at `1.0`).
- Turning **Pointer and wheel navigation** off disables drag and wheel together. To keep drag and click but ignore the wheel, leave it on and turn **Mouse wheel navigation** off.

### Back button hold (v1.18.0)

Settings → Controller has **Hold Back to open the Big Box menu, seconds** (`bigbox_back_hold_seconds`, default `0.8`, 0–2). A short Back press leaves Big Box; holding Back for the configured time opens the Big Box menu instead. Set it to `0` to make Back leave immediately without the hold gesture.

### Filter and sort menu

Pressing **M** (or Start on gamepad) opens the Filter and Sort menu with 4 interactive select dropdowns navigateable via controller:
1. **Show**: All games, Installed, Owned, Favorites, In progress, Completed.
2. **Sort**: Title, Rating, Recently played, Recent activity, Play time, Shuffle.
3. **Quick preset**: Filter presets pinned in the desktop UI.
4. **Achievements**: All, RetroAchievements matched, Not matched.

### Controller prompt packs

Activating a controller media pack (`controller-xbox` or `controller-playstation`) via Settings or `POST /api/premium/media-packs/apply` automatically updates the on-screen button legend and prompts to match your physical gamepad layout (`controller_prompt_pack`). Toggle on-screen button hints with `controller_prompt_hint`.

The **screensaver / attract mode** shows a rotating random game after a delay. Settings has two related fields: **Big Box screensaver delay** (`screensaver_seconds`, default 90) and **Attract mode delay** (`attract_mode_seconds`). The screensaver reads `attract_mode_seconds`, which falls back to `screensaver_seconds` when unset, and the Settings dialog keeps both in sync with the same fallback. Both are 0-3600 seconds (0 disables; values 1-29 are rejected). Any control returns; Play launches the displayed game. The screensaver uses the game's background or cover and plays its video when present.

### Video and audio (v1.18.0)

Big Box video snaps read their audio settings from Settings → Big Box; the startup video is always muted.

- **Show video controls in Big Box** (`bigbox_video_controls`, default on) adds a hover bar to a stage video with Pause/Play, a seek slider, Mute/Unmute, and Full screen. The bar hides after about two seconds without pointer movement.
- **Big Box video volume** (`bigbox_video_volume`, default `0.8`) is the video snap level, 0–1.
- **Use a blurred video backdrop in Big Box** (`bigbox_video_backdrop`, default off) plays the platform video, or the game video when no platform video is set, as a muted backdrop.
- **Big Box startup video path** (`bigbox_startup_video`) plays muted once when Big Box opens; **Loop the Big Box startup video** (`bigbox_startup_video_loop`, default off) keeps it running instead of hiding it when it ends. Under `prefers-reduced-motion: reduce` the startup video and video snaps are hidden.
- **Library background music path** (`library_music`) loops in Big Box, and **Mix video audio with background music** (`video_bgm_mix`) decides whether video audio plays over the music. When mixing, the music drops to a low volume instead of being muted.

### Battery indicator (v1.18.0)

The Big Box status bar shows battery percentage and a charging marker when a battery is present. Turn it off with **Show the battery indicator in Big Box** (`battery_indicator`, default on).

The indicator prefers the browser Battery Status API and otherwise calls `GET /api/native/battery`, which reads the first `BAT*` device under `/sys/class/power_supply` on Linux, `pmset -g batt` on macOS, and `GetSystemPowerStatus` on Windows. The route returns `present`, `percent` (0–100), and `charging`; a host with no battery returns `{"present": false, "percent": 0, "charging": false}`. The client caches the result for 60 seconds and reads it once when Big Box opens, so it never polls the filesystem during navigation.

### Hidden platforms, categories, and playlists (v1.18.0)

Big Box can hide platforms, categories, and a playlist without deleting anything. Settings → Big Box has a comma-separated **Hide from Big Box: platforms, categories, playlists** row backed by the `bigbox_hidden_platforms`, `bigbox_hidden_categories`, and `bigbox_hidden_playlists` string lists (the API accepts up to 500 entries of 200 characters each).

Games on a hidden platform are filtered out, and a hidden category removes every platform assigned to it. If the desktop's active playlist is listed in `bigbox_hidden_playlists`, Big Box clears that playlist scope when it builds the list. The same toggle is available from the desktop: a platform, category, or playlist view shows **Hide this platform/category/playlist from Big Box**. Categories are the names mapped in `platform_categories` (games without a mapping belong to `Other`). The separate per-game `hide_in_bigbox` flag still hides individual games.

**Big Box shutdown commands** run when switching into Big Box; they are not run when leaving it.

## On-screen keyboard

When the hybrid search takes focus, a d-pad-navigable QWERTY + symbols grid opens and types into the search via input events, reusing the existing filter. It sits on the gamepad loop just below the pause overlay, so the pad keeps driving the grid everywhere else.

## Health tile

Big Box shows a library **health tile** with a re-scan action, so you can check the 0–100 health score and re-run the audit without leaving the couch.

## 3D cover models (v1.18.0)

Big Box and the desktop details pane render covers as CSS 3D models; no WebGL or external assets are involved. Settings → Appearance chooses **Cover model** (`cover_model`):

| Value | Model |
| :--- | :--- |
| `box` | Standard box (default) |
| `jewel` | Jewel case |
| `long_jewel` | Long jewel case |
| `double_jewel` | Double jewel case with a second spine |
| `cassette` | Cassette |
| `none` | Flat cover |

Box backs and spines use the game's matching media when available; a missing image falls back to a labelled placeholder rather than a blank face. The cassette j-card shows the game title. The selected CoverFlow card uses the same model and binding as the stage; the cards beside it stay flat so scrolling remains cheap.

Cassette models have two extra properties. The back can be **straight** or **angled** (default `angled`); the case can be **clear** or **solid** (default `clear`). Both are stored per platform in `model_back_by_platform` and `model_case_by_platform`. Per-platform values for the model itself live in `cover_model_by_platform`.

**3D rotation lock** (`model_rotation_lock`) can be `free` (default), `horizontal`, or `vertical`. A horizontal lock disables vertical tilt, a vertical lock disables sideways rotation, and a free model clamps tilt to ±90°. Models respond to pointer drag and expose rotate-right (15°), flip (180°), and full-screen tools on hover. Per-platform overrides live in `model_rotation_lock_by_platform`. Resolution order is the game's own `cover_model`, then the platform map, then the global setting.

All four overrides are edited in the desktop platform view under **Presentation**; each change saves immediately and the preview card re-renders the selected model.

## Documents, media, and details (v1.18.0)

- **Document reader controls are remappable.** Settings → Controller's keyboard shortcuts include **Reader previous page** (`reader_prev`, default `ArrowLeft`) and **Reader next page** (`reader_next`, default `ArrowRight`); `Home` and `End` still jump to the first and last page. Reader theme (**Document reader theme**, `reader_theme`, `light`/`dark`) and layout (**Document reader layout**, `reader_spread`, `single`/`spread`) persist through the settings API, so they carry into the next document and the next launch.
- **Image cells open the lightbox fullscreen.** Screenshots in the Screenshots grid and artwork cells in the details pane open the media lightbox already maximised, with labels, a page counter, and arrow-key paging. **Ctrl+I** (or `F`) toggles fullscreen on any open image, `Esc` leaves it, and `+`/`-`/`0` adjust zoom.
- **Integer scaling.** The lightbox's integer-scale control (or the `I` key) switches to nearest-neighbour scaling and shows the active factor (up to 8×); toggling it again returns to fit-to-stage zoom.
- **Popped-out details remember their window.** **Pop out** on a game's details opens `/?details=<id>` in its own window. Position and size are saved in local storage and restored on the next pop-out, clamped to the visible screen with a 480×360 minimum (default 900×720).

## High scores in the running-game panel (v1.18.0)

For an arcade entry (platform `Arcade` or a game with a ROM name), the Big Box running-game panel adds **High scores**. It shows the parsed scores in a searchable Rank/Score/Name table and exports or imports the game's MAME files. It uses the same endpoints as the library details pane:

- `GET /api/v2/highscores/table?id=<id>` returns `parsed` and the `scores` rows, or a `message` when the table cannot be read;
- `POST /api/highscores/export` writes the game's score files; and
- `POST /api/highscores/import` restores a chosen MAME high-score file.

Parsing uses the optional `hi2txt` tool and accepts its JSON or pipe-delimited output. Without `hi2txt` the panel says the table was not parsed instead of showing empty scores. The native battery route and the rest of the additive 1.18 surface are catalogued in [API 1.18 additions](/reference/api/one-eighteen/).

## Themes and media packs

Big Box uses the same CSS themes as the desktop UI (see [Themes](/themes/)), including per-platform themes. Bundled media packs add platform clear logos, Xbox or PlayStation controller prompt packs (which also change the on-screen hint), and core status badges.

Themes may also ship audio. A theme can add background music and navigation sounds (move, select, and back) through a sidecar JSON file; **Play theme music and navigation sounds in Big Box** (`bigbox_sounds_enabled`, default on) enables both. Theme audio starts when Big Box opens and stops when it closes. See [Theme music and sounds](/guides/themes/custom-themes/#theme-music-and-sounds-v1180) for the file format.

## Steam Game Mode (handhelds)

On Steam Deck, Bazzite, and other gamescope sessions, OpenBoxGL runs as a guest inside Steam's gamescope session so Steam Input, the Quick Access Menu (TDP/FPS), and MangoHud stay with Steam.

1. Install the AppImage (preferred on SteamOS, Bazzite, and other immutable images).
2. In Desktop Mode, add a non-Steam game pointing at the AppImage with launch options or target args including `--game-mode`.
3. Enable Steam Input for that shortcut if you want controller profiles in Big Box.
4. Return to Game Mode and launch OpenBox. It opens Big Box fullscreen.

After shortcuts are applied, Steam Bridge copies cached SteamGridDB artwork (cover → capsule, background → hero, clear logo → logo) into the account's Steam grid directory, so bridged games are no longer grey tiles in Game Mode. Original bytes are copied as-is (no resize); skips are logged and reported, and nothing is ever written outside a detected Steam account directory.

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

Settings → Controller includes a **MangoHud** toggle. When enabled, `MANGOHUD=1` and `MANGOHUD_CONFIG=font_size=24,no_display` are set in the environment when launching games (`pkg/parity/parity_gamescope.py:580-581`), causing the MangoHud on-screen performance overlay (FPS, CPU/GPU usage, frame pacing) to appear. MangoHud must be installed on your system separately.

## Controller bench (v1.7.2)

Settings → Controller includes a **controller bench** tab with a live SVG gamepad visualization. The bench reads `navigator.getGamepads()` and renders button presses, stick positions, and trigger values in real time, so you can verify controller connectivity and mapping without launching a game.

## Game Night party mode (v1.9.0)

**Game Night** (**Big Box → Game Night**) turns Big Box into a couch-multiplayer party screen: set players (2–8) and session length, build a queue of party-friendly games, spin the wheel to pick, launch, and advance rounds. The queue and round index persist across restarts. Control it with a gamepad or keyboard (arrows/Enter/N/Escape). Backed by `POST /api/v2/party/queue`, `GET /api/v2/party/queue`, and `POST /api/v2/party/next`.

**Decks (v1.17.0)** save the setup rather than just the result. A deck stores a name, a filter query (for example `platform:SNES`), the player count, and a minute budget; up to 20 decks are kept, and **Save deck** / **Delete deck** sit under the setup controls. Loading a deck restores those values, and a build returns an eight-character seed: the same seed and library reproduce the same draw on another device. Decks live in the local library state and do not cross the library-sync protocol. Backed by `GET`/`POST /api/v2/party/decks` and `POST /api/v2/party/decks/delete`; see [API 1.17 additions](/reference/api/one-seventeen/).

## Video snaps in stage mode (v1.9.0)

Big Box stage mode plays looping gameplay videos behind the selected cover when a video is available, with a 600ms debounce so fast scrolling stays smooth, background-music ducking while video audio plays, and `prefers-reduced-motion` support. Without a video it falls back to the static cover.

## Guides in this section

- [Handheld performance](/guides/big-box-and-handhelds/performance/) — frame pacing, TDP, resolution, and gamescope tuning on real devices.
- [Arcade Room](/guides/big-box-and-handhelds/arcade-room/) — a controller-first platform showroom with fact cards and an optional kiosk PIN.
- [Household](/guides/big-box-and-handhelds/household/) — opt-in members, challenges, and a leaderboard over a local folder, opened from **Tools → Family sharing**.
