---
title: Plugins
description: Build trusted local plugins with the documented manifest, hook, and capability contract.
---

Plugins are local Python packages that extend OpenBoxGL through documented hooks. They run as separate processes with a JSON stdin/stdout protocol, so a plugin that crashes or misbehaves cannot take down the library.

## Quick facts

- A plugin manifest (`plugin.json`) requires `id`, `name`, and `version`. IDs match `^[a-z0-9][a-z0-9._-]{1,63}$`.
- The implementation entry defaults to `plugin.py`; explicit entries such as `main.py` are supported and must be a Python file inside the package.
- Base hooks are `library`, `before_launch`, `after_session`, `command`, `library_source`, and `events` (the last three added in v1.14.0). A declared base hook outside this set is rejected.
- Capability hooks (1.18.0) are `storefront`, `metadata`, `media`, `stats`, `emulator`, and `discovery`. Each is declared through `capabilities`, and a capability without its hook is a manifest error. There is no standalone `services` hook; a capability hook may return `service_requests` instead.
- The runner exchanges one JSON object per invocation over stdin/stdout, chains base hooks in sorted (alphabetical by directory) order, caps input and output at 2 MiB each, and stops a plugin after its hook timeout (5 seconds for base hooks; 30 s storefront, 15 s metadata/media/stats, 10 s emulator/discovery).
- The plugin environment is cleaned before execution: `PYTHONPATH`, `PYTHONHOME`, `LD_PRELOAD`, and `LD_LIBRARY_PATH` are removed and `PYTHONNOUSERSITE=1` is set.
- Capability hooks also receive a bounded data bag, non-secret settings, and capability credentials. Backups exclude the credential store and blank password-format settings.
- Plugins are local code. Review them before installation. Safe mode (`OPENBOX_SAFE_MODE=1`) skips the lifecycle hooks (`library`, `before_launch`, `after_session`, `library_source`, `events`) and the webhook dispatcher, but not the capability hooks — an explicit storefront, metadata, media, stats, emulator-settings, or discovery call still invokes that plugin's hook. Failed installations roll back to the previous version.

## Reference pages

- [Plugin API overview](/reference/plugins/overview/), trust boundary and lifecycle
- [Plugin manifest reference](/reference/plugins/manifest/), fields, ID validation, entry selection, capabilities and messages
- [Plugin hooks reference](/reference/plugins/hooks/), the payloads, service requests, and response rules
- [Plugin processes and errors](/reference/plugins/process-and-errors/), protocol limits, timeouts, safe mode, rollback
- [Plugin catalog reference](/reference/plugins/catalog/), bundled catalog entries and installation

## Install locations

Plugins live in `plugins/` inside the data directory. Installation accepts a directory or a ZIP package; the ZIP is extracted with the same safe extraction rules as game archives (no symlinks, no `..` paths, bounded sizes). State such as disabled plugins is kept in `plugins-state.json` next to the directory. Per-plugin data and credentials live under `plugins/data/` and `plugins/credentials/` with mode `0600`, and cached stats live under `plugin-stats/`.

## See also

- [Configuration](/reference/configuration/) for `OPENBOX_SAFE_MODE` and the data directory.
- [Data and recovery](/reference/data-and-recovery/) for the library state plugins transform.
- [API local administrator](/reference/api/local-admin/) for the install/toggle/remove routes.
