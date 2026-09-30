---
title: Faugus Launcher Integration
description: Import games, manage prefixes, and configure UMU-backed launches from Faugus Launcher.
---

OpenBox provides native integration with **Faugus Launcher**, the lightweight Linux game manager for Wine and UMU games: it reads Faugus manifests and prefixes and imports the titles into your unified library.

## Overview

When Faugus Launcher is installed, OpenBox can scan its data directories, read each game's prefix configuration, and import the titles into your unified library. OpenBox looks for Faugus data in `~/.config/faugus-launcher`, `~/.local/share/faugus-launcher`, `~/Faugus`, the matching `XDG_CONFIG_HOME`/`XDG_DATA_HOME` locations, and prefix directories containing `drive_c`.

## How to Import from Faugus

1. Open the **Library Setup Center** (**Set up library** in the top bar).
2. On the **Sources** step, add the **Faugus** source.
3. Continue to the scan: OpenBox detects all titles defined in Faugus manifests and prefix directories as preview candidates.
4. Review and commit the preview as usual.

You can also drive the scan entirely through the REST API (below).

Each imported title automatically receives:
- Canonical identity deduplication (matching against existing Steam, GOG, or ROM titles)
- Target executable path
- Dedicated Wine prefix path, recorded as `wine_prefix`
- A **suggested** launch command (`umu-run {path}`) — a starting point you can edit in Edit Metadata, not a wrapper the app applies for you. Prefix-only rows import without it.

## REST Endpoints

Automate Faugus scans or integrate with scripts:

- `GET /api/faugus/status`: Reports whether Faugus data directories exist, and which ones.
- `GET /api/faugus/scan`: Scans manifests and prefix directories and returns the discovered games with their prefix and runner metadata.
- `POST /api/faugus/import`: Imports the scanned games into the OpenBox library.

```bash
# Check Faugus installation status
curl -s -H "X-OpenBox-Token: $TOKEN" http://127.0.0.1:$PORT/api/faugus/status

# Scan for installed titles
curl -s -H "X-OpenBox-Token: $TOKEN" http://127.0.0.1:$PORT/api/faugus/scan
```
