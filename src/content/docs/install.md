---
title: Installation
description: Install OpenBoxGL on Linux with AppImage, Flatpak, or source.
---

OpenBoxGL runs on Linux with Python 3.10+ for source installs. AppImage is the recommended path.

## AppImage

Download the latest release from [GitHub Releases](https://github.com/vindeckyy/OpenBoxGL/releases/latest), then run:

```bash
chmod +x OpenBox-x86_64.AppImage
./OpenBox-x86_64.AppImage
```

Use `--native` for the lightweight Tk interface:

```bash
./OpenBox-x86_64.AppImage --native
```

## Flatpak

```bash
flatpak-builder --user --install --force-clean build-dir io.openbox.GameLauncher.yml
flatpak run io.openbox.GameLauncher
```

## From source

```bash
git clone https://github.com/vindeckyy/OpenBoxGL.git
cd OpenBoxGL
python3 web_app.py
```

### Known issue

The current `sudo make install` wrapper path is not the recommended installation route. Use the AppImage, Flatpak, or source commands above.

## Related pages

- [Getting started](/getting-started/)
- [Interfaces and data](/interfaces-and-data/)
- [Updating](/updating/)
