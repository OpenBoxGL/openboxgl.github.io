---
title: Background jobs
description: Observable states, retry limits, replacement, cancellation, and volatility.
---

Background work in OpenBoxGL runs through the durable **Operation Service** in `crates/openbox-store/src/operations.rs`. Operations are persisted to `operations.json` plus one `operations_items/<job_id>.json` per job, surviving application restarts and supporting progress streaming, cancellation, retries, and resume flows. The Python `crates/openbox-store/src/operations.rs` path remains only for `OPENBOX_BACKEND=python`.

## The operation object

Every submitted operation is recorded with these fields:

| Key | Meaning |
| --- | --- |
| `job_id` | Unique hex identifier |
| `root_job_id` | Identifier of the root job a retry or resume descends from |
| `retry_of` | `job_id` of the job this one retries |
| `resume_of` | `job_id` of the job this one resumes |
| `type` | Dotted operation type (see supported types below) |
| `title` | Human-readable job title |
| `state` | `queued`, `running`, `cancelling`, `done`, `partial`, `error`, `cancelled`, or `interrupted` |
| `phase` | Current phase label |
| `current` | Progress counter |
| `total` | Progress total |
| `message` | Progress or status message |
| `created_at` | UTC ISO timestamp |
| `updated_at` | Last change timestamp |
| `started_at` | Start timestamp |
| `finished_at` | Terminal timestamp |
| `can_cancel` | Whether the job can be cancelled right now |
| `can_retry` | Whether the job can be retried right now |
| `can_resume` | Whether the job can be resumed right now |
| `input` | Context-specific parameters, with secrets redacted |
| `checkpoint` | Resume checkpoint data |
| `result` | Result counters, normalised to `added`, `merged`, `skipped`, `excluded`, `failed`, `completed`, `downloaded` |
| `error` | Error object on failure (`code`, `message`, `request_id`) |

Progress is flat: `phase`, `current`, `total`, and `message` are top-level keys, and there is no `unit` field.

## Supported operation types

Jobs carry a dotted `type`: `setup.scan`, `setup.revalidate`, `setup.commit`, `metadata.db_sync`, `metadata.match_preview`, `metadata.match_auto`, `metadata.apply`, `metadata.media_auto`, `media.bulk_download`, `media.cleanup`, `media.memories_import`, `emulator.install`, `emulator.update`, `gameyfin.install`, `saves.scan`, `saves.backup`, `saves.restore`, `library.backup`, `library.restore`, `library.export`, `screenscraper.match`, `screenscraper.apply`, `steamgrid.match`, `steamgrid.apply`, `storefront.auto_import`, `storefront.scan`, `clips.reel`, `cloud.sync`, `updater.install`, `trail.refresh`, and `itinerary.igdb`. The legacy job-name map was removed in 2.1; the v2 list returns typed rows. At most `MAX_OPERATIONS=100` operations are retained.

Workers run as Tokio blocking tasks behind a semaphore with 4 concurrent slots (`DEFAULT_MAX_WORKERS=4`). Live status and incremental events stream to the frontend over Server-Sent Events (SSE) via `/api/v2/events`.

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

All operations are persisted atomically to `operations.json` in the data directory, with per-job item rows under `operations_items/<job_id>.json`.
- On startup, any operation previously left in `running`, `queued`, or `cancelling` state is automatically marked `interrupted`.
- The **Activity drawer** (`#activityButton`) displays live and historical operations.
- Interrupted jobs can be cleanly retried or resumed without duplicating finished work.

## Durable media queue

The media automation queue is a separate durable worker rather than an Operation Service job. It is stored in `media-queue.json` (at most 5,000 items) and reached through `GET /api/v2/media/queue` plus `POST /api/v2/media/queue/pause`, `/resume`, `/cancel`, and `/retry` (the retry body names one `id`). The response reports worker state, `items`, `queue`, and per-state `counts`. Because the list lives on disk, closing OpenBox does not lose queued downloads.

## Observability & Endpoints

- `GET /api/v2/jobs`: Cursor-paginated operations (`limit`, `cursor`, `type`/`type_filter`, `state`/`state_filter`, `root_job_id`, `group_by`).
- `GET /api/v2/jobs/items`: Paginated list of operation items for a specific job (`?job_id=`).
- `POST /api/v2/jobs/cancel`: Cancels an in-flight operation (accepts `job_id` in JSON body).
- `POST /api/v2/jobs/retry`: Retries a failed or interrupted operation (accepts `job_id` in JSON body).
- `POST /api/v2/jobs/resume`: Resumes an interrupted operation (accepts `job_id` in JSON body).
- `GET /api/v2/events`: SSE stream of real-time operation state and progress updates.
- `GET /api/jobs` and `GET /api/v1/jobs`: Retired. They return `410` (`API_VERSION_REQUIRED` or `V1_API_REMOVED`); use `/api/v2/jobs`.

## Related

- [API content and imports](/reference/api/content-and-imports/) for metadata/media/emulator/Gameyfin jobs
- [API local administrator](/reference/api/local-admin/) for update jobs
- [Data and recovery](/reference/data-and-recovery/) for what a crash leaves behind
