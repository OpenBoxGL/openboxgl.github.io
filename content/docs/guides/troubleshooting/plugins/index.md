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
| Plugin crashes/timeouts | A crashing plugin can never break the app: the child process exits nonzero, times out, or returns invalid JSON, and its result is skipped with a warning. Only `before_launch` structural errors abort. |
| `"Plugin does not declare the <hook> hook."` | The installed manifest does not list that hook. Reinstall a package that declares it; a hook cannot be called just because the plugin is installed. |
| `"Plugin does not declare the <capability> capability."` | A storefront, metadata, media, stats, emulator-settings, or discovery entry was requested from a plugin whose manifest lacks that capability. |
| `"Grant network access to this plugin first."` | A plugin source needs the `network` permission. Grant it in the plugin's permissions dialog; grants can never exceed what the manifest declares. |
| `"Plugin does not declare permissions: <names>."` | The permission grant includes something outside the manifest's declared set. Update the plugin or narrow the grant. |
| Plugin settings are missing from Settings > Plugins | Settings only render for enabled plugins with a valid settings schema. A disabled plugin's palette commands and settings forms do not load. |
| `"Plugin package needs a valid plugin.json."` / `"Plugin id, name, and version are required."` | The installed package is not a valid plugin. Install a package with a manifest (`id`, `name`, `version`; `entry` defaults to `plugin.py`). |
| A plugin update broke it | Updates are atomic with rollback: the old version moves to `plugins/.backups/<id>-<timestamp>` during the swap and is restored on any failure. |
| A local package changed on disk | The recorded checksum no longer matches. `POST /api/v2/plugins/repair` reinstalls from the recorded package or the catalog; if the recorded file changed, reinstall it manually. |

### Hook timeouts

Legacy hooks keep a 5-second budget. Capability hooks get longer: storefront 30 s, metadata/media/stats 15 s, emulator/discovery 10 s. A hook that exceeds its budget is skipped with a warning; the library and launch still proceed. Capability hooks may request host services exactly once, and the host re-invokes the hook with the results; there is no standalone `services` hook.

## Repair, reinstall, and removal

- `POST /api/v2/plugins/repair` reinstalls one plugin from its catalog entry (or its recorded local package) without touching settings, stats, or trust. Use it when a plugin's files are damaged but its records are fine.
- Disabling or removing a plugin deletes the games it imported, stops its cached stats from merging, and clears its settings, trust, permissions, data, credentials, and stats cache. Removal moves the package to `plugins/.removed/<id>-<timestamp>` (recoverable by moving it back).
- Capability credentials are stored per plugin and never returned to the browser; `GET /api/v2/plugins/credentials` reports which keys are set. Backups exclude the capability credential store and blank password-format plugin settings, so a restored backup does not reintroduce secrets.
- Plugin stats merge monotonically into library projections; a stats hook failure leaves the previous values in place.

## Trust boundary

- Plugins execute in an isolated Bubblewrap (`bwrap`) OS sandbox (`--unshare-all`, `--ro-bind / /`, tmpfs on `/home`, `/tmp`, `/run`, and network disabled).
- If `bwrap` is missing on the host — always the case on Windows — plugins are skipped unless `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` is set for trusted local environments.
- Install only packages you wrote or audited. The bundled catalog is small and documentation-oriented; installing from it still runs local code.

## See also

- [Plugins](/reference/plugins/), manifest, hooks, and lifecycle
- [Plugin overview](/reference/plugins/overview/), trust boundary and safe mode
- [Plugin processes and errors](/reference/plugins/process-and-errors/), limits and failure handling
- [API local administrator](/reference/api/local-admin/), install/toggle/remove routes
