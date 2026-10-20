---
title: Library backups
description: Create, rotate, and restore whole-library backup archives.
---

The **Backup** dialog (Tools → Backup) creates whole-library ZIP archives under `<data-dir>/backups/` named `OpenBoxBackup-%Y-%m-%d-%H-%M-%S-%f.zip`. Each archive contains a manifest plus any of: settings, library, media, plugins, themes, and extension data. The Gameyfin password, the OBS WebSocket password, the per-provider integration tokens (IGDB, ScreenScraper, SteamGridDB, Gameyfin, RetroAchievements), and webhook secrets are redacted from export and safely preserved on restore.

## Create a backup

1. Open **Tools → Backup**.
2. Click **Create backup**. The dialog has no item picker and no rotation control: every archive holds the library, settings, media, plugins, and themes, and the newest 7 archives are kept.
3. Backup and restore are refused while any game is running.

`extension_data` can only be selected through the API or the CLI (`--backup --items ...,extension_data`). When `items` is omitted, the API and the CLI default to library + settings; the API's `keep` default is 0 (no rotation), while **Create backup** uses 7.

The CLI form is:

```bash
python3 web_app.py --backup --items library,settings,media --keep 7
```

The archive is written via a temp file and `os.replace`, then the directory is fsynced. If you include `plugins`, the archive stores the installed packages and the plugin state file but **not** the capability credential store, and password-format plugin settings are blanked. Local password values are merged back when that archive is restored, so a backup cannot leak a plugin secret or erase one on restore. The other redacted values — the Gameyfin and OBS WebSocket passwords, the per-provider integration tokens, and webhook secrets — are handled the same way: stripped from the archive, merged back from your local copy on restore.

### Scheduled automatic backups (v1.12.0)

Settings can run the same engine on a weekly schedule: enable **automatic backups**, pick a retention of 1-52 archives (default 4), and an hourly daemon tick fires `auto_backup_due()` once seven days have passed since `last_auto_backup` — a missing or unparsable stamp counts as due. The automatic backup covers the library, settings, media, plugins, and themes — never extension data. Automatic archives are byte-identical to manual ones, so the restore path below applies unchanged.

## Restore a backup

Restore is guarded at every step:

1. Refused while any game is running.
2. The data directory must not be a symlink.
3. Every member is validated before any write: no empty names, NUL bytes, absolute paths, `..`, duplicates, or symlink/device modes; member cap 4 GiB, total cap 32 GiB.
4. The archive must decode; a non-ZIP raises `"Backup archive is invalid."`, a bad manifest `"Backup manifest is invalid."`
5. **Stale-backup guard**: when restoring `library`, if the archive's `created` time is older than the current `library.json` modification time, restore is refused unless forced: `"This backup is older than the current library. Pass force=True to restore it anyway."` The UI asks before any restore and offers a force path for older archives.
6. When `library` is restored, the current `library.json` is copied to `library.before-restore.json` first, and archived `settings.json` values are merged into the restored library's settings.
7. `media`/`plugins`/`themes`/`extension_data` members are written under the data directory with mode `0o600`, rejecting symlink destinations before and after intermediate `mkdir`s.

The CLI form is `python3 web_app.py --restore-backup <archive>`; the archive must be a real `.zip` inside the data directory or `backups/`.

## Inspect backups

`GET /api/backups` lists archives newest first with `name`, `path`, `size`, `created`, `items`, and `invalid: true` when the archive or manifest cannot be read. `GET /api/backup/manifest` returns the six selectable item keys.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| `"Close running games before creating a backup."` | A game session is active; close games first (Running dialog). |
| `"This backup is older than the current library. Pass force=True to restore it anyway."` | The archive predates the current library. Only force when you intentionally want the older state; the current library is saved to `library.before-restore.json` first. |
| `"Backup archive is invalid."` / `"Backup manifest is invalid."` | Not a ZIP or missing manifest. Only `OpenBoxBackup-*.zip` archives inside the data directory or `backups/` are accepted. |
| Restore fails on a symlink | Restore refuses symlinks anywhere in the archive or destination; re-create the archive from non-symlinked sources. |

## See also

- [Data and recovery](/reference/data-and-recovery/), the state store and `.bak` recovery
- [Save archives](/reference/save-archives/), per-game save backups
- [Library backups API reference](/reference/library-backups/), full archive contract and limits
