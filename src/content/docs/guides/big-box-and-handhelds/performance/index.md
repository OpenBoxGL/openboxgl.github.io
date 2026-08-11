---
title: Handheld performance
description: Apply optional per-launch handheld performance profiles.
---

Performance profiles apply a TDP limit through `ryzenadj` before a game launches, and optionally restore a configured value when the session ends. They are per launch profile: either a platform profile or a per-game launch profile override.

## Setup

In **Emulators**, after a profile exists (for example `GameCube = dolphin-emu -b -e {path}`), the Handheld performance section lists each profile with:

- **Enable TDP** checkbox
- **Limit (W)**: the TDP applied at launch (0-60, step 0.5)
- **Restore (W)**: the TDP applied when the session ends (0-60, step 0.5)

Limits are stored in watts and converted to milliwatts for `ryzenadj -stapm-limit=<mW>`. A profile with only a limit and no restore value applies the limit at launch and does nothing on close.

## When limits apply

The **Apply handheld performance limits** setting (Settings) has three modes:

- `auto` (default): applies only when OpenBoxGL detects a gamescope guest (Steam Deck / Bazzite game mode) or a battery-powered host (`/sys/class/power_supply/BAT*` present).
- `always`: applies on any host.
- `off`: never applies.

Because `auto` gates on battery or gamescope, a desktop session never applies or restores a limit. The same gating decides restore, so a session that never applied a limit does not try to restore one.

## Failure behavior

Missing `ryzenadj` on PATH, a permission failure, a non-Ryzen CPU, or a malformed TDP value are logged as warnings and do not block the game launch. The apply and restore helpers never raise; the profile resolution falls back from a per-game `launch_profile` override to the game's platform when the override does not name an existing profile.

## Safety

Hardware-specific permissions remain host configuration; OpenBoxGL stores no root credential. `ryzenadj` runs with a 10-second timeout and only ever receives `-stapm-limit=<mW>` arguments. If the limit should not persist, configure a restore value so the session end restores it; keep in mind the restore is skipped when the apply was skipped under `auto`.
