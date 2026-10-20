---
title: Plugin catalog reference
description: Bundled catalog entries and local installation behavior.
---

The plugin catalog is the curated list of community plugins OpenBoxGL knows about. It is bundled with the application and refreshed from a commit-pinned repository URL when the network is available.

## Catalog sources

| Source | Path / URL | Timeout / cap | Fallback |
| --- | --- | --- | --- |
| Remote | The pinned `plugins/catalog.json` commit on the OpenBoxGL repository | 20 s, 4 MiB, plus a pinned SHA-256 check on the response | Bundled local catalog |
| Local | `plugins/catalog.json` next to the application | none | `[]` |

`GET /api/plugins/catalog` tries the remote catalog first and falls back to the bundled file on any network, checksum, or parse failure, so the catalog always returns something valid. `GET /api/v2/plugins/catalog` (1.14.0+) additionally enriches every entry with `installed`, `installed_version`, and `update_available` (the enrichment is per-entry, not attached to `sandbox`), and reports the current `sandbox` status as a top-level response field.

## Bundled entries

The current bundled catalog (`plugins/catalog.json`) contains two documentation examples, both `local_only`:

| id | name | hooks | url | notes |
| --- | --- | --- | --- | --- |
| `openbox.library-stats` | Library Stats Hook | `after_session` | (empty) | `local_only: true` example |
| `openbox.hello-palette` | Hello Palette | `command` | (empty) | `local_only: true` example declaring one palette command |

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
| `author` | Optional author name (up to 80 characters), shown in the catalog browser |
| `homepage` | Optional HTTPS project URL, shown in the catalog browser |
| `local_only` | When true, the entry is documentation-only: installing it raises `400` `"This catalog entry is documentation-only. Install local plugin packages manually."` |

## Installing from the catalog

`POST /api/plugins/catalog/install` with `{"id": "<catalog id>"}`:

1. Fetches the current catalog.
2. Looks up the id; unknown ids raise `400` `"Unknown catalog plugin."`
3. Downloads the package into a temporary directory with a 128 MiB cap, 120-second timeout, and SHA-256 verification when the entry provides `sha256`.
4. Installs it with the normal plugin installer (safe extraction, staging, rollback).

The plugin is then listed by `GET /api/plugins` and runs its declared hooks. `POST /api/v2/plugins/repair` with `{id}` reinstalls an installed plugin from its catalog entry without touching its settings or cached stats; when the catalog has no entry it falls back to the recorded local package and re-verifies its SHA-256. The trust record survives the reinstall but is re-evaluated against the new package checksum, so a reinstall with different bytes leaves the plugin untrusted and asks for approval again.

Catalog validation is strict:

- Every entry needs a valid plugin id plus a non-empty `name` and `version`.
- A downloadable entry needs an HTTPS `url` and a 64-hex `sha256`; an entry without a URL must set `local_only`.
- `author` is at most 80 characters; `homepage` must be HTTPS and at most 300 characters. Both are shown in the catalog browser.
- If the remote catalog fails its pinned checksum or does not validate, the bundled catalog is used. If the bundled file is also invalid or missing, the catalog is empty.

## Security notes

- Catalog entries are still third-party code. The catalog URL and sha256 only ensure the bytes you download match what the catalog advertises; they do not make the plugin trustworthy. Review `plugin.py` after install (it lives in `plugins/<id>/`).
- The remote catalog is fetched over HTTPS from the OpenBoxGL repository, so the trust chain is the repository's.
- If the network is unavailable or the remote catalog is unreachable, installs fall back to the bundled catalog (which has no downloadable entries today), and manual ZIP/directory installs remain the reliable path.

## Related

- [Plugin manifest reference](/reference/plugins/manifest/)
- [Plugin processes and errors](/reference/plugins/process-and-errors/)
- [API local administrator](/reference/api/local-admin/) for the catalog routes
