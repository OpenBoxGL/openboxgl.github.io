---
title: Media providers
description: Set up IGDB, LaunchBox Games Database, SteamGridDB, ScreenScraper, EmuMovies, Bezel Project, Steam, GOG, and plugin media.
---

OpenBoxGL enriches games from several optional media and metadata providers. This page is the setup guide; the [Accounts and media](/integrations/accounts-and-media/) reference has the exact credentials and API details.

<Callout type="note" title="Which providers need credentials">

Four providers require **no credentials** and work out of the box: LaunchBox Games Database (public download), Steam (per App ID), GOG (embedded data), and Bezel Project (GitHub public repo). IGDB, ScreenScraper, and SteamGridDB need credentials in `~/.env` (optional provider tokens can also be saved in the app — see below). Only EmuMovies requires a paid licensed account. Plugin providers carry their own requirements. All other providers are optional, your library functions perfectly with zero media providers configured.

</Callout>

## Choose your providers

| Provider | What it provides | Credentials needed |
| --- | --- | --- |
| LaunchBox Games Database | Metadata + box front, background, screenshots, box back/spine/3D, clear logo, fanart, banner, icon, title screen, cart fronts/backs, disc, ads/flyers | None (public download, up to 2 GiB) |
| IGDB | Metadata (name, description, year, genre, developer, publisher, rating, time-to-beat) | `IGDB_CLIENT_ID` + `IGDB_CLIENT_SECRET` in `~/.env` |
| Steam | Name, developer, publisher, genre, year, description + cover and header | None (per-Steam-App-ID) |
| GOG | Cover + background for Heroic/GOG entries | None |
| EmuMovies | Covers, box backs/spines/3D boxes, screenshots, title screens, marquees, cart fronts/backs, discs, clear logos, snap and theme videos, manuals, music | Licensed account (`EMUMOVIES_USERNAME`/`EMUMOVIES_PASSWORD`) |
| SteamGridDB | Covers, backgrounds, clear logos, icons, banners | `STEAMGRIDDB_API_KEY` in `~/.env` |
| Bezel Project | Per-platform bezel sets for RetroArch-style presentation | None |
| ScreenScraper | Per-ROM-hash metadata + media for emulated games (ROM hash matching) | Required (`SCREENSCRAPER_USER`/`SCREENSCRAPER_PASSWORD` plus `SCREENSCRAPER_DEV_ID`/`SCREENSCRAPER_DEV_PASSWORD` in `~/.env`) |
| Plugin providers | Metadata and media from an enabled plugin that declares the capability | Per plugin; see its manifest and settings |

