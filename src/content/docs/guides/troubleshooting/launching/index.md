---
title: Troubleshooting launching
description: Diagnose launch validation errors, failed sessions, and archive extraction.
---

Launch failures fall into two groups: validation errors that stop the launch before any process starts, and sessions that start but fail. Start with the exact message in the game detail pane, then the diagnostic log.

## Validation errors (nothing starts)

| Message | Cause / fix |
| --- | --- |
| `"<name> has no launch path."` | The game has no `path`. Edit the game and set the game file path. |
| `"The configured path no longer exists: <path>"` | The file was moved or deleted. Point the game at the new path under Edit game, or re-import the folder. |
| `"<name> has no launch command and its file is not executable."` | Make the file executable (`chmod +x`), set a platform profile in **Emulators**, or set a per-game launch command in Edit metadata. |
| `"7z or 7zz is required to extract this archive."` | Non-ZIP archive extraction needs `7z` or `7zz` on `PATH`. ZIP is handled internally. |
| `"Launch canceled by a plugin."` (or a plugin's error) | A `before_launch` plugin canceled the launch. Check the plugin, or run with `OPENBOX_SAFE_MODE=1` to bypass plugins. |

A game with no launch command and a non-executable file fails before any process starts with a message naming the game; set a platform profile or a per-game launch command.

## Session failed (exit code N)

The process started and exited. Check:

- The command tokens (`{path}`, `{rom_name}`, `{app_id}`, ...) — a wrong token substitutes an empty string, not an error.
- The emulator binary and its install state/mode (native vs Flatpak) in **Emulators**.
- Any BIOS files the game needs: use **Emulators** > dependency check (DuckStation `scph1001.bin`, PCSX2 BIOS, RPCS3 firmware, RetroArch system directory).
- Paths with spaces stay one argument because commands are tokenized, not shell-interpolated. If the emulator needs its own quoting, add quotes around `{path}` in the profile.

## Archive extraction

- ZIP is built-in and strictly validated (25,000 members, 2 GiB per member, 8 GiB total, no symlinks, no `..` paths).
- 7z/RAR need `7z` or `7zz` on `PATH`; extraction validates the listing with the same limits.
- Extraction fails loudly on unsafe archives and never replaces a good cache with a partial one. A failed extraction raises before any process starts.

## TDP / performance

TDP limits (ryzenadj) never block a launch; check the log for `apply_perf` warnings if you expected a limit to apply. `auto` mode applies only on gamescope guests or battery-powered hosts.

## The game is marked running but the window is gone

The Running dialog's **Force close** (SIGKILL) ends the session; unsaved progress may be lost. Pause/Resume, Restart, and Exit (SIGTERM) are the gentler options.

## See also

- [Emulators and launching](/guides/emulators-and-launching/) — profiles, tokens, archives, dependencies
- [Command tokens](/reference/command-tokens/) — every token and validation error
- [Handheld performance](/guides/big-box-and-handhelds/performance/) — TDP profiles
