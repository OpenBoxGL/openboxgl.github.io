---
title: REST API
description: Use the local authenticated HTTP API for automation.
---

The Web UI exposes a local REST API for automation and third-party tooling. The server binds to loopback only and requires a per-launch token on every request. This page is the index; each operation group has its own reference page.

## Server and transport

- The API listens at `http://127.0.0.1:SERVER_PORT` on a random port chosen at startup. The port and token are written to `server.port` and `server.token` inside the data directory and deleted when the server stops.
- OpenBoxGL does not terminate HTTPS. The API is designed for the local host. If you expose it beyond the machine, put a trusted reverse proxy in front and understand the trust boundary first.
- Requests time out after 30 seconds at the socket level (`Handler.REQUEST_TIMEOUT`).
- JSON request bodies are limited to 65,536 bytes (`Handler.MAX_BODY`). A larger body returns HTTP 400 with `{"error": "Request is too large."}`.

## Authentication

Every route except the static UI page requires a token. Send it as a header:

```
X-OpenBox-Token: TOKEN
```

The query parameter `token=TOKEN` is also accepted but can leak through browser history, referrer logs, and proxy logs. Prefer the header in anything you write. The token is compared with a constant-time comparison (`secrets.compare_digest`). A missing or wrong token returns `403 {"error":"Unauthorized"}` for every route, including unknown ones, so the route surface is not discoverable without the token.

## Response envelope

All JSON responses use the shape `{"key": value, ...}`. Errors are always `{"error": "message"}` with a status code.

| Status | Meaning |
| --- | --- |
| `200` | Success |
| `202` | Accepted; a background job was started (metadata sync, media bulk, emulator install/update, Gameyfin install) |
| `304` | Not modified (conditional media and theme requests) |
| `400` | Validation error; the `error` field names the exact problem |
| `403` | `{"error":"Unauthorized"}`; missing or wrong token |
| `404` | `{"error":"Not found"}` for unknown routes or missing games/media/documents |
| `409` | Required local prerequisite is missing (for example, the metadata database has not been downloaded) |
| `416` | Invalid byte range on media |
| `503` | `{"error":"OpenBox library data needs recovery before this operation can continue."}` when the state file is corrupt |
| `500` | `{"error":"Unexpected server error. Copy the diagnostic log from Settings and include it in your report."}` |

The `400` path catches `ValueError`, `OSError`, `TypeError`, `AttributeError`, `KeyError`, `IndexError`, `json.JSONDecodeError`, `GameyfinError`, `FileNotFoundError`, `RuntimeError`, and `subprocess.SubprocessError` from handlers, so most operation failures surface as `400` with a readable message. A corrupt state file raises `503` before the handler runs. Anything else is a `500` with a logged exception.

## Security notes

- Keep exported library data and local paths sensitive. The API can read game paths, media files, documents, and the diagnostic log.
- Secrets (webhook secrets, Gameyfin password, RetroAchievements and EmuMovies credentials) are never returned: credential-bearing settings expose `*_set` boolean flags instead, and the diagnostic log redacts tokens, passwords, and API keys.
- Restore, deletion, and cleanup operations are destructive by design. They validate archive paths, reject symlinks, and refuse to run while games are running where the operation says so.

## Route groups

| Group | Page | Example routes |
| --- | --- | --- |
| Overview and contract | [REST API overview](/reference/api/overview/) | auth, errors, body limits |
| Library and settings | [API library and settings](/reference/api/library-and-settings/) | `/api/library`, `/api/settings`, `/api/game`, `/api/launch`, `/api/profiles`, `/api/related`, `/api/playlists`, `/api/filter-presets` |
| Automation | [API automation](/reference/api/automation/) | `/api/queue`, `/api/tags`, `/api/notifications`, `/api/webhooks`, `/api/launcher/menu` |
| Content and imports | [API content and imports](/reference/api/content-and-imports/) | `/api/import`, `/api/metadata/*`, `/api/media/*`, `/api/emulators/*`, `/api/storefront/*`, `/api/gameyfin/*`, `/api/health` |
| Saves and operations | [API saves and operations](/reference/api/saves-and-operations/) | `/api/saves/*`, `/api/backup/*`, `/api/cloud/sync`, `/api/save-tools/*`, `/api/highscores/*`, `/api/obs/*` |
| Local administrator | [API local administrator](/reference/api/local-admin/) | `/api/update`, `/api/shutdown`, `/api/state/recover`, `/api/desktop/install`, `/api/themes/*` |

## Examples

List the library with the header token:

```bash
curl -H "X-OpenBox-Token: $TOKEN" http://127.0.0.1:8787/api/library
```

Launch a game by stable id:

```bash
curl -X POST -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"game_id": "GAME_ID"}' \
  http://127.0.0.1:8787/api/launch
```

Where `$TOKEN` and the port come from the running server (`cat ~/.local/share/openbox-game-launcher/server.token`). See [Configuration](/reference/configuration/) for the data directory and [the application repository](https://github.com/vindeckyy/OpenBoxGL) for the current route contract (`web_app.py`).
