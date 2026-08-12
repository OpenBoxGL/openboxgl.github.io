---
title: Plugins
description: Build trusted local plugins with the documented manifest and hook contract.
---

Plugins are local Python packages that extend OpenBoxGL through three hooks. They run as separate processes with a JSON stdin/stdout protocol, so a plugin that crashes or misbehaves cannot take down the library.

## Quick facts

- A plugin manifest (`plugin.json`) requires `id`, `name`, and `version`. IDs match `^[a-z0-9][a-z0-9._-]{1,63}$`.
- The implementation entry defaults to `plugin.py`; explicit entries such as `main.py` are supported and must be a Python file inside the package.
- Hooks are `library`, `before_launch`, and `after_session`. Declared hooks must be a subset of these three.
- The runner exchanges one JSON object per invocation over stdin/stdout, chains plugins in sorted (alphabetical by directory) order, caps input and output at 2 MiB each, and stops a plugin after five seconds.
- The plugin environment is cleaned before execution: `PYTHONPATH`, `PYTHONHOME`, `LD_PRELOAD`, and `LD_LIBRARY_PATH` are removed and `PYTHONNOUSERSITE=1` is set.
- Plugins are local code. Review them before installation. Safe mode (`OPENBOX_SAFE_MODE=1`) bypasses plugin execution entirely, and failed installations roll back to the previous version.

## Reference pages

- [Plugin API overview](/reference/plugins/overview/) — trust boundary and lifecycle
- [Plugin manifest reference](/reference/plugins/manifest/) — fields, ID validation, entry selection
- [Plugin hooks reference](/reference/plugins/hooks/) — the three payloads and response rules
- [Plugin processes and errors](/reference/plugins/process-and-errors/) — protocol limits, timeout, safe mode, rollback
- [Plugin catalog reference](/reference/plugins/catalog/) — bundled catalog entries and installation

## Install locations

Plugins live in `plugins/` inside the data directory. Installation accepts a directory or a ZIP package; the ZIP is extracted with the same safe extraction rules as game archives (no symlinks, no `..` paths, bounded sizes). State such as disabled plugins is kept in `plugins-state.json` next to the directory.

## See also

- [Configuration](/reference/configuration/) for `OPENBOX_SAFE_MODE` and the data directory.
- [Data and recovery](/reference/data-and-recovery/) for the library state plugins transform.
- [API local administrator](/reference/api/local-admin/) for the install/toggle/remove routes.
