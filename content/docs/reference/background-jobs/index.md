---
title: Background jobs
description: Observable states, retry limits, replacement, cancellation, and volatility.
---

Background work in OpenBoxGL runs through the durable **Operation Service** (`pkg/state/operations.py`). Operations are persisted to disk in `operations.json`, surviving application restarts and supporting progress streaming, cancellation, retries, and resume flows.

## The operation object

Every submitted operation is recorded with these fields:

| Key | Meaning |
| --- | --- |
| `operation_id` | Unique hex identifier |
| `kind` | Operation type (e.g. `import_scan`, `metadata_sync`, `media_download`, `emulator_install`, `backup_create`) |
| `state` | `queued`, `running`, `cancelling`, `done`, `partial`, `error`, `cancelled`, or `interrupted` |
| `created_at` | UTC ISO timestamp |
| `started_at` | Start timestamp |
| `finished_at` | Terminal timestamp |
| `progress` | Current progress object (`current`, `total`, `unit`, `message`) |
| `error` | Error message on failure |
| `metadata` | Context-specific parameters and batch identifiers |

Workers execute on a managed `ThreadPoolExecutor` with 4 concurrent slots (`openbox-job-*`). Live status and incremental events stream to the frontend over Server-Sent Events (SSE) via `/api/events`.

## States and lifecycle transitions

```text
queued -> running -> cancelling -> cancelled
                  -> done
                  -> partial
                  -> error
(on restart)      -> interrupted -> (resumed or retried)
```

- **`queued`**: Submitted and awaiting execution slot.
- **`running`**: Actively executing in a worker thread.
- **`cancelling`**: User requested cancellation; worker is safely terminating.
- **`cancelled`**: Worker terminated early without side-effect leaks.
- **`done`**: Operation completed successfully.
- **`partial`**: Operation completed with some skipped or non-fatal item errors.
- **`error`**: Unrecoverable failure occurred.
- **`interrupted`**: Process restart occurred while job was in flight. Can be resumed or retried via `POST /api/v2/jobs/resume` or `POST /api/v2/jobs/retry` (both accept `job_id` in the JSON body).

## Durability & Recovery (`operations.json`)

Unlike legacy in-memory job queues, all operations are persisted atomically to `operations.json` in the data directory.
- On startup, any operation previously left in `running` or `queued` state is automatically marked `interrupted`.
- The **Activity drawer** (`#activityButton`) displays live and historical operations.
- Interrupted jobs can be cleanly retried or resumed without duplicating finished work.

## Observability & Endpoints

- `GET /api/v2/jobs`: Lists active, pending, and recent operations.
- `GET /api/v2/jobs/items`: Paginated list of operation items for a specific job (`?job_id=`).
- `POST /api/v2/jobs/cancel`: Cancels an in-flight operation (accepts `job_id` in JSON body).
- `POST /api/v2/jobs/retry`: Retries a failed or interrupted operation (accepts `job_id` in JSON body).
- `POST /api/v2/jobs/resume`: Resumes an interrupted operation (accepts `job_id` in JSON body).
- `GET /api/events`: SSE stream of real-time operation state and progress updates.
- `GET /api/jobs`: Backwards-compatible legacy route returning combined live and finished jobs.

## Related

- [API content and imports](/reference/api/content-and-imports/) for metadata/media/emulator/Gameyfin jobs
- [API local administrator](/reference/api/local-admin/) for update jobs
- [Data and recovery](/reference/data-and-recovery/) for what a crash leaves behind
