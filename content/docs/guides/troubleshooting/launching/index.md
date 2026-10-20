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
| `"<name> has no launch command and its file is not executable."` | Make the file executable (`chmod +x`), set a platform profile in **Emulators & controllers**, or set a per-game launch command in Edit metadata. |
| `"7z or 7zz is required to extract this archive."` | Non-ZIP archive extraction needs `7z` or `7zz` on `PATH`. ZIP is handled internally. |
| `"Launch canceled by a plugin."` (or a plugin's error) | A `before_launch` plugin canceled the launch. Check the plugin, or run with `OPENBOX_SAFE_MODE=1` to bypass plugins. |

A game with no launch command and a non-executable file fails before any process starts with a message naming the game; set a platform profile or a per-game launch command.

## Session failed (exit code N)

The process started and exited. Check:

- The command tokens (`{path}`, `{rom_name}`, `{app_id}`, ...), a wrong token substitutes an empty string, not an error.
- The emulator binary and its install state/mode (native vs Flatpak) in **Emulators & controllers**.
- Any BIOS files the game needs: use **Emulators & controllers** > dependency check (DuckStation `scph1001.bin`, PCSX2 BIOS, RPCS3 firmware, RetroArch system directory).
- Paths with spaces stay one argument because commands are tokenized, not shell-interpolated. If the emulator needs its own quoting, add quotes around `{path}` in the profile.

## Archive extraction

- ZIP is built-in and strictly validated (25,000 members, 2 GiB per member, 8 GiB total, no symlinks, no `..` paths).
- 7z/RAR need `7z` or `7zz` on `PATH`; extraction validates the listing with the same limits.
- Extraction fails loudly on unsafe archives and never replaces a good cache with a partial one. A failed extraction raises before any process starts.

## TDP / performance

TDP limits (ryzenadj) never block a launch; check the log for `apply_perf` warnings if you expected a limit to apply. `auto` mode applies only on gamescope guests or battery-powered hosts.

## Emulator settings did not apply

Manage Emulators stores a managed flag, per-platform overrides, and install/version status. Launch arguments come from the global settings unless a platform override supplies an adapter, RetroArch core, or extra arguments.

- **RetroArch settings.** Display, fullscreen, effects, run-ahead, rewind, and upscaling are written to `<data-dir>/emulator-configs/retroarch/<platform>.cfg` and attached as `--appendconfig`. If an existing `--appendconfig` is present, the generated path is appended after a comma instead of replacing it. The file is written atomically with `0o600`.
- **Settings that cannot apply are warnings, not launch failures.** A launch with no data directory logs `RetroArch settings were skipped because no data directory was provided.`; an unwritable config logs `RetroArch settings could not be written: <error>`; a requested effect whose bundled shader is missing logs `RetroArch scanlines were requested but the bundled shader is missing.` The original command still runs.
- **MAME settings** are rendered as flags before the ROM. A flag combination the running MAME rejects appears as the emulator's own startup error, not as a launch validation error.
- **Plugin emulator settings** are logged under `Plugin emulator settings` and are skipped with a warning when the plugin does not declare the emulator hook, the values fail validation, or the emulator is unknown. Plugin environment keys may not override a blocked host variable.
- **Update checks.** Update-all probes installed versions. An installed emulator shows its probed version and an explicit note when update checks are off (`skip_update_check`); an empty version line is not a sign that the emulator is missing.

## The game is marked running but the window is gone

The Running dialog's **Force close** (SIGKILL) ends the session; unsaved progress may be lost. Pause/Resume, Restart, and Exit (SIGTERM) are the gentler options.

## Launch check history

The **Launch check** card in the details pane runs the launch check for one game; the library-wide audit runs the same checks across the library. Alongside the report in `cache/launch_audit.json`, a compact rolling history is appended to `<data-dir>/cache/launch_audit.jsonl` so recurring failures can be spotted over time. The history rotates at 5 MiB to `launch_audit.jsonl.1`. Both files are diagnostic only; deleting them removes the trend and last report, not the library or the audit itself.

## Steam Verify files

An imported Steam game whose install folder exists offers **Verify Steam files** in the details pane and Big Box. It hands the app to Steam with `steam://validate/<id>`, so Steam performs the verification and any repair; OpenBox does not hash or replace the files itself. A game whose install folder is gone shows **Missing** and an **Install** handoff instead, because there is nothing local to verify.

## See also

- [Emulators and launching](/guides/emulators-and-launching/), profiles, tokens, archives, dependencies
- [Command tokens](/reference/command-tokens/), every token and validation error
- [Handheld performance](/guides/big-box-and-handhelds/performance/), TDP profiles
