---
title: Metadata and media
description: Match games and manage local artwork and media jobs.
---

Metadata sync uses the LaunchBox Games Database (LBGDB) when its local copy is available. The database downloads from `https://gamesdb.launchbox-app.com/Metadata.zip` and is built into a local SQLite file at `<data-dir>/metadata/launchbox.db`. The first download can be large (up to 2 GiB allowed); it runs as a background job visible through the operation's status endpoint.

## Download and search

Open a game's detail pane and click **Find metadata** to open the LaunchBox Games Database dialog. Use **Download database** to fetch and build the local database (it skips when a download is already running and reports the job state). Then **Search** matches the game title (or your query) with the game's platform as a hint, returning up to 20 results ordered by exact normalized match, platform match, then shortest name. Without a database, the search route returns HTTP 409 with "Download the LaunchBox metadata database first."

Select a result to apply fields: name, platform, year, developer, publisher, genre, description, series, ESRB, and max players. Check **Box front**, **Background**, and **Screenshots** to also download media (up to 12 screenshots); **Replace existing fields and media** (overwrite) updates values that are already set, otherwise only empty fields are filled. Downloads go to `<data-dir>/media/launchbox/<database_id>/`. ESRB values are accepted from the standard set (E, E10+, T, M, AO, RP, EC, K-A, Unrated). The game keeps a `launchbox_db_id` so later jobs can find it.

## Metadata Match Review

After batch imports, OpenBox provides a dedicated **Metadata Match Review** queue:

- **Preview Matches**: `POST /api/v2/metadata/matches/preview` queues a metadata match preview for a batch or game set; `GET /api/v2/metadata/matches/preview?preview_id=` retrieves the preview result with candidate scores and field previews.
- **Inspect Candidates**: `GET /api/v2/metadata/matches/items` returns paginated candidate lists with confidence scores and field previews.
- **Apply or Decide**:
  - `POST /api/v2/metadata/matches/decisions`: Submits per-item accept/reject decisions for matched candidates.
  - `POST /api/v2/metadata/matches/apply`: Confirms matched metadata and artwork for selected items or entire batches.

**Search IGDB** is an alternative provider; it needs `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` in `~/.env` (Twitch developer app credentials). IGDB results apply name, summary, genres, and platforms.

**Use Steam data** fills name, developer, publisher, genre, year, and description from the Steam storefront API for entries with a Steam App ID, and downloads the library cover and header image.

## Media Manager and Durable Operations

The **Media** button opens the Media Manager, which shows a per-platform audit: games, database matched, missing box front, missing background, and missing screenshots. Check the types to download (cover, background, screenshots) and whether to replace existing media, then **Download for matched games**. This runs a durable background operation tracked in the **Activity drawer** (`#activityButton`), backed by `operations.json` with live Server-Sent Events (SSE) progress and cancel/resume support.

## Duplicate media cleanup

**Find duplicate media** hashes cover, background, and screenshot files (SHA-256 over size + content) and groups files that are byte-identical. The dry-run reports the groups; **Delete duplicate media** (only shown after a scan) deletes the duplicate copies. Deletion keeps one copy per group, prefers the copy inside the OpenBox data directory, and refuses symlinks and files outside the allowed roots. Deleted media refresh the browser cache epoch so stale artwork disappears.

## Video and per-game media

Each game can hold up to four video fields: `video_snap`, `video_theme`, `video_trailer`, and `video_recording`, plus a legacy `video` value. The active video is chosen by the **video priority** setting (default snap, theme, trailer, recording); the detail pane plays the first field whose file exists. **Download Steam trailer** fetches the first storefront trailer for a Steam App ID into `media/steam/<app_id>/trailer.mp4`; **Download GOG media** fetches cover and background from the GOG embed API for Heroic/GOG entries. **Capture screenshot** uses `gnome-screenshot`, `spectacle`, `scrot`, or ImageMagick `import` (first available) and appends the PNG to the game's screenshots. OBS recordings can auto-attach when a session ends (Settings, **Auto-attach latest OBS recording**, with an optional folder override; default detection reads OBS profiles and falls back to `~/Videos`).

EmuMovies downloads require a licensed account: credentials come from Settings or `EMUMOVIES_USERNAME`/`EMUMOVIES_PASSWORD` in `~/.env`, are stored owner-only, and downloads expect an image content type. **Download bezel** fetches Bezel Project artwork per platform from GitHub and extracts into `<data-dir>/bezels`; a corrupt replacement never destroys the previously working set (extraction stages into a temp directory first).

## Limits and recovery

<Callout type="note" title="Why downloads are bounded and jobs are observable">

Metadata and media work never blocks the UI and never runs unbounded. Every bulk operation is a named background job (metadata sync, media-bulk) on a 4-thread pool, surfaced through its own status route so you can poll until `done` and inspect the per-game error list before retrying. Downloads cap per image (32 MiB), per trailer (512 MiB), and per database (2 GiB), and require an `image/` content type. See [Background jobs](/reference/background-jobs/) for the job lifecycle and [How OpenBoxGL works](/reference/how-it-works/#the-job-manager) for why a crash mid-job leaves partial-but-valid state.

</Callout>

- Metadata database download: 2 GiB cap, 120-second timeout.
- Image downloads: 32 MiB cap, 30-second timeout (15 seconds for Steam covers), must return an `image/` content type.
- Steam trailer/GOG media: responses read up to 4 MiB for JSON, downloads capped at 512 MiB.
- Import-time media jobs queue per game when a `launchbox_db_id` exists, respecting the **Media download limit during imports** (0 = unlimited, max 10000) and the **Auto-import media types** list (cover, background, screenshots).

A missing metadata database returns HTTP 409 from readiness-dependent routes. Media downloads write local files and provider integrations call external services, so check credentials and rate limits first; the diagnostic log records failures with secrets redacted.
