---
title: SteamGridDB artwork and launcher trophies
description: Configure optional SteamGridDB artwork and understand OpenBox's separate deterministic trophy case.
---

OpenBox 1.11 adds an optional **SteamGridDB** artwork provider and a separate local **OpenBox launcher trophy case**. SteamGridDB improves art coverage; launcher trophies summarize what your local library and play history already prove. Neither feature requires an OpenBox account.

## SteamGridDB artwork

1. Put `STEAMGRIDDB_API_KEY` in an owner-only `~/.env` file or another supported environment file.
2. Leave **Enable SteamGridDB artwork provider** on in Settings → Integrations, or turn it off when the provider should not be contacted.
3. In the metadata dialog, use **Search SteamGridDB** for one game or **Fill missing art via SteamGridDB** for a bulk job.
4. Review the selected result and media kinds before applying it.

The provider can supply covers, backgrounds, clear logos, icons, and banners. OpenBox sends HTTPS requests to SteamGridDB, keeps a local disk cache, rejects unsafe media URLs, and reports provider/rate-limit failures as integration errors. The API key is never returned in settings or diagnostics. Without a key, or after the provider is disabled/rejected for the session, the rest of the library and other providers continue to work.

Useful routes are:

- `GET /api/v2/steamgrid/status` — enabled/configured/provider and cache status;
- `GET /api/v2/steamgrid/search?q=TITLE&limit=12` — bounded autocomplete results;
- `POST /api/v2/steamgrid/test` — test the configured key;
- `POST /api/v2/steamgrid/info` with `{"steamgrid_id":"ID"}` — normalized metadata/media for review;
- `POST /api/v2/steamgrid/apply` — queue selected metadata/media for one stable game id; and
- `POST /api/v2/steamgrid/match` — queue a bulk fill for explicit ids or games missing covers.

Apply and bulk match return `202` with a `job_id`; inspect it through [Background jobs](/reference/background-jobs/). The provider is optional, external, and subject to its own account terms and rate limits.

## OpenBox launcher trophies

The local Trophy Case opens from the **View Trophy Case** button in the success toast that appears when a new launcher trophy is awarded. The toast expires after a few seconds, and there is not yet a persistent Trophy Case item in the Tools menu. **Tools → Achievements** opens the separate RetroAchievements account dialog, not this local case. The evaluator reads only the current library and recorded history. It stores earn timestamps so an award toast is shown once, but awards are never revoked when metadata or history later changes.

| Trophy | Rule |
| --- | --- |
| Century Club | 100 hours of total playtime |
| Collector | 100 games in the library |
| Completionist | Beat or complete 5 games |
| Curator | 25 games with cover art |
| Decade Tourist | Play games from 4 different decades |
| Deep Diver | Spend 20 hours in one game |
| First Launch | Finish the first session |
| Marathon Runner | Play a 4-hour session |
| Night Owl | Start a session after midnight (local time) |
| Old School | Play a game released before 1990 |
| Platform Hopper | Play games on 4 different platforms |
| Every Second Counts | Play 7 days in a row |

`GET /api/v2/insights/trophies` returns each trophy's `id`, `awarded`, `awarded_at`, and live `progress`. `POST /api/v2/insights/trophies/evaluate` persists newly met awards and returns `newly_awarded`, `earned`, and `total`. This is a launcher-level local feature, not a replacement for the optional RetroAchievements account, sets, or emulator injection.

See [Media providers](/guides/media-providers/), [RetroAchievements](/guides/retroachievements/), and [API 1.11 additions](/reference/api/one-eleven/) for provider credentials and route details.
