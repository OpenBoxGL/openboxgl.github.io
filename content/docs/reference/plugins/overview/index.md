---
title: Plugin API overview
description: Trust boundary, the local plugin lifecycle, and capability services.
---

Plugins are optional local Python packages that observe or extend OpenBoxGL. They are untrusted-by-default third-party code: review a package before installing it, and use safe mode to disable all plugins when something misbehaves.

## Trust boundary

- On Linux, each hook runs inside a bubblewrap OS sandbox when `bwrap` is available: every namespace is unshared (no network access), the host root is mounted read-only, and `/home`, `/tmp`, `/run`, `/mnt`, and `/media` are replaced with empty filesystems. The plugin sees only its own package directory (read-only) and the JSON hook payload on stdin — never your data directory or home folder.
- If the sandbox cannot be created, the plugin is skipped rather than run unsandboxed, unless you trust the plugin or set `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1`. Two paths exist: per-plugin "Trust and run" in the Plugins manager, which binds the grant to the installed package's SHA-256 (any update that changes the package invalidates the grant and re-prompts), or the legacy operator-wide `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` escape hatch for trusted local code. Reserve unsandboxed execution for plugin code you have read and audited: without the sandbox, the plugin runs as a plain child process with your user privileges and can read and modify files in your data directory and under your account, not only library entries. On Windows `bwrap` does not exist, so the same per-plugin trust prompt is the only gate.
- In both modes the plugin environment is scrubbed before launch: `PYTHONPATH`, `PYTHONHOME`, `LD_PRELOAD`, and `LD_LIBRARY_PATH` are removed, `PYTHONNOUSERSITE=1` is set, and any variable whose name contains `TOKEN`, `PASSWORD`, `SECRET`, or `API_KEY` (case-insensitive) — or starts with `OPENBOX_`, `RETROACHIEVEMENTS_`, `EMUMOVIES_`, `GITHUB_`, `RA_`, `IGDB_`, or `GAMEYFIN_` — is stripped, so plugins cannot read tokens, secrets, or host state out of the environment.
- Install only packages you wrote or audited. The bundled catalog is documentation-oriented; installing from it still runs downloaded code.

## Lifecycle

1. **Install** (`/api/plugins/install`): a directory or ZIP package is staged, validated, and moved into `plugins/<id>/`. Updates replace the previous version atomically; a failed install or update restores the previous version.
2. **Enable/disable** (`/api/plugins/toggle`): disabled plugin ids persist in `plugins-state.json`; disabled plugins are skipped by every hook. Disabling also deletes the games the plugin imported and stops its cached stats from merging, while keeping its stored settings, trust, grants, data, and credentials.
3. **Run**: on each hook event, enabled plugins that declare the hook execute in sorted (alphabetical) directory order, each as a separate process.
4. **Remove** (`/api/plugins/remove`): the package moves to `plugins/.removed/<id>-<timestamp>` (recoverable), imported games are deleted, and its disabled state, trust grant, permission grants, settings, data bag, credentials, and stats cache are cleared, so a reinstall comes back enabled and untrusted.
5. **Repair/reinstall** (`POST /api/v2/plugins/repair`, 1.18.0+): reinstalls an installed plugin from its catalog entry, or from its recorded local package when the catalog has no entry (the recorded SHA-256 is re-verified). Settings and cached stats are preserved, and the trust record is kept but re-evaluated against the new package checksum: a reinstall whose bytes differ leaves the plugin untrusted and asks for approval again.
6. **Trust** (`GET`/`POST /api/v2/plugins/trust`, 1.14.0+): on a host where the bubblewrap sandbox cannot be created, a plugin does nothing until you grant per-plugin trust in the Plugins manager. The grant is bound to the installed package's SHA-256, so any update that changes the package invalidates it and re-prompts. There is deliberately no global "trust everything" switch; `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` remains the operator-level override.
7. **Permissions** (`POST /api/v2/plugins/permissions`, 1.14.0+): declared permissions are denied by default. The only permission in 1.x is `network`; granting it adds `--share-net` to the plugin's sandbox argv, and without the grant the plugin keeps the no-network sandbox. A grant can never exceed the manifest declaration.
8. **Settings** (`GET`/`POST /api/v2/plugins/settings`, 1.14.0+): a manifest `settings` JSON Schema subset renders a form under Settings > Plugins; validated values are stored per plugin and delivered to the hook as `payload["settings"]`.
9. **Data and credentials** (1.18.0+): `GET`/`POST /api/v2/plugins/data` reads or shallow-merges the bounded data bag; `GET`/`POST /api/v2/plugins/credentials` writes capability credentials and only ever returns key names and presence flags.

## Hook execution points

