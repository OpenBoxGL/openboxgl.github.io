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

**Settings > Copy diagnostic log** copies the current rotating log to the clipboard (or prints its path). This is the canonical way to attach logs to an issue.

`GET /api/log` returns the last 250 KB of the log for local scripting.

## How to use it

1. **Reproduce the failure** with the smallest local example (for example a single test ROM in a scratch folder).
2. **Capture the exact visible error** and the log section around it. Look for:
  - Import errors: which source, which manifest, what failed.
  - Launch failures: the validation error or the session's exit code.
  - Job failures: the job name and attempt (`openbox-job-*` workers).
  - Provider errors: IGDB/EmuMovies/Gameyfin messages (secrets redacted).
  - `apply_perf` warnings when a TDP limit was expected but not applied.
3. **Report** with both the visible error and the copied log at [OpenBoxGL issues](https://github.com/vindeckyy/OpenBoxGL/issues). Security and credential problems belong in the [Security and legal](/policies/security/) policy.

## See also

- [Interfaces and data](/interfaces-and-data/), data directory layout and rotation
- [Troubleshooting](/guides/troubleshooting/), the index of every troubleshooting area
- [API local administrator](/reference/api/local-admin/), `GET /api/log`
