---
title: Save Vault
description: Indexed, SHA-256-verified save snapshots with manual, on-close, and scheduled triggers.
---

Save Vault (ADR 0109, 3.0) keeps indexed snapshots of a game's saves under `<data-dir>/save-vault/`. It is separate from the per-game save backups and the whole-library backup: vault snapshots are fast to list, verify, diff, and restore, and they are **not** included in `BACKUP_ITEMS`.

## Enable and configure

Open **Settings > Sessions > Save Vault**, or set the four keys directly:

| Setting | Default | Meaning |
| --- | --- | --- |
| `save_vault_enabled` | `true` | Enables the vault. `session_close` and `auto` snapshots require it. |
| `save_vault_keep` | `5` | Snapshots kept per game, 1-50. Older snapshots are pruned. `pre-restore` safety snapshots are exempt. |
| `save_vault_on_close` | `false` | Takes a `session_close` snapshot when a game session ends. |
| `save_vault_auto_days` | `0` | Days between automatic `auto` snapshots, 0-365. `0` disables the schedule. |

**3.0 scheduling note:** the Rust server's hourly tick currently unlocks time capsules and refreshes tray recents; it does not call `auto_vault_due`. Manual and on-close snapshots work, but the scheduled `auto` pass does not fire under `openbox-server` yet. Use the manual **Create snapshot** action until the scheduler is wired.

## Take a snapshot

Open the game's **Save management** card and choose **Save Vault > Create snapshot**, or call:

```bash
curl -X POST -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"game_id":"GAME_ID","trigger":"manual"}' \
  http://127.0.0.1:$PORT/api/v2/saves/vault/snapshot
```

Triggers are `manual`, `session_close`, `auto`, and `pre-restore`. A `pre-restore` snapshot is taken automatically before every restore and is never pruned.

## Inspect and restore

The tabbed **Save History** dialog lists snapshots newest first with size, trigger, and file count. Select one to see a diff of added, changed, and unchanged files.

```bash
# List snapshots for a game
curl -H "X-OpenBox-Token: $TOKEN" \
  "http://127.0.0.1:$PORT/api/v2/saves/vault?game_id=GAME_ID"

# Compare a snapshot with the live saves
curl -H "X-OpenBox-Token: $TOKEN" \
  "http://127.0.0.1:$PORT/api/v2/saves/vault/diff?game_id=GAME_ID&snapshot=SNAPSHOT_ID"

# Restore (returns 202 and a job id)
curl -X POST -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"game_id":"GAME_ID","snapshot":"SNAPSHOT_ID"}' \
  http://127.0.0.1:$PORT/api/v2/saves/vault/restore
```

Restore always takes the `pre-restore` safety snapshot first. It validates the snapshot manifest and refuses symlinked destinations or paths outside the game's save roots.

## Limits and storage

- A snapshot is capped at **512 MiB** and **5,000 files**.
- Vault use above **5 GiB** shows a disk warning; lower retention or delete old snapshots.
- Shared emulator roots are excluded automatically so the vault does not duplicate every game's memory card or state directory.
- `index.json` is self-healing: a malformed or missing index is rebuilt from the snapshot directories on load.
- Vault snapshots live outside `BACKUP_ITEMS`. To copy the vault off-machine, copy `<data-dir>/save-vault/` alongside your ZIP backups.

## Related pages

- [Save discovery and restore](/guides/sessions-saves-and-backups/saves/)
- [Library backups](/guides/sessions-saves-and-backups/library-backups/)
- [Save Vault API](/reference/api/saves-and-operations/#save-vault)
