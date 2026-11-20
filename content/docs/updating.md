---
title: Updating
description: Update OpenBoxGL 3.0, migrate a library from 2.x or 1.x, and understand the package boundaries.
---

OpenBoxGL 3.0 ships the Rust `openbox-server` with no bundled Python. The in-app update **check** works on every platform, but the verified **install** step is implemented for the AppImage only. Windows and macOS install a new release by running the new release's installer. Flatpak, source, and system installs follow their own package or source workflow.

## Upgrading to 3.0

3.0 keeps library schema 7, backup format 2, sync format 3, and `/api/v2`. A 2.0 or 2.1 library opens without migration. The breaks run the other way: 3.0 will not boot a schema 6 file, will not run a v1 plugin, will not roll a library back, and will not start on Python 3.10.

### Before you upgrade

- **If the library is still schema 6** (a 1.19 library that 2.1 has not opened yet): quit OpenBox, then either run `openbox --migrate-library` on 3.0 or open the library once on 2.1 before you install 3.0. Startup does not upgrade it. The command keeps `library.v6.backup.json`.
- **If the library is schema 1 through 5:** open it on OpenBox 2.1 before you install 3.0. 3.0 migrates schema 6 only and does not rewrite an older file.
- **If a plugin omits `api_version` or still says `1`:** set `"api_version": 2` and follow the [plugin reference](/reference/plugins/). 3.0 does not run the v1 runner; the manifest fails with `PLUGIN_API_RETIRED`.
- **If you run from source on Python 3.10:** install Python 3.11 or newer before you start the fallback. The Rust server itself needs no Python.
- **If you still need `openbox --rollback-library`:** that command is gone. OpenBox 2.1.0 is the last build that restores `library.v6.backup.json`. 3.0 does not delete a backup that is already on disk.

### Upgrade

1. Quit OpenBox.
2. If the library is older than schema 7, migrate it as described above. A schema 7 library needs no migration.
3. Install 3.0 over 2.1, or over an older build after the library is schema 7.
4. Start OpenBox. `GET /api/v2/version` reports `version` 3.0.0, `api_version` 2, `state_schema` 7, `plugin_api_version` 2, `backup_format` 2, `sync_format` 3, and `runtime: "rust"`.

### What did not change

- Library schema 7, the required envelope, and backup format 2 (format 1 is still read).
- Sync format 3.
- The public API at `/api/v2` and the host channel at `/api/host`.
- The SQLite read model: it is still a projection. Deleting `sqlite_readmodel.db` loses nothing.
- The AppImage glibc floor (`GLIBC_2.35` on Ubuntu 22.04).

### What you cannot do in 3.0

- Roll the library back to the v6 copy. Use OpenBox 2.1.0 if you still have `library.v6.backup.json` and need that restore.
- Start the Python fallback on Python 3.10.
- Load a plugin whose manifest is missing `api_version` or sets it to 1.

## Upgrading from 2.0 or 2.1

2.1 installs over 2.0 and makes the 2.0 contracts permanent: the public API is `/api/v2` only, the `/api/v1` bridge and unversioned `/api/*` aliases are gone, backups write format 2 only, and the media checksum toggle takes effect. 3.0 installs over 2.1 with no library migration.

If you are coming from 2.0, note that 2.0's `/api/v1` bridge and 1.19-compatible backup export are not available in 2.1 or 3.0. Format 1 backups still restore; new format 1 writes return `BACKUP_FORMAT_RETIRED`.

## Upgrading from 1.19.x

1.19.x uses schema 6. 2.0 and 2.1 migrated it on first start; 3.0 does not. Before installing 3.0, either:

- open the library once on OpenBox 2.1, or
- install 3.0 and run `openbox --migrate-library` before starting the app.

The migration writes `library.v6.backup.json`, `migration-in-progress.json`, and `migration-report.json`. A schema 6 library opened by 3.0 without migration raises `STATE_SCHEMA_TOO_OLD` and is left unchanged.

## Upgrading from 1.18.x or earlier

1.19.0 and 1.19.1 install over any 1.18.x release. No v1 API route is removed or changed, and the library schema stays at version 6, so an existing library opens without a re-import. There is no data migration. The macOS app bundle is the one new install type.

Schema 1 through 5 libraries must be opened once on OpenBox 2.1 before 3.0. 3.0 migrates schema 6 only.

## Which installs get the built-in updater

| Installation | Update check | How to install the update |
| --- | --- | --- |
| AppImage | Built-in | Settings > Check for updates, then Install verified update |
| Windows portable | Built-in check | Re-run the new release's `install.ps1` |
| macOS app bundle | Built-in check | Re-run the new release's `install-macos.sh --replace` |
| Flatpak | None | Install the new bundle or rebuild the manifest |
| Source | None | `git pull`, rebuild with `cargo build --release --locked -p openbox-cli`, then restart |
| System install (`sudo make install`) | None | `git pull`, `make build-rust`, then `sudo make install` again |

The 3.0 Rust updater installs only when `APPIMAGE` is set. On Windows it returns "Automatic updates require an installed OpenBox copy."; on macOS it returns "Automatic updates require the OpenBox.app bundle." The check itself still reports the release channel on those platforms, and the manual installer path is the supported update route.

## How the AppImage update works

When you click **Check for updates** in Settings, OpenBoxGL queries the GitHub releases API for the latest release of `vindeckyy/OpenBoxGL` and compares versions:

