---
title: Plugin processes and errors reference
description: Protocol limits, timeout, safe mode, and rollback.
---

Every plugin invocation runs as a separate child process (`python3 plugin_runner.py <entry> <hook>`) with JSON over stdin/stdout. This page documents the exact limits and failure handling.

## Protocol

- The runner passes the current payload as one JSON object on stdin and reads one JSON object from stdout.
- A plugin whose module lacks the hook function gets the input payload and echoes it back.
- A plugin whose return value is not a dict falls back to the input payload (`json.dump(result if isinstance(result, dict) else payload, ...)`).

## Limits

| Limit | Value | Behavior when exceeded |
| --- | --- | --- |
| Input payload | 2 MiB (`MAX_PLUGIN_PAYLOAD`) | The plugin is skipped with `"Skipping plugin <id> for <hook> because the payload is too large"` |
| Output | 2 MiB | Output beyond 2 MiB is ignored: `"Ignoring oversized output from plugin <id>"` |
| Execution time | 5 seconds (`subprocess.run(..., timeout=5)`) | The process is killed; a warning is logged and the plugin's result is skipped |
| stderr kept | last 400 bytes | Included in the failure warning |

The payload check happens before spawn for input; the output check happens after the process exits.

## Environment

The child environment is cleaned before execution:

- Removed: `PYTHONPATH`, `PYTHONHOME`, `LD_PRELOAD`, `LD_LIBRARY_PATH`
- Added: `PYTHONNOUSERSITE=1`
- `start_new_session=True` so the plugin runs in its own process group (and can be killed without touching the parent)

## Failure handling

| Failure | Consequence |
| --- | --- |
| Nonzero exit | Warning `"Plugin <id> exited with status <n>: <stderr tail>"`; payload passes through unchanged |
| Timeout (`subprocess.TimeoutExpired`) | Warning; payload passes through |
| Invalid JSON on stdout | Warning `"Ignoring invalid JSON from plugin <id>"`; payload passes through |
| Non-dict JSON | Result ignored; payload passes through |
| Exception inside the plugin | The child exits nonzero; handled as above. Plugin exceptions can never raise inside the OpenBoxGL process |
| Spawn error (`OSError`) | Warning; payload passes through |

A plugin therefore cannot break a launch or a library read by crashing: worst case its changes are dropped and a warning is logged. The one exception is `before_launch` output validation: valid JSON that is structurally wrong (missing `args`/`cwd`, empty argv, nonexistent cwd) aborts the launch with a validation error, because launching with a broken command would be worse.

## Safe mode

With `OPENBOX_SAFE_MODE` set in the environment:

- `run_plugins` is never called for `library`, `before_launch`, or `after_session`.
- The webhook dispatcher is not created (`get_webhook_dispatcher` returns None).
- `settings.safe_mode` reports true to the UI.

Safe mode is a diagnosis tool: enable it, confirm the problem disappears, then remove or fix the offending plugin and restart normally.

## Install and update rollback

`install_plugin` stages the new package and swaps it in:

1. Existing version (if any) moves to `plugins/.backups/<id>-<timestamp>`.
2. The staged copy is moved to `plugins/<id>`.
3. On any failure, the backup is moved back if the destination is missing; the staging directory is always cleaned up.
4. On success, the backup is deleted.

Both the copy failure and the swap failure paths are covered by tests: a disk-full error during staging and a failed `Path.replace` during the swap both leave the previous version installed and enabled. Reinstalling after removal clears disabled state, so the plugin comes back enabled.

## Related

- [Plugin hooks reference](/reference/plugins/hooks/) for payload shapes
- [Plugin manifest reference](/reference/plugins/manifest/) for what installs validate
- [API local administrator](/reference/api/local-admin/) for the install/toggle/remove routes
