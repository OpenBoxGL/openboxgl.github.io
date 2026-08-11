---
title: Plugin API overview
description: Trust boundary and the local plugin lifecycle.
---

Plugins are optional local Python packages that observe or extend OpenBoxGL. They are untrusted-by-default third-party code: review a package before installing it, and use safe mode to disable all plugins when something misbehaves.

## Trust boundary

- Plugins are local code executed with the same user privileges as OpenBoxGL. A plugin can read and modify files in your data directory and under your account, not just library entries.
- The runner isolates a plugin into a child process, but that is robustness isolation, not a security sandbox: the child shares your user and your filesystem.
- Install only packages you wrote or audited. The bundled catalog is small and documentation-oriented; installing from it still runs the downloaded code.

## Lifecycle

1. **Install** (`/api/plugins/install`): a directory or ZIP package is staged, validated, and moved into `plugins/<id>/`. Updates replace the previous version atomically; a failed install or update restores the previous version.
2. **Enable/disable** (`/api/plugins/toggle`): disabled plugin ids persist in `plugins-state.json`; disabled plugins are skipped by every hook.
3. **Run**: on each hook event, enabled plugins that declare the hook execute in sorted (alphabetical) directory order, each as a separate process.
4. **Remove** (`/api/plugins/remove`): the package moves to `plugins/.removed/<id>-<timestamp>` (recoverable) and its disabled state is cleared, so a reinstall comes back enabled.

## Hook execution points

| Hook | When | Effect on result |
| --- | --- | --- |
| `library` | Every `/api/library` read (cached for 3 seconds), skipped in safe mode | May rewrite the `games` list; the response uses the last plugin's output when it is a dict with a `games` list of the same length |
| `before_launch` | At launch, after profile/archive resolution, skipped in safe mode | May rewrite `args`/`cwd` or cancel with `{"cancel": true, "error": "..."}`; invalid output raises a launch validation error |
| `after_session` | After a session ends (history recorded, plugins run unless safe mode) | Ignored (return value discarded) |

## Safe mode

`OPENBOX_SAFE_MODE=1` (any non-empty value) in the process environment disables plugin execution process-wide: `library` hooks, `before_launch`, `after_session`, and the webhook dispatcher all skip. The setting is exposed to the UI as `settings.safe_mode`. It is the first thing to try when a plugin causes launch or library failures.

## Limits and failure behavior

- One JSON object per invocation over stdin/stdout.
- Input payload and output capped at 2 MiB each; oversized output is ignored with a warning.
- 5-second timeout per plugin; a timeout, crash, or invalid JSON logs a warning and the plugin's result is skipped (the previous result passes through).
- A nonzero exit is logged with the last 400 bytes of stderr.
- The plugin environment is cleaned: `PYTHONPATH`, `PYTHONHOME`, `LD_PRELOAD`, `LD_LIBRARY_PATH` removed, `PYTHONNOUSERSITE=1`.

## Related pages

- [Plugin manifest reference](/reference/plugins/manifest/)
- [Plugin hooks reference](/reference/plugins/hooks/)
- [Plugin processes and errors](/reference/plugins/process-and-errors/)
- [Plugin catalog reference](/reference/plugins/catalog/)
- [Plugins](/reference/plugins/) index
