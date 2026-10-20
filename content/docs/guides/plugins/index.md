---
title: Plugins guide
description: Install and use local Python plugins to extend OpenBoxGL.
---

Plugins are optional local Python packages that observe or extend OpenBoxGL through lifecycle hooks. They run as separate processes with a JSON stdin/stdout protocol, so a plugin that crashes or misbehaves cannot take down the library.

<Callout type="caution" title="What 'separate process' actually means">

Without bubblewrap, isolation is robustness, not a security sandbox. The child process shares your user privileges and your filesystem, it can read and write any file your OpenBoxGL process can reach. The per-hook timeout (5 seconds for base hooks), 2 MiB payload cap, and `PYTHONNOUSERSITE=1` environment cleaning prevent runaway behavior, but they don't restrict what the plugin can see on disk. When `bwrap` (bubblewrap) is available, OpenBoxGL runs plugins in an OS sandbox (`--unshare-all`, `--ro-bind / /`, `tmpfs` on `/home`/`/tmp`/`/run`, no network); if the sandbox cannot be created, enabled plugins are skipped unless you trust the plugin in the Plugins manager ("Trust and run", bound to the package's SHA-256) or set `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` for trusted local plugins.

</Callout>

## What a plugin can do

Base hooks run on lifecycle events:

| Hook | When it runs | What it can change |
| --- | --- | --- |
| `library` | On every library read | Rewrites the games list shown in the UI |
| `before_launch` | At launch, after profile/archive resolution | Rewrites the launch `args`/`cwd`, or cancels the launch with an error |
| `after_session` | After a session ends | Observes the session record; the result is discarded |
| `command` | When a command-palette entry is picked (1.14.0+) | Returns a notification to display; adds entries to the palette |
| `library_source` | On every library read, if declared (1.14.0+) | Contributes imported games to your library |
| `events` | On lifecycle events (1.14.0+) | Observes `app_startup`, `app_shutdown`, `scan_finished`, `playtime_milestone`, `game_added`, `game_removed`, `game_updated` |

Capability hooks (1.18.0) let a plugin act like a built-in source. A manifest declares a `capabilities` object and must also declare the hook that implements each one:

| Capability | Hook | What it provides | Timeout |
| --- | --- | --- | --- |
| `storefront` | `storefront` | Owned/installed games through the shared catalog and import UI | 30 s |
| `metadata` | `metadata` | Metadata search candidates, with an optional `platform` | 15 s |
| `media` | `media` | Media candidates, optionally limited by `media_kinds` | 15 s |
| `stats` | `stats` | Playtime and achievement statistics merged into the library | 15 s |
| `emulator_settings` | `emulator` | Emulator setting schemas and scopes | 10 s |
| `discovery` | `discovery` | Named discovery lists shown in the Discovery Center | 10 s |

Capability hooks receive the usual payload plus:

- **`plugin_data`** — the plugin's bounded data bag (1 MiB, at most four levels deep). A hook may return `data`, which is shallow-merged into the bag.
- **`settings`** — non-secret stored settings values.
- **`credentials`** — values from the capability credential store. Password-format settings are never included.

They may also return `service_requests` (at most 8, one round only). The host answers read-only services — `library.query`, `achievements`, `profile`, `activity`, `leaderboards`, `catalog.search`, `metadata.search`, and `media.search` — and re-invokes the hook once with `service_results`. There is no standalone `services` hook: services exist only as a request from a capability hook. Credentials cannot be written from a hook result.

## Install a plugin

1. Open **Tools → Plugins**.
2. **Install plugin** accepts a local directory or a ZIP package containing `plugin.json` (with `id`, `name`, `version`; `entry` defaults to `plugin.py`).
3. The package is staged, validated, and moved into `<data-dir>/plugins/<id>/`. Updates replace the previous version atomically with rollback.
4. Installed plugins list their id, name, version, entry, hooks, capabilities, and enabled state. Toggle them on/off per plugin (persisted in `plugins-state.json`).
5. **Reinstall** (repair) reinstalls an installed plugin from its catalog entry, or from the recorded local package when the catalog has no entry. Settings and cached stats are preserved — including for local packages, whose recorded SHA-256 is re-verified before reinstalling. The trust record is kept but re-evaluated against the new package checksum, so a reinstall with different bytes leaves the plugin untrusted and asks for approval again.

