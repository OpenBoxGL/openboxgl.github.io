---
title: Updating
description: Update AppImage and Windows portable installations and understand package boundaries.
---

OpenBoxGL has one built-in updater with two platform paths: the AppImage on Linux and the portable install on Windows. This page explains what it verifies, what happens during an update, what can go wrong, and how the other installation types update instead.

## Upgrading from a pre-1.0 build

The Tk interface was removed as of 1.0.0; the app opens a native WebKitGTK window by default. If you are upgrading from any pre-1.0 build, the same notes apply. Your library data is untouched: the same `library.json` in `~/.local/share/openbox-game-launcher` (or `OPENBOX_DATA_DIR`) keeps working, and the schema migrates to version 6 automatically on first launch. Later migrations add queue, notifications, `ui_state`, and `active_sessions` without requiring a re-import or re-download.

The one behavioral change to expect is the window itself: instead of a browser tab, `openbox` opens the native window. `openbox --web` still opens the loopback web UI in a browser for development, and if WebKitGTK is missing the launcher falls back to a chrome-less app window rather than failing.

## Which installs get the built-in updater

| Installation | Updater | How to update |
| --- | --- | --- |
| AppImage | Built-in verified updater | Settings > Check for updates, then Install verified update |
| Windows portable | Built-in verified updater | Settings > Check for updates, then Install verified update, then restart |
| Flatpak | None | Rebuild the manifest (`flatpak-builder --user --install --force-clean build-dir io.openbox.GameLauncher.yml`) or use your local Flatpak workflow |
| Source | None | `git pull` in the checkout, then restart |
| System install (`sudo make install`) | None | `git pull`, then `sudo make install` again |

The updater only recognizes an AppImage or a Windows portable install: on Linux it refuses to run when `APPIMAGE` is not set (source and Flatpak launches never set it), and on Windows it requires the launcher to live under the installed tree. If you are on Flatpak or source, the update button reports the release channel but the install step will not replace anything, by design.

## How the AppImage update works

When you click **Check for updates** in Settings, OpenBoxGL queries the GitHub releases API for the latest release of `vindeckyy/OpenBoxGL` and compares versions:

1. **Version comparison.** The tag must be newer than the running version. Pre-release and build-suffixed tags (`-beta`, `+build`) are never offered as updates, even when their version number is higher. A malformed GitHub releases payload (non-object JSON) fails closed instead of crashing.
2. **Asset verification.** The update is only offered when the release ships the AppImage asset matching the running architecture — `OpenBox-x86_64.AppImage` or `OpenBox-aarch64.AppImage` — from the trusted `https://github.com/vindeckyy/OpenBoxGL/releases/download/` prefix, a SHA-256 checksum is available (asset digest or `.sha256` file), and an Ed25519 release signature (the `.sig` asset) is present. A release missing any of the three is rejected with a clear error instead of an unsafe download. Inline checksums must be 64 hex chars; otherwise the `.sha256` URL is fetched only when it starts with the same trusted prefix, else the update fails with "The release checksum is unavailable."
3. **Signature verification.** Before anything is downloaded, the Ed25519 signature is verified against the pinned production public key (`openbox-release.pub`, shipped with the app). The `.sig` asset is a JSON contract — `{"algorithm": "ed25519", "digest_algorithm": "sha256", "digest": "<64 hex>", "signature": "<base64, 64 bytes>"}` — and any deviation (unsupported algorithm, missing digest, bad length) rejects the update. The verification key itself is checked: non-canonical coordinates, off-curve points, and the full small-order blacklist (orders 1, 2, 4, and 8, matching the libsodium/ZIP-215 set) are rejected, so a weak key can never verify a forgery. If the key is unavailable or still the placeholder, the update refuses to proceed with a loud warning.
4. **Checksummed download.** The new AppImage downloads to a staging file beside the current one, streaming with a 2 GiB cap. The download fails if the computed SHA-256 does not match the release's checksum.
5. **Atomic swap with rollback.** The install destination is resolved through symlinks first, so a symlinked AppImage path replaces the real file rather than the link. The staged file takes the destination's permission bits (`chmod`), the current AppImage is renamed to `<arch>.previous.AppImage` (for example, `OpenBox-x86_64.previous.AppImage`; any older rollback file is removed first), then the new file is moved into place with the install directory fsynced. If the move fails, the previous file is restored and the update reports the error; the staging file is always cleaned up. **Install desktop shortcut** escapes the AppImage path (`\`, `"`, `` ` ``, `$`, and `%` doubled to `%%`) so a path cannot inject desktop-entry field codes, and rejects paths containing newlines.

That is why the Settings dialog says "The current AppImage will be retained as a backup" before you confirm: the `.previous.AppImage` file is the rollback copy, not a leftover.

### What you see

