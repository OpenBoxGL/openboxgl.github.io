---
title: Installation
description: Install OpenBoxGL on Linux with AppImage, Flatpak, or source.
---

OpenBoxGL runs on Linux with Python 3.10+ for source installs. AppImage is the recommended path: it bundles its own Python runtime, so you never depend on system Python versions or library packages.

There is no OpenBox account, installer wizard, or license key. Downloading a release or cloning the repository is the entire installation.

## Decide which package to use

| Package | Best for | Updates |
| --- | --- | --- |
| [AppImage](#appimage) | Desktop, Steam Deck, handhelds, immutable systems | Built-in verified updater |
| [Flatpak](#flatpak) | Sandboxed installs from a manifest | Your normal Flatpak workflow |
| [Source](#from-source) | Development, testing, or patching | `git pull` and re-run |
| [System install](#system-install) | Installing to `/usr/local` from source | `sudo make install` again |

Only the AppImage receives the built-in updater. Flatpak, source, and system installs follow their own package or source workflow; see [Updating](/updating/).

## AppImage

The AppImage is a single executable file that bundles OpenBoxGL, Python, and its dependencies. It does not need to be "installed" system-wide and works on immutable images like SteamOS and Bazzite.

1. Download the latest release from [GitHub Releases](https://github.com/vindeckyy/OpenBoxGL/releases/latest). The file is named `OpenBox-x86_64.AppImage`.
2. Make it executable. Downloads are not executable by default, and a non-executable AppImage reports "Permission denied" when you try to run it:

```bash
chmod +x OpenBox-x86_64.AppImage
```

3. Run it:

```bash
./OpenBox-x86_64.AppImage
```

The first launch starts the local server, writes the per-launch token files into the data directory, and opens your default browser on `http://127.0.0.1:PORT/?token=...`. If the browser does not open, run from a terminal and copy the printed URL into a browser.

Use `--native` for the lightweight Tk interface instead of the Web UI:

```bash
./OpenBox-x86_64.AppImage --native
```

The Tk interface shares the same library data as the Web UI, so you can switch between them freely.

### Making an app menu entry

Open Settings and choose **Install desktop shortcut** (the button appears when OpenBoxGL detects it is running from an AppImage). This writes a `.desktop` entry under `~/.local/share/applications` pointing at the AppImage's current path. If you move the AppImage afterwards, re-run the install shortcut so the entry follows the new location. Desktop integrators such as Gear Lever also work.

If an older build opened then never showed a window after integration, install **v0.6.0 or newer**, remove the old menu entry, and re-add the AppImage.

### Where the AppImage keeps state

All library data, media, backups, themes, and logs live in `~/.local/share/openbox-game-launcher` (or the `OPENBOX_DATA_DIR` you set), never inside the AppImage file. Updating or deleting the AppImage does not touch your library.

## Flatpak

Build and install the Flatpak from the project's manifest with `flatpak-builder`:

```bash
flatpak-builder --user --install --force-clean build-dir io.openbox.GameLauncher.yml
flatpak run io.openbox.GameLauncher
```

- The manifest (the `flatpak` module) uses the FreeDesktop runtime and grants `--filesystem=home`, so Steam, Heroic, Lutris, and ROM folders under your home directory are readable.
- Flatpak builds install the same `openbox` and `openbox-native` launchers; `flatpak run io.openbox.GameLauncher --native` starts the Tk interface.
- The Flatpak is not updated by OpenBoxGL's built-in updater (it only understands the AppImage). Update by rebuilding the manifest or using the Flatpak workflow you already have for local builds.

## From source

Source installs are the fastest way to run the current code, and they need the least tooling:

```bash
git clone https://github.com/vindeckyy/OpenBoxGL.git
cd OpenBoxGL
python3 web_app.py
```

Requirements: Python 3.10 or newer on a Linux system with standard desktop tooling. No third-party Python packages are required; the application uses the standard library.

The Web UI starts and opens your browser. `python3 openbox.py` starts the Tk interface instead.

### Optional local configuration

OpenBoxGL loads optional credentials and settings from `.env` files it discovers: the current directory, the project directory, your home directory, and `~/.config/openbox-game-launcher`. A documented template ships as `.env.example`.

Secrets and tokens (RetroAchievements, EmuMovies, IGDB, GitHub) are read from these files or from the process environment. Put real secrets in `~/.env` or `~/.config/openbox-game-launcher/.env` only, never in the repository or in a tracked file.

Two environment variables behave differently from credentials and must be set before launch:

- `OPENBOX_DATA_DIR` chooses the data directory. It is read before `.env` bootstrap, so putting it inside a discovered `.env` file is too late.
- `OPENBOX_SAFE_MODE=1` disables plugin execution for the whole process. Useful for diagnosing plugin-caused launch failures.

See [Configuration](/reference/configuration/) for the full environment contract.

## System install

The `make` target installs the launchers, web assets, themes, emulator definitions, desktop entry, and metadata file under `/usr/local` (override with `PREFIX=...`):

```bash
sudo make install
openbox          # Web UI
openbox-native   # Native UI
```

`sudo make uninstall` removes everything the target placed.

### Known issue

The current `sudo make install` wrapper path is not the recommended installation route. Use the AppImage, Flatpak, or source commands above. The wrapper exists for distro-style packaging; the AppImage covers desktop, handheld, and immutable-system use more completely.

## After installation

Your first launch creates the data directory with an empty library. The Web UI shows the welcome wizard when the library is empty; it walks you through a folder import, a Steam import, metadata syncing, and settings.

- First-time setup: [Getting started](/getting-started/)
- What the interfaces look like and where data lives: [Interfaces and data](/interfaces-and-data/)
- Keeping an AppImage install current: [Updating](/updating/)
- If something does not start: [Troubleshooting](/guides/troubleshooting/)

## Related pages

- [Getting started](/getting-started/)
- [Interfaces and data](/interfaces-and-data/)
- [Updating](/updating/)
