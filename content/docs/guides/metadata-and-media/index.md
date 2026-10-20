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

**Search IGDB** is an alternative provider; it needs `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` in `~/.env` (Twitch developer app credentials). IGDB results apply name, summary/description, year, and genre.

**Use Steam data** fills name, developer, publisher, genre, year, and description from the Steam storefront API for entries with a Steam App ID, and downloads the library cover and header image.

## Metadata provider priority

Metadata searches can mix the built-in providers and enabled plugin providers in a configured order. Settings → Metadata & Media exposes **Metadata provider priority, one per line** (`metadata_provider_priority`) and **Prefer plugin metadata providers in bulk downloads** (`plugin_metadata_priority`, off by default).

- **Priority list.** Name built-ins in the order you want them: `launchbox`, `screenscraper`, `igdb`, `steamgriddb`. Enabled plugins that declare a `metadata` capability are appended automatically as `plugin:<id>`. The setting accepts at most 20 entries and named values longer than 80 characters are truncated; unknown names are discarded and duplicates are ignored. Unlisted built-ins still follow in the default order (LaunchBox, ScreenScraper, IGDB, SteamGridDB), so a partial list never disables a provider.
- **Plugin preference.** With `plugin_metadata_priority` on, plugin providers move ahead of built-ins in search order, and bulk media chooses a plugin provider when a game has no recorded metadata provider.
- **Result source labels.** `GET /api/metadata/search` returns both `results` (LaunchBox database rows) and ranked `candidates`. Every candidate carries a `source` (`launchbox`, `screenscraper`, `igdb`, `steamgriddb`, or `plugin:<id>`); plugin results also carry their display name and `plugin_id`. The dialog labels each row with its provider (LaunchBox, ScreenScraper, IGDB, SteamGridDB, or the plugin name).
- **Ranking.** Candidates are ordered by normalized-title exactness, then platform equivalence, then title similarity, then name length. Partial-word searches place an exact normalized title first and prefer a matching platform before shorter names.
- **Applying.** `POST /api/v2/metadata/candidates/apply` takes `{"game_id", "candidate", "overwrite"}` and applies only the known metadata fields. Applying records the result's `metadata_provider` when the game has none yet or overwrite is on, so later bulk media can prioritize that provider even when every metadata field already had a value.

## Automatic post-import scrape

The setup wizard's Options step has an **Automatically match metadata and download media after import** toggle (on by default). When enabled, every import batch triggers one `POST /api/v2/metadata/auto-scrape` call, which queues exactly two jobs: `metadata-match:{batch}` (offline LaunchBox match preview plus opted-in ScreenScraper dual-hash and IGDB exact-title passes) and `metadata-media:{batch}` (LaunchBox media for confidently matched games, then SteamGridDB fill for anything still missing). Anything the automatic pass cannot resolve stays in the Metadata Match Review queue above.

All online providers stay **off by default**; each runs only when its opt-in is enabled and configured, with per-run budgets, so a single game's failure never aborts a pass. The master toggle, provider opt-ins, and media-type lists are persisted through `GET`/`POST /api/v2/metadata/scrape-settings` — unchecking every media type runs match-only.

## Thumbnail chooser

Every LaunchBox, SteamGridDB, and ScreenScraper search result now offers a **Thumbnails** button that opens a chooser dialog with all image candidates grouped by media kind; picking one applies exactly that image instead of the top pick. (IGDB results apply directly with a **Use** button.) Chosen URLs are downloaded only when they match a candidate the provider returned for that record, so the server never fetches an arbitrary URL. `GET /api/v2/metadata/media-candidates` lists LaunchBox image candidates.

## Time to beat

The Information card's **Time to beat** fact comes from IGDB (its `game_time_to_beats` endpoint, converted from seconds to hours) and is projected into the game list, so pickers and sorting can use it.

## Media Manager

