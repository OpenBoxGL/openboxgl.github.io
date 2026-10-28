---
title: API 1.19 changes
description: Platform-gated changes to existing routes in OpenBox 1.19.0 and 1.19.1, covering the capability features object, battery sources, host-specific storefront lists, and refusals on the wrong platform.
---

OpenBox 1.19 adds **no routes and no settings**. The route baseline is unchanged at 381 method and path pairs, and the configuration reference is unchanged at 150 keys. What changed is what existing routes return on each platform, so this page lists those differences. Every route still requires the per-launch token described in the [API overview](/reference/api/overview/).

## Capability features (1.19.1)

`GET /api/native/capabilities` carries a `features` object alongside its existing fields, such as `version`, `platform`, and `data_dir`. Each key is `true` only when the host supports that feature. A missing object, or a missing key, must be read as `false`. A failed request therefore hides controls instead of exposing broken ones.

| Feature | Linux | Windows | macOS | Gates |
| --- | --- | --- | --- | --- |
| `gamescope` | true | false | false | Gamescope presets, Game Mode, and window marking |
| `mangohud` | true | false | false | MangoHud overlay |
| `handheld_perf` | true | false | false | ryzenadj TDP limits |
| `flatpak` | true | false | false | Flatpak emulator installs, update-all, and folder grants |
| `wine` | true | false | false | Wine and Proton prefix and runner manager |
| `faugus` | true | false | false | Faugus Launcher scanning and import |
| `lutris` | true | false | false | Lutris import and launch |
| `heroic` | true | true | false | Heroic import and launch |
| `epic` | true | true | false | Epic import |
| `native_storefronts` | false | true | false | Native GOG, EA app, and Ubisoft Connect imports |
| `desktop_entry` | true | false | false | XDG desktop shortcut installer |

The `platform` value is Python's `sys.platform`: `linux`, `win32`, or `darwin`. Settings → About shows these as Linux, Windows, and macOS.

A macOS response includes, for example, the following. Other fields are omitted here.

```json
{
  "platform": "darwin",
  "features": {
    "gamescope": false,
    "mangohud": false,
    "handheld_perf": false,
    "flatpak": false,
    "wine": false,
    "faugus": false,
    "lutris": false,
    "heroic": false,
    "epic": false,
    "native_storefronts": false,
    "desktop_entry": false
  }
}
```

## Battery (1.19.1)

`GET /api/native/battery` returns `{"present": bool, "percent": 0-100, "charging": bool}` on every platform. The device path is never returned.

| Platform | Source | Server cache |
| --- | --- | --- |
| Linux | First `BAT*` device under `/sys/class/power_supply` | None |
| Windows | `GetSystemPowerStatus`. A desktop reports `present: false`. A laptop reports its percentage and charging state, and an unknown percentage reads as 0. | 30 seconds |
| macOS | `pmset -g batt`, `InternalBattery` line | 30 seconds |

Big Box keeps its own 60-second client cache on top of these readings.

## Storefront list (1.19.1)

`GET /api/v2/storefronts` lists only the built-in sources this host can import from:

| Built-in source | Listed when |
| --- | --- |
| `steam`, `gameyfin` | Always |
| `heroic` | `features.heroic`: Linux and Windows |
| `lutris` | `features.lutris`: Linux only |
| `gog`, `ea`, `ubisoft` | `features.native_storefronts`: Windows only |

Enabled plugin storefronts follow as before, with the same redacted settings.

## Windows-only import routes (1.19.1)

`POST /api/v2/import/gog`, `POST /api/v2/import/ea`, and `POST /api/v2/import/ubisoft` on a host that is not Windows return `400`. The message names the store, for example `GOG import is only available on Windows.`, `EA import is only available on Windows.`, or `UBISOFT import is only available on Windows.` The discovery code does not run. Earlier releases returned an empty result on these hosts instead.

## Wine, Faugus, and Flatpak (1.19.1)

These routes answer on Linux only. Elsewhere they report nothing and do not scan the disk:

| Route | Off Linux |
| --- | --- |
| `GET /api/wine/prefixes` | `{"prefixes": [], "available": false}` |
| `GET /api/wine/protons` | `{"protons": [], "available": false}` |
| `GET /api/wine/prefix-for-game` | `{"prefix": "", "available": false}` |
| `GET /api/faugus/status`, `GET /api/faugus/scan`, `POST /api/faugus/import` | The Faugus scanner finds no data directories and returns no games. |
| `POST /api/v2/launch/grant` and `POST /api/v2/launch/grant/undo` | `400` with "Flatpak grants are only available on Linux." The request is refused before any subprocess runs. |

## Heroic and Lutris on macOS

Heroic has no macOS build. A direct call to the Heroic import refuses with "Heroic import is not available on macOS." The Heroic and Lutris controls are hidden in the UI on that platform.

## Game Mode outside Linux

Starting with `--game-mode` on Windows or macOS (for example `openbox --game-mode` or `python3 web_app.py --game-mode`) exits with status 2 and prints "Game Mode needs gamescope and is only available on Linux." to standard error. The server does not start.

## Data directory defaults

No setting changed. The default data directory depends on the platform:

| Platform | Default data directory |
| --- | --- |
| Linux | `~/.local/share/openbox-game-launcher` |
| Windows | `%LOCALAPPDATA%\openbox-game-launcher` |
| macOS | `~/Library/Application Support/openbox-game-launcher` |

`OPENBOX_DATA_DIR` overrides all three. The curl examples in the other API pages use the Linux path, so substitute the macOS or Windows path on those platforms.

## Related pages

- [API overview](/reference/api/overview/)
- [API 1.18 additions](/reference/api/one-eighteen/)
- [Local administrator API](/reference/api/local-admin/)
- [macOS](/macos/)
- [Windows](/windows/)