1. **Version comparison.** The tag must be newer than the running version. Pre-release and build-suffixed tags (`-beta`, `+build`) are never offered as updates, even when their version number is higher.
2. **Asset verification.** The update is only offered when the release ships the AppImage asset matching the running architecture — `OpenBox-x86_64.AppImage` or `OpenBox-aarch64.AppImage` — from the trusted `https://github.com/vindeckyy/OpenBoxGL/releases/download/` prefix, a SHA-256 checksum is available, and an Ed25519 release signature (the `.sig` asset) is present. A release missing any of the three is rejected instead of downloaded.
3. **Signature verification.** Before anything is downloaded, the Ed25519 signature is verified against the pinned production public key (`openbox-release.pub`, embedded in the Rust binary). The `.sig` asset is a JSON contract — `{"algorithm": "ed25519", "digest_algorithm": "sha256", "digest": "<64 hex>", "signature": "<base64, 64 bytes>"}` — and any deviation rejects the update.
4. **Checksummed download.** The new AppImage downloads to a staging file beside the current one with a 512 MiB cap. The download fails if the computed SHA-256 does not match the release's checksum.
5. **Atomic swap with rollback.** The install destination is resolved through symlinks first, so a symlinked AppImage path replaces the real file rather than the link. The staged file takes the destination's permission bits, the current AppImage is renamed to `<arch>.previous.AppImage`, then the new file is moved into place with the install directory fsynced. If the move fails, the previous file is restored and the update reports the error.

That is why the Settings dialog says "The current AppImage will be retained as a backup" before you confirm: the `.previous.AppImage` file is the rollback copy, not a leftover.

### What you see

- **Update status line** in Settings shows the running version and an install label: `· AppImage` for an AppImage, or `· source checkout` otherwise.
- After a successful install, the status line reports the installed version and the backup path. **You must restart OpenBoxGL to use the update**; the running process still executes the old file.
- The desktop entry does not change because it points at the same path; only the file contents at that path were replaced.

## Windows and macOS updates

Run the new release's installer:

- **Windows:** download `OpenBox-x86_64-windows.zip` or `OpenBox-arm64-windows.zip`, extract it, and run `OpenBox\scripts\install.ps1 -Tag "v3.0.0"`. The installer verifies the archive, keeps the previous runtime at `share\openbox.previous`, and updates the Start Menu shortcut and `openbox://` handler.
- **macOS:** download `OpenBox-macos.zip` and `install-macos.sh` from the new release, then run `OPENBOX_RELEASE_TAG="v3.0.0" bash install-macos.sh --replace`. The installer verifies the bundle and replaces `OpenBox.app` in `~/Applications`.

Both installers need Python 3.11 or newer to run the release verifier. The installed application does not need Python.

## Common failures and recovery

<Callout type="tip" title="The rollback file is your safety net">
Every successful AppImage update renames the current file to an architecture-matched `.previous.AppImage` before swapping in the new one. If the new build will not start, the previous version is sitting right next to it.
</Callout>

### "Automatic updates require the OpenBox AppImage"

The app is not running from an AppImage. This is expected for Flatpak, source, and system installs; update those through their own workflow above.

### "Automatic updates require an installed OpenBox copy" / "require the OpenBox.app bundle"

3.0's verified install step is AppImage-only. Use the Windows or macOS installer from the new release.

### Windows: the installer cannot verify the release

Install Python 3.11+ (or set `OPENBOX_PYTHON`), and run the installer from the extracted release so `updates.py` is one directory above it.

### macOS: "is not writable; move OpenBox to a writable folder"

Move `OpenBox.app` to a folder you own, such as `~/Applications`, then run the installer again.

### "GitHub releases request failed (4xx) or Could not reach GitHub releases"

No network, GitHub unreachable, or the API rate limit was hit. The update check is read-only and never modifies anything, so retry later. If you run many installs from one IP, set `GITHUB_TOKEN` in a `.env` file (or `GH_TOKEN`) so the request authenticates against the higher API limit; the token is used only for this request.

### "The release checksum is unavailable" / "The release is missing a SHA-256 checksum"

The latest release lacks a verified asset or checksum. Nothing is downloaded; report the release to the maintainers rather than bypassing the check.

### Update installed but the app still shows the old version

Restart OpenBoxGL. The new file only takes effect on the next launch. If it still shows old behavior after a restart, you are likely running a different file than the one that was updated.

### The new AppImage will not start

The previous version is intact at the architecture-matched `.previous.AppImage` in the same directory. For x86_64:

```bash
mv OpenBox-x86_64.previous.AppImage OpenBox-x86_64.AppImage
chmod +x OpenBox-x86_64.AppImage
```

Then report the failure with the diagnostic log (Settings > Advanced > Copy diagnostic log), which redacts tokens and passwords but can include game names and file paths.

## Data safety during updates

The updater touches only the installed AppImage, Windows tree, or macOS app bundle. Your library, media, backups, themes, and settings live in the data directory (`~/.local/share/openbox-game-launcher` on Linux, `%LOCALAPPDATA%\openbox-game-launcher` on Windows, `~/Library/Application Support/openbox-game-launcher` on macOS, or `OPENBOX_DATA_DIR`) and are never part of the update. Moving, replacing, or deleting the installed app does not touch them.

Keep a library backup before major changes, and definitely before any rollback dance: [Library backups](/reference/library-backups/) and [Data and recovery](/reference/data-and-recovery/) cover both. Save Vault snapshots live under `<data-dir>/save-vault/` and are not part of a library backup; copy that folder separately if you need it off-machine.

## Related pages

- [Installation](/install/)
- [Getting started](/getting-started/)
- [Interfaces and data](/interfaces-and-data/)
- [Troubleshooting](/guides/troubleshooting/)