Installing from the **catalog** is also possible (`GET /api/plugins/catalog`, or `GET /api/v2/plugins/catalog` for the version that also reports what is already installed and the current sandbox status). The catalog browser shows each entry's author and homepage when the entry declares them. The bundled catalog ships two `local_only` documentation examples — `openbox.library-stats` and `openbox.hello-palette` — so manual installs remain the reliable path.

## Settings, credentials, and storage

Enabled plugins that declare a `settings` JSON Schema get a form under **Settings > Plugins**, using the same schema renderer as the rest of Settings. The form is searchable from Options search. Values are validated when saved, stored per plugin, and passed to hooks as `payload["settings"]`.

Password-format fields are special:

- The form shows a "Stored; leave blank to keep" placeholder and a **Clear stored** checkbox instead of the value.
- `GET /api/v2/plugins/settings` returns the schema, non-secret values, and `secret_set` flags — never the secret itself.
- A blank password field keeps the stored value; list the field in `clear_secrets` to remove it.

Capability credentials are a separate store, written with `POST /api/v2/plugins/credentials` and reported back as key names and presence flags only. The data bag has `GET`/`POST /api/v2/plugins/data` (shallow merge). Both live under `<data-dir>/plugins/credentials/` and `<data-dir>/plugins/data/` with `0600` permissions, and both are excluded from library backups (credentials entirely; password settings blanked, then merged back on restore).

## What capabilities change in the UI

- **Storefronts.** A plugin storefront appears in the storefronts screen next to built-in stores. It uses the normal catalog and import actions (`POST /api/v2/storefronts/plugin/catalog` and `/import`), supports installed/uninstalled filters, auto-import settings, and the shared plugin settings form. Its games carry `plugin_source`/`plugin_source_name` provenance and a source badge; plugin sources also appear by display name in Library checkup.
- **Metadata and media.** Results carry their source, can be mixed with built-in providers in a configured priority order, and a bulk metadata result persists `metadata_provider` so bulk media download can prioritize plugin candidates.
- **Stats.** Plugin playtime and achievement summaries merge monotonically into the library: playtime never decreases and `last_played` only moves forward. Achievement sources are namespaced `plugin:<plugin_id>:<source>`, appear in the achievement tabs with provider totals, and can be included or excluded through the library's **Achievement source** filter.
- **Discovery.** Each `discovery` plugin may publish up to ten named lists of up to 50 library game ids. The host resolves them to the existing `/api/discovery` row shape under `plugin:<plugin_id>:<list_id>`, so they render as shelves in the Discovery Center with no separate payload.
- **Notifications.** A hook notification may use a manifest `messages` key and parameters instead of a fixed string; the host resolves the active locale, then English, then the raw key.

## Repair, disable, and remove

- **Reinstall** keeps settings and stats, and keeps the trust record only as long as it still matches the installed package checksum — a changed package asks for approval again.
- **Disabling** a plugin stops its hooks, deletes the games it imported (through `library_source` or a storefront), and stops its cached stats from merging. Its settings, trust, permission grants, data bag, credentials, and stats cache are kept, so re-enabling restores its behavior.
- **Removing** a plugin moves the package to `plugins/.removed/<id>-<timestamp>`, deletes its imported games, and clears its disabled state, trust, permissions, settings, data bag, credentials, and stats cache. A reinstall therefore comes back enabled, untrusted, and without stored approvals.
- Palette commands are re-read every time the palette opens, so a newly enabled plugin shows up without a restart — and a disabled plugin's commands never run.

## Trust and safety