- **Update status line** in Settings shows the running version and the install kind: an AppImage ("AppImage"), a Windows portable install, or a source checkout.
- After a successful install, the status line reports the installed version and the backup path. **You must restart OpenBoxGL to use the update**; the running process still executes the old file (on Windows the swap only happens once the app exits).
- The desktop entry does not change because it points at the same path; only the file contents at that path were replaced. On Windows the Start Menu shortcut points at `openbox.cmd` inside the install tree, which the swap replaces in place.

## How the Windows portable update works

The Windows path runs the same version comparison, asset selection, and verification ladder as the AppImage path, then swaps the whole installed tree instead of a single file:

1. **Asset selection.** The updater looks for `OpenBox-x86_64-windows.zip` under the trusted `https://github.com/vindeckyy/OpenBoxGL/releases/download/` prefix, together with its `.sha256` and `.sig` assets. A release missing any of the three is rejected before anything is downloaded.
2. **Verification.** The pinned release public key, the SHA-256 checksum, and the Ed25519 signature are checked with the same standard-library RFC 8032 implementation the installer uses, so Windows needs neither curl nor OpenSSL. The signature is verified before the archive is downloaded.
3. **Staged download.** The archive is downloaded with a 2 GiB cap into a scratch folder inside the install root and extracted there. The extracted tree must contain `web_app.py`, otherwise the update stops without touching the install.
4. **Swap after exit.** A running install cannot be replaced in place, so a detached PowerShell applier waits for OpenBox to exit (up to ten minutes), moves the current tree to `share\openbox.previous`, moves the staged tree into place, and deletes the scratch folder. Restart OpenBoxGL to use the update; until the app exits, the update has not landed.
5. **Rollback.** The previous tree stays at `share\openbox.previous`. To roll back, exit OpenBox, delete the current `share\openbox`, and rename `share\openbox.previous` to `share\openbox`.

Your library is never part of the swap: it lives in `%LOCALAPPDATA%\openbox-game-launcher` (or `OPENBOX_DATA_DIR`).

## Common failures and recovery

<Callout type="tip" title="The rollback file is your safety net">

Every successful AppImage update renames the current file to an architecture-matched `.previous.AppImage` before swapping in the new one. If the new build will not start, you can always get back to a working launcher, the previous version is sitting right next to it. You never need to re-download to roll back.

</Callout>

### "Automatic updates require the OpenBox AppImage"

The app is not running from an AppImage. This is expected for Flatpak, source, and system installs; update those through their own workflow above.

### "Automatic updates require an installed copy of OpenBox"

The Windows build is not running from a portable install (for example, you launched `web_app.py` from a source checkout). Install with `install.ps1`, or update a checkout with `git pull`.

### Windows: the update is downloaded but nothing changed yet

The staged tree is swapped in only after OpenBox exits, because Windows cannot replace files that are in use. Quit OpenBox (including the tray icon) and it lands within seconds; the applier gives up after ten minutes, and nothing is lost if it does — the staged tree and the current install are both intact.

### "GitHub releases request failed (4xx) or Could not reach GitHub releases"

No network, GitHub unreachable, or the API rate limit was hit. The update check is read-only and never modifies anything, so retry later. If you run many installs from one IP, set `GITHUB_TOKEN` in a `.env` file (or `GH_TOKEN`) so the request authenticates against the higher API limit; the token is used only for this request.

### "The release checksum is unavailable" / "The release is missing a SHA-256 checksum"

The latest release lacks a verified asset or checksum. Nothing is downloaded; report the release to the maintainers rather than bypassing the check.

### Update installed but the app still shows the old version

Restart OpenBoxGL. The new file only takes effect on the next launch. If it still shows old behavior after a restart, you are likely running a different file than the one that was updated (for example, a copy elsewhere on disk); update that copy, or move the updated AppImage and re-run **Install desktop shortcut** so the menu entry follows it.

### The new AppImage will not start

The previous version is intact at the architecture-matched `.previous.AppImage` in the same directory. For x86_64, replace the new file with it:

```bash
mv OpenBox-x86_64.previous.AppImage OpenBox-x86_64.AppImage
chmod +x OpenBox-x86_64.AppImage
```

then report the failure with the diagnostic log (Settings > Copy diagnostic log), which redacts tokens and passwords but can include game names and file paths.

## Data safety during updates

The updater touches only the AppImage file next to the running executable. Your library, media, backups, themes, and settings live in the data directory (`~/.local/share/openbox-game-launcher` or `OPENBOX_DATA_DIR`) and are never part of the update. Moving, replacing, or deleting the AppImage does not touch them.

Still, keep a library backup before major changes, and definitely before any rollback dance: [Library backups](/reference/library-backups/) and [Data and recovery](/reference/data-and-recovery/) cover both.

## Related pages

- [Installation](/install/)
- [Getting started](/getting-started/)
- [Interfaces and data](/interfaces-and-data/)
- [Troubleshooting](/guides/troubleshooting/)
