---
title: Upgrading to OpenBox 3.0
description: Schema 6 and 1-5 migration, plugin API v2, Python 3.11, and the removed surfaces.
---

OpenBox 3.0 keeps library schema 7, backup format 2, sync format 3, and `/api/v2`. A 2.0 or 2.1 library opens without migration. The breaks run the other way: 3.0 will not boot a schema 6 file, will not run a v1 plugin, will not roll a library back, and will not start on Python 3.10.

## Before you upgrade

- **Schema 6 library** (a 1.19 library that 2.1 has not opened): quit OpenBox, then either run `openbox --migrate-library` on 3.0 or open the library once on 2.1 before installing 3.0. Startup does not upgrade it. The command keeps `library.v6.backup.json`.
- **Schema 1-5 library:** open it on OpenBox 2.1 before installing 3.0. 3.0 migrates schema 6 only.
- **Plugin without `"api_version": 2`:** add it. 3.0 refuses a missing version or `1` with `PLUGIN_API_RETIRED`.
- **Source run on Python 3.10:** install Python 3.11 or newer. The Rust server itself needs no Python.
- **Need `openbox --rollback-library`:** it is gone. OpenBox 2.1.0 is the last build that restores `library.v6.backup.json`.

## Upgrade steps

1. Quit OpenBox.
2. Migrate a schema 6 library with `openbox --migrate-library`; a schema 7 library needs no migration.
3. Install 3.0 over 2.1, or over an older build after the library is schema 7.
4. Start OpenBox. `GET /api/v2/version` reports `version` 3.0.0, `api_version` 2, `state_schema` 7, `plugin_api_version` 2, `backup_format` 2, `sync_format` 3, and `runtime: "rust"`.

## What changed

- The backend is the Rust `openbox-server` with zero bundled CPython. The Python fallback (`OPENBOX_BACKEND=python`) still needs Python 3.11+.
- Plugin API v1 and `plugin_runner.py` are gone.
- `openbox --rollback-library` exits 4 and changes no file.
- Python 3.10 is no longer supported.
- The public API remains `/api/v2`; unversioned `/api/*` and `/api/v1/*` stay retired.

## What did not change

- Library schema 7, the required envelope, and backup format 2 (format 1 is still read).
- Sync format 3.
- `/api/v2` and `/api/host`.
- The SQLite read model: still a projection; deleting `sqlite_readmodel.db` loses nothing.
- The AppImage glibc floor (`GLIBC_2.35` on Ubuntu 22.04).

## If something goes wrong

- `STATE_SCHEMA_TOO_OLD`: run `openbox --migrate-library`; for schema 1-5, open the library on 2.1 first.
- `PLUGIN_API_RETIRED`: set `"api_version": 2` in `plugin.json`.
- `ROLLBACK_REMOVED`: install OpenBox 2.1.0 if you need `library.v6.backup.json`.
- The app will not start on Python 3.10: install 3.11+ for the fallback, or use a packaged 3.0 build (no Python required).

## Related pages

- [Updating](/updating/)
- [API 3.0 changes](/reference/api/three-zero/)
- [Plugin manifest](/reference/plugins/manifest/)
- [Data and recovery](/reference/data-and-recovery/)
