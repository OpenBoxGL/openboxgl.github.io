---
title: API local administrator
description: Local administrator operations that are not a stable remote contract.
---

These routes manage the local installation and process. They are not a stable remote contract: treat them as local-administrator operations and verify behavior against the running version. All require `X-OpenBox-Token: TOKEN`; POST bodies are JSON objects.

## Updates

### `GET /api/update`

Check for a new release. Queries the GitHub releases API for `vindeckyy/OpenBoxGL` (30-second timeout) and returns:

```json
{
  "current": "0.8.1",
  "latest": "0.8.2",
  "available": true,
  "notes": "...",
  "appimage": "https://github.com/vindeckyy/OpenBoxGL/releases/download/.../OpenBox-x86_64.AppImage",
  "checksum": "sha256:...",
  "checksum_url": "...",
  "page": "https://github.com/.../releases/tag/..."
}
```

Rules:

- Pre-release and build-suffixed tags are never `available`.
- The AppImage asset must come from the trusted `https://github.com/vindeckyy/OpenBoxGL/releases/download/` prefix and a SHA-256 checksum must be present (asset digest or `.sha256` file); otherwise `400` with a clear reason.
- GitHub failures return `400` (`"GitHub releases request failed (...)"` / `"Could not reach GitHub releases: ..."`). Setting `GITHUB_TOKEN` (or `GH_TOKEN`) in `~/.env` authenticates the request for a higher rate limit.

### `POST /api/update/install`

Download and atomically install the verified update into the running AppImage. Prerequisites:

- `APPIMAGE` must be set (the process must run from an AppImage), else `400` `"Automatic updates require the OpenBox AppImage."`
- The update must be `available` and its URLs trusted.
- The download streams with a 2 GiB cap and the SHA-256 is verified before the swap.
- The current AppImage is renamed to `<name>.previous<ext>`; a failed swap restores it.

Returns `{"installed": "<version>", "backup": "<path>"}`. Restart to use the update.

## Shutdown

### `POST /api/shutdown`

`{"force": bool}` stops every running game (SIGTERM, or SIGKILL with `force: true`) and returns `{"stopped": <count>, "forced": bool}`. Games that already exited are skipped.

## State recovery

### `POST /api/state/recover`

Restore the library from `library.json.bak` (see [Data and recovery](/reference/data-and-recovery/)). Success returns `{"ok": true, "games": <count>}`; an unusable backup raises `503`-class errors (surfaced as `400` with the message).

## Desktop integration

### `POST /api/desktop/install`

Write the desktop entry and icon for the running AppImage: `~/.local/share/applications/io.openbox.GameLauncher.desktop` and `~/.local/share/icons/hicolor/scalable/apps/io.openbox.GameLauncher.svg`. Requires `APPIMAGE` (else `400`). Returns `{"desktop": "<path>"}`.

## Themes

### `GET /api/themes`

`?platform=<name>` returns `{"themes": [...], "selected": "...", "global": "...", "mappings": {...}}`. Stock themes are installed on demand (Midnight Circuit, Phosphor Terminal, Harbor Light, Cinema Marquee, Nordic Mist). `selected` is the per-platform mapping when `platform` is given, else the global theme.

### `POST /api/themes/select`

`{"name": "theme-name"|"", "platform": ""}` sets the global theme (or clears it with `""`); with `platform`, sets/clears a per-platform mapping. Unknown theme file: `400`. Returns `{"selected", "platform"}`.

### `POST /api/themes/import`

`{"path": "/path/to/theme.css"}` copies a CSS file into `themes/` (`.css` suffix required). Returns `{"theme": "<stem>"}`.

### `POST /api/themes/open-folder`

Open the themes folder in the file manager via `xdg-open` (missing `xdg-open`: `400`). Returns `{"path"}`.

## Plugins

### `GET /api/plugins`

`{"plugins": [{"id", "name", "version", "entry", "hooks", "enabled"}, ...]}` sorted by id. Invalid packages are skipped.

### `POST /api/plugins/install`

`{"path": "/path/to/plugin-dir-or.zip"}` installs or updates a plugin package (safe extraction, staging, rollback on failure). Returns `{"plugin": {...manifest..., "updated": bool}}`.

### `POST /api/plugins/toggle`

`{"id", "enabled": bool}` enables/disables a plugin (persisted in `plugins-state.json`). Returns `{"enabled": bool}`.

### `POST /api/plugins/remove`

`{"id"}` moves the plugin directory to `plugins/.removed/<id>-<timestamp>` (reversible by moving it back) and clears its disabled state. Returns `{"removed": "<id>"}`.

### `GET /api/plugins/catalog`

`{"catalog": [...]}` from the bundled local catalog, falling back to the remote catalog (`raw.githubusercontent.com/vindeckyy/OpenBoxGL/master/plugins/catalog.json`, 20-second timeout, 4 MiB cap).

### `POST /api/plugins/catalog/install`

`{"id"}` downloads the catalog entry's package (128 MiB cap, SHA-256 verified when the entry provides one, 120-second timeout) and installs it. Unknown id or `local_only` entries raise `400` (`"This catalog entry is documentation-only. Install local plugin packages manually."`). Returns `{"plugin": {...}}`.

See [Plugins](/reference/plugins/) for the manifest and hook contract.

## Premium read models

### `GET /api/premium/strings`

`?locale=en|es|de|fr|pt` returns `{"locale", "strings": {...}}`; unknown locales fall back to English.

### `GET /api/premium/media-packs`

`{"packs": [{"id", "name", "description", "kinds", "active"}, ...]}`. Bundled packs: `clear-logos-default`, `controller-xbox`, `controller-playstation`, `badges-core`.

### `GET /api/premium/platform-categories`

`{"categories": {...}}` platform-to-category mapping (Nintendo, Sony, Microsoft, Computer, Arcade, Adventure, ...) with user overrides merged.

### `POST /api/premium/media-packs/apply`

`{"id": "<pack id>"}` activates a pack (and sets the controller prompt pack/hint for controller packs). Unknown pack: `400`. Returns `{"pack": {...}, "settings": {...}}`.

## Local reads

### `GET /api/log`

`{"log": "<last 250 KB of openbox.log>"}`. The log redacts tokens, passwords, API keys, and authorization headers, but can contain game names and local file paths.

### `GET /api/theme.css`

`?name=<theme>` serves the theme CSS with revalidation headers; unknown themes return an empty stylesheet.

### `GET /api/platform/documents` and `GET /api/platform/document`

Per-platform document lists and file serving (`?platform=&index=`). Documents are validated to be regular files; symlinks are rejected. Missing documents return `404`.

### `POST /api/platform/documents`

`{"platform", "documents": [{"name", "path"}, ...]}` replaces the platform's document list (capped at 100 entries). Returns `{"saved", "count"}`.

## Errors

These routes fail loudly on missing prerequisites (`400` with the exact requirement) and never silently skip destructive steps. See [REST API overview](/reference/api/overview/) for the shared envelope.
