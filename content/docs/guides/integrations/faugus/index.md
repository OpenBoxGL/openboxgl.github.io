---
title: Faugus Launcher Integration
description: Import games, manage prefixes, and configure UMU-backed launches from Faugus Launcher.
---

OpenBox provides native integration with **Faugus Launcher**, the lightweight Linux game manager for Wine and UMU games.

## Overview

When Faugus Launcher is installed (either natively or as a Flatpak via `io.github.Foldex.FaugusLauncher`), OpenBox can scan installed games, read their custom prefix configurations, and import them into your unified library.

## How to Import from Faugus

1. Open **Settings** (<kbd>Ctrl</kbd> + <kbd>,</kbd>) or the **Import** dialog.
2. Under **Launchers & Stores**, locate **Faugus Launcher**.
3. Click **Scan Faugus Games**. OpenBox will detect all titles defined in Faugus manifests.
4. Click **Import Scanned Games**.

Each imported title automatically receives:
- Canonical identity deduplication (matching against existing Steam, GOG, or ROM titles)
- Target executable path
- Dedicated Wine prefix path
- Pre-configured launch command (`umu-run {path}`)

## REST Endpoints

Automate Faugus scans or integrate with scripts:

- `GET /api/faugus/status`: Checks if Faugus data directories and manifests exist.
- `GET /api/faugus/scan`: Scans manifests and returns all discovered games with metadata.
- `POST /api/faugus/import`: Imports the scanned games into the OpenBox library.

```bash
# Check Faugus installation status
curl -s http://127.0.0.1:47990/api/faugus/status

# Scan for installed titles
curl -s http://127.0.0.1:47990/api/faugus/scan
```
