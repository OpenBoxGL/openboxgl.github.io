---
title: Configuration
description: Configure environment values, local state, and application settings.
---

OpenBoxGL reads configuration from three places, in order: the process environment, discovered `.env` files, and persisted application settings (the Settings dialog). This page documents each source, the exact variables, and the validation limits applied when settings are saved.

## Configuration sources

| Source | When it is read | Precedence |
| --- | --- | --- |
| Process environment | At startup and on demand (`os.environ`) | Highest |
| Discovered `.env` files | `bootstrap_env` at Web UI startup, lazily before some lookups | Middle; never overrides an existing environment value |
| Persisted settings | `library.json` -> `settings` | Lowest for credentials; the only store for UI settings |

A `.env` file sets an environment variable only when that variable is not already set, so the process environment always wins. Unreadable or non-UTF-8 `.env` files are skipped silently; an optional `.env` must never abort startup.

## `.env` discovery order

`env_config.discover_env_files` checks these roots in order and loads every `.env` found:

1. The `OPENBOX_DATA_DIR` you passed in (used as an extra root).
2. The parent of the data directory.
3. The current working directory.
4. The application directory (next to `web_app.py`).
5. Your home directory (`~/.env`).
6. `~/.config/openbox-game-launcher/.env`.

Values already in the environment are never overridden by `.env`. The template lives at `.env.example` in the repository. Put real secrets in `~/.env` or `~/.config/openbox-game-launcher/.env` only, never in a tracked file.

## Environment variables

### Data and process behavior

| Variable | Meaning |
| --- | --- |
| `OPENBOX_DATA_DIR` | Data directory. Read at import time, before `.env` bootstrap; must be exported in the shell, desktop entry, or systemd unit before launch. Defaults to `~/.local/share/openbox-game-launcher`. |
| `OPENBOX_SAFE_MODE` | Any non-empty value (conventionally `1`) disables plugin execution and the webhook dispatcher for the whole process. Exposed as `settings.safe_mode`. |
| `APPIMAGE` | Set automatically when running from an AppImage; the updater refuses to install without it. Exposed as `settings.appimage`. |
| `OPENBOX_ALLOW_HTTP_WEBHOOKS` | Set to `1` to allow plain-HTTP webhook URLs. Required only for trusted local test targets; HTTPS is the default and safer. |

### Credentials (all optional)

| Variable | Used by | Aliases |
| --- | --- | --- |
| `RETROACHIEVEMENTS_USERNAME` | RetroAchievements matching and progress | `RA_USERNAME`, `OPENBOX_RA_USERNAME` |
| `RETROACHIEVEMENTS_API_KEY` | RetroAchievements web API | `RA_API_KEY`, `RETROACHIEVEMENTS_KEY`, `OPENBOX_RA_API_KEY` |
| `EMUMOVIES_USERNAME` | EmuMovies media downloads | `OPENBOX_EMUMOVIES_USERNAME` |
| `EMUMOVIES_PASSWORD` | EmuMovies media downloads | `OPENBOX_EMUMOVIES_PASSWORD` |
| `GITHUB_TOKEN` | GitHub release API rate limit for update checks | `GH_TOKEN`, `OPENBOX_GITHUB_TOKEN` |
| `IGDB_CLIENT_ID` | IGDB metadata provider (Twitch developer app) | none |
| `IGDB_CLIENT_SECRET` | IGDB metadata provider | none |

Each credential lookup checks the aliases in order and uses the first non-empty value. IGDB requires both `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET`; without them the IGDB routes return a `400` error naming the missing variables.

Credentials supplied through the Settings dialog are persisted in the data directory (`retroachievements.json`, `emumovies.json`, `settings.json` for Gameyfin) with owner-only permissions (`0o600` via `secure_text_write`). The API and diagnostic log redact the values, but the files themselves are plaintext.

## Persisted settings

The Settings dialog saves into `library.json` under `settings`. The save handler (`web_app._save_settings_locked`) validates each field before committing; an invalid value aborts the whole save with a `400` error. The full key list is exposed by `GET /api/settings`. Notable validated limits:

| Setting | Validation |
| --- | --- |
| `watch_folders` | List of at most 50 absolute, existing directories; duplicates removed |
| `screensaver_seconds` | `0` or between 30 and 3600 |
| `controller_map` | Actions limited to `play`, `back`, `favorite`, `random`, `page_left`, `page_right`, `pause`, `menu`; button numbers 0 through 31 |
| `progress_automation_play_minutes` | 0 to 100000 |
| `progress_automation_idle_days` | 0 to 3650 |
| `save_backup_limit` | 0 to 500 |
| `media_download_limit` | 0 to 10000 |
| `auto_import_media_types` | Subset of `cover`, `background`, `screenshots` |
| `region_priority` | Non-empty list |
| `video_priority` | Subset of `video_snap`, `video_theme`, `video_trailer`, `video_recording`, `video` |
| `bigbox_mode` | `stage`, `hybrid`, or `coverflow` |
| `startup_commands` / `shutdown_commands` / `bigbox_shutdown_commands` | List of at most 25 shell-free commands, each parsed with `shlex.split` |
| `tracking_mode` | `default`, `process`, `original_process`, `folder`, `process_name` |
| `tracking_delay` | 0 to 600 seconds |
| `tracking_frequency` | 0.5 to 60 seconds |
| `apply_perf` | `off`, `auto`, or `always` |
| `locale` | Any string, truncated to 5 characters; UI strings fall back to English for unknown locales |
| `hidden_sidebar_sections` | List capped at 20 entries |
| `list_columns` | List capped at 12 entries |
| `gameyfin_url` | Prepends `http://` when no scheme is present |

Partial saves merge with existing settings: keys you omit are preserved, and concurrent partial saves of different keys do not lose updates (covered by the API sweep tests). An empty `gameyfin_password` in a save leaves the stored password unchanged.

## Values consumed at startup

These are read once during process startup and require a restart to change:

- `OPENBOX_DATA_DIR` (data directory and state store path)
- `server.token` / `server.port` (per-launch, deleted on exit)
- `.env` bootstrap (performed once per process)
- `startup_commands` (run after the server binds, via `run_configured_commands`)
- Profile merging from emulator definition packs (`merge_profiles_from_definitions`) at startup

`shutdown_commands` run on graceful exit. Both command lists execute with `shlex.split` and a new session; failures are logged and skipped, never fatal.

## Security notes

- Public examples must use placeholders. Never commit `.env`, `server.token`, `retroachievements.json`, `emumovies.json`, or library exports.
- Keep `server.token`, provider credentials, and webhook secrets private. The diagnostic log redacts values matching token/password/secret/API-key/authorization patterns, but a `.env` file is plaintext.
- Restart OpenBoxGL after changing values consumed at process startup.

The authoritative sources are `.env.example`, `env_config.py`, the settings validation in `web_app.py`, and the Settings dialog.
