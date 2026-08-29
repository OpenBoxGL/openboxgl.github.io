---
title: Troubleshooting plugins
description: Diagnose plugin launch failures, crashes, and safe mode.
---

Plugins are trusted local Python code that runs with your user privileges. When a plugin causes launch or library failures, the first tool is safe mode.

## Safe mode

`OPENBOX_SAFE_MODE=1` in the process environment disables plugin execution process-wide: `library` hooks, `before_launch`, `after_session`, and the webhook dispatcher all skip. The UI reports `settings.safe_mode`. It is the first thing to try when a plugin causes launch or library failures.

```
OPENBOX_SAFE_MODE=1 openbox
```

## Common failures

| Problem | Cause / fix |
| --- | --- |
| `"Launch canceled by a plugin."` / plugin error text | A `before_launch` plugin returned `{"cancel": true, ...}`. Remove or fix the plugin, or use safe mode. |
| `"A plugin returned an invalid launch command."` / `"...invalid working directory."` | A plugin returned structurally wrong output (empty argv, missing `cwd`, nonexistent working directory). Valid JSON that is wrong aborts the launch because launching with a broken command is worse. |
| Plugin crashes/timeouts | A crashing plugin can never break the app: the child process exits nonzero, times out (5 s), or returns invalid JSON, and its result is skipped with a warning. Only `before_launch` structural errors abort. |
| `"Plugin package needs a valid plugin.json."` / `"Plugin id, name, and version are required."` | The installed package is not a valid plugin. Install a package with a manifest (`id`, `name`, `version`; `entry` defaults to `plugin.py`). |
| Failed update broke a plugin | Updates are atomic with rollback: the old version moves to `plugins/.backups/<id>-<timestamp>` during the swap and is restored on any failure. Removal moves the package to `plugins/.removed/<id>-<timestamp>` (recoverable by moving it back). |

## Trust boundary

- Plugins execute in an isolated Bubblewrap (`bwrap`) OS sandbox (`--unshare-all`, `--ro-bind / /`, tmpfs on `/home`, `/tmp`, `/run`, and network disabled).
- If `bwrap` is missing on the host, plugins are skipped unless `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` is set for trusted local environments.
- Install only packages you wrote or audited. The bundled catalog is small and documentation-oriented; installing from it still runs local code.

## See also

- [Plugins](/reference/plugins/), manifest, hooks, and lifecycle
- [Plugin overview](/reference/plugins/overview/), trust boundary and safe mode
- [Plugin processes and errors](/reference/plugins/process-and-errors/), limits and failure handling
- [API local administrator](/reference/api/local-admin/), install/toggle/remove routes
