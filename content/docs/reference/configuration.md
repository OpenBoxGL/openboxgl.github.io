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

1. An explicit `OPENBOX_ENV_FILE` path, if set (read before the extra roots).
2. The data directory (the extra root passed to `bootstrap_env`).
3. The parent of the data directory.
4. Your home directory (`~/.env`).
5. `~/.config/openbox-game-launcher/.env`.

The current working directory and the application directory are not searched. Each `.env` file must be an owner-only regular file (mode `0o600`, no group or other permission bits), must not be a symlink, and must be under 1 MiB; anything else is skipped silently.

Values already in the environment are never overridden by `.env`. The template lives at `.env.example` in the repository. Put real secrets in `~/.env` or `~/.config/openbox-game-launcher/.env` only, never in a tracked file.

## Environment variables

### Data and process behavior

| Variable | Meaning |
| --- | --- |
| `OPENBOX_DATA_DIR` | Data directory. Read at import time, before `.env` bootstrap; must be exported in the shell, desktop entry, or systemd unit before launch. Defaults to `~/.local/share/openbox-game-launcher`. |
| `OPENBOX_SAFE_MODE` | Any non-empty value (conventionally `1`) disables plugin execution and the webhook dispatcher for the whole process. Exposed as `settings.safe_mode`. |
| `APPIMAGE` | Set automatically when running from an AppImage; the updater refuses to install without it. Exposed as `settings.appimage`. |
| `OPENBOX_ENV_FILE` | Explicit path to a single `.env` file, checked first before the data-directory roots. Read directly from the process environment; must point at an owner-only regular file (not a symlink) or it is skipped. |
| `OPENBOX_ALLOW_HTTP_WEBHOOKS` | Set to `1` to allow plain-HTTP webhook URLs. Required only for trusted local test targets; HTTPS is the default and safer. |
| `OPENBOX_ALLOW_HTTP_GAMEYFIN` | Set to `1` to allow plain-HTTP Gameyfin URLs. HTTPS is the default; loopback (localhost) addresses are always allowed. |
| `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS` | Set to `1` in the process shell to allow unsandboxed plugin execution when bubblewrap is unavailable. Read directly from the process environment (not `.env`). |
| `OPENBOX_MEDIA_ROOTS` | Colon-separated list (`os.pathsep`) of additional absolute directories approved for scanning and media storage. Up to 32 roots. |
| `OPENBOX_ENABLE_DMABUF` | Set to `1` to enable WebKitGTK DMA-BUF rendering in the native window. Disabled by default to prevent silent blank windows on AMD GPUs (including Steam Deck). |
| `OPENBOX_WEBKIT_HARDWARE_ACCELERATION` | WebKitGTK hardware acceleration policy in native window (`always` or `on-demand`; default is `on-demand`). |
| `OPENBOX_SNAPSHOT_DEBOUNCE` | Debounce delay in seconds (float) for background library state snapshot writes (defaults to `0.0`). |
| `OPENBOX_INSTALL_DIR` | Custom installation directory used by `install.sh` (defaults to `~/.local/bin`). |
| `OPENBOX_RELEASE_TAG` | Pins a specific GitHub release tag (e.g. `v1.7.1`) during `install.sh` execution. |
| `OPENBOX_PYTHON` | Path to the Python interpreter invoked by the native host (defaults to `python3`). |
| `OPENBOX_WEB_APP` | Path to `web_app.py` invoked by the native host. |

### Credentials (all optional)

| Variable | Used by | Aliases |
| --- | --- | --- |
| `RETROACHIEVEMENTS_USERNAME` | RetroAchievements matching and progress | `RA_USERNAME`, `OPENBOX_RA_USERNAME` |
| `RETROACHIEVEMENTS_API_KEY` | RetroAchievements web API | `RA_API_KEY`, `RETROACHIEVEMENTS_KEY`, `OPENBOX_RA_API_KEY` |
| `EMUMOVIES_USERNAME` | EmuMovies media downloads | `OPENBOX_EMUMOVIES_USERNAME` |
| `EMUMOVIES_PASSWORD` | EmuMovies media downloads | `OPENBOX_EMUMOVIES_PASSWORD` |
| `GITHUB_TOKEN` | GitHub release API rate limit for update checks (`GITHUB_TOKEN`, `GH_TOKEN`, `OPENBOX_GITHUB_TOKEN` all accepted) | `GH_TOKEN`, `OPENBOX_GITHUB_TOKEN` |
| `IGDB_CLIENT_ID` | IGDB metadata provider (Twitch developer app) |, |
| `IGDB_CLIENT_SECRET` | IGDB metadata provider (Twitch developer app) |, |