**Tools → Media files** opens the Media Manager, which shows a per-platform audit: games, database matched, and missing counts for box front, background, screenshots, box back, box spine, 3D box, clear logo, fanart, banner, icon, title screen, cart front, cart back, disc, advertisement, and manual (`GET /api/media/audit?platform=`). Check any of the 22 offered types — cover, background, screenshots, poster, square, box back, box spine, 3D box, clear logo, fanart, banner, icon, title screen, cart front, cart back, disc, advertisement, manual, snap video, theme video, trailer, and music — and whether to replace existing media, then **Download for matched games**.

LaunchBox-matched games run as the bounded `media-bulk` background job with progress and a per-game error list. Games matched through another provider, or given an explicit `game_ids` list, are fed into the durable media queue below so provider downloads survive a restart.

Missing artwork cells render the shared `/assets/placeholder-cover.svg` image instead of repeating "no cover" text.

## Media automation queue

Automatic imports and Media Manager downloads share a durable queue stored at `<data-dir>/media-queue.json`. Each entry records the game, provider source, one media kind, an overwrite flag, attempt count, last error, and a retry time, so an OpenBox restart loses no queued work.

- **What feeds it.** Folder scans and storefront imports enqueue media for every imported game that has a `launchbox_db_id` or a recorded `metadata_provider`, using the **Auto-import media types** list (default cover, background, screenshots). EmuMovies, LaunchBox, ScreenScraper, IGDB, SteamGridDB, and enabled plugin providers are all valid sources; a plugin source is recorded as `plugin:<id>`. Media Manager bulk downloads also enqueue games that are not LaunchBox-matched.
- **Kinds.** The queue accepts every provider media type — cover, background, screenshots, poster, square, box back, box spine, 3D box, clear logo, fanart, banner, icon, title screen, cart front, cart back, disc, advertisement, manual, `video`, `video_snap`, `video_theme`, `video_trailer`, and music — plus `video_recording`. A game can therefore queue a poster, square art, a video, music, and a manual alongside the classic cover/background/screenshots set.
- **Deduplication.** One queue entry exists per `(game, source, kind)`. Re-enqueuing with the same overwrite flag updates that entry rather than adding a duplicate; a different overwrite flag is kept as a separate entry.
- **Survives restart.** The queue is written atomically with owner-only permissions. The worker starts with OpenBox and again after a bulk download, retry, or resume, and continues where it stopped.
- **Controls.** `GET /api/media/queue` returns `items`, `queue`, `running`, `paused`, `completed`, `failed`, and per-state `counts` (`total`, `queued`, `failed`, `completed`, `cancelled`). Pause, resume, cancel, and retry use `POST /api/media/queue/pause`, `/resume`, `/cancel`, and `/retry` (`{"id": "<item id>"}`); retry clears the item's attempts and error and starts the worker when it is not running.
- **Per-item errors.** A failed download records its message on that item (up to 500 characters) and is shown in the Media Manager queue list with its attempt count and a **Retry** button. Other items continue.
- **Retries.** An item is attempted up to 3 times with 5, 30, and 120-second backoff; after the third failure it stays in `failed` state until retried or cancelled.
- **Limits.** The queue holds at most 5,000 items. **Media download limit during imports** (`media_download_limit`, 0 = unlimited, max 10,000) caps how many games an import or worker pass queues/completes, and **Per platform and media kind limit** (`media_download_limit_per_group`, 0 = unlimited, max 100) caps downloads for each platform-and-kind pair in one worker pass, so one large platform cannot consume every slot.
- **Existing files are preserved** unless overwrite is requested for that item. Manuals are never replaced by the queue when a manual is already set.

Queue routes are documented in [API content and imports](/reference/api/content-and-imports/).

## Media cache cleanup

**Clear old media cache** in the Media Manager posts `{"days": 30}` to `POST /api/media/cache/cleanup`. The route accepts a window of 1–3650 days, deletes only regular files anywhere under `<data-dir>/cache/media` whose modification time is older than that window, skips symlinks so the walk cannot escape the cache root, and returns `{"root", "deleted", "bytes", "skipped"}`. User media directories are never touched.

## Duplicate media cleanup

