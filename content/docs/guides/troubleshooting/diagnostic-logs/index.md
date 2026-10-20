---
title: Troubleshooting diagnostic logs
description: Read, copy, and share the rotating diagnostic log safely.
---

The diagnostic log is the first place to look when anything misbehaves. It records server activity, import/launch/session errors, job failures, and provider errors with credentials redacted.

## Where it lives

- Path: `<data-dir>/openbox.log` (default `~/.local/share/openbox-game-launcher/openbox.log`).
- Rotation: 2 MiB per file, 4 rotations (`openbox.log.1` ... `.4`).
- Redaction: tokens, passwords, secrets, API keys, and authorization values are redacted before writing.
- It can still contain **game names and local file paths**, review it before sharing.

## Copy it

**Settings > Advanced > Copy diagnostic log** copies a redacted diagnostic **summary** to the clipboard (it excludes secrets and the full log). This is the canonical way to attach diagnostics to an issue. The complete rotating log is available separately: `GET /api/log` returns its last 250 KB for local scripting, and `GET /api/diagnostic` returns the same summary preview the button copies.

## How to use it

1. **Reproduce the failure** with the smallest local example (for example a single test ROM in a scratch folder).
2. **Capture the exact visible error** and the log section around it. Look for:
  - Import errors: which source, which manifest, what failed, and `Storefront scan timed out after 30s.` for a store that exceeded its budget.
  - Launch failures: the validation error or the session's exit code, and emulator-setting warnings (`RetroArch settings could not be written`, `Plugin emulator settings`).
  - Job failures: the job name and attempt (`openbox-job-*` workers), including media queue items whose `last_error` names the provider failure.
  - Provider errors: IGDB/EmuMovies/Gameyfin messages (secrets redacted), and `The remote server returned an unsupported content type` for a bad download.
  - `apply_perf` warnings when a TDP limit was expected but not applied.
  - Startup errors: a library that failed to load or was restored from the last-known-good backup.
3. **Report** with both the visible error and the copied log at [OpenBoxGL issues](https://github.com/vindeckyy/OpenBoxGL/issues). Security and credential problems belong in the [Security and legal](/policies/security/) policy.

## Related diagnostic files

- `<data-dir>/cache/launch_audit.json` holds the last launch audit report.
- `<data-dir>/cache/launch_audit.jsonl` is the compact rolling audit history (rotates to `.1` at 5 MiB).
- `<data-dir>/media-queue.json` is the durable media queue; failed items carry `last_error` and attempts.
- `<data-dir>/storefront-status.json` (or the status file reported by `GET /api/v2/storefront/status`) holds the last per-source scan state.

These are caches, not library state; removing them loses history, not games.

## See also

- [Interfaces and data](/interfaces-and-data/), data directory layout and rotation
- [Troubleshooting](/guides/troubleshooting/), the index of every troubleshooting area
- [API local administrator](/reference/api/local-admin/), `GET /api/log`