| Hook | When | Effect on result |
| --- | --- | --- |
| `library` | Every `/api/library` read (cached for 30 seconds), skipped in safe mode | May rewrite the `games` list; the response uses the last plugin's output when it is a dict with a `games` list of the same length |
| `before_launch` | At launch, after profile/archive resolution, skipped in safe mode | May rewrite `args`/`cwd` or cancel with `{"cancel": true, "error": "..."}`; structurally invalid output is discarded with a warning and the original launch command is used |
| `after_session` | After a session ends (history recorded, plugins run unless safe mode) | Ignored (return value discarded) |
| `command` | When a palette command is invoked (1.14.0+) | Returns an optional `notification` to show; unlike the chained hooks, its errors surface to the caller |
| `library_source` | On every library read, for manifests declaring it (1.14.0+) | Contributes imported games, namespaced `plugin:<plugin_id>:<id>` and merged into the public library |
| `events` | On each lifecycle event: `app_startup`, `app_shutdown`, `scan_finished`, `playtime_milestone`, `game_added`, `game_removed`, `game_updated` (1.14.0+) | Result discarded; a failure is logged and never breaks the emitting operation |
| `storefront`, `metadata`, `media`, `stats`, `emulator`, `discovery` | Only for plugins that declare the matching capability (1.18.0+) | Provides source-style data; see [Hooks](/reference/plugins/hooks/#capability-hooks) |

## Capability services

A capability hook may return `service_requests` — at most 8, each `{id, action, params}` — and the host executes them against a read-only, bounded allowlist:

| Service | Returns | Limits |
| --- | --- | --- |
| `library.query` | Game rows visible in the UI | 500 games, no filesystem paths |
| `achievements` | Per-game achievement sources and items | 100 games, 500 items |
| `profile` | Library and achievement profile summary | bounded object |
| `activity` | Recent play activity | 100 rows |
| `leaderboards` | Achievement leaderboard rows | 100 rows |
| `catalog.search` | Catalog entries matching a query | 20 rows (10 by default) |
| `metadata.search` | Metadata candidates for one game | 10 rows (5 by default) |
| `media.search` | Media candidates for one game | 20 rows (10 by default) |

The host then re-invokes the same hook once with `service_results` keyed by request id. That second round is final: a second `service_requests` list is ignored with a logged warning. Service payloads never carry path-like keys (`path`, `save_paths`, `media_root`, and similar), and every request is validated; a failing service returns `{"error": "..."}` for that request instead of failing the hook.

There is no standalone `services` hook. Declaring one is rejected, and `service_requests` from a non-capability hook is discarded with `"service_requests are only available to capability hooks."`

## Safe mode

`OPENBOX_SAFE_MODE=1` (any non-empty value) in the process environment skips the lifecycle hooks: `library`, `before_launch`, `after_session`, the `library_source` merge, and `events` emission, and it disables the webhook dispatcher. Palette command runs are refused, and the setting is exposed to the UI as `settings.safe_mode`. It is the first thing to try when a plugin causes launch or library failures. Note that an explicit capability action (storefront catalog or import, a metadata/media search, a stats refresh, or plugin discovery lists) still invokes that plugin's hook; disable the plugin itself to stop those.

## Limits and failure behavior

- One JSON object per invocation over stdin/stdout.
- Input payload and output capped at 2 MiB each; oversized output is ignored with a warning.
- Per-hook timeout: 5 seconds for base hooks, 30 seconds for `storefront`, 15 seconds for `metadata`/`media`/`stats`, and 10 seconds for `emulator`/`discovery`. A timeout, crash, or invalid JSON logs a warning and the plugin's result is skipped (the previous result passes through). Palette `command` runs are the exception: a hook error there is surfaced to the API caller as a `400`.
- A nonzero exit is logged with the last 400 bytes of stderr.
- The plugin environment is cleaned: `PYTHONPATH`, `PYTHONHOME`, `LD_PRELOAD`, `LD_LIBRARY_PATH` removed, `PYTHONNOUSERSITE=1`.
- The data bag must stay at or under 1 MiB and four levels deep; a patch that breaks either bound writes nothing.

## Plugin v2 routes

- `GET /api/v2/plugins/commands` — manifest-declared commands from enabled, valid plugins; `POST /api/v2/plugins/command` with `{plugin_id, command}` runs the `command` hook.
- `GET /api/v2/plugins/trust?id=<id>` / `POST /api/v2/plugins/trust` with `{id, trusted}` — per-plugin sandbox-bypass trust (checksum-bound, updates re-prompt).
- `POST /api/v2/plugins/permissions` with `{id, permissions}` — grant declared permissions (currently `network` only).
- `GET /api/v2/plugins/settings?id=<id>` / `POST /api/v2/plugins/settings` with `{id, values, clear_secrets?}` — schema, redacted values, validated save.
- `GET`/`POST /api/v2/plugins/data` with `{id, values}` — read or shallow-merge the bounded data bag.
- `GET`/`POST /api/v2/plugins/credentials` — credential key summary, or write `{id, values, clear}`; values never travel back.
- `POST /api/v2/plugins/repair` with `{id}` — reinstall without touching settings or stats; the trust record is kept but re-evaluated against the new package checksum, so changed bytes ask for approval again.
- `GET /api/v2/plugins/catalog` — catalog entries enriched with `installed`, `installed_version`, `update_available`, plus `author` and `homepage`; `sandbox` is a top-level field of the response.
- `GET /api/v2/plugin-stats` / `POST /api/v2/plugin-stats/refresh` with `{plugin_id | plugin_ids}` — cached stats source summaries, or refresh up to 64 sources.
- `POST /api/v2/storefronts/plugin/catalog` / `POST /api/v2/storefronts/plugin/import` with `{plugin_id, installed_only?, uninstalled_only?}` — the shared storefront catalog and import path for plugin storefronts.

## Related pages

- [Plugin manifest reference](/reference/plugins/manifest/)
- [Plugin hooks reference](/reference/plugins/hooks/)
- [Plugin processes and errors](/reference/plugins/process-and-errors/)
- [Plugin catalog reference](/reference/plugins/catalog/)
- [Plugins](/reference/plugins/) index
