---
title: Storefront Manager
description: Browse owned and installed catalogs, import either set, and automate imports.
---

The **Storefront Manager** dialog (Tools → Game stores) browses your storefront catalogs, owned versus installed, and imports either set into the library. It covers Steam, Heroic, Lutris, and Gameyfin on both platforms, and native GOG Galaxy, EA app, and Ubisoft Connect installs on Windows.

<Callout type="note" title="Why owned vs. installed matters">

OpenBoxGL distinguishes between what you *own* on a storefront and what you actually *have installed* on disk. Importing "installed" gives you games ready to play; importing "owned / uninstalled" gives you placeholders so your catalog reflects your entire library ahead of time. The Play button on an uninstalled entry stays greyed-out (or becomes **INSTALL** for Gameyfin, and for a Steam game whose install folder is missing) until the game's local files appear. This separation lets you see your full collection without needing every title downloaded simultaneously.

</Callout>

## Scanning storefronts

**Scan storefronts** (`POST /api/v2/storefront/scan`) refreshes installed state without deleting games. Each source is scanned in its own child process with a **30-second budget** (`STOREFRONT_SCAN_TIMEOUT`); a source that exceeds it is recorded as `timeout` and the scan moves on rather than hanging on one launcher. The dialog shows a row per source with its live status — `pending`, `running`, `ok`, `skipped`, `timeout`, or `error` — the games it resolved, and its last scan time, so progress is visible per source rather than as one spinner.

A source with no storefront installed *and* no games already in the library is skipped instead of probed. The scan writes its per-source status to `storefront-status.json` in the data directory, and `GET /api/v2/storefront/status` returns the same list the dialog renders. A scan that runs into the budget stops there and keeps what it already found: a source that times out or errors leaves the library untouched, so the sources scanned before it stay applied — the saved state stays valid and the next scan picks up where this one stopped.

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

The other per-source buttons are **Import Steam**, **Import Heroic**, **Import Lutris**, **Import Gameyfin**, **Import ScummVM**, **Import RPCS3**, and **Import Vita3K**. On Windows, three more buttons import installed games natively: **Import GOG**, **Import EA app**, and **Import Ubisoft Connect** (`POST /api/v2/import/gog`, `/ea`, and `/ubisoft`). They read installed games only, are offline, and never touch the launchers' files. **Import PICO-8**, **Import MSU-1**, and **Import WHDLoad** live in Tools → Imports & extras rather than this dialog because they scan a folder instead of a launcher; see [Importing](/guides/library/importing/#pico-8-msu-1-and-whdload).

## Import owned / uninstalled

Storefront entries without local files are imported as owned-but-uninstalled (`store_installed: false`). For Gameyfin, the Play button on such an entry becomes **INSTALL**, downloading through the configured provider into the install folder (the Settings field is empty by default and shows a `~/Games/Gameyfin` placeholder). For Steam/Heroic/Lutris, an owned-but-uninstalled entry launches once the client has the game installed, the import simply keeps the title in your catalog ahead of time. The native Windows GOG, EA app, and Ubisoft Connect imports are installed-only: they do not read owned-but-uninstalled catalogs.

Steam adds two states to that model. An imported game whose install folder no longer exists shows a red **Missing** badge, and its Play button becomes the same **INSTALL** handoff; an installed Steam game offers **Verify Steam files**, which runs `steam://validate/<app_id>`. A rescan updates both flags in place, so a repaired install clears the badge without a re-import.

## Auto-import on startup

Each source's **Auto-import on startup** checkbox makes the same import run every launch. The stored setting is an object — `{enabled, platform, include_uninstalled}` — where **platform** overrides the platform assigned to imported titles and **include_uninstalled** also brings in owned-but-uninstalled games. Steam, Heroic, Lutris, Gameyfin, the Windows-only GOG, EA app, and Ubisoft Connect, and plugin storefronts are all covered; plugin sources use a `plugin:<id>` key. They are off by default, `include_uninstalled` is false for the three Windows-only sources (which have no platform or uninstall option in the dialog), and a legacy boolean saved by an older build is still honored until the next settings save migrates it to the object shape. A shared **excluded platforms** list is applied to every auto-import, and a background worker also re-imports watched folders every 10 seconds. A tick that finds nothing — an idle install, or a library that cannot be read — doubles the wait, up to 5 minutes; the next tick that imports something returns it to 10 seconds.

An import can also be limited to **new games only** — the **Import only games not already in the library** checkbox filters the catalog against existing game ids before anything is merged, which is useful for a storefront that lists hundreds of titles you already have.

## Import exclusions

Per-source import exclusions keep specific titles out of future imports and rescans. Add one per title from the **Storefront Manager** dialog (or via `/api/import/exclusions`); excluded entries are filtered from storefront imports and rescans, and the key is the source plus that source's external id — `steam`, `heroic`, `lutris`, `gameyfin`, `gog`, `ea`, or `ubisoft`. Heroic exclusions can be store-specific (Epic/GOG/Amazon). Removing one takes the same pair through `/api/import/exclusions/delete`.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| Catalog empty for a source | The source has no readable manifests/caches. Check the paths in [Import sources](/integrations/import-sources/). |
| Gameyfin catalog fails | The server URL is unconfigured or unreachable; use **Test Gameyfin connection** first. |
| A title keeps re-importing | Add an import exclusion for it, or check it is not a storefront rescan. |
| A Steam game shows a red **Missing** badge | Its install folder is gone. Use **INSTALL** to hand off to Steam, then rescan; **Verify Steam files** on an installed game runs `steam://validate/<app_id>`. |
| GOG/EA/Ubisoft import finds nothing on Windows | The launcher has no installed games, or its registry entries/manifests are unreadable. Re-installing or repairing the launcher restores them; malformed entries are listed in `errors`. |
| An imported EA or Ubisoft game will not launch | The launcher's URI handler is missing. Reinstall or repair the EA app / Ubisoft Connect; the game stays in the library. |
| Auto-import imports too much | Uncheck the source's auto-import box, and use exclusions for the titles you do not want. |

## See also

- [Library importing](/guides/library/importing/), importing in general
- [Import sources](/integrations/import-sources/), source-specific paths and manifests
- [API content and imports](/reference/api/content-and-imports/), storefront catalog/import routes
- [Local services](/integrations/local-services/), Gameyfin server setup
