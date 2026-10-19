---
title: Storefront Manager
description: Browse owned and installed catalogs, import either set, and automate imports.
---

The **Storefronts** dialog (top bar) browses your storefront catalogs, owned versus installed, and imports either set into the library. It covers Steam, Heroic, Lutris, and Gameyfin on both platforms, and native GOG Galaxy, EA app, and Ubisoft Connect installs on Windows.

<Callout type="note" title="Why owned vs. installed matters">

OpenBoxGL distinguishes between what you *own* on a storefront and what you actually *have installed* on disk. Importing "installed" gives you games ready to play; importing "owned / uninstalled" gives you placeholders so your catalog reflects your entire library ahead of time. The Play button on an uninstalled entry stays greyed-out (or becomes **INSTALL** for Gameyfin) until the game's local files appear. This separation lets you see your full collection without needing every title downloaded simultaneously.

</Callout>

## What each source shows

| Source | Owned list comes from | Installed list comes from |
| --- | --- | --- |
| Steam | `userdata/*/config/localconfig.vdf` | `steamapps/appmanifest_*.acf` |
| Heroic | `store_cache` library JSON | installed manifests (`legendaryConfig`, `gog_store`, `nile_config`) |
| Epic | `legendaryConfig/legendary/installed.json`, or `~/.config/legendary/installed.json` | the same manifests |
| Lutris | `lutris --list-games --json` | `lutris --list-games --installed --json` |
| Gameyfin | The configured server's catalog | The same catalog, filtered to installed titles |
| GOG Galaxy (Windows) | Not imported | Registry entries plus each game's `goggame-*.info` |
| EA app (Windows) | Not imported | EA `installerdata.xml` manifests |
| Ubisoft Connect (Windows) | Not imported | Ubisoft `Installs` registry keys |

**Import Epic** (`POST /api/import/epic`) reads Epic on its own through Legendary, and also reads Epic Games Launcher Windows manifests when they are present. It is a source in its own right rather than part of Heroic: use it when you keep Epic games via a native Legendary install and have no Heroic profile to import. Imported titles carry `source: "Epic"` and are keyed by their Heroic app id, so they dedupe against a later Heroic import instead of appearing twice.

The other per-source buttons are **Import Steam**, **Import Heroic**, **Import Lutris**, **Import Gameyfin**, **Import ScummVM**, **Import RPCS3**, and **Import Vita3K**. On Windows, three more buttons import installed games natively: **Import GOG**, **Import EA app**, and **Import Ubisoft Connect** (`POST /api/v2/import/gog`, `/ea`, and `/ubisoft`). They read installed games only, are offline, and never touch the launchers' files.

## Import owned / uninstalled

Storefront entries without local files are imported as owned-but-uninstalled (`store_installed: false`). For Gameyfin, the Play button on such an entry becomes **INSTALL**, downloading through the configured provider into the install folder (the Settings field is empty by default and shows a `~/Games/Gameyfin` placeholder). For Steam/Heroic/Lutris, an owned-but-uninstalled entry launches once the client has the game installed, the import simply keeps the title in your catalog ahead of time. The native Windows GOG, EA app, and Ubisoft Connect imports are installed-only: they do not read owned-but-uninstalled catalogs. The unreleased 1.18 build also gives each source an opt-in **Auto-import … on startup** checkbox, off by default.

## Auto-import on startup

Per-source **Auto-import on startup** checkboxes — Steam, Heroic, Epic, Lutris, and Gameyfin, plus the Windows-only GOG, EA app, and Ubisoft Connect in the unreleased 1.18 build — make the same imports run every launch. They are off by default; `include_uninstalled` is false for the three Windows-only sources. A background worker also re-imports watched folders every 10 seconds, backing off to 5 minutes when the library cannot be read.

## Import exclusions

Per-source import exclusions keep specific titles out of future imports and rescans. Add one per title from the Storefronts dialog (or via `/api/import/exclusions`); excluded entries are filtered from storefront imports and rescans. Heroic exclusions can be store-specific (Epic/GOG/Amazon).

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| Catalog empty for a source | The source has no readable manifests/caches. Check the paths in [Import sources](/integrations/import-sources/). |
| Gameyfin catalog fails | The server URL is unconfigured or unreachable; use **Test Gameyfin connection** first. |
| A title keeps re-importing | Add an import exclusion for it, or check it is not a storefront rescan. |
| GOG/EA/Ubisoft import finds nothing on Windows | The launcher has no installed games, or its registry entries/manifests are unreadable. Re-installing or repairing the launcher restores them; malformed entries are listed in `errors`. |
| An imported EA or Ubisoft game will not launch | The launcher's URI handler is missing. Reinstall or repair the EA app / Ubisoft Connect; the game stays in the library. |
| Auto-import imports too much | Uncheck the source's auto-import box, and use exclusions for the titles you do not want. |

## See also

- [Library importing](/guides/library/importing/), importing in general
- [Import sources](/integrations/import-sources/), source-specific paths and manifests
- [API content and imports](/reference/api/content-and-imports/), storefront catalog/import routes
- [Local services](/integrations/local-services/), Gameyfin server setup
