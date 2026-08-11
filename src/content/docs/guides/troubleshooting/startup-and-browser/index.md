---
title: Troubleshooting startup and browser
description: Diagnose why the app does not start or the browser does not open.
---

Start with the diagnostic log and the exact visible error. **Settings** has **Copy diagnostic log**: it copies the rotating log (`<data-dir>/openbox.log`, 2 MiB per file, 4 rotations) which redacts tokens, passwords, secrets, API keys, and authorization values, but may include game names and local file paths. Review it before sharing.

## The browser did not open

The Web UI binds to `127.0.0.1` on a random port. The port and token are written to `<data-dir>/server.port` and `<data-dir>/server.token`; the URL is printed to the terminal. If the browser shows "Could not reach the OpenBox server", check that `web_app.py` is still running.

- Run the entry point from a terminal and open the printed URL yourself: `http://127.0.0.1:PORT/?token=...`
- `--no-browser` skips opening a browser; useful for remote or scripted starts.

## Nothing starts at all

| Problem | Cause / fix |
| --- | --- |
| `Permission denied` on an AppImage | The file is not executable; `chmod +x OpenBox-x86_64.AppImage`. |
| App exits immediately | Run from a terminal and read the printed error. Check `OPENBOX_DATA_DIR` is set before launch (it is read before `.env` bootstrap). |
| Flatpak fails to find files | The Flatpak uses the FreeDesktop runtime and grants `--filesystem=home`; keep Steam/Heroic/Lutris/ROM folders under home. |
| Kiosk browser not opening in Game Mode | The UI opens in a kiosk browser (Chromium, Chrome, Brave, Edge; native or Flatpak). If none is installed the fallback may fail; install one. Prefer the AppImage in Game Mode since the Flatpak relies on host tools for window tagging. |

## Browser opens but the library looks empty

Check `OPENBOX_DATA_DIR`. The server is reading a different directory than the one you edited. The variable must be in the process environment at launch — putting it inside a discovered `.env` file is too late.

## Steam / Game Mode specifics

- Games that launch through Steam still go through Steam (`steam -applaunch` / `steam://`). If Steam Input or overlays do not work in Game Mode, confirm the title is a real Steam launch and that Steam Input is enabled for the OpenBox shortcut.
- If an older AppImage build opened but never showed a window after desktop integration, install v0.6.0 or newer, remove the old menu entry, and re-add the AppImage.

## See also

- [Installation](/install/) — install paths and prerequisites
- [Interfaces and data](/interfaces-and-data/) — server startup order, token files, and `OPENBOX_DATA_DIR`
- [Troubleshooting](/guides/troubleshooting/) — the index of every troubleshooting area