**Find duplicate media** hashes every stored media field (covers, backgrounds, clear logos, fanart, banners, icons, posters, square art, box backs/spines/3D boxes, title screens, carts, discs, ads, manuals, videos, and music) plus screenshots (SHA-256 over size + content) and groups files that are byte-identical. The dry-run reports the groups; **Delete duplicate media** (only shown after a scan) deletes the duplicate copies. Deletion keeps one copy per group, prefers the copy inside the OpenBox data directory, and refuses symlinks and files outside the allowed roots. Deleted media refresh the browser cache epoch so stale artwork disappears.

## Video and per-game media

Each game can hold up to four video fields: `video_snap`, `video_theme`, `video_trailer`, and `video_recording`, plus a legacy `video` value. The active video is chosen by the **video priority** setting (default snap, theme, trailer, recording); the detail pane plays the first field whose file exists. **Download Steam trailer** fetches the first storefront trailer for a Steam App ID into `media/steam/<app_id>/trailer.mp4`; **Download GOG media** fetches cover and background from the GOG embed API for Heroic/GOG entries. **Capture screenshot** uses `gnome-screenshot`, `spectacle`, `scrot`, or ImageMagick `import` (first available) and appends the PNG to the game's screenshots. OBS recordings can auto-attach when a session ends (Settings, **Auto-attach latest OBS recording**, with an optional folder override; default detection reads OBS profiles and falls back to `~/Videos`).

EmuMovies downloads require a licensed account: credentials come from Settings or `EMUMOVIES_USERNAME`/`EMUMOVIES_PASSWORD` in `~/.env` and are stored owner-only. The provider covers covers (box fronts), box backs, box spines, 3D boxes, screenshots, title screens, marquees, cart fronts and backs, discs, clear logos, snap and theme videos, manuals, and music. Each kind has its own content-type and size cap, and files land under `media/emumovies/<platform>/<game>/`. See [Accounts and media](/integrations/accounts-and-media/#emumovies) for the exact asset mapping. **Download bezel** fetches Bezel Project artwork per platform from GitHub and extracts into `<data-dir>/bezels`; a corrupt replacement never destroys the previously working set (extraction stages into a temp directory first).

## Limits and recovery

<Callout type="note" title="Why downloads are bounded and jobs are observable">

Metadata and media work never blocks the UI and never runs unbounded. Every bulk operation is a named background job (metadata sync, media-bulk) on a 4-thread pool, surfaced through its own status route so you can poll until `done` and inspect the per-game error list before retrying, while the durable queue records per-item retries. LaunchBox media downloads validate the HTTP status, content type, and payload size before writing: the response is streamed to a temporary file under the per-image cap, rejected on an unexpected status or content type, and moved to its destination only after the full download succeeds, so a failed request never leaves a partial file in the library. Local database imports keep their retry and progress reporting. See [Background jobs](/reference/background-jobs/) for the job lifecycle and [How OpenBoxGL works](/reference/how-it-works/#job-manager-and-durable-operations) for why a crash mid-job leaves partial-but-valid state.

</Callout>

- Metadata database download: 2 GiB cap, 120-second timeout.
- LaunchBox image downloads: 32 MiB cap, 30-second timeout (15 seconds for Steam covers), must return an `image/` content type.
- Metadata-provider and EmuMovies downloads by kind: images 64 MiB and `image/`; videos 512 MiB and `video/`; music 32 MiB and `audio/` or `application/ogg`; manuals 64 MiB and `application/pdf`.
- Steam trailer/GOG media: responses read up to 4 MiB for JSON, downloads capped at 512 MiB.
- Import and queue limits: **Media download limit during imports** (0 = unlimited, max 10,000), **Per platform and media kind limit** (0 = unlimited, max 100), and the **Auto-import media types** list (default cover, background, screenshots). The queue holds up to 5,000 items and retries an item 3 times.

A missing metadata database returns HTTP 409 from readiness-dependent routes. Media downloads write local files and provider integrations call external services, so check credentials and rate limits first; the diagnostic log records failures with secrets redacted.
