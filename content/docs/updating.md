---
title: Updating
description: Update AppImage installations and understand package boundaries.
---

OpenBoxGL has one built-in updater and it is for the AppImage only. This page explains what it verifies, what happens during an update, what can go wrong, and how the other installation types update instead.

## Upgrading from a pre-1.0 build

The Tk interface was removed as of 1.0.0; the app opens a native WebKitGTK window by default. If you are upgrading from any pre-1.0 build, the same notes apply. Your library data is untouched: the same `library.json` in `~/.local/share/openbox-game-launcher` (or `OPENBOX_DATA_DIR`) keeps working, and the schema migrates to version 6 automatically on first launch. Later migrations add queue, notifications, `ui_state`, and `active_sessions` without requiring a re-import or re-download.

The one behavioral change to expect is the window itself: instead of a browser tab, `openbox` opens the native window. `openbox --web` still opens the loopback web UI in a browser for development, and if WebKitGTK is missing the launcher falls back to a chrome-less app window rather than failing.

## Which installs get the built-in updater

| Installation | Updater | How to update |
| --- | --- | --- |
| AppImage | Built-in verified updater | Settings > Check for updates, then Install verified update |
| Flatpak | None | Rebuild the manifest (`flatpak-builder --user --install --force-clean build-dir io.openbox.GameLauncher.yml`) or use your local Flatpak workflow |
| Source | None | `git pull` in the checkout, then restart |
| System install (`sudo make install`) | None | `git pull`, then `sudo make install` again |

The updater only recognizes an AppImage: it refuses to run when `APPIMAGE` is not set (source and Flatpak launches never set it). If you are on Flatpak or source, the update button reports the release channel but the install step will not replace anything, by design.

## How the AppImage update works

When you click **Check for updates** in Settings, OpenBoxGL queries the GitHub releases API for the latest release of `vindeckyy/OpenBoxGL` and compares versions:

1. **Version comparison.** The tag must be newer than the running version. Pre-release and build-suffixed tags (`-beta`, `+build`) are never offered as updates, even when their version number is higher.
2. **Asset verification.** The update is only offered when the release ships the `OpenBox-x86_64.AppImage` asset from the trusted `https://github.com/vindeckyy/OpenBoxGL/releases/download/` prefix, a SHA-256 checksum is available (asset digest or `.sha256` file), and an Ed25519 release signature (the `.sig` asset) is present. A release missing any of the three is rejected with a clear error instead of an unsafe download.
3. **Signature verification.** Before anything is downloaded, the Ed25519 signature is verified against the pinned production public key (`openbox-release.pub`, shipped with the app). If the key is unavailable or still the placeholder, the update refuses to proceed with a loud warning.
4. **Checksummed download.** The new AppImage downloads to a staging file beside the current one, streaming with a 2 GiB cap. The download fails if the computed SHA-256 does not match the release's checksum.
5. **Atomic swap with rollback.** The current AppImage is renamed to `OpenBox-x86_64.previous.AppImage` (any older rollback file is removed first), then the new file is moved into place. If the move fails, the previous file is restored and the update reports the error.

That is why the Settings dialog says "The current AppImage will be retained as a backup" before you confirm: the `.previous.AppImage` file is the rollback copy, not a leftover.

### What you see

- **Update status line** in Settings shows the running version and whether it is an AppImage ("AppImage") or a source checkout.
- After a successful install, the status line reports the installed version and the backup path. **You must restart OpenBoxGL to use the update**; the running process still executes the old file.
- The desktop entry does not change because it points at the same path; only the file contents at that path were replaced.

## Common failures and recovery

<Callout type="tip" title="The rollback file is your safety net">

Every successful AppImage update renames the current file to `OpenBox-x86_64.previous.AppImage` before swapping in the new one. If the new build will not start, you can always get back to a working launcher, the previous version is sitting right next to it. You never need to re-download to roll back.

</Callout>

### "Automatic updates require the OpenBox AppImage"

The app is not running from an AppImage. This is expected for Flatpak, source, and system installs; update those through their own workflow above.

### "GitHub releases request failed (4xx) or Could not reach GitHub releases"

No network, GitHub unreachable, or the API rate limit was hit. The update check is read-only and never modifies anything, so retry later. If you run many installs from one IP, set `GITHUB_TOKEN` in a `.env` file (or `GH_TOKEN`) so the request authenticates against the higher API limit; the token is used only for this request.

### "The release checksum is unavailable" / "The release is missing a SHA-256 checksum"

The latest release lacks a verified asset or checksum. Nothing is downloaded; report the release to the maintainers rather than bypassing the check.

### Update installed but the app still shows the old version

Restart OpenBoxGL. The new file only takes effect on the next launch. If it still shows old behavior after a restart, you are likely running a different file than the one that was updated (for example, a copy elsewhere on disk); update that copy, or move the updated AppImage and re-run **Install desktop shortcut** so the menu entry follows it.

### The new AppImage will not start

The previous version is intact at `OpenBox-x86_64.previous.AppImage` in the same directory. Replace the new file with it:

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
