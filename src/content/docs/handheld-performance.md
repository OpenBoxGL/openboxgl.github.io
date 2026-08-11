---
title: Handheld performance
description: Apply optional per-launch handheld performance profiles.
---

Performance profiles can apply a TDP limit through `ryzenadj` before launch and restore a configured value after the session. The setting supports `off`, `auto`, and `always`.

`auto` applies only when OpenBoxGL detects a gamescope guest or battery-powered handheld. Missing `ryzenadj` or permission failures are logged as warnings and do not block the game launch.

Use the profile editor in Emulator settings. Hardware-specific permissions remain host configuration; no root credential is stored by OpenBoxGL.
