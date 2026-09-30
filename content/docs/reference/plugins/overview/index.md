---
title: Plugin API overview
description: Trust boundary and the local plugin lifecycle.
---

Plugins are optional local Python packages that observe or extend OpenBoxGL. They are untrusted-by-default third-party code: review a package before installing it, and use safe mode to disable all plugins when something misbehaves.

## Trust boundary

- On Linux, each hook runs inside a bubblewrap OS sandbox when `bwrap` is available: every namespace is unshared (no network access), the host root is mounted read-only, and `/home`, `/tmp`, `/run`, `/mnt`, and `/media` are replaced with empty filesystems. The plugin sees only its own package directory (read-only) and the JSON hook payload on stdin — never your data directory or home folder.
- If the sandbox cannot be created, the plugin is skipped rather than run unsandboxed, unless you trust the plugin or set `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1`. Two paths exist: per-plugin "Trust and run" in the Plugins manager, which binds the grant to the installed package's SHA-256 (any update that changes the package invalidates the grant and re-prompts), or the legacy operator-wide `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` escape hatch for trusted local code. Reserve unsandboxed execution for plugin code you have read and audited: without the sandbox, the plugin runs as a plain child process with your user privileges and can read and modify files in your data directory and under your account, not only library entries. On Windows `bwrap` does not exist, so plugins are skipped with a warning until trusted one by one in the Plugins manager or the variable is set.
- In both modes the plugin environment is scrubbed before launch: `PYTHONPATH`, `PYTHONHOME`, `LD_PRELOAD`, and `LD_LIBRARY_PATH` are removed, `PYTHONNOUSERSITE=1` is set, and any variable whose name contains `TOKEN`, `PASSWORD`, `SECRET`, or `API_KEY` (case-insensitive) — or starts with `OPENBOX_`, `RETROACHIEVEMENTS_`, `EMUMOVIES_`, `GITHUB_`, `RA_`, `IGDB_`, or `GAMEYFIN_` — is stripped, so plugins cannot read tokens, secrets, or host state out of the environment.
- Install only packages you wrote or audited. The bundled catalog is documentation-oriented; installing from it still runs downloaded code.

## Lifecycle

1. **Install** (`/api/plugins/install`): a directory or ZIP package is staged, validated, and moved into `plugins/<id>/`. Updates replace the previous version atomically; a failed install or update restores the previous version.
2. **Enable/disable** (`/api/plugins/toggle`): disabled plugin ids persist in `plugins-state.json`; disabled plugins are skipped by every hook.
3. **Run**: on each hook event, enabled plugins that declare the hook execute in sorted (alphabetical) directory order, each as a separate process.
4. **Remove** (`/api/plugins/remove`): the package moves to `plugins/.removed/<id>-<timestamp>` (recoverable) and its disabled state, trust grant, and permission grants are cleared, so a reinstall comes back enabled and untrusted.
5. **Trust** (`GET`/`POST /api/v2/plugins/trust`, 1.14.0+): on a host where the bubblewrap sandbox cannot be created, a plugin does nothing until you grant per-plugin trust in the Plugins manager. The grant is bound to the installed package's SHA-256, so any update that changes the package invalidates it and re-prompts. There is deliberately no global "trust everything" switch; `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` remains the operator-level override.
6. **Permissions** (`POST /api/v2/plugins/permissions`, 1.14.0+): declared permissions are denied by default. The only permission in 1.14.0 is `network`; granting it adds `--share-net` to the plugin's sandbox argv, and without the grant the plugin keeps the no-network sandbox. A grant can never exceed the manifest declaration.
7. **Settings** (`GET`/`POST /api/v2/plugins/settings`, 1.14.0+): a manifest `settings` JSON Schema subset renders a form in the Plugins manager; validated values are stored per plugin and delivered to the hook as `payload["settings"]`.

## Hook execution points

| Hook | When | Effect on result |
| --- | --- | --- |
| `library` | Every `/api/library` read (cached for 30 seconds), skipped in safe mode | May rewrite the `games` list; the response uses the last plugin's output when it is a dict with a `games` list of the same length |
| `before_launch` | At launch, after profile/archive resolution, skipped in safe mode | May rewrite `args`/`cwd` or cancel with `{"cancel": true, "error": "..."}`; structurally invalid output is discarded with a warning and the original launch command is used |
| `after_session` | After a session ends (history recorded, plugins run unless safe mode) | Ignored (return value discarded) |
| `command` | When a palette command is invoked (1.14.0+) | Returns an optional `notification` to show; unlike the chained hooks, its errors surface to the caller |
| `library_source` | On every library read, for manifests declaring it (1.14.0+) | Contributes imported games, namespaced `plugin:<plugin_id>:<id>` and merged into the public library |
| `events` | On each lifecycle event: `app_startup`, `app_shutdown`, `scan_finished`, `playtime_milestone`, `game_added`, `game_removed`, `game_updated` (1.14.0+) | Result discarded; a failure is logged and never breaks the emitting operation |

## Safe mode

`OPENBOX_SAFE_MODE=1` (any non-empty value) in the process environment disables plugin execution process-wide: `library` hooks, `before_launch`, `after_session`, the `command`, `library_source`, and `events` hooks, and the webhook dispatcher all skip. The setting is exposed to the UI as `settings.safe_mode`. It is the first thing to try when a plugin causes launch or library failures.

## Limits and failure behavior

- One JSON object per invocation over stdin/stdout.
- Input payload and output capped at 2 MiB each; oversized output is ignored with a warning.
- 5-second timeout per plugin; a timeout, crash, or invalid JSON logs a warning and the plugin's result is skipped (the previous result passes through). Palette `command` runs are the exception: a hook error there is surfaced to the API caller as a `400`.
- A nonzero exit is logged with the last 400 bytes of stderr.
- The plugin environment is cleaned: `PYTHONPATH`, `PYTHONHOME`, `LD_PRELOAD`, `LD_LIBRARY_PATH` removed, `PYTHONNOUSERSITE=1`.

## Plugin v2 routes

- `GET /api/v2/plugins/commands` — manifest-declared commands from enabled, valid plugins; `POST /api/v2/plugins/command` with `{plugin_id, command}` runs the `command` hook.
- `GET /api/v2/plugins/trust?id=<id>` / `POST /api/v2/plugins/trust` with `{id, trusted}` — per-plugin sandbox-bypass trust (checksum-bound, updates re-prompt).
- `POST /api/v2/plugins/permissions` with `{id, permissions}` — grant declared permissions (currently `network` only).
- `GET /api/v2/plugins/settings?id=<id>` / `POST /api/v2/plugins/settings` with `{id, values}` — schema, stored values, and validated save.
- `GET /api/v2/plugins/catalog` — catalog entries enriched with `installed`, `installed_version`, `update_available`; `sandbox` is a top-level field of the response.

## Related pages

- [Plugin manifest reference](/reference/plugins/manifest/)
- [Plugin hooks reference](/reference/plugins/hooks/)
- [Plugin processes and errors](/reference/plugins/process-and-errors/)
- [Plugin catalog reference](/reference/plugins/catalog/)
- [Plugins](/reference/plugins/) index