Each credential lookup checks the aliases in order using `env_value()` from `env_config.py`, it iterates through the listed names for a variable and uses the first non-empty value found. If an empty string is returned for any required variable, the route returns a specific `400` error naming exactly which variable is missing. For example, IGDB requires both `IGDB_CLIENT_ID` **and** `IGDB_CLIENT_SECRET`; without either the IGDB routes return `400 {"error":"Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in ~/.env to use IGDB."}`. Without RetroAchievements credentials, the `/api/ra/*` routes return `400 {"error":"Configure RetroAchievements first."}`.

<Callout type="tip" title="Why aliases exist">

The alias pattern lets users choose whichever name suits their setup. A RetroAchievements user might already have `RA_USERNAME` set as part of another tool's config; OpenBoxGL will pick it up automatically. The `OPENBOX_*` variants are useful when you're prefixing all your custom environment variables under one namespace.

</Callout>

Credentials supplied through the Settings dialog are persisted in the data directory (`retroachievements.json`, `emumovies.json`, `settings.json` for Gameyfin) with owner-only permissions (`0o600` via `secure_text_write`). The API and diagnostic log redact the values, but the files themselves are plaintext.

## Persisted settings

The Settings dialog saves into `library.json` under `settings`. The save handler (`web_app._save_settings_locked`) validates each field before committing; an invalid value aborts the whole save with a `400` error. Keys must exist in the `settings_schema.py` registry: unknown keys are dropped with a diagnostic log warning rather than persisted. The full key list is exposed by `GET /api/settings`. Notable validated limits:

