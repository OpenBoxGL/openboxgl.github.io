---
title: Media providers
description: Set up IGDB, LaunchBox Games Database, EmuMovies, Bezel Project, Steam, and GOG media.
---

OpenBoxGL enriches games from several optional media and metadata providers. This page is the setup guide; the [Accounts and media](/integrations/accounts-and-media/) reference has the exact credentials and API details.

<Callout type="note" title="Which providers need credentials">

Five providers require **no credentials** and work out of the box: LaunchBox Games Database (public download), Steam (per App ID), GOG (embedded data), Bezel Project (GitHub public repo), and IGDB when you supply `IGDB_CLIENT_ID`/`IGDB_CLIENT_SECRET`. Only EmuMovies requires a paid licensed account. All other providers are optional, your library functions perfectly with zero media providers configured.

</Callout>

## Choose your providers

| Provider | What it provides | Credentials needed |
| --- | --- | --- |
| LaunchBox Games Database | Metadata + box front, background, screenshots | None (public download, up to 2 GiB) |
| IGDB | Metadata (name, description, year, genre, developer, publisher, rating, time-to-beat) | `IGDB_CLIENT_ID` + `IGDB_CLIENT_SECRET` in `~/.env` |
| Steam | Name, developer, publisher, genre, year, description + cover and header | None (per-Steam-App-ID) |
| GOG | Cover + background for Heroic/GOG entries | None |
| EmuMovies | Licensed media (box art) | Licensed account (`EMUMOVIES_USERNAME`/`EMUMOVIES_PASSWORD`) |
| Bezel Project | Per-platform bezel sets for RetroArch-style presentation | None |

## Set up metadata

1. **Find metadata** on a game opens the LaunchBox Games Database dialog. **Download database** fetches and builds the local SQLite database (`<data-dir>/metadata/launchbox.db`); it skips when a download is already running.
2. **Search** matches the game title with the platform as a hint (up to 20 results, exact-match first).
3. Select a result to apply fields (name, platform, year, developer, publisher, genre, description, series, ESRB, max players). Check **Box front**, **Background**, **Screenshots** to also download media (up to 12 screenshots); **Replace existing fields and media** overwrites values, otherwise only empty fields are filled.
4. **Search IGDB** is an alternative provider, it needs the Twitch credentials in `~/.env`. Results apply name, summary, genres, and platforms.
5. **Use Steam data** fills fields from the Steam storefront API for entries with a Steam App ID and downloads the library cover and header image.

## Set up media

- **Media Manager** (the **Media** button) shows a per-platform audit: games, database matched, missing box front, missing background, missing screenshots. Check the types to download and whether to replace existing media, then **Download for matched games**. This runs as a bounded background job with progress and a list of per-game errors.
- **Download Steam trailer** fetches the first storefront trailer into `media/steam/<app_id>/trailer.mp4`.
- **Download GOG media** fetches cover and background from the GOG embed API.
- **EmuMovies**: licensed account in Settings or `~/.env`, then download per game. Downloads expect an `image/` content type and cap at 32 MiB.
- **Download bezel** fetches Bezel Project artwork per platform and extracts into `<data-dir>/bezels`; a corrupt replacement never destroys the working set (staging + swap).
- **Capture screenshot** uses the first available of gnome-screenshot, spectacle, scrot, or ImageMagick `import`, appending to the game's screenshots.

## Region priority and download limits

- **Region priority** (Settings) is a non-empty list that ranks which regional media to prefer.
- **Media download limit during imports** (0 = unlimited, max 10000) caps import-time media jobs; **Auto-import media types** picks cover/background/screenshots.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| `"Download the LaunchBox metadata database first."` | Run **Download database**; metadata routes return 409 until it exists. |
| IGDB returns 400 | `IGDB_CLIENT_ID`/`IGDB_CLIENT_SECRET` are missing from `~/.env`. |
| EmuMovies rejects credentials | The account is not licensed, or the password/username are wrong. |
| Media download fails | Check the content-type (must be `image/`) and the 32 MiB cap; check provider rate limits. |
| Bezel download corrupt | Re-run **Download bezel** after fixing the archive; the previous set is never destroyed. |

## See also

- [Metadata and media](/guides/metadata-and-media/), the full workflow and limits
- [Accounts and media](/integrations/accounts-and-media/), credentials, aliases, and API details
- [Configuration](/reference/configuration/), `IGDB_*`, `EMUMOVIES_*` environment table
- [API content and imports](/reference/api/content-and-imports/), metadata/media routes
