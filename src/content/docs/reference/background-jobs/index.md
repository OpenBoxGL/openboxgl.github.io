---
title: Background jobs
description: Observable states, retry limits, replacement, cancellation, and volatility.
---

Background work in OpenBoxGL runs through a bounded job manager (`job_manager.py`). This page documents the job object, retry and cancellation semantics, the named jobs, and how their state is exposed.

## The job object

Every submitted job is a dict with these keys:

| Key | Meaning |
| --- | --- |
| `job_id` | Unique hex id for this submission |
| `name` | Job name (stable across submissions) |
| `state` | `queued`, `running`, `done`, `error`, or `cancelled` |
| `created_at` | UTC ISO timestamp |
| `started_at` | First run start, empty until running |
| `finished_at` | Terminal timestamp, empty until terminal |
| `attempt` | Current attempt number (1-based) |
| `max_attempts` | 1..5, clamped |
| `error` | Error message on failure, truncated to 800 characters |
| `duration_seconds` | Rounded to 3 decimals after the terminal state |

Workers run on a `ThreadPoolExecutor` with 4 threads (`max_workers=4`, thread names `openbox-job-*`). A worker may accept a `cancel_event` argument; the manager introspects the signature to decide.

## States and transitions

```text
queued -> running -> done | error | cancelled
```

- `submit` with the same name while a job is `queued` or `running` returns the existing job without starting a second worker, unless `replace=True`.
- `replace=True` cancels the current job and starts a fresh submission (used where a new operation must supersede an old one).
- `cancel(name)` sets the cancel event; a `queued` job flips to `cancelled` immediately, a `running` job flips when the worker observes the event (or after its current step), and a `finished`/`error`/`cancelled` job returns `False`.
- On exception, the job retries up to `max_attempts` with exponential backoff `backoff_seconds * 2^(attempt-1)`; the last failure sets `state: "error"` with the message (800-char cap). A cancelled job during retries becomes `cancelled`.
- `shutdown(wait=..., cancel_futures=...)` sets every cancel event and shuts the executor down.

## Named jobs

| Name | What it does | Exposed by |
| --- | --- | --- |
| `auto-import` | Watch-folder and storefront auto-import loop (runs continuously, first scan after 10 s, backoff to 300 s on state errors) | none (in-process) |
| `metadata` | LaunchBox Games Database sync | `GET /api/metadata/status` (`job` field) |
| `media-bulk` | Bulk metadata/media download for the library | `GET /api/media/bulk/status` (`job` field) |
| `emulator-install:<app_id>` | Flatpak emulator install | `GET /api/emulators` (`emulators[].job`, `install_all`) |
| `emulator-install-all` | Install all emulators | `GET /api/emulators` (`install_all`) |
| `update:<app_id>` | Flatpak emulator update | `GET /api/emulators` (`emulators[].job`) |
| `emulator-update-all` | Update all installed flatpak emulators | `GET /api/emulators` (`install_all`? no: `__update_all__` under `INSTALLS`) |
| `gameyfin:<game_id>` | Gameyfin game download/install | `GET /api/gameyfin/install/status?gameyfin_id=<id>` |

Emulator and Gameyfin jobs use the in-memory `INSTALLS` dict with per-operation keys, and their `state` values are `installing`/`updating`/`done`/`error` (queued/running are collapsed into the in-flight state by the route). The metadata and media jobs use `METADATA_JOB` / `MEDIA_JOB` dicts with `downloading`/`running`/`done`/`error`.

## Volatility

Job state is in-memory only: it does not survive a restart, and jobs do not resume. The results that matter (library writes, downloaded files, settings changes) are committed transactionally by the worker before the job reports `done`, so a crash mid-job leaves partial-but-valid state (media files may be partially downloaded and are validated on use).

## Observability

- POST routes that start a job return `202` with the initial job state; re-POSTing while in flight returns the current state with `200`.
- Poll the documented status route until `state` is `done` or `error`, inspect `error` (or the job's `errors` list for `media-bulk`, capped at the last 20), then retry only after correcting the input.
- The diagnostic log records worker failures with the job name and attempt.

## Related

- [API content and imports](/reference/api/content-and-imports/) for metadata/media/emulator/Gameyfin jobs
- [API local administrator](/reference/api/local-admin/) for update jobs
- [Data and recovery](/reference/data-and-recovery/) for what a crash leaves behind
