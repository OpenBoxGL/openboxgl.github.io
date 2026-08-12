# OpenBox docs site backend

Serves the static export in `out/` and a small dependency-free API (Node 18+ or Bun, stdlib only).

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Liveness + version + uptime |
| GET | `/api/search?q=...` | Ranked docs search over `public/docs-index.json` |
| GET | `/api/release` | Latest GitHub release (cached 15 min): version, notes, AppImage URL, checksum |
| GET | `/api/stats` | GitHub stars, forks, downloads (cached 1h) |
| GET | `/api/changelog.rss` | RSS feed generated from `content/docs/changelog.md` |
| POST | `/api/feedback` | Feedback form to `data/feedback.jsonl` (rate limited, honeypot) |

## Run

```bash
bun run build        # produces out/
bun run serve        # node server/index.mjs, PORT/HOST env
```

Defaults: `PORT=3000`, `HOST=127.0.0.1`. Set `GITHUB_TOKEN` in the environment to raise the GitHub API rate limit for `/api/release` and `/api/stats`; the server reads it and sends it as a Bearer token on GitHub requests only.

`OPENBOX_SITE_DATA` overrides where `feedback.jsonl` is written (default `./data`).

## Docker

```bash
docker compose up --build
```

The container builds the static site, copies `out/` plus the server into a slim Node image, and listens on `3000`. Bind it behind a reverse proxy (Caddy, nginx, Traefik) with a domain and TLS; the server does not terminate TLS.

## Deploy notes

- The API is read-mostly and stateless. `/api/feedback` is the only write path; it stores a JSONL line per post with an in-memory per-IP rate limit. Restarting resets the rate buckets but never loses stored feedback.
- GitHub calls are cached in memory; a restart just re-warms them on the next request.
- Static assets are served with long cache headers; HTML with a one-hour cache.
- The server never touches the OpenBox app's data directory. It is a website backend only.
