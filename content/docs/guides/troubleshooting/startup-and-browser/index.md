---
title: Troubleshooting startup and window
description: Diagnose why the app does not start or the window does not open.
---

Start with the diagnostic log and the exact visible error. **Settings > Advanced** has **Copy diagnostic log**: it copies a redacted diagnostic **summary** (the `/api/diagnostic` preview, with secrets and the full log excluded). The rotating log is `<data-dir>/openbox.log` (2 MiB per file, 4 rotations); it redacts tokens, passwords, secrets, API keys, and authorization values, but may include game names and local file paths. Review it before sharing.

## The window did not open

The native window renders the same UI as the web UI; both are served by the loopback server on `127.0.0.1` at a random port. The port and token are written to `<data-dir>/server.port` and `<data-dir>/server.token`. If the native window shows "Could not reach the OpenBox server", the server child did not start or exited; run `openbox` from a terminal to read the error.

- When WebKitGTK is missing, `openbox` prints an install hint and falls back to a chrome-less app window (then your default browser). Install `libwebkit2gtk-4.1-dev` (Debian/Ubuntu) or `webkit2gtk-4.1` (Fedora) for the native window.
- `openbox --web` forces the loopback web UI in a browser instead of the native window.
- `python3 web_app.py --no-browser` starts the server without opening any window; open the printed `http://127.0.0.1:PORT/?token=...` URL yourself.

## Nothing starts at all

| Problem | Cause / fix |
| --- | --- |
| `Permission denied` on an AppImage | The file is not executable; `chmod +x OpenBox-x86_64.AppImage`. |
| App exits immediately | Run from a terminal and read the printed error. Check `OPENBOX_DATA_DIR` is set before launch (it is read before `.env` bootstrap). |
| Flatpak fails to find files | The Flatpak uses the GNOME Platform 49 runtime and grants `--filesystem=home`; keep Steam/Heroic/Lutris/ROM folders under home. |
| Kiosk browser not opening in Game Mode | The web fallback (`--web`) opens the UI in a kiosk browser (Chromium, Chrome, Brave, Edge; native or Flatpak). If none is installed the fallback may fail; install one. The native window (default) needs no browser in Game Mode. Prefer the AppImage in Game Mode since the Flatpak relies on host tools for window tagging. |

## Window opens but the library looks empty

Check `OPENBOX_DATA_DIR`. The server is reading a different directory than the one you edited. The variable must be in the process environment at launch, putting it inside a discovered `.env` file is too late. A library that failed to load at boot also surfaces the error in the library's `startup_errors` list rather than only in the terminal.

## Big Box window problems

- **Pointer or wheel navigation does nothing.** Pointer drag and mouse wheel are separate switches (`pointer_nav_enabled`, `mouse_wheel_nav`). A trackball or spinner needs the pointer path and a usable `spinner_sensitivity` (1..20, default 6); wheel speed is `bigbox_wheel_speed` (0.25..3.0, default 1).
- **Back does not open the menu.** Holding Back opens the Big Box menu once `bigbox_back_hold_seconds` (0–2, default 0.8) has elapsed; a short tap closes Big Box instead. A zero value makes Back close immediately with no menu. Check controller remapping if Back was reassigned.
- **The battery indicator is missing.** It reads the battery on each platform: Linux sysfs, `pmset` on macOS, and `GetSystemPowerStatus` on Windows. `GET /api/native/battery` returns `present: false` on a host with no battery, such as a desktop, and the indicator is hidden when `battery_indicator` is off.
- **Video has no sound or fights the music.** Video controls and the audio mix are settings: `bigbox_video_controls` adds the play/seek/mute/full-screen bar, `bigbox_video_volume` sets the video level (0.0–1.0, default 0.8), and `video_bgm_mix` lowers background music under video audio instead of muting the video. A startup video that should play once needs `bigbox_startup_video_loop` off.
- **No sounds or background music.** Themes may supply a sound pack and background music; a theme without those assets is silent. Missing theme assets are skipped, not an error.
- **A helper app should stop when Big Box exits.** `bigbox_shutdown_commands` runs shell-free commands when Big Box mode is left; a command that cannot start is skipped and logged, and does not block the exit.

## Steam / Game Mode specifics

- Games that launch through Steam still go through Steam (`steam -applaunch` / `steam://`). If Steam Input or overlays do not work in Game Mode, confirm the title is a real Steam launch and that Steam Input is enabled for the OpenBox shortcut.
- If an older AppImage build opened but never showed a window after desktop integration, install v0.6.0 or newer, remove the old menu entry, and re-add the AppImage.

## See also

- [Installation](/install/), install paths and prerequisites
- [Interfaces and data](/interfaces-and-data/), server startup order, token files, and `OPENBOX_DATA_DIR`
- [Troubleshooting](/guides/troubleshooting/), the index of every troubleshooting area
