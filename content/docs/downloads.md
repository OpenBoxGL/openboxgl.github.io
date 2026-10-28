---
title: Downloads
description: Every way to install OpenBoxGL, with verification steps per method.
---

# Downloads

One table for every install method. Pick the row that matches your system, then follow its verify step. All methods install the same OpenBox application, currently **v1.19.1**.

| Method | Best for | Updates | Verify |
| --- | --- | --- | --- |
| AppImage with installer | Linux desktop, Steam Deck, handhelds, immutable systems | Built-in verified updater | `openbox-release.pub` Ed25519 plus SHA-256 checksum |
| AppImage manual | Offline or custom path | Manual re-download | `chmod +x`, then `./OpenBox-$(uname -m).AppImage --web` prints the server URL |
| Flatpak | Sandboxed installs | Flatpak workflow | `flatpak info io.openbox.GameLauncher` |
| From source | Development, patching | `git pull` | `python3 web_app.py` |
| System install | Install to `/usr/local` | `sudo make install` again | `openbox --web` prints the server URL |
| Windows portable with installer | Windows 10 and 11, x86_64 | Built-in verified updater | `install.ps1` Ed25519 plus SHA-256 checksum |
| macOS app bundle | macOS 11 or newer, Apple Silicon or Intel | Built-in verified updater | `install-macos.sh` verifies the release key, SHA-256, and Ed25519 signature |

Every release publishes these artifacts:

| Asset | Architecture | Type |
| --- | --- | --- |
| `install.sh` | any | Linux release installer (bash) |
| `install.ps1` | any | Windows release installer (PowerShell 5.1), run from the extracted release archive |
| `install-macos.sh` | any | macOS release installer (bash), run with the tag pinned |
| `verify_release.py` | any | Release signature verifier that `install-macos.sh` runs |
| `openbox-release.pub` | any | Ed25519 release public key |
| `OpenBox-x86_64.AppImage` | x86_64 | AppImage, signed |
| `OpenBox-x86_64.AppImage.sha256` | x86_64 | SHA-256 checksum sidecar |
| `OpenBox-x86_64.AppImage.sig` | x86_64 | Ed25519 signature sidecar |
| `OpenBox-x86_64.AppImage.zsync` | x86_64 | zsync delta-update metadata |
| `OpenBox-aarch64.AppImage` | ARM64 | AppImage, signed |
| `OpenBox-aarch64.AppImage.sha256` | ARM64 | SHA-256 checksum sidecar |
| `OpenBox-aarch64.AppImage.sig` | ARM64 | Ed25519 signature sidecar |
| `OpenBox-aarch64.AppImage.zsync` | ARM64 | zsync delta-update metadata |
| `OpenBox-x86_64.flatpak` | x86_64 | Flatpak bundle |
| `OpenBox-x86_64-windows.zip` | x86_64 | Windows portable, signed |
| `OpenBox-x86_64-windows.zip.sha256` | x86_64 | SHA-256 checksum sidecar |
| `OpenBox-x86_64-windows.zip.sig` | x86_64 | Ed25519 signature sidecar |
| `OpenBox-x86_64-windows-native-host.exe` | x86_64 | WebView2 window host, signed |
| `OpenBox-x86_64-windows-native-host.exe.sha256` | x86_64 | SHA-256 checksum sidecar |
| `OpenBox-x86_64-windows-native-host.exe.sig` | x86_64 | Ed25519 signature sidecar |
| `OpenBox-macos.zip` | Universal (arm64 and x86_64) | macOS app bundle, ad-hoc signed, with a signed release |
| `OpenBox-macos.zip.sha256` | Universal | SHA-256 checksum sidecar |
| `OpenBox-macos.zip.sig` | Universal | Ed25519 signature sidecar |
| `OpenBox-1.19.1-sbom.json` | x86_64 | SBOM (CycloneDX 1.4) |
| `OpenBox-1.19.1-aarch64-sbom.json` | ARM64 | SBOM (CycloneDX 1.4) |
| `OpenBox-1.19.1-macos-sbom.json` | Universal | SBOM (CycloneDX 1.4) |

The Windows archive ships with the same `.sha256` sidecar and `.sig` signature as the AppImages, verified by `install.ps1` and by the in-app updater with the Python standard library alone. The native-host executable is the same binary that archive carries, published on its own for source checkouts, and it goes through the same checksum and signature ladder.

The macOS bundle is signed the same way. `install-macos.sh` and the in-app updater verify its SHA-256 checksum and Ed25519 signature before they install it. The bundle is also ad-hoc signed, so macOS asks you to allow it on first launch.

## AppImage with installer, recommended

The installer pins the release public key, verifies the SHA-256 checksum, and verifies the Ed25519 signature before installing to `~/.local/bin`.

```bash
VERSION=1.19.1
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

Windows 10 and 11 on x86_64 install from a signed portable archive. Download the archive, extract it, and run the bundled installer. The installer resolves and pins the release public key, verifies the archive's SHA-256 checksum and its Ed25519 signature, and only then extracts the runtime to `%LOCALAPPDATA%\OpenBox\share\openbox`.

```powershell
$Version = '1.19.1'
Invoke-WebRequest -UseBasicParsing -OutFile OpenBox-x86_64-windows.zip `
  "https://github.com/vindeckyy/OpenBoxGL/releases/download/v$Version/OpenBox-x86_64-windows.zip"
Expand-Archive OpenBox-x86_64-windows.zip -DestinationPath .
Get-Content .\OpenBox\scripts\install.ps1   # read it before running it
powershell -ExecutionPolicy Bypass -File .\OpenBox\scripts\install.ps1 -Tag "v$Version"
```

