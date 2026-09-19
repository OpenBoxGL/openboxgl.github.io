---
title: Downloads
description: Every way to install OpenBoxGL, with verification steps per method.
---

# Downloads

One table for every install method. Pick the row that matches your system, then follow its verify step. All methods install the same OpenBox application, currently **v1.13.0**.

| Method | Best for | Updates | Verify |
| --- | --- | --- | --- |
| AppImage with installer | Linux desktop, Steam Deck, handhelds, immutable systems | Built-in verified updater | `openbox-release.pub` Ed25519 plus SHA-256 checksum |
| AppImage manual | Offline or custom path | Manual re-download | `chmod +x` then `openbox --help` or `--web` |
| Flatpak | Sandboxed installs | Flatpak workflow | `flatpak run io.openbox.GameLauncher` |
| From source | Development, patching | `git pull` | `python3 web_app.py` |
| System install | Install to `/usr/local` | `sudo make install` again | `openbox --help` |
| Windows portable with installer | Windows 10 and 11, x86_64 | Built-in verified updater | `install.ps1` Ed25519 plus SHA-256 checksum |

Every release publishes these artifacts:

| Asset | Architecture | Type |
| --- | --- | --- |
| `OpenBox-x86_64.AppImage` | x86_64 | AppImage, signed |
| `OpenBox-aarch64.AppImage` | ARM64 | AppImage, signed |
| `OpenBox-x86_64.flatpak` | x86_64 | Flatpak bundle |
| `OpenBox-x86_64-windows.zip` | x86_64 | Windows portable, signed |

The Windows archive ships with the same `.sha256` sidecar and `.sig` signature as the AppImages, verified by `install.ps1` and by the in-app updater with the Python standard library alone.

## AppImage with installer, recommended

The installer pins the release public key, verifies the SHA-256 checksum, and verifies the Ed25519 signature before installing to `~/.local/bin`.

```bash
VERSION=1.13.0
curl --proto '=https' --tlsv1.2 --fail --location \
  --output install.sh \
  "https://github.com/vindeckyy/OpenBoxGL/releases/download/v${VERSION}/install.sh"
less install.sh
OPENBOX_RELEASE_TAG="v${VERSION}" bash install.sh
```

To launch right after installing:

```bash
OPENBOX_RELEASE_TAG="v${VERSION}" bash install.sh --run
```

Install to a different directory with `OPENBOX_INSTALL_DIR`, for example `OPENBOX_INSTALL_DIR="$HOME/Applications"`. Omit `OPENBOX_RELEASE_TAG` only when you intend to track the latest stable release.

The installer selects the AppImage that matches `uname -m`. Override detection for a packaging or emulation environment with `OPENBOX_ARCH=x86_64` or `OPENBOX_ARCH=aarch64`.

Manual download:

```bash
chmod +x OpenBox-$(uname -m).AppImage
./OpenBox-$(uname -m).AppImage
./OpenBox-$(uname -m).AppImage --web
```

## Windows portable with installer

Windows 10 and 11 on x86_64 install from a signed portable archive. The installer resolves and pins the release public key, verifies the archive's SHA-256 checksum and its Ed25519 signature, and only then extracts the runtime to `%LOCALAPPDATA%\OpenBox\share\openbox`.

```powershell
$Version = '1.13.0'
Invoke-WebRequest -UseBasicParsing -OutFile install.ps1 `
  "https://github.com/vindeckyy/OpenBoxGL/releases/download/v$Version/install.ps1"
less install.ps1
.\install.ps1 -Tag "v$Version"
```

To launch right after installing, add `-Run`. Install to a different directory with `-InstallDir`, or skip the user `PATH` edit with `-NoPathUpdate`. The installer requires Windows PowerShell 5.1 and Python 3.10 or newer on `PATH`; it needs neither curl nor OpenSSL, because signature verification uses the same standard-library RFC 8032 implementation as the in-app updater.

It keeps the previous runtime at `share\openbox.previous`, registers the Start Menu shortcut and the `openbox://` protocol handler, and adds the runtime folder to your user `PATH`. See [Windows](/windows/) for the launcher ladder, the WebView2 native window, and uninstall steps.

## Flatpak

```bash
flatpak-builder --user --install --force-clean build-dir io.openbox.GameLauncher.yml
flatpak run io.openbox.GameLauncher
```

The manifest targets the GNOME Flatpak runtime (`org.gnome.Platform` 49) and grants `--filesystem=home`, so Steam, Heroic, Lutris, and ROM folders under home remain readable. The Flatpak is not updated by the built-in updater. Rebuild the manifest to update.

## From source

```bash
git clone https://github.com/vindeckyy/OpenBoxGL.git
cd OpenBoxGL
python3 web_app.py
```

Requirements: Python 3.10 or newer on Linux with standard desktop tooling. The native window additionally needs WebKitGTK 4.1, `make native-host` builds `native_host`. No `pip install` is required. See `.env.example` for optional local configuration, never commit secrets.

## System install

```bash
sudo make install
openbox          # native window, default
openbox --web    # loopback web UI
```

## Prerequisites

| Requirement | AppImage | Flatpak | Source | Windows |
| --- | --- | --- | --- | --- |
| Linux desktop, X11 or Wayland | Yes | Yes | Yes | Not applicable |
| Windows 10 or 11, x86_64 | Not applicable | Not applicable | Not applicable | Yes |
| WebKitGTK for native window | Bundled | Bundled | Required, libwebkit2gtk-4.1 | Not used |
| WebView2 runtime for native window | Not used | Not used | Not used | Required by `native_host.exe`; already present on Windows 11 and most Windows 10 |
| Python | Bundled | Bundled | 3.10+ | 3.10+ on `PATH` |
| flatpak and flatpak-builder | Not needed | Required | Not needed | Not needed |
| git | Not needed | Not needed | Required | Not needed |
| FUSE to mount AppImages | Required | Not needed | Not needed | Not applicable |
| bubblewrap bwrap | Optional, plugins sandboxed when present | Bundled check | Optional | Not applicable |

See [Installation](/install/) for prerequisites in detail, [Updating](/updating/) for the update flow and rollback, and [Getting started](/getting-started/) for the first import. v1.13.0 publishes signed x86_64 and aarch64 AppImages, an x86_64 Flatpak bundle, and a signed x86_64 Windows portable archive.
