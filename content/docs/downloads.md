---
title: Downloads
description: Every way to install OpenBoxGL, with verification steps per method.
---

# Downloads

One table for every install method. Pick the row that matches your system, then follow its verify step. All methods install the same OpenBoxGL application, currently **v1.8.0**.

| Method | Best for | Updates | Verify |
| --- | --- | --- | --- |
| AppImage with installer | Desktop, Steam Deck, handhelds, immutable systems | Built-in verified updater | `openbox-release.pub` Ed25519 plus SHA-256 checksum |
| AppImage manual | Offline or custom path | Manual re-download | `chmod +x` then `--version` or `--web` |
| Flatpak | Sandboxed installs | Flatpak workflow | `flatpak run io.openbox.GameLauncher` |
| From source | Development, patching | `git pull` | `python3 web_app.py` |
| System install | Install to `/usr/local` | `sudo make install` again | `openbox --help` |

## AppImage with installer, recommended

The installer pins the release public key, verifies the SHA-256 checksum, and verifies the Ed25519 signature before installing to `~/.local/bin`.

```bash
VERSION=1.8.0
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

Manual download:

```bash
chmod +x OpenBox-$(uname -m).AppImage
./OpenBox-$(uname -m).AppImage
./OpenBox-x86_64.AppImage --web
```

## Flatpak

```bash
flatpak-builder --user --install --force-clean build-dir io.openbox.GameLauncher.yml
flatpak run io.openbox.GameLauncher
```

The manifest targets the GNOME / Flatpak 25.08 runtime and grants `--filesystem=home`, so Steam, Heroic, Lutris, and ROM folders under home remain readable. The Flatpak is not updated by the built-in updater. Rebuild the manifest to update.

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

| Requirement | AppImage | Flatpak | Source |
| --- | --- | --- | --- |
| Linux desktop, X11 or Wayland | Yes | Yes | Yes |
| WebKitGTK for native window | Bundled | Bundled | Required, libwebkit2gtk-4.1 |
| Python | Bundled | Bundled | 3.10+ |
| flatpak and flatpak-builder | Not needed | Required | Not needed |
| git | Not needed | Not needed | Required |
| FUSE to mount AppImages | Required | Not needed | Not needed |
| bubblewrap bwrap | Optional, plugins sandboxed when present | Bundled check | Optional |

See [Installation](/install/) for prerequisites in detail, [Updating](/updating/) for the update flow and rollback with `OpenBox-x86_64.previous.AppImage`, and [Getting started](/getting-started/) for the first import.
