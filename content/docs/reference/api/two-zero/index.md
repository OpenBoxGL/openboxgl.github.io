---
title: API 2.0 changes
description: The 2.0 contract surface — /api/v2 becomes the public API, /api/v1 retires behind an opt-in bridge, the /api/host channel, problem+json errors, and the migration, portable-library, and version routes.
---

<Callout type="note" title="Historical page — 2.0 shipped on 2026-10-31">
This page records the 2.0 contract. The current release is 3.0.0. The `/api/v1` bridge described here was removed in 2.1, and 3.0 moved the server to Rust. See [API 2.1 changes](/reference/api/two-one/) and [API 3.0 changes](/reference/api/three-zero/).
</Callout>

OpenBox 2.0 promoted `/api/v2` from an additive surface to **the** public API, retired `/api/v1` behind an opt-in bridge, gave the native windows their own `/api/host` channel, and answered every error as an RFC 9457 problem document. It added **10 routes and 3 settings** (`library_root`, `path_mode`, `media_manifest_enabled`). Every route still requires the per-launch token described in the [API overview](/reference/api/overview/).

## The public API is `/api/v2`

`/api/v2` and `/api/host` are the supported surfaces. In 2.0 `/api/v1` was **off by default**; it was removed entirely in 2.1.

| Surface | State in 2.0 | State in 3.0 |
| --- | --- | --- |
| `/api/v2/*` | The public API. Everything new lands here. | The public API. |
| `/api/host/*` | The native-window channel. Guarded by `X-OpenBox-API-Version` (below). | The native-window channel. |
| `/api/v1/*` | Off by default. `OPENBOX_ENABLE_V1_API=1` restored it through 2.0.x. | Removed: `410 V1_API_REMOVED`; the environment variable is ignored. |

The frozen 61-route v1 list is archived at `docs/archive/v1_contracts.json` in the app repo; the live route contract is `api_contracts.json`, enforced by `scripts/check_api_contract.py`.

## The host channel

The native windows (WebKitGTK on Linux, WebView2 on Windows, WKWebView on macOS) talk to `/api/host/*` and send `X-OpenBox-API-Version: 2`. A window that sends a different major version is refused before the route runs with `409 HOST_API_UNSUPPORTED` and the message "This OpenBox window is from a different version. Restart OpenBox and the window together." A request with no version header is not refused.

## Problem-details errors

Every error response (status 400 and up) is now an RFC 9457 problem document served as `application/problem+json`:

```json
{
  "type": "https://openbox.local/problems/move-plan-stale",
  "title": "Conflict",
  "status": 409,
  "detail": "The library changed since the preview. Run the preview again.",
  "code": "MOVE_PLAN_STALE",
  "error": "The library changed since the preview. Run the preview again.",
  "retryable": false,
  "request_id": "…",
  "instance": "/api/v2/library/move/apply"
}
```

- `type` is derived from `code` (`https://openbox.local/problems/` + the lowercased code with dashes).
- `code` is the stable machine-readable key; it survives rewording of `detail`/`title`.
- `error` duplicates `detail` for one major cycle, so existing clients keep working.
- `retryable` is true for 408, 425, 429, 500, 502, 503, 504, and for any payload that carries `retry_after`.

## Version and contract report

`GET /api/v2/version` reports every contract version so a client can refuse a shape it cannot read:

```json
{
  "version": "3.0.0",
  "api_version": 2,
  "state_schema": 7,
  "plugin_api_version": 2,
  "backup_format": 2,
  "sync_format": 3,
  "platform": "linux",
  "python": "",
  "runtime": "rust"
}
```

`GET /api/v2/compat/report` serves the same deterministic compatibility report as **Settings → About → Show compatibility report**: the library format, each theme's token fallbacks, which backup formats restore on which version, unknown settings keys, the public API and host channel, and the sync folder.

## Migration gate

In 2.0 a format 6 library was upgraded on first start. In 3.0 opening does **not** migrate: run `openbox --migrate-library` first. A readiness gate then lists what needs a look before the migrated library is used. The four routes back it:

| Route | Behavior |
| --- | --- |
| `GET /api/v2/setup/migration/status` | What the last migration did, whether the user has acknowledged it, and the `readiness` items. |
| `POST /api/v2/setup/migration/backup` | Writes a `library`+`settings` backup before the migrated library is opened. Returns `{archive, name}`. |
| `POST /api/v2/setup/migration/acknowledge` | Records that the user has seen the migration report. |
| `POST /api/v2/setup/migration/rollback` | **Removed in 3.0.** The route is registered but always returns `409 ROLLBACK_REMOVED`. Use OpenBox 2.1.0 to restore `library.v6.backup.json`. |

## Portable library

The portable library stores game paths under one library folder as `@library/...` tokens so the folder can move between drives or machines. Two routes back the **Settings → Library → Move library** flow; a third reads integrity:

| Route | Behavior |
| --- | --- |
| `POST /api/v2/library/move/preview` | Body `{old_root, new_root}`. Returns the move plan: `plan_id` (`mv-<sha256 prefix>`), normalized roots, `counts` (`tokenized`, `absolute_inside_old`, `missing`, `outside`, `symlink_outside`), `examples`, and the `rebased` path map. `new_root` must exist, else `400`. Nothing is copied or moved — you move the folder, the plan rebases stored paths. |
| `POST /api/v2/library/move/apply` | Body `{old_root, new_root, plan_id}`. Recomputes the plan inside the store lock and refuses with `409 MOVE_PLAN_STALE` when the library no longer matches the preview. On success it writes the rebased paths, sets `library_root` and `path_mode: "portable"`, and returns `{moved, counts, library_root, path_mode}`. |
| `GET /api/v2/library/integrity` | The read-only integrity report also surfaced by `openbox --check-library`: `status` (`healthy`, `warnings`, `errors`), `exit_code` (0/1/2), and per-category `severity`, `count`, and `examples` for missing, unreadable, outside-root, and token-broken game paths plus media-manifest drift. |

## Host resume

`POST /api/host/resume` resumes a stored Quick Resume state for a game; it is the same handler as `POST /api/v2/resume`, mounted on the host channel for the native windows.

## New error codes

| Code | Status | When |
| --- | --- | --- |
| `V1_API_REMOVED` | 410 | A `/api/v1` path was called in 2.1 or later. (2.0 used `V1_API_DISABLED` while the bridge was off.) |
| `HOST_API_UNSUPPORTED` | 409 | A native host sent an `X-OpenBox-API-Version` major other than 2. |
| `MOVE_PLAN_STALE` | 409 | The library changed between move preview and apply. |
| `BACKUP_FORMAT_UNSUPPORTED` | 400 | A backup manifest declares a format this build cannot read or write. |
| `ROLLBACK_REMOVED` | 409 | `POST /api/v2/setup/migration/rollback` was called in 3.0. |

See [Updating](/updating/) for the 3.0 upgrade story, [Backups](/guides/sessions-saves-and-backups/library-backups/) for backup format 2, and [Plugins](/reference/plugins/) for plugin API v2.
