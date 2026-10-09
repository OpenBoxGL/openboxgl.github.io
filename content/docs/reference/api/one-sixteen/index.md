---
title: API 1.16 additions
description: Request and response guidance for the Launch Readiness, restore preview, Flatpak grant, and per-game core workflows shipped in OpenBox 1.16.0 and 1.16.1.
---

OpenBox 1.16.0 and 1.16.1 add these authenticated, additive `/api/v2/*` workflows without changing the frozen v1 contract. The server still binds to loopback, chooses a random port at launch, and accepts `X-OpenBox-Token: TOKEN` on every protected route.

```bash
DATA_DIR="$HOME/.local/share/openbox-game-launcher"
TOKEN=$(cat "$DATA_DIR/server.token")
PORT=$(cat "$DATA_DIR/server.port")
BASE="http://127.0.0.1:$PORT"
```

Use the header form in scripts. The query-string token is accepted for the browser launch path but can leak into history and logs. POST bodies are JSON objects and are subject to the shared 65,536-byte body limit. Durable operations return `202` with a `job_id`; inspect them through the jobs endpoints documented in [Saves and operations](/reference/api/saves-and-operations/). On Windows the data directory is `%LOCALAPPDATA%\openbox-game-launcher`, so `server.token` and `server.port` live there instead.

## Launch Readiness

Launch Readiness answers "which of my games will not launch, and why?" for the whole library instead of one game at a time. It reuses the Launch Doctor unchanged, so every cause code it reports is a code the single-game Doctor already produces — an audit is not a second opinion.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/v2/launch/audit/scan` | Queue a full audit. Body: optional `deep` (default `false`). Returns `202 {"state": "queued", "job_id": "...", "deep": <bool>}`. A second call replaces the first, so a double click collapses into one run. |
| `GET` | `/api/v2/launch/audit` | The cached report. **Never scans** — read-only, so it is cheap to poll. |
| `GET` | `/api/v2/launch/audit/status` | Per-game readiness for the grid: `{"statuses": {"<game_id>": "blocked" or "warning"}}`. Ready games are absent. |
| `POST` | `/api/v2/launch/audit/refresh` | Re-check only the games of one group and merge into the cached report. Body: `group` (required). |

### `GET /api/v2/launch/audit`

Returns the totals and one row per root cause:

```bash
curl -s -H "X-OpenBox-Token: $TOKEN" "$BASE/api/v2/launch/audit" | jq '.totals, .groups[0]'
```

```json
{
  "scanned": true,
  "computed_at": "2026-10-05T14:22:10",
  "game_count": 1340,
  "stale": false,
  "deep": false,
  "totals": { "ready": 902, "warning": 26, "blocked": 412 },
  "failed": { "count": 0 },
  "groups": [
    { "key": "flatpak_missing:org.libretro.RetroArch",
      "code": "FLATPAK_MISSING",
      "subject": "org.libretro.RetroArch",
      "severity": "error",
      "message": "RetroArch is not installed",
      "count": 412,
      "fix_action": "install" }
  ],
  "job": { "state": "done", "job_id": "..." }
}
```

- `scanned: false` is returned when no report exists yet — queue one with `/scan`.
- `stale: true` means the library has changed since the audit ran, so the counts are a snapshot of a different library. The same rule empties `/audit/status`, which is why a grid badge is never drawn from data that no longer describes your library.
- Groups are **causes, not games**. One line reading `RetroArch is not installed — 412 games` is the point of the feature: fixing that one thing fixes all 412.
- `fix_action` tells you what the UI can offer for this cause — `install` where a missing emulator can be installed for the whole group at once.

### Listing the games behind one cause

Add `group` to page through a cause's members. `limit` is at most 500 per page — the large-library guard, so this route is never unbounded.

```bash
curl -s -H "X-OpenBox-Token: $TOKEN" \
  "$BASE/api/v2/launch/audit?group=flatpak_missing:org.libretro.RetroArch&offset=0&limit=50"
