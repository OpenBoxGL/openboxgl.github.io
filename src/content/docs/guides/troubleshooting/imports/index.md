---
title: Troubleshooting imports
description: Diagnose Steam, Heroic, Lutris, arcade, Gameyfin, and folder import failures.
---

Start with the exact visible error and the diagnostic log (**Settings > Copy diagnostic log**). Missing tools and malformed manifests are reported as import errors rather than silently creating unusable entries.

## Steam

Check that one of `~/.local/share/Steam`, `~/.steam/steam`, or the Flatpak path contains `steamapps/` with `appmanifest_*.acf` files. Launching requires `steam`, Flatpak Steam, or `xdg-open` on `PATH`; otherwise the importer raises:

```
"Steam, Flatpak, or xdg-open is required to launch imported Steam games."
```

## Heroic

Manifests live under `~/.config/heroic` (`legendaryConfig`, `gog_store`, `nile_config`) or the Flatpak path, plus standalone `~/.config/legendary`. Launching requires `xdg-open`:

```
"xdg-open is required to launch imported Heroic games."
```

## Lutris

OpenBoxGL runs `lutris --list-games --installed --json` (or the Flatpak variant). A missing binary raises:

```
"Lutris or Flatpak is required to import Lutris games."
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

Missing tools and malformed manifests never create partial entries: the importer raises a clear error (surfaced as `400`) or skips the unusable record. Re-running an import never duplicates — existing entries are skipped.

## See also

- [Library importing](/guides/library/importing/) — the full import workflow
- [Import sources](/integrations/import-sources/) — source-specific paths and manifests
- [API content and imports](/reference/api/content-and-imports/) — import route contracts
