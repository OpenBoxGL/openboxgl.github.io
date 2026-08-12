---
title: Import sources
description: Configure Steam, Heroic, Lutris, Gameyfin, ROM, and arcade imports.
---

OpenBoxGL imports installed libraries and local files from the sources you already run on Linux. Every importer adds only entries that are not already present, so re-running an import never duplicates. Missing manifests, binaries, or malformed output are reported and skipped according to the source importer.

## Steam

- **Manifests**: `steamapps/appmanifest_*.acf` in every Steam library folder (`~/.local/share/Steam`, `~/.steam/steam`, the Flatpak `~/.var/app/com.valvesoftware.Steam/.local/share/Steam`, plus any library listed in `steamapps/libraryfolders.vdf`).
- **Records**: name, platform `PC`, source `Steam`, `steam_app_id`, install dir, and a launch command that prefers `steam -applaunch {app_id}`, falls back to `flatpak run com.valvesoftware.Steam -applaunch {app_id}`, then `xdg-open steam://rungameid/{app_id}`.
- **Prerequisite**: one of `steam`, `flatpak`, or `xdg-open` on `PATH`, else `"Steam, Flatpak, or xdg-open is required to launch imported Steam games."`
- `POST /api/import/steam` imports installed games; the storefront catalog also reads owned app ids from `userdata/*/config/localconfig.vdf`.

## Heroic

- **Manifests**: `legendaryConfig/legendary/installed.json` (Epic), `gog_store/installed.json` (GOG), `nile_config/installed.json` (Amazon) under `~/.config/heroic` or the Flatpak `~/.var/app/com.heroicgameslauncher.hgl/config/heroic`, plus the standalone `~/.config/legendary/installed.json`.
- **Records**: source `Epic`/`GOG`/`Amazon`, `heroic_app_id`, launch `xdg-open heroic://launch/<runner>/{heroic_app_id}`.
- DLC records (`is_dlc`) are skipped.
- **Prerequisite**: `xdg-open`, else `"xdg-open is required to launch imported Heroic games."`
- The storefront catalog reads library caches (`store_cache/*.json`, `GamesConfig/legendary.json`) to list owned-but-uninstalled titles.

## Lutris

- **Source**: `lutris --list-games --installed --json` (or `flatpak run net.lutris.Lutris --list-games --installed --json`), 30-second timeout.
- **Records**: non-installed entries skipped; numeric `id` required. Origin tagging from the service/source fields: Xbox/Game Pass -> `Xbox`, EA app/Origin -> `EA`, Ubisoft/uPlay -> `Ubisoft`, else `Lutris`. Platform defaults to the record platform, or `Windows` for wine/winesteam runners. Cover art is discovered from Lutris coverart folders when present.
- **Prerequisite**: `lutris` or `flatpak`, else `"Lutris or Flatpak is required to import Lutris games."` Malformed JSON raises `"Lutris returned an invalid game list."`

## Gameyfin

- **Source**: a self-hosted Gameyfin server configured in Settings (`gameyfin_url`, optional `gameyfin_username`/`gameyfin_password`, `gameyfin_install_dir`, `gameyfin_provider`).
- **Behavior**: catalog import lists owned games with installed status; install downloads the game from the server into the install directory (staging, rollback, symlink rejection, 4 GiB per file cap) and marks the entry installed; uninstall removes only files under the install directory.
- The install directory is empty by default; the Settings field shows a `~/Games/Gameyfin` placeholder. Provider resolution falls back to the first provider the server offers, or the bundled Direct Download provider.
- Connection and request failures surface as `400` with the server's message.

## ROM folders and executables

- **Import Folder** scans a folder recursively for supported extensions (see [API content and imports](/reference/api/content-and-imports/) for the full list) and adds each file, grouping multi-disc sets into an `.m3u` and ranking duplicate ROMs (preferring USA/World releases over beta/proto/demo/hack tags, and larger CHD/CUE/M3U over archives).
- Watch folders rescanned automatically every 10 seconds while the server runs.
- A `chosen_emulators` map can install emulators from Flathub during the wizard flow.

## Arcade sets (MAME / FinalBurn Neo)

- **Import**: `POST /api/import/arcade` with a ROM folder and optionally a DAT/XML file. Without a DAT, MAME's own `mame -listxml` output is used (`mame` must be installed, 300 s timeout, 256 MiB cap).
- **Classification** from the DAT (`cloneof` and per-set ROMs compared to ZIP contents): `parent`, `merged` (clone runs from the parent archive), `split` (own archive missing parent ROMs), `non-merged` (complete own archive).
- Launch command defaults to `mame -rompath <folder> {rom_name}` or `fbneo {path}`; an explicit `command` overrides.
- The set type counts are returned so you can verify classification.

## Loose arcade and console helpers

- `POST /api/import/loose-arcade`: `.zip`/`.7z`/`.singe`/`.rom` files, defaulting to `hypseus`/`singe` commands.
- `POST /api/import/xbox360`: folders with `default.xex`, `.xex`, `.xbe`; title from the parent folder for `default.xex`.
- `POST /api/import/scummvm`: games from `scummvm.ini` sections.
- `POST /api/import/rpcs3`: titles from `dev_hdd0/game/*/PARAM.SFO` (PS3).
- `POST /api/import/vita3k`: titles from `ux0/app/*/sce_sys/param.sfo` (Vita), resolving title ids to readable names.

## Import exclusions

Entries added via `/api/import/exclusions` block specific storefront titles from future imports and rescans, keyed by source + external id (Heroic entries can carry a three-part `heroic` key for store-specific exclusions).

## Failure model

- Missing launchers, malformed manifests, and empty results never create partial entries: the importer raises a clear error (surfaced as `400`) or skips the unusable record.
- `found` counts everything the source reported; `added` counts what the library did not already have. Storefront entries without local files are imported as owned-but-uninstalled (`store_installed: false`).

## Related

- [API content and imports](/reference/api/content-and-imports/) for every import route
- [Accounts and media](/integrations/accounts-and-media/) for metadata providers
- [Local services](/integrations/local-services/) for Gameyfin, OBS, and save tools
