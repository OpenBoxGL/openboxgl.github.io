---
title: Plugin processes and errors reference
description: Protocol limits, per-hook timeouts, safe mode, and rollback.
---

Every plugin invocation runs as a separate child process (`python3 plugin_runner.py <entry> <hook>`) with JSON over stdin/stdout. This page documents the exact limits and failure handling.

## Protocol

- The runner passes the current payload as one JSON object on stdin and reads one JSON object from stdout.
- A plugin whose module lacks the hook function gets the input payload and echoes it back.
- A plugin whose return value is not a dict falls back to the input payload (`json.dump(result if isinstance(result, dict) else payload, ...)`).
- Capability hooks get one optional extra round for `service_requests`: the host runs at most 8 read-only services and re-invokes the same hook once with `service_results`. A second request list is dropped with a warning.

## Limits

| Limit | Value | Behavior when exceeded |
| --- | --- | --- |
| Input payload | 2 MiB (`MAX_PLUGIN_PAYLOAD`) | The plugin is skipped with `"Payload is too large for plugin execution."` |
| Output | 2 MiB | Output beyond 2 MiB is ignored: `"Plugin output exceeded the payload limit."` |
| Execution time, base hooks | 5 seconds | The process is killed; a warning is logged and the plugin's result is skipped |
| Execution time, `storefront` | 30 seconds | Above |
| Execution time, `metadata` / `media` / `stats` | 15 seconds | Above |
| Execution time, `emulator` / `discovery` | 10 seconds | Above |
| stderr kept | last 400 bytes | Included in the failure warning |
| Data bag | 1 MiB, 4 levels deep | A patch that breaks either bound raises and writes nothing |
| Service requests | 8 per hook, one round | More than 8 raises `"service_requests must be a list of at most 8 requests."`; a second round is ignored |
| Storefront paging | 20 pages, 2,000 entries | Paging stops; a repeated cursor raises `"Plugin storefront pagination repeated a cursor."` |
| Storefront entry | id up to 160, text up to 300, URL up to 2,000 | Longer values are truncated or the entry is skipped |
| Credentials | 128 keys, 4,096 characters per value | A write beyond 128 keys or a longer value raises; malformed stored entries are ignored when read |

The payload check happens before spawn for input; the output check happens after the process exits.

## Environment

The child environment is cleaned before execution:

- Removed: `PYTHONPATH`, `PYTHONHOME`, `LD_PRELOAD`, `LD_LIBRARY_PATH`
- Added: `PYTHONNOUSERSITE=1`
- Stripped: any variable whose name contains `TOKEN`, `PASSWORD`, `SECRET`, or `API_KEY` (case-insensitive), or starts with `OPENBOX_`, `RETROACHIEVEMENTS_`, `EMUMOVIES_`, `GITHUB_`, `RA_`, `IGDB_`, or `GAMEYFIN_`
- `start_new_session=True` so the plugin runs in its own process group (and can be killed without touching the parent)

## Failure handling

| Failure | Consequence |
| --- | --- |
| Nonzero exit | Warning `"Plugin exited with status <code>: <stderr tail>"` — the message does not name the plugin; payload passes through unchanged |
| Timeout (`subprocess.TimeoutExpired`) | Warning; payload passes through |
| Invalid JSON on stdout | Warning `"Plugin returned invalid JSON."`; payload passes through |
| Non-dict JSON | Warning `"Plugin output must be a JSON object."`; result ignored; payload passes through |
| Exception inside the plugin | The child exits nonzero; handled as above. Plugin exceptions can never raise inside the OpenBoxGL process |
| Spawn error (`OSError`) | Warning; payload passes through |

A plugin therefore cannot break a launch or a library read by crashing: worst case its changes are dropped and a warning is logged. Exceptions:

- A non-dict `before_launch` return falls back to the input payload (the runner echoes it), and structurally invalid `args`/`cwd` are discarded with a warning while the host launches with the original command; only `{"cancel": true}` aborts the launch.
- `command` hook errors (bad JSON, non-object, oversized output, nonzero exit, timeout) are surfaced to the `POST /api/v2/plugins/command` caller as a `400`. The route also refuses a disabled plugin or safe mode with `"Plugin is disabled."`
- Capability hooks follow their consumer: a `storefront` failure or malformed page raises for the catalog/import action, a `metadata` or `media` failure yields an empty candidate list so other providers still run, a `stats` failure raises for the refresh, and an `emulator` section that returns bad args/env is skipped with a warning while the launch continues. A failing optional `discovery` plugin is skipped instead of breaking the Discovery Center.
- A returned `credentials` key is removed and logged: hooks cannot write the credential store.

## Safe mode

With `OPENBOX_SAFE_MODE` set in the environment:

- `run_plugins` is never called for `library`, `before_launch`, or `after_session`; the `library_source` merge and `events` emission are skipped as well.
- The webhook dispatcher is not created (`get_webhook_dispatcher` returns None).
- `settings.safe_mode` reports true to the UI.
- `POST /api/v2/plugins/command` refuses to run (`"Plugin is disabled."`).
- Capability hooks are not globally gated. An explicit storefront catalog/import, metadata or media search, stats refresh, or plugin discovery call still invokes the plugin's sandboxed hook; disable the plugin to stop those.

Safe mode is a diagnosis tool: enable it, confirm the problem disappears, then remove or fix the offending plugin and restart normally.

## Install and update rollback

`install_plugin` stages the new package and swaps it in:

1. Existing version (if any) moves to `plugins/.backups/<id>-<timestamp>`.
2. The staged copy is moved to `plugins/<id>`.
3. On any failure, the backup is moved back if the destination is missing; the staging directory is always cleaned up.
4. On success, the backup is deleted.

Both the copy failure and the swap failure paths are covered by tests: a disk-full error during staging and a failed `Path.replace` during the swap both leave the previous version installed and enabled. Reinstalling after removal clears disabled state, so the plugin comes back enabled.

## Repair, disable, and remove

- `POST /api/v2/plugins/repair` with `{id}` reinstalls the package from the catalog entry, or from the recorded local package when the catalog has none. The recorded SHA-256 is re-verified first; a changed local package raises `"The recorded local plugin package changed; reinstall it manually."` Settings, stats cache, and grants survive the reinstall, and the trust record is kept but re-evaluated against the new package checksum — a reinstall whose bytes differ leaves the plugin untrusted and asks for approval again.
- Disabling a plugin keeps its records (settings, trust, permissions, data, credentials, stats cache) but deletes the games it imported and stops its cached stats from merging.
- Removing a plugin moves the package to `plugins/.removed/<id>-<timestamp>` and deletes the plugin's settings, trust, permission grants, data bag, credentials, and stats cache, along with its imported games. A reinstall after removal comes back enabled, untrusted, and without approvals.

## Related

- [Plugin hooks reference](/reference/plugins/hooks/) for payload shapes
- [Plugin manifest reference](/reference/plugins/manifest/) for what installs validate
- [API local administrator](/reference/api/local-admin/) for the install/toggle/remove routes
