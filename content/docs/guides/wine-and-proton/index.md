---
title: Proton & Wine Prefix Manager
description: Discovers, configures, and isolates Windows game runners, Wine prefixes, and Proton runtime environments on Linux.
---

OpenBox includes a local-first Wine and Proton prefix manager. It automatically discovers existing prefixes from Bottles, Lutris, Heroic, Steam Proton, and custom directories, eliminating manual prefix path management.

## How it works

OpenBox's Wine subsystem inspects standard local directories at startup and caches known runtime environments:

1. **Prefix Discovery**:
   - Flatpak & Native Bottles: `~/.var/app/com.usebottles.bottles/data/bottles/prefixes/` and `~/.local/share/bottles/prefixes/`
   - Heroic Games Launcher: `~/.var/app/com.heroicgameslauncher.hgl/data/prefixes/` and `~/.config/heroic/prefixes/`
   - Lutris: `~/.local/share/lutris/runners/` and detected Wine runners
   - Steam Proton: `~/.local/share/Steam/steamapps/compatdata/` and Proton runtime installations in `compatibilitytools.d/`
   - System standard: `~/.wine`, `~/.local/share/wineprefixes/`

2. **Proton Runtime Discovery**:
   - GE-Proton, Proton-TKG, Proton Experimental, and standard Steam Proton builds are detected in `~/.local/share/Steam/compatibilitytools.d` and `~/.steam/root/compatibilitytools.d`.

## Assigning a Prefix to a Game

In the game's **Edit Metadata** modal:

- **Wine Prefix**: Select a discovered prefix from the dropdown or type an absolute directory path.
- **Wine / Proton Runner**: Choose between system Wine, Lutris Wine, or a detected Proton version.
- **Launch Command**: By default, OpenBox executes the game executable directly inside its configured prefix environment, or prepends `umu-run` when installed.

```bash
# Example resolved command executed by OpenBox
WINEPREFIX="/home/deck/.local/share/bottles/prefixes/gaming" wine "/home/deck/Games/Cyberpunk2077/bin/x64/Cyberpunk2077.exe"
```

## Running with UMU (Unified Linux Wine Game Launcher)

When `umu-run` is detected on `$PATH`, OpenBox can launch Windows executables through UMU, which automatically matches the appropriate Proton version, DXVK layer, and runtime fixes based on the game's identity.

```bash
# UMU execution format
GAMEID=openbox-game umu-run "{ImagePath}"
```

## REST API Endpoints

The Wine and Proton subsystem is fully accessible over OpenBox's local REST API:

- `GET /api/wine/prefixes`: Returns all discovered Wine and Proton prefixes.
- `GET /api/wine/protons`: Returns all detected Proton runtime versions.
- `GET /api/wine/prefix-for-game?game_id=<id>`: Resolves or suggests the optimal prefix for a given library title.

<Callout type="tip" title="Isolated Game Saves">
Save discovery scans automatically index the `drive_c/users/<user>/AppData` and `Saved Games` directories inside any attached Wine prefix.
</Callout>
