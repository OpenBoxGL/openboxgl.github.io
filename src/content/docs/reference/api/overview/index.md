---
title: REST API overview
description: Loopback boundary, authentication, body limits, and common errors.
---

The Web UI starts a `ThreadingHTTPServer` bound to `127.0.0.1` on a random port. This page documents the shared contract every route follows. Route lists live on the group pages.

## Loopback boundary

- The server binds to `("127.0.0.1", 0)`, so nothing is reachable from the network.
- OpenBoxGL does not terminate HTTPS. Use a trusted network and an external reverse proxy if you must expose it beyond the host.
- Requests carry a 30-second socket timeout (`Handler.REQUEST_TIMEOUT`).
- The static UI is served at `/` and `/index.html`; the favicon is served at `/favicon.svg` and `/favicon.ico`. Every other route requires authentication.

## Authentication

All API routes require the session token. The server writes it to `server.token` in the data directory at startup and deletes the file on exit. Two transports are accepted:

- Header: `X-OpenBox-Token: TOKEN` (preferred)
- Query parameter: `?token=TOKEN` (can leak through history and logs)

The check uses `secrets.compare_digest`, and unauthenticated requests to any route, known or unknown, return `403 {"error":"Unauthorized"}`.

## Bodies

- POST bodies must be JSON. `Content-Length` must be a valid non-negative number; bodies over 65,536 bytes are rejected with `"Request is too large."`; truncated bodies with `"Request body was truncated."`.
- The body must decode to a JSON object; `[]`, `null`, `"text"`, and malformed JSON return `400 {"error": ...}`.
- GET requests take parameters from the query string (`parse_qs`); lists and repeated keys behave per `parse_qs` (values are lists).

## Response headers

JSON responses are served with `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and a restrictive Content-Security-Policy. Media files are served with immutable cache headers, ETag, Last-Modified, `Accept-Ranges`, and byte-range (206/416) support; `theme.css` revalidates with `public, max-age=0, must-revalidate` and ETag.

## Common errors

| Status | Envelope | When |
| --- | --- | --- |
| 403 | `{"error":"Unauthorized"}` | Missing or wrong token |
| 400 | `{"error": "<message>"}` | Validation failures, missing prerequisites surfaced by handlers, provider errors, unknown queue/notification actions, malformed payloads |
| 404 | `{"error":"Not found"}` | Unknown route |
| 404 | `{"error":"Game not found"}` / `"Media not found"` / `"Document not found"` / `"Platform document not found"` / `"Badge not found"` | Lookups that miss |
| 409 | `{"error":"Download the LaunchBox metadata database first."}` | Metadata routes before the database exists |
| 503 | `{"error":"OpenBox library data needs recovery before this operation can continue."}` | Corrupt state file |
| 500 | `{"error":"Unexpected server error. Copy the diagnostic log from Settings and include it in your report."}` | Unhandled exception |

The handler catches `ValueError`, `OSError`, `TypeError`, `AttributeError`, `KeyError`, `IndexError`, `json.JSONDecodeError`, `GameyfinError`, `FileNotFoundError`, `RuntimeError`, and `subprocess.SubprocessError` from POST handlers and returns them as `400` with the message in `error`. State-corruption errors become `503` before handler dispatch. Everything else is logged and returned as `500`.

## Limits that apply across routes

| Limit | Value |
| --- | --- |
| Request body | 65,536 bytes |
| Socket timeout | 30 seconds |
| Playlist members | 100,000 per playlist |
| History returned by `/api/history` | `limit` clamped to 1..500, default 100 |
| Webhook configs | 32 |
| Watch folders | 50 |

## Security notes

- Treat `server.token` like a password: it grants full read/write access to the library, media, settings, and destructive operations.
- The API can read any local file path referenced by library entries (media, documents, saves). Keep local paths and exported library data private.
- Never log tokens or paste library exports into issues. The diagnostic log redacts credentials.

See [Configuration](/reference/configuration/) for the data directory and [REST API](/reference/api/) for the route index.