```

### Re-checking one group

`POST /api/v2/launch/audit/refresh` runs in the request rather than as a job, because a group is one cause and therefore usually a handful of games. It returns `{"ok": true, "rechecked": <n>, "totals": {...}, "computed_at": "..."}`.

A missing `group` is `400`. So is a group that is no longer in the report, or a report whose `game_count` no longer matches the library: refreshing one group into a report that already describes a different library would make the totals wrong, so the caller must re-audit the whole library instead.

The Launch Audit also runs on the scheduled library check (daily or weekly), so a report is usually already there.

### Flatpak folder grants

A Flatpak emulator that cannot see a folder was previously reported as "not installed", and the fix offered was a reinstall — which cannot grant access. These routes do grant it.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/v2/launch/grant` | Give one Flatpak app read access to one folder. Body: `app_id`, `folder`. |
| `POST` | `/api/v2/launch/grant/undo` | Remove a grant made above. Same body. |

The grant runs `flatpak override --user --filesystem=<folder>:ro <app>`. It is **read-only**, the home folder itself cannot be granted, and `undo` reverses it until OpenBox restarts.

### Per-game RetroArch core

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/launch/cores` | Installed RetroArch cores: `{"cores": [...]}`. |
| `POST` | `/api/v2/launch/core` | Bind one core to one game. Body: `game_id` (required), `core` (a core file name). Returns `{"ok": true, "game_id": "...", "core": "...", "name": "..."}`. |

An empty `core` restores the definition's default. A `core` that is not a RetroArch core file name returns `400`. The choice applies on Windows as well as Linux, and resume states record the chosen core.

## Restore preview (1.16.0)

`GET /api/v2/backup/diff` gained a `restore` block alongside the original 1.7.2 fields. The three lists are deliberately both present because they name the same three sets in opposite directions: `added` is relative to your current library, while `restore.will_remove` is relative to the restore you are about to perform. `restore` is the only block the UI reads.

```json
{
  "restore": {
    "will_remove": { "total": 12, "truncated": false, "rows": [{ "game_id": "...", "name": "..." }] },
    "will_add":    { "total": 3,  "truncated": false, "rows": [{ "game_id": "...", "name": "..." }] },
    "will_change": { "total": 1,  "truncated": false,
      "rows": [{ "game_id": "...", "name": "...",
                 "fields": [{ "field": "progress", "from": "Playing", "to": "Beaten" }] }] }
  },
  "settings": {
    "restored": true, "present": true, "would_change": true,
    "differs": true, "redacted_secrets": true, "keys_changed": ["metadata_provider"]
  },
  "truncated": { "added": false, "removed": false, "changed": false, "limit": 200 },
  "summary": { "added": 12, "removed": 3, "changed": 1, "total": 1340 }
}
```

- `total` is always the true count even when `rows` is capped, so a long difference never looks smaller than it is. `truncated` names which list lost rows.
- `settings.would_change` is the question the UI asks — *would this restore move my settings?* — and can be `false` while `settings.differs` is `true`, because a library-only backup can differ without the restore being able to act on it.
- The flat `settings_changed` boolean is unchanged and still returned, per ADR 0019. `settings.differs` is the same fact.

The restore button in the UI is built only from a successful diff, so a restore can never happen unseen. The full contract is on [Library backups](/reference/library-backups/#restore-preview-v1160).

## Corrections to earlier releases

Two behaviours described in earlier release notes were documentation-only and are corrected here rather than by editing those entries:

- **Preflight endpoints validated nothing.** Two blocks that claimed to validate launch tokens were no-ops; they are removed, and both `POST /api/v2/launch/preflight` and `/preflight/batch` now reject a body that is not a JSON object.
- **A failed launch did reach the UI, but not reliably.** The exit code is now an `int` with a separate `timed_out` boolean on both the session event and the `session.stopped` webhook, whose allowlist gained `timed_out`.

## Related pages

- [API overview and route groups](/reference/api/overview/)
- [API 1.14 additions](/reference/api/one-fourteen/), the previous release's v2 surface
- [Emulators and launching](/guides/emulators-and-launching/#check-every-game-v1160), the user-facing Launch Readiness workflow
- [Library backups](/reference/library-backups/), the full backup and restore contract
- [Security](/policies/security/), the defects 1.16.0 closes