---
title: Plugin catalog reference
description: Bundled catalog entries and local installation behavior.
---

The plugin catalog is the curated list of community plugins OpenBoxGL knows about. It is bundled with the application and refreshed from the repository when the network is available.

## Catalog sources

| Source | Path / URL | Timeout / cap | Fallback |
| --- | --- | --- | --- |
| Remote | `https://raw.githubusercontent.com/vindeckyy/OpenBoxGL/master/plugins/catalog.json` | 20 s, 4 MiB | Bundled local catalog |
| Local | `plugins/catalog.json` next to the application | none | `[]` |

`GET /api/plugins/catalog` tries the remote catalog first and falls back to the bundled file on any network or parse failure, so the catalog always returns something valid.

## Bundled entries

The current bundled catalog (`plugins/catalog.json`) contains one documentation example:

| id | name | hooks | url | notes |
| --- | --- | --- | --- | --- |
| `openbox.library-stats` | Library Stats Hook | `after_session` | (empty) | `local_only: true` example |

## Entry fields

| Field | Meaning |
| --- | --- |
| `id` | Plugin id, must match the manifest pattern (`^[a-z0-9][a-z0-9._-]{1,63}$`) |
| `name` | Display name |
| `version` | Version string |
| `description` | What the plugin does |
| `url` | Download URL for the plugin package (ZIP) |
| `hooks` | Declared hooks |
| `sha256` | Optional SHA-256 of the package; verified during download when present |
| `local_only` | When true, the entry is documentation-only: installing it raises `400` `"This catalog entry is documentation-only. Install local plugin packages manually."` |

## Installing from the catalog

`POST /api/plugins/catalog/install` with `{"id": "<catalog id>"}`:

1. Fetches the current catalog.
2. Looks up the id; unknown ids raise `400` `"Unknown catalog plugin."`
3. Downloads the package into a temporary directory with a 128 MiB cap, 120-second timeout, and SHA-256 verification when the entry provides `sha256`.
4. Installs it with the normal plugin installer (safe extraction, staging, rollback).

The plugin is then listed by `GET /api/plugins` and runs its declared hooks.

## Security notes

- Catalog entries are still third-party code. The catalog URL and sha256 only ensure the bytes you download match what the catalog advertises; they do not make the plugin trustworthy. Review `plugin.py` after install (it lives in `plugins/<id>/`).
- The remote catalog is fetched over HTTPS from the OpenBoxGL repository, so the trust chain is the repository's.
- If the network is unavailable or the remote catalog is unreachable, installs fall back to the bundled catalog (which has no downloadable entries today), and manual ZIP/directory installs remain the reliable path.

## Related

- [Plugin manifest reference](/reference/plugins/manifest/)
- [Plugin processes and errors](/reference/plugins/process-and-errors/)
- [API local administrator](/reference/api/local-admin/) for the catalog routes