- Plugins execute with the same user privileges as OpenBoxGL and can read and modify files in your data directory and under your account, unless `bwrap` is available, in which case the OS sandbox hides `~/` and `/tmp` and drops network access. `bwrap` exists only on Linux, so on Windows every plugin hook is unsandboxed and therefore skipped unless you trust the plugin in the Plugins manager ("Trust and run", bound to the package's SHA-256 so updates re-prompt) or opt in with `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1`.
- The child-process isolation is robustness, not a security sandbox without bubblewrap; with `bwrap` it is an OS sandbox (`--unshare-all`, `--ro-bind`, no network).
- **Install only packages you wrote or audited.** Review `plugin.py` after install (it lives in `plugins/<id>/`).
- Safe mode (`OPENBOX_SAFE_MODE=1` in the environment) skips the lifecycle hooks (`library`, `before_launch`, `after_session`, `library_source`, `events`) and webhook dispatch, and refuses palette commands. It does not gate explicit capability calls (storefront, metadata/media search, stats refresh, discovery), so disable a misbehaving provider in the Plugins manager to stop those.
- `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` opts into unsandboxed execution for trusted local plugins when the sandbox cannot be created (otherwise they are skipped with a warning).
- **Permissions.** A manifest may declare `"permissions": ["network"]`, the only permission shipped so far. Declared permissions are **denied by default**: the plugin runs in the no-network sandbox until you grant it, and the grant then adds `--share-net` to the sandbox argv. A grant can never exceed what the manifest declares. Storefront, metadata, media, and stats capabilities refuse to call their hook without a declared and granted network permission.
- **Per-plugin trust.** On a host without bubblewrap, a plugin runs only after you trust it individually in the Plugins manager. The grant is bound to the installed package's SHA-256, so updating a plugin invalidates the trust and asks again.
- **Settings forms.** A manifest may declare a `settings` JSON Schema subset (`string`, `number`, `integer`, `boolean`, plus `enum` and range rules). The Plugins manager and Settings > Plugins render the form, store validated values per plugin, and pass them to the hook as `payload["settings"]`.

## Write your own

The [Plugin API reference](/reference/plugins/) documents the full contract:

- [Manifest](/reference/plugins/manifest/), `plugin.json` fields, capabilities, messages, and ID validation
- [Hooks](/reference/plugins/hooks/), the payloads, service requests, and response rules
- [Processes and errors](/reference/plugins/process-and-errors/), limits (2 MiB in/out, per-hook timeouts), environment cleaning, and failure handling
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

A capability plugin declares the hook and the capability together:

```json
{
  "id": "example.discovery",
  "name": "Example Discovery",
  "version": "1.0.0",
  "hooks": ["discovery"],
  "capabilities": {"discovery": {"id": "example.discovery", "name": "Example lists"}}
}
```

```python
def discovery(payload):
    return {"lists": [{"id": "short", "name": "Short games", "game_ids": ["game-id"]}]}
```

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| Launch canceled by a plugin | A `before_launch` plugin canceled the launch. Fix or remove the plugin, or use safe mode. |
| Library looks wrong after installing a plugin | A `library` hook rewrites the games list. Toggle the plugin off, or run with `OPENBOX_SAFE_MODE=1`. |
| Failed update broke a plugin | Updates roll back automatically to `plugins/.backups/<id>-<timestamp>`; removal keeps a recoverable copy in `plugins/.removed/`. Use **Reinstall** to repair an installed plugin without losing its settings or stats. |
| Plugin storefront says network access is not granted | Grant the `network` permission in the Plugins manager; storefront, metadata, media, and stats capabilities refuse to run without it. |
| Plugin shelves or games disappear | The plugin was disabled or removed: imported games are dropped and its discovery lists and cached stats stop merging. |

## See also

- [Creating a plugin](/guides/plugins/creating-a-plugin/), a worked manifest and hook from scratch
- [Troubleshooting plugins](/guides/troubleshooting/plugins/), safe mode and failure handling
- [Plugin API reference](/reference/plugins/), the full contract
- [API local administrator](/reference/api/local-admin/), install/toggle/remove routes