Since 1.18.0, optional provider tokens can also be saved inside the app under **Settings → Metadata & Media → Integration tokens** and are shown masked. They cover IGDB, ScreenScraper, SteamGridDB, Gameyfin, and RetroAchievements, and they are separate from the required environment credentials above: a stored token does not replace `IGDB_CLIENT_ID`/`IGDB_CLIENT_SECRET`, the ScreenScraper pair, or `STEAMGRIDDB_API_KEY`. See [Per-provider integration tokens](/integrations/accounts-and-media/#per-provider-integration-tokens).

Priority is configurable: `metadata_provider_priority` orders built-in and plugin metadata providers, and plugin results can be preferred for bulk media (`plugin_metadata_priority`). Every search result is labelled with its source. Media from these providers feeds the durable download queue, which survives a restart and supports pause, resume, cancel, retry, and per-item errors.

## Set up metadata

1. **Find metadata** on a game opens the LaunchBox Games Database dialog. **Download database** fetches and builds the local SQLite database (`<data-dir>/metadata/launchbox.db`); it skips when a download is already running.
2. **Search** matches the game title with the platform as a hint (up to 20 results). A partial-word query places an exact normalized title first, then a platform match, then the shortest name. The dialog also shows ranked candidates from every enabled provider, each labelled with its source.
3. Select a result to apply fields (name, platform, year, developer, publisher, genre, description, series, ESRB, max players). Check **Box front**, **Background**, **Screenshots** to also download media (up to 12 screenshots); **Replace existing fields and media** overwrites values, otherwise only empty fields are filled.
4. **Metadata provider priority** in Settings orders built-in providers (`launchbox`, `screenscraper`, `igdb`, `steamgriddb`) and any enabled plugin providers. Unlisted built-ins keep the default order, and **Prefer plugin metadata providers in bulk downloads** moves plugin results ahead for bulk media.
5. **Search IGDB** is an alternative provider, it needs the Twitch credentials in `~/.env`. Results apply name, summary/description, year, and genre.
6. **Use Steam data** fills fields from the Steam storefront API for entries with a Steam App ID and downloads the library cover and header image.

## Set up media

- **Media Manager** (**Tools → Media files**) shows a per-platform audit: games, database matched, and missing covers, backgrounds, screenshots, box backs/spines/3D boxes, clear logos, fanart, banners, icons, title screens, carts, discs, ads/flyers, and manuals. Check the types to download and whether to replace existing media, then **Download for matched games**. LaunchBox-matched games run as a bounded background job; provider-matched games enter the durable queue, which shows per-item errors and supports pause, resume, cancel, and retry.
- **EmuMovies**: licensed account in Settings or `~/.env`, then download per game or queue it. It supplies covers, box backs/spines/3D boxes, screenshots, title screens, marquees, cart fronts/backs, discs, clear logos, snap and theme videos, manuals, and music. Caps are per kind: images 64 MiB, videos 512 MiB, music 32 MiB, manuals 64 MiB, each with its expected content type.
- **SteamGridDB**: covers, backgrounds, clear logos, icons, and banners from a `STEAMGRIDDB_API_KEY`; see [SteamGridDB and launcher trophies](/guides/metadata-and-media/steamgriddb-and-trophies/).
- **Download Steam trailer** fetches the first storefront trailer into `media/steam/<app_id>/trailer.mp4`.
- **Download GOG media** fetches cover and background from the GOG embed API.
- **Download bezel** fetches Bezel Project artwork per platform and extracts into `<data-dir>/bezels`; a corrupt replacement never destroys the working set (staging + swap).
- **Capture screenshot** uses the first available of gnome-screenshot, spectacle, scrot, or ImageMagick `import`, appending to the game's screenshots.
- **Clear old media cache** posts `{"days": 30}` to `POST /api/media/cache/cleanup`, which deletes only stale generated files under `<data-dir>/cache/media` and reports the removed count and bytes.
- **ScreenScraper** (introduced in v1.8.0): matches emulated games by ROM hash (md5/sha1/crc, 512 MB cap) against ScreenScraper's endpoints, so ROMs with generic filenames still get correct metadata and media. Throttled to 1 request/second with 429/5xx backoff and a 30-day disk cache under `cache/screenscraper/`. Media is picked by your region priority and URLs are forced to https. All four credentials are required: set `SCREENSCRAPER_USER`/`SCREENSCRAPER_PASSWORD` plus the developer pair `SCREENSCRAPER_DEV_ID`/`SCREENSCRAPER_DEV_PASSWORD` in `~/.env` (there is no anonymous access path, and the API refuses lookups without the developer pair). The metadata dialog has **ScreenScraper search** and **hash-match** actions; hash-match can ru…

See [SteamGridDB and launcher trophies](/guides/metadata-and-media/steamgriddb-and-trophies/) for the artwork provider's routes and the separate local trophy case. Enabled plugins that declare a media capability join these providers as `plugin:<id>` sources.

## Region priority and download limits

- **Region priority** (Settings) is a non-empty list that ranks which regional media to prefer.
- **Media download limit during imports** (0 = unlimited, max 10,000) caps import-time media jobs; **Auto-import media types** picks the kinds queued for each imported game (default cover, background, screenshots).
- **Per platform and media kind limit** (0 = unlimited, max 100) caps downloads for each platform-and-kind pair in one queue pass, so one large platform cannot consume every slot. The queue itself holds up to 5,000 items and retries each item 3 times.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| `"Download the LaunchBox metadata database first."` | Run **Download database**; metadata routes return 409 until it exists. |
| IGDB returns 400 | `IGDB_CLIENT_ID`/`IGDB_CLIENT_SECRET` are missing from `~/.env`. |
| EmuMovies rejects credentials | The account is not licensed, or the password/username are wrong. |
| Media download fails | Check the kind's content type and cap (images 64 MiB, videos 512 MiB, music 32 MiB, manuals 64 MiB for provider/EmuMovies downloads; LaunchBox images cap at 32 MiB); check provider rate limits. |
| A queue item fails repeatedly | The item keeps its last error (up to 500 characters) and stops after 3 attempts; use **Retry** in the Media Manager after fixing credentials, the target folder, or the provider response. |
| Bezel download corrupt | Re-run **Download bezel** after fixing the archive; the previous set is never destroyed. |

## See also

- [Metadata and media](/guides/metadata-and-media/), the full workflow and limits
- [Accounts and media](/integrations/accounts-and-media/), credentials, aliases, and API details
- [Configuration](/reference/configuration/), `IGDB_*`, `EMUMOVIES_*` environment table
- [API content and imports](/reference/api/content-and-imports/), metadata/media routes
