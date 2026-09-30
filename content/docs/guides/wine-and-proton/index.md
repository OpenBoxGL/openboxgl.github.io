---
title: Proton & Wine Prefix Manager
description: Discovers, configures, and isolates Windows game runners, Wine prefixes, and Proton runtime environments on Linux.
---

OpenBox ships a local-first Wine and Proton **discovery** layer. It automatically finds existing prefixes in `~/.wine`, `~/.local/share/wineprefixes`, the Lutris Wine runners tree, the Faugus prefix directories, the Bottles store, and `~/Games`, so you can point a title at a prefix without hand-writing a path. Heroic is not one of these sources: it appears only as a storefront importer, which is a different subsystem.

<Callout type="caution" title="This guide applies to Linux hosts">

Since 1.13.0 OpenBox also runs natively on Windows, where Windows titles launch directly: the Windows build does not use Wine, Proton, or UMU, and none of the discovery or launch behavior below applies there. See [Windows](/windows/) for the native Windows host, install layout, and launchers.

</Callout>

## How it works

OpenBox's Wine subsystem inspects standard local directories and lists what it finds. It is a **discovery and suggestion** layer, not a runtime wrapper: it reads directories and reads the `wine_prefix` field on a game record, but it does not construct the launch command for you.

1. **Prefix Discovery** (`DEFAULT_PREFIX_ROOTS` in `pkg/parity/parity_wine.py:16-24`):
   - `~/.wine`, `~/.local/share/wineprefixes/`
   - Faugus Launcher prefixes: `~/.config/faugus-launcher/prefixes`, `~/Faugus`
   - Bottles: `~/.local/share/bottles/bottles`
   - Lutris: `~/.local/share/lutris/runners/wine`
   - Custom folders: `~/Games`, plus the `WINEPREFIX` environment variable
   - Note: `~/.local/share/lutris/runners/wine` holds Wine **builds**, not game prefixes. The scanner only accepts a directory that actually contains a `drive_c`, so a runner tree is skipped even though the root is scanned.

2. **Proton Runtime Discovery** (`DEFAULT_PROTON_ROOTS` in `pkg/parity/parity_wine.py:28-36`):
   - Steam Proton: `~/.steam/root/compatibilitytools.d`, `~/.steam/steam/compatibilitytools.d`, `~/.local/share/Steam/compatibilitytools.d`
   - Faugus runners: `~/.config/faugus-launcher/runners`, `~/.local/share/faugus-launcher/runners`
   - Lutris runners: `~/.local/share/lutris/runners/wine`
   - System and Flatpak executables: `wine`, `wine64`, `proton`, `umu-run`, `umu-launcher`

   Proton roots are scanned one level deep, which is why the Steam `compatibilitytools.d` and Lutris runner trees resolve: each direct child of a root is checked for a `proton` file, a `files/bin/wine` or `dist/bin/wine` binary, or a name containing "proton" or "wine". (The two-level walk belongs to the separate prefix scanner, not to this one.)

## Assigning a Prefix to a Game

`GET /api/wine/prefix-for-game?game_id=<id>` resolves a title's prefix by reading the `wine_prefix`, `prefix`, or `WINEPREFIX` field on the game record, including a `WINEPREFIX=` assignment inside the launch command.

There is no control for setting this, and the library API cannot set it either: the game field cleaner copies only the fields in its accepted set, and `wine_prefix` is not one of them, so a `wine_prefix` key sent to the library API is dropped. The supported way to record a prefix on a title is the **Launch command** field of the **Edit Metadata** modal, because `WINEPREFIX=/path/to/prefix` written there is parsed out of the command and resolved like any other prefix. The one place OpenBox itself writes `wine_prefix` is the Faugus importer, which seeds imported titles with the prefix it found in the Faugus data. The prefix OpenBox reads is the one you assign; there is no automatic `WINEPREFIX` environment injection at spawn time, and no automatic UMU wrapper.

<Callout type="caution" title="OpenBox does not build the Wine launch command">

The prefix and Proton discovery is read-only. OpenBox will not prepend `wine` or `umu-run` to your launch command for you. To launch through a runner, write the command yourself on the game record — for example `WINEPREFIX=/path/to/prefix wine "/path/to/game.exe"`. The Faugus importer is the one exception: it seeds imported titles with `umu-run {path}` as a starting point.

</Callout>

## REST API Endpoints

The Wine and Proton discovery results are readable over OpenBox's local REST API:

- `GET /api/wine/prefixes`: Returns all discovered Wine prefixes, each as `{path, has_drive_c, name}`.
- `GET /api/wine/protons`: Returns all detected Proton runtime versions.
- `GET /api/wine/prefix-for-game?game_id=<id>`: Resolves the prefix recorded for a library title.

All three return `available: false` with an empty list when the Wine layer is unavailable on the host.

<Callout type="tip" title="Game saves inside prefixes">

If a game's configured save path lives inside its attached Wine prefix (for example under `drive_c/users/<user>/AppData` or `Saved Games`), point save discovery at that absolute path. There is no automatic Wine-prefix save scan — configure the path explicitly so backups capture it.
</Callout>