The `install.ps1` release asset is the same installer that ships inside the archive, and it needs the release verifier (`updates.py`) one directory above it. The verifier is the trust anchor for the Ed25519 check, so it is never downloaded on its own — run the script from the extracted release, where `updates.py` sits one directory above it.

To launch right after installing, add `-Run`. Install to a different directory with `-InstallDir`, or skip the user `PATH` edit with `-NoPathUpdate`. The installer requires Windows PowerShell 5.1 and Python 3.10 or newer on `PATH`; it needs neither curl nor OpenSSL, because signature verification uses the same standard-library RFC 8032 implementation as the in-app updater.

It keeps the previous runtime at `share\openbox.previous`, registers the Start Menu shortcut and the `openbox://` protocol handler, and adds the runtime folder to your user `PATH`. The release publishes only the two installers, `install.sh` and `install.ps1`, as release assets — the uninstaller is not one of them. It ships **inside** the zip and inside the install tree, so you run it from `scripts\uninstall.ps1` under your install directory (for a default install, `%LOCALAPPDATA%\OpenBox\share\openbox\scripts\uninstall.ps1`). It removes exactly what this installer created — the install tree, the `PATH` entry, the shortcut, and the `openbox://` registration — and never touches your library. See [Windows](/windows/) for the launcher ladder, the WebView2 native window, and the full uninstall procedure.

## macOS app bundle

macOS 11 or newer on Apple Silicon or Intel installs from the signed universal app bundle. The installer pins the release key, verifies the bundle's SHA-256 checksum and Ed25519 signature, and installs `OpenBox.app` into `~/Applications`:

```bash
VERSION=1.19.1
curl --proto '=https' --tlsv1.2 --fail --location \
  --output install-macos.sh \
  "https://github.com/vindeckyy/OpenBoxGL/releases/download/v${VERSION}/install-macos.sh"
less install-macos.sh
OPENBOX_RELEASE_TAG="v${VERSION}" bash install-macos.sh
```

The bundle carries its own Python, so the app needs nothing installed. The installer needs `curl`, `shasum`, `ditto`, and `python3` on `PATH`. It refuses to replace an existing `OpenBox.app` unless you pass `--replace`. The bundle is not notarized, so the first launch asks you to allow it in **System Settings > Privacy & Security > Open Anyway**. See [macOS](/macos/) for the native window, updates, data location, and what is hidden on macOS.

## Flatpak

Install the published bundle directly — no build step needed:

```bash
curl --proto '=https' --tlsv1.2 --fail --location \
  --output OpenBox-x86_64.flatpak \
  "https://github.com/vindeckyy/OpenBoxGL/releases/download/v1.19.1/OpenBox-x86_64.flatpak"
flatpak install --bundle OpenBox-x86_64.flatpak
flatpak run io.openbox.GameLauncher
```

Or build from the project's manifest with `flatpak-builder`:

```bash
git clone https://github.com/vindeckyy/OpenBoxGL.git
cd OpenBoxGL
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

Requirements: Python 3.10 or newer on Linux or macOS with standard desktop tooling. On Linux the native window additionally needs WebKitGTK 4.1, and `make native-host` builds `native_host`. On macOS the native window uses WKWebView, which ships with the OS. No `pip install` is required. See `.env.example` for optional local configuration, never commit secrets.

## System install

```bash
sudo make install
openbox          # native window, default
openbox --web    # loopback web UI
```

## Prerequisites

| Requirement | AppImage | Flatpak | Source | Windows | macOS app bundle |
| --- | --- | --- | --- | --- | --- |
| Linux desktop, X11 or Wayland | Yes | Yes | Yes | Not applicable | Not applicable |
| Windows 10 or 11, x86_64 | Not applicable | Not applicable | Not applicable | Yes | Not applicable |
| macOS 11 or newer, Apple Silicon or Intel | Not applicable | Not applicable | Not applicable | Not applicable | Yes |
| WebKitGTK for native window | Bundled | Bundled | Required, libwebkit2gtk-4.1 | Not used | Not used |
| WebView2 runtime for native window | Not used | Not used | Not used | Required by `native_host.exe`; already present on Windows 11 and most Windows 10 | Not used |
| WKWebView for native window | Not used | Not used | Not used | Not used | Built in |
| Python | Bundled | Bundled | 3.10+ | 3.10+ on `PATH` | Bundled; `install-macos.sh` needs `python3` on `PATH` |
| flatpak and flatpak-builder | Not needed | Required | Not needed | Not needed | Not needed |
| git | Not needed | Not needed | Required | Not needed | Not needed |
| FUSE to mount AppImages | Required | Not needed | Not needed | Not applicable | Not applicable |
| bubblewrap bwrap | Optional, plugins sandboxed when present | Bundled check | Optional | Not applicable | Not applicable |

See [Installation](/install/) for prerequisites in detail, [Updating](/updating/) for the update flow and rollback, and [Getting started](/getting-started/) for the first import. v1.19.1 publishes signed x86_64 and aarch64 AppImages, an x86_64 Flatpak bundle, a signed x86_64 Windows portable archive, and a signed universal macOS app bundle.
