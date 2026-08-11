---
title: Plugins guide
description: Install and use local Python plugins to extend OpenBoxGL.
---

Plugins are optional local Python packages that observe or extend OpenBoxGL through three hooks. They run as separate processes with a JSON stdin/stdout protocol, so a plugin that crashes or misbehaves cannot take down the library.

## What a plugin can do

| Hook | When it runs | What it can change |
| --- | --- | --- |
| `library` | On every library read | Rewrites the games list shown in the UI |
| `before_launch` | At launch, after profile/archive resolution | Rewrites the launch `args`/`cwd`, or cancels the launch with an error |
| `after_session` | After a session ends | Observes the session record; the result is discarded |

## Install a plugin

1. Open **Plugins** in the top bar.
2. **Install plugin** accepts a local directory or a ZIP package containing `plugin.json` (with `id`, `name`, `version`; `entry` defaults to `plugin.py`).
3. The package is staged, validated, and moved into `<data-dir>/plugins/<id>/`. Updates replace the previous version atomically with rollback.
4. Installed plugins list their id, name, version, entry, hooks, and enabled state. Toggle them on/off per plugin (persisted in `plugins-state.json`).

Installing from the **catalog** is also possible (`/api/plugins/catalog`), but the bundled catalog is small and documentation-oriented — today it contains one `local_only` example, so manual installs are the reliable path.

## Trust and safety

- Plugins execute with the same user privileges as OpenBoxGL and can read and modify files in your data directory and under your account.
- The child-process isolation is robustness, not a security sandbox.
- **Install only packages you wrote or audited.** Review `plugin.py` after install (it lives in `plugins/<id>/`).
- Safe mode (`OPENBOX_SAFE_MODE=1` in the environment) disables all plugin execution process-wide. It is the first thing to try when a plugin causes launch or library failures.

## Write your own

The [Plugin API reference](/reference/plugins/) documents the full contract:

- [Manifest](/reference/plugins/manifest/) — `plugin.json` fields and ID validation
- [Hooks](/reference/plugins/hooks/) — the three payloads and response rules
- [Processes and errors](/reference/plugins/process-and-errors/) — limits (2 MiB in/out, 5-second timeout), environment cleaning, and failure handling
- [Catalog](/reference/plugins/catalog/) — bundled entries and installation

A minimal plugin that observes sessions:

```json
{ "id": "example-observer", "name": "Example Observer", "version": "1.0.0", "hooks": ["after_session"] }
```

```python
def after_session(session):
    print("played", session["game"], "for", session["seconds"], "seconds")
    return session
```

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| Launch canceled by a plugin | A `before_launch` plugin canceled the launch. Fix or remove the plugin, or use safe mode. |
| Library looks wrong after installing a plugin | A `library` hook rewrites the games list. Toggle the plugin off, or run with `OPENBOX_SAFE_MODE=1`. |
| Failed update broke a plugin | Updates roll back automatically to `plugins/.backups/<id>-<timestamp>`; removal keeps a recoverable copy in `plugins/.removed/`. |

## See also

- [Troubleshooting plugins](/guides/troubleshooting/plugins/) — safe mode and failure handling
- [Plugin API reference](/reference/plugins/) — the full contract
- [API local administrator](/reference/api/local-admin/) — install/toggle/remove routes
