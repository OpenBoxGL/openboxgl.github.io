---
title: Plugins guide
description: Install and use local Python plugins to extend OpenBoxGL.
---

Plugins are optional local Python packages that observe or extend OpenBoxGL through six hooks. They run as separate processes with a JSON stdin/stdout protocol, so a plugin that crashes or misbehaves cannot take down the library.

<Callout type="caution" title="What 'separate process' actually means">

Without bubblewrap, isolation is robustness, not a security sandbox. The child process shares your user privileges and your filesystem, it can read and write any file your OpenBoxGL process can reach. The 5-second timeout, 2 MiB payload cap, and `PYTHONNOUSERSITE=1` environment cleaning prevent runaway behavior, but they don't restrict what the plugin can see on disk. When `bwrap` (bubblewrap) is available, OpenBoxGL runs plugins in an OS sandbox (`--unshare-all`, `--ro-bind / /`, `tmpfs` on `/home`/`/tmp`/`/run`, no network); if the sandbox cannot be created, enabled plugins are skipped unless you trust the plugin in the Plugins manager ("Trust and run", bound to the package's SHA-256) or set `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` for trusted local plugins. Review every installed `plugin.py` before enabling it, and use `OPENBOX_SAFE_MODE=1` if you're unsure about a package. See [How OpenBoxGL works](/reference/how-it-works/#the-plugin-runner) for the execution pipeline.

</Callout>

## What a plugin can do

| Hook | When it runs | What it can change |
| --- | --- | --- |
| `library` | On every library read | Rewrites the games list shown in the UI |
| `before_launch` | At launch, after profile/archive resolution | Rewrites the launch `args`/`cwd`, or cancels the launch with an error |
| `after_session` | After a session ends | Observes the session record; the result is discarded |
| `command` | When a command-palette entry is picked (1.14.0+) | Returns a notification to display; adds entries to the palette |
| `library_source` | On every library read, if declared (1.14.0+) | Contributes imported games to your library |
| `events` | On lifecycle events (1.14.0+) | Observes `app_startup`, `app_shutdown`, `scan_finished`, `playtime_milestone`, `game_added`, `game_removed`, `game_updated` |

## Install a plugin

1. Open **Plugins** in the top bar.
2. **Install plugin** accepts a local directory or a ZIP package containing `plugin.json` (with `id`, `name`, `version`; `entry` defaults to `plugin.py`).
3. The package is staged, validated, and moved into `<data-dir>/plugins/<id>/`. Updates replace the previous version atomically with rollback.
4. Installed plugins list their id, name, version, entry, hooks, and enabled state. Toggle them on/off per plugin (persisted in `plugins-state.json`).

Installing from the **catalog** is also possible (`GET /api/plugins/catalog`, or `GET /api/v2/plugins/catalog` for the version that also reports what is already installed and the current sandbox status). The bundled catalog ships two `local_only` documentation examples — `openbox.library-stats` and `openbox.hello-palette` — so manual installs remain the reliable path.

## Trust and safety

- Plugins execute with the same user privileges as OpenBoxGL and can read and modify files in your data directory and under your account, unless `bwrap` is available, in which case the OS sandbox hides `~/` and `/tmp` and drops network access. `bwrap` exists only on Linux, so on Windows every plugin hook is unsandboxed and therefore skipped unless you trust the plugin in the Plugins manager ("Trust and run", bound to the package's SHA-256 so updates re-prompt) or opt in with `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1`.
- The child-process isolation is robustness, not a security sandbox without bubblewrap; with `bwrap` it is an OS sandbox (`--unshare-all`, `--ro-bind`, no network).
- **Install only packages you wrote or audited.** Review `plugin.py` after install (it lives in `plugins/<id>/`).
- Safe mode (`OPENBOX_SAFE_MODE=1` in the environment) disables all plugin execution process-wide. It is the first thing to try when a plugin causes launch or library failures.
- `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` opts into unsandboxed execution for trusted local plugins when the sandbox cannot be created (otherwise they are skipped with a warning).
- **Permissions (1.14.0+).** A manifest may declare `"permissions": ["network"]`, the only permission shipped so far. Declared permissions are **denied by default**: the plugin runs in the no-network sandbox until you grant it, and the grant then adds `--share-net` to the sandbox argv. A grant can never exceed what the manifest declares.
- **Per-plugin trust (1.14.0+).** On a host without bubblewrap, a plugin runs only after you trust it individually in the Plugins manager. The grant is bound to the installed package's SHA-256, so updating a plugin invalidates the trust and asks again.
- **Settings forms (1.14.0+).** A manifest may declare a `settings` JSON Schema subset (`string`, `number`, `integer`, `boolean`, plus `enum` and range rules). The Plugins manager renders the form, stores validated values per plugin, and passes them to the hook as `payload["settings"]`.

## Write your own

The [Plugin API reference](/reference/plugins/) documents the full contract:

- [Manifest](/reference/plugins/manifest/), `plugin.json` fields and ID validation
- [Hooks](/reference/plugins/hooks/), the payloads and response rules
- [Processes and errors](/reference/plugins/process-and-errors/), limits (2 MiB in/out, 5-second timeout), environment cleaning, and failure handling
- [Catalog](/reference/plugins/catalog/), bundled entries and installation

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

- [Troubleshooting plugins](/guides/troubleshooting/plugins/), safe mode and failure handling
- [Plugin API reference](/reference/plugins/), the full contract
- [API local administrator](/reference/api/local-admin/), install/toggle/remove routes