| Setting | Default | Validation |
| --- | --- | --- |
| `watch_folders` | `[]` | List of at most 50 absolute, existing directories; duplicates removed |
| `screensaver_seconds` | 90 | `0` (off) or between 30 and 3600; values 1-29 are rejected |
| `controller_map` | `{}` | Actions limited to `play`, `back`, `favorite`, `random`, `page_left`, `page_right`, `pause`, `menu`; button numbers 0-31 |
| `progress_automation_enabled` | `false` | Boolean; enables/disables automatic progress changes |
| `progress_automation_play_minutes` | 30 | 0 to 100,000, minutes before marking Playing |
| `progress_automation_idle_days` | 30 | 0 to 3,650, days before marking Paused |
| `progress_on_first_play` | "Playing" | Must be a known progress status |
| `welcome_completed` | `false` | Boolean, suppresses opening the Library Setup Center on empty library launch |
| `image_group` | "cover" | One of cover, background, screenshot, clear_logo, fanart, banner, icon, box_back, box_spine, box_3d, title_screen, cart_front, cart_back, disc, advertisement, manual |
| `badge_visibility` | favorite, installed, saves, documents, progress, storefront, achievements, rating | Subset of favorite, installed, missing_media, saves, documents, versions, storefront, achievements, highscores, progress, rating, broken, portable, controller |
| `cloud_folder` | "" | Absolute, existing path for mounted-folder statistics sync |
| `storefront_auto_import` | All off | Object with boolean keys: `steam`, `heroic`, `lutris`, `gameyfin` |
| `auto_import_media_types` | ["background", "cover", "screenshots"] | Subset of MEDIA_TYPES_ALL (18 types including cover, background, screenshots, clear_logo, box_back, manual, video, etc.) |
| `media_download_limit` | 0 (unlimited) | 0 to 10,000 |
| `region_priority` | (default list) | Non-empty ordered list, ranks which regional media to prefer |
| `video_priority` | snap, theme, trailer, recording | Subset of video_snap, video_theme, video_trailer, video_recording, video |
| `library_music` | "" | Path to existing audio file; empty disables Big Box library BGM |
| `video_bgm_mix` | `false` | Boolean, lower music volume when mixing with video audio |
| `bigbox_mode` | "stage" | One of stage, hybrid, coverflow |
| `attract_mode_seconds` | 90 | Seconds of idle before screensaver/attract mode triggers |
| `bigbox_startup_video` | "" | Empty string (disabled) or path to startup video file |
| `bigbox_shutdown_commands` | `[]` | At most 25 commands; run on entering Big Box (see note below) |
| `startup_commands` | `[]` | At most 25 commands; run after server binds |
| `shutdown_commands` | `[]` | At most 25 commands; run on graceful exit |
| `track_session_history` | `true` | Boolean, when false, sessions still track but history isn't recorded |
| `backup_on_close` | `false` | Boolean, creates save backups when session ends |
| `save_backup_limit` | 10 | 0 to 500, oldest archives trimmed after each backup |
| `tracking_mode` | "default" | One of default, process, original_process, folder, process_name |
| `tracking_delay` | 0 | 0 to 600 seconds before tracking starts after spawn |
| `tracking_frequency` | 2.0 | 0.5 to 60 seconds between poll checks |
| `apply_perf` | "auto" | One of off, auto, always, whether TDP limits apply |
| `auto_close_store_clients` | `false` | Boolean, close Steam/Heroic/Lutris clients after a session ends |
| `obs_auto_attach` | `true` | Boolean, auto-attaches latest OBS recording to game |
| `obs_recording_path` | "" | Absolute, existing path override; empty uses discovery |
| `dynamic_play_button` | `true` | Boolean, shows animated PLAY state |
| `custom_field_defs` | `[]` | Up to 20 fields; each 50 options max |
| `platform_categories` | Built-in mapping | Platform-to-category overrides (Nintendo, Sony, Microsoft, Computer, Arcade, Adventure, Other) |
| `list_columns` | Defaults | Capped at 12 columns per platform or global view |
| `library_view` | "grid" | Current persistent view preference |
| `locale` | "en" | Language locale code (en, es, de, fr, pt). Defaults to en. |
| `hidden_sidebar_sections` | `[]` | Capped at 20 entries |
| `tray_enabled` | `false` | Boolean, shows system tray icon |
| `minimize_to_tray` | `false` | Boolean, minimizes to tray instead of closing |
| `show_playlist_actions` | `true` | Boolean, show add/remove playlist buttons |
| `gameyfin_url` | "" | Prepends `http://` when no scheme present; must resolve |
| `gameyfin_username` | "" | Stored as plain text alongside url and password |
| `gameyfin_password` | "" | Empty value leaves stored password unchanged; otherwise persisted with `0o600` |
| `gameyfin_install_dir` | "" | Absolute path; created if missing, rejected if symlink or non-existent. Empty by default; the UI shows a `~/Games/Gameyfin` placeholder |
| `gameyfin_provider` | "" | Provider label; falls back to first available |
| `ludusavi_backup_path` | "" | Optional absolute path for Ludusavi JSON output |
| `cover_grouping` | `"shape"` | String; shape used to group covers in the library |
| `image_group_by_platform` | `{}` | Object; per-platform image group overrides |
| `image_group_by_playlist` | `{}` | Object; per-playlist image group overrides |
| `sidebar_sections` | `["search", "view", "platforms", "playlists", "filters"]` | List of strings; valid section names: `search`, `view`, `categories`, `esrb`, `platforms`, `playlists`, `presets`, `explorer` |
| `platform_documents` | `{}` | Object; per-platform manual/document lists |
| `filter_presets` | `[]` | List of objects; named filter rules, each needs at least one rule |
| `import_exclusions` | `[]` | List of objects with `source` (steam, heroic, lutris, gameyfin) and `external_id` |
| `emulator_scan_configs` | `[]` | List of objects; per-emulator scan configuration |
| `tracking_process_name` | `""` | String; process name used when `tracking_mode` is `process_name` |
| `webhook_attempts` | 3 | 1 to 5 delivery retries per webhook |
| `webhook_timeout` | 5 | 1 to 15 seconds before delivery times out |
| `webhooks` | `[]` | At most 32 configs; each needs a URL and at least one event |
| `theme` | `""` | String; global theme name, empty uses the stock theme |
| `theme_by_platform` | `{}` | Object; platform to theme name mappings |
| `bigbox_quick` | `(auto-managed)` | Derived list; presets flagged as Big Box quick actions, capped at 8 |
| `controller_prompt_pack` | `"xbox"` | String; active controller prompt pack (`xbox`, `playstation`, `nintendo`) |
| `controller_prompt_hint` | `false` | Boolean; toggles on-screen controller button prompts in Big Box |
| `active_media_packs` | `[]` | List of strings; media pack ids, appended when a pack is applied |
| `last_cloud_sync` | `""` | Internal, auto-managed timestamp; do not edit |
| `last_update_check` | `""` | Internal, auto-managed timestamp; do not edit |
| `gameyfin_password_set` | `false` | Internal, boolean indicator of whether password is set |
| `gamescope_guest` | `false` | Internal, auto-detected guest mode under Gamescope |

Two naming details worth knowing:

- `bigbox_shutdown_commands` is misnamed: the commands run when Big Box is **entered**, not when it is left.
- `attract_mode_seconds` is the screensaver delay the Big Box screensaver actually reads; it falls back to `screensaver_seconds` when unset, and the Settings dialog keeps both fields with the same fallback.

Partial saves merge with existing settings: keys you omit are preserved, and concurrent partial saves of different keys do not lose updates (covered by the API sweep tests). An empty `gameyfin_password` in a save leaves the stored password unchanged.

<Callout type="tip" title="How validation prevents bad saves">

The save handler validates **every** posted field before committing any change. If a single value fails validation (for example, `screensaver_seconds: -5`), the entire save request returns `400` and **nothing** is written. This means you can safely send partial saves, changing `bigbox_mode` won't accidentally corrupt `tracking_frequency` even if both arrive in the same request. The only exception is an empty `gameyfin_password`, which deliberately preserves the old value so you don't erase your password while updating other settings.

</Callout>

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

The authoritative sources are `.env.example`, `env_config.py`, `handlers/settings.py`, `settings_schema.py`, and the Settings dialog.
