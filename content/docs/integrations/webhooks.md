---
title: Webhooks
description: Deliver signed best-effort event notifications to trusted destinations.
---

OpenBoxGL delivers signed JSON events to your own webhook endpoints when library or session events happen. Delivery is asynchronous and best-effort: it never blocks the originating operation, and a failing endpoint only records a failure.

## Configuration limits

| Limit | Value |
| --- | --- |
| Max webhook configs | 32 (`MAX_WEBHOOKS`) |
| Max URL length | 2048 characters |
| Delivery attempts | 1..5 per config (default 3) |
| Timeout per attempt | 1..15 seconds (default 5) |
| Queue | 128 pending items, 4 delivery workers |
| Envelope size | 64 KiB (`MAX_ENVELOPE_BYTES`) |
| Secret | at least 8 characters when set |

Attempts and timeout are configurable per webhook and globally (`webhook_attempts`, `webhook_timeout` in settings).

## Event types

| Event | Data allowlist |
| --- | --- |
| `session.started` | `launch_id`, `game_id`, `name`, `platform`, `started_at` |
| `session.stopped` | `launch_id`, `game_id`, `name`, `seconds`, `exit_code`, `started_at`, `stopped_at` |
| `queue.advanced` | `from_game_id`, `from_entry_id`, `to_game_id`, `to_entry_id` |
| `library.imported` | `source`, `found`, `added` |
| `library.changed` | `action`, `game_ids`, `count` |
| `metadata.synced` | `status` |
| `backup.created` | `archive_name`, `items` |
| `update.installed` | `version` |
| `plugin.changed` | `action`, `plugin` |

Data payloads are allowlisted per event: any other key in the caller-provided data is dropped before the envelope is built. You cannot smuggle extra fields through.

## Envelope and signature

Every delivery is a compact JSON POST:

```json
{
 "id": "evt-<hex>",
 "type": "session.stopped",
 "version": 1,
 "created_at": "2026-08-11T12:00:00+00:00",
 "source": "openbox",
 "data": { ... }
}
```

Headers: `Content-Type: application/json`, `User-Agent: OpenBox/1`, `X-OpenBox-Event-Id`, `X-OpenBox-Event`, `X-OpenBox-Timestamp`, and `X-OpenBox-Signature: sha256=<hex>` when the config has a secret.

The signature is HMAC-SHA256 over `timestamp + "." + body` where `body` is the exact transmitted JSON bytes. Verify it as:

```python
import hashlib, hmac

mac = hmac.new(secret.encode(), digestmod=hashlib.sha256)
mac.update(timestamp.encode())
mac.update(b".")
mac.update(body)
assert mac.hexdigest() == provided_signature
```

## URL validation

`POST /api/webhooks` and `POST /api/webhooks/test` reject unsafe targets before saving:

- Scheme must be `https` by default. Plain `http` is refused unless `OPENBOX_ALLOW_HTTP_WEBHOOKS=1` is set for trusted local testing.
- No embedded credentials, no fragments, port within 1..65535.
- The host must resolve; unspecified, multicast, link-local, and reserved addresses are rejected.
- Loopback destinations must not be the running OpenBoxGL server (matched by port and by a live TCP probe), so the app cannot webhook itself into a loop.

## Delivery behavior

- A matching enabled config receives the envelope for every subscribed event.
- Retryable statuses: 408, 425, 429, and any 5xx. Backoff is exponential (1, 2, 4, 8 seconds), clamped by `Retry-After` to at most 30 seconds.
- Redirects (3xx) are a terminal failure: a redirected request is never followed, because following would send the signed payload to an unvalidated destination.
- Response bodies are drained with a bounded read (4 KiB) and discarded; the response body, resolved addresses, and credentials are never surfaced.
- A full delivery queue drops the event with a failure notification (`"Webhook delivery queue is full; the event was dropped."`).
- Delivery results update the config's `last_status`, `last_error`, `last_sent_at`, `last_delivery_at`; terminal failures also emit an error notification with a `webhook:<event_id>` dedupe key.

## Testing

`POST /api/webhooks/test` with a webhook config performs one bounded synchronous `test.ping` delivery and returns `{"ok": bool, "status": int|null, "error": str}`. The test respects the same URL validation, so a bad target fails immediately. Receivers can distinguish tests by the `test.ping` event type.

## Worked receiver example

A minimal HTTPS receiver that verifies the signature and logs `session.stopped` events:

```python
import hashlib, hmac, json

SECRET = "your-webhook-secret"

def handle(request_body: bytes, headers):
  timestamp = headers["X-OpenBox-Timestamp"]
  provided = headers.get("X-OpenBox-Signature", "").removeprefix("sha256=")

  expected = hmac.new(SECRET.encode(), digestmod=hashlib.sha256)
  expected.update(timestamp.encode())
  expected.update(b".")
  expected.update(request_body)
  if not hmac.compare_digest(expected.hexdigest(), provided):
    raise ValueError("bad signature")

  event = json.loads(request_body)
  if event["type"] == "session.stopped":
    game = event["data"]["name"]
    seconds = event["data"]["seconds"]
    print(f"{game} played for {seconds}s")
```

The signature covers the exact transmitted body bytes, so read the raw request body before any framework decodes or reformats it. Configure the webhook with the same `SECRET` in the **Webhooks** dialog; delivery only signs when a secret is set, and `X-OpenBox-Signature` is omitted when the config has none.

## Security notes

- Keep webhook endpoints private: anyone with read access to your endpoint can see game names and play times.
- A webhook URL points somewhere on the internet (or a loopback test target). It sends game/library metadata, never credentials.
- Secrets are stored locally, preserved through `secret_set`, and never returned by GET responses.
- Inspect failure notifications; a repeatedly failing endpoint means your automation is silently missing events.

## Related

- [API automation](/reference/api/automation/) for the request shapes and `POST /api/webhooks`
- [Configuration](/reference/configuration/) for `OPENBOX_ALLOW_HTTP_WEBHOOKS`
- [API local administrator](/reference/api/local-admin/) for the diagnostic log
