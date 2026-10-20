---
title: Troubleshooting imports
description: Diagnose Steam, Heroic, Lutris, arcade, Gameyfin, and folder import failures.
---

Start with the exact visible error and the diagnostic log (**Settings > Advanced > Copy diagnostic log**). Missing tools and malformed manifests are reported as import errors rather than silently creating unusable entries.

## Steam

Check that one of `~/.local/share/Steam`, `~/.steam/steam`, or the Flatpak path contains `steamapps/` with `appmanifest_*.acf` files. Launching requires `steam`, the Steam Flatpak, or `xdg-open` on `PATH`; otherwise the importer raises:

```
"Steam, the Steam Flatpak, or xdg-open is required to launch imported Steam games."
```

`POST /api/import/steam` returns `{"added", "found", "errors"}`: unreadable libraries are reported, not skipped silently. Each `errors` entry names the path and the OS error (`"<steamapps path>: <strerror>"`). A library on a read-only mount shows up here (for example `"<steamapps>: Read-only file system"`) instead of importing zero games with no explanation. `POST /api/import/watch` reports per-folder errors the same way.

Imported Steam games record whether their install folder still exists. In the library, a missing install shows a red **Missing** badge and the play button becomes **Install**, which hands the game to Steam to install. An installed game offers **Verify Steam files**, which opens `steam://validate/<app_id>` so Steam performs verification and repair; OpenBox does not hash or replace the files. Neither action rewrites the imported record, so the badge clears on the next storefront scan once the install folder exists.

Non-UTF8 file names survive the scan: folder scanners and Steam shortcut parsing decode with `surrogateescape`, so a foreign byte sequence never crashes the import — the entry imports under its surrogate-escaped name.

## Storefront scans and auto-import

- `POST /api/v2/storefront/scan` queues a background scan (`202` with `job_id` and `sources`). `GET /api/v2/storefront/status` reports one entry per source with `status`, `installed`, `last_scan`, `error`, and `games`.
- Each source gets a 30-second budget in its own child process. A timeout is recorded as `{"status": "timeout", "error": "Storefront scan timed out after 30s."}` and leaves that source untouched; sources already scanned stay applied and later sources still run. Re-run the scan after the store responds.
- Sources with no install and no games already in the library are marked `skipped` instead of failing.
- Per-source auto-import stores `{enabled, platform, include_uninstalled}`. `enabled` keeps importing that store, `platform` sets the target platform for its games, and `include_uninstalled` imports owned-but-uninstalled titles. A storefront import can also be limited to games that are not already in the library with `only_new`.
- A legacy boolean `storefront_auto_import` entry is migrated to the object shape on the next settings save; until then readers accept both, so an enabled store keeps importing after the upgrade.
- The watched-folder worker ticks every 10 seconds. A tick that finds nothing — an idle install, or a library that cannot be read — doubles the wait, up to 5 minutes, and the next tick that imports something returns it to 10 seconds.

## Heroic

Manifests live under `~/.config/heroic` (`legendaryConfig`, `gog_store`, `nile_config`) or the Flatpak path, plus standalone `~/.config/legendary`. Launching requires `xdg-open`:

```
"xdg-open is required to launch imported Heroic games."
```

## Lutris

OpenBoxGL runs `lutris --list-games --installed --json` (or the Flatpak variant). A missing binary raises:

```
"Lutris or the Lutris Flatpak is required to import Lutris games."
```

Malformed output raises `"Lutris returned an invalid game list."` and imports nothing.

## Arcade sets

A DAT/XML file is used when given; otherwise `mame -listxml` must work (up to 256 MiB output, 5-minute timeout). BIOS and non-runnable machines are skipped. Imported sets are classified parent/merged/split/non-merged; verify the returned set counts.

## Gameyfin

Configure the URL in **Storefronts** and use **Test Gameyfin connection** first. Connection and request failures surface as `400` with the server's message. Install failures keep the previous files (staging with rollback); uninstall refuses paths outside the install directory.

## Folder import

- Only recognized extensions import; unknown files are skipped.
- Multi-disc groups need `(Disc N)` style markers to merge into one entry.
- If a folder import finds 0 of N, check the extension table in [Library importing](/guides/library/importing/).
- A wrong path imports nothing and reports it; the importer resolves `~` but does not guess.

## General

Missing tools and malformed manifests never create partial entries: the importer raises a clear error (surfaced as `400`) or skips the unusable record. Re-running an import never duplicates, existing entries are skipped.

## See also

- [Library importing](/guides/library/importing/), the full import workflow
- [Import sources](/integrations/import-sources/), source-specific paths and manifests
- [API content and imports](/reference/api/content-and-imports/), import route contracts
