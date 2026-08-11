---
title: Command tokens
description: Use exact placeholders in emulator and launch profile commands.
---

| Token | Value |
| --- | --- |
| `{path}` | Absolute game or ROM path |
| `{name}` | Game title |
| `{rom_name}` | ROM filename |
| `{app_id}` | Steam application ID |
| `{heroic_app_id}` | Heroic application ID |
| `{lutris_id}` | Lutris game identifier |

Example:

```ini
[SNES]
command = retroarch -L /usr/lib/libretro/snes9x_libretro.so "{path}"
```

Use quotes where the target command requires them. A missing token value, command, executable, or platform profile is a launch validation error.
