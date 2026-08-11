---
title: Queue, tags, and notifications
description: Manage the persistent play queue, normalized tags, notifications, and webhooks.
---

The Web UI's Queue, Tags, Notifications, and Webhooks dialogs are opened from the top bar. All of them are persistent local state stored in the library file (schema version 4).

## Play queue

Open **Queue** to see the queue, **Play next**, **Add selected game**, and a Remove button per entry. The queue is capped at **500 entries**, each note is limited to **200 characters**, and entries are stored by stable game ID so they survive reordering and library edits.

- **Enqueue** adds games at the end (or at a requested position) with an optional note.
- **Advance** (Play next) walks forward, skipping entries whose game is missing or whose path no longer exists; those entries are marked `skip` and left in place. It returns the next playable entry or `null` when the queue is exhausted.
- **Reorder** requires the full ordered list of current entry IDs and rejects partial lists.
- **Remove** deletes the given entries. Missing games resolve to a "Missing" label with the entry retained so you can remove it.

## Tags

Tags are canonicalized: trimmed, whitespace-collapsed, case-insensitively deduplicated (first spelling wins), up to **50 tags per game** and **64 characters per tag**. Over-long tags raise an error rather than being silently truncated.

- **Replace** sets the full tag list.
- **Add** appends only labels not already present (case-insensitive).
- **Remove** deletes exact case-insensitive matches, preserving order.
- Replace and adjust cannot be combined in one request; adding and removing the same label in one request is rejected.

The Tags dialog lists tag counts (visible, non-hidden games only, sorted by count then name). Clicking a tag filters the library with a `tag:<name>` search. **Save tags on selected game** writes comma-separated tags to the currently selected game.

## Notifications

The Notification Center stores up to **200 entries**, newest first. Titles are capped at 200 characters, bodies at 2000. Notifications are deduplicated within 10 minutes when the kind and title match, or immediately when an explicit `dedupe_key` matches (webhook delivery failures reuse a per-event key). **Mark all read** and **Clear** act on the whole list or selected IDs. Webhook delivery failures surface here as error-level notifications so you can notice them without polling.

## Webhooks

Webhooks deliver signed, best-effort JSON events to your own endpoints. Configure up to **32 webhooks**, each with a URL, a secret (at least 8 characters), and a comma-separated event list. Available events:

- `session.started` and `session.stopped` (with `launch_id`, `game_id`, `name`, seconds, exit code, timestamps)
- `queue.advanced` (from/to game and entry IDs)
- `library.imported` (source, found, added)
- `library.changed` (action, game IDs, count)
- `metadata.synced` (status)
- `backup.created` (archive name, items)
- `update.installed` (version)
- `plugin.changed` (action, plugin)

Delivery is asynchronous: four background workers with a bounded queue of 128 pending items. Each delivery is a POST with `Content-Type: application/json`, `X-OpenBox-Event-Id`, `X-OpenBox-Event`, `X-OpenBox-Timestamp`, and `X-OpenBox-Signature: sha256=<hex>` (HMAC-SHA256 over `timestamp + "." + body`). Retries happen for HTTP 408, 425, 429, and 5xx, with delays of 1, 2, 4, 8 seconds (Retry-After honored and clamped to 30 seconds), default 3 attempts (max 5), default 5-second timeout (max 15). Redirects are treated as terminal failures.

Safety rules:

- HTTPS is required. HTTP targets only work when `OPENBOX_ALLOW_HTTP_WEBHOOKS=1`, meant for trusted local testing.
- URLs may not embed credentials, contain fragments, exceed 2048 characters, or resolve to unspecified, multicast, link-local, or reserved addresses. Loopback URLs whose port matches the running OpenBox server are rejected, as are loopback URLs pointing at any listening port.
- Secrets never leave the server in GET responses; the API returns a `secret_set` flag instead. Logs redact token, password, secret, API key, and authorization values.

**Test** performs one synchronous `test.ping` delivery and reports `ok` with the status or an error, without exposing the response body. **Save webhook** replaces the configuration list. Delivery failures are recorded per webhook (`last_status`, `last_error`, `last_sent_at`, `last_delivery_at`) and surfaced as notifications.

See [Webhooks](/integrations/webhooks/) and [API automation](/reference/api/) for request shapes.
