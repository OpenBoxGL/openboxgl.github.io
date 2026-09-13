# OpenBox docs site backend

Serves the static export in `out/` and a small dependency-free API (Node 18+ or Bun, stdlib only).

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Liveness + site-server version (`SITE_VERSION`, not the OpenBox app release) + uptime |
| GET | `/api/search?q=...` | Ranked docs search over `public/docs-index.json` |
| GET | `/api/release` | Latest GitHub release (cached 15 min), including an `appimages` entry for each supported architecture |
| GET | `/api/release?arch=x86_64` | Same release with the selected architecture also exposed in the legacy `appimage` and `checksum_url` fields; accepts `aarch64` (and `arm64`) too |
| GET | `/api/stats` | GitHub stars, forks, downloads (cached 1h) |
| GET | `/api/changelog.rss` | RSS feed generated from `content/docs/changelog.md` |
| POST | `/api/feedback` | Feedback form to `data/feedback.jsonl` (rate limited, honeypot) |

## Run

```bash
bun run build        # produces out/
bun run serve        # node server/index.mjs, PORT/HOST env
```

Defaults: `PORT=3000`, `HOST=127.0.0.1`. Set `GITHUB_TOKEN` in the environment to raise the GitHub API rate limit for `/api/release` and `/api/stats`; the server reads it and sends it as a Bearer token on GitHub requests only.

The unqualified release response is visitor-neutral: it returns both `x86_64` and `aarch64` entries under `appimages` and leaves the legacy single-asset fields null. Clients that need those fields can pass `?arch=` explicitly. The server never selects an artifact from `process.arch`, because a shared site host's CPU is not the visitor's CPU. `/api/stats` reports combined AppImage downloads plus per-architecture counts.

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
