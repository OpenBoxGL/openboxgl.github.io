---
title: Emulators and launching
description: Configure profiles, tokens, archives, dependencies, and session controls.
---

OpenBoxGL launches games through tokenized commands, never shell interpolation. A launch command is split with shell rules into an argument list, and tokens are replaced per argument; a path with spaces stays one argument.

:::tip[Read the launch pipeline first]
Launching is a fixed sequence — resolve path → extract archive → resolve command → substitute tokens → apply perf → run `before_launch` plugins → spawn → track → `after_session`. The full order and where each validation error fires is documented in [How OpenBoxGL works](/reference/how-it-works/#the-launch-pipeline). Knowing the order tells you exactly which step a failure came from.
:::

## Profiles

The **Emulators** button opens the Emulator profiles dialog. Profiles are one per line: `Platform = command`. Tokens available in any command:

| Token | Value |
| --- | --- |
| `{path}` | Absolute game or ROM path (after archive extraction, when enabled) |
| `{name}` | Game title |
| `{rom_name}` | ROM filename |
| `{app_id}` | Steam application ID |
| `{heroic_app_id}` | Heroic application ID |
| `{lutris_id}` | Lutris game identifier |

If a profile command has no `{path}` and the game has no per-game command, the resolved path is appended. A `.sh` game with no command launches with `bash`; otherwise the path itself runs when it is executable.

**Per-game overrides**: in Edit metadata, set **Launch command, optional override** to use a different command for one title, or **Launch profile override** to select a named profile (the override wins over the platform profile).

### Emulator catalog

The same dialog lists supported emulators with install state, mode (native or Flatpak), platforms, and per-platform profiles:

- Dolphin (GameCube `-b -e {path}`, Wii, WiiWare)
- PPSSPP (PSP `{path}`)
- PCSX2 (PlayStation 2 `-batch {path}`)
- RPCS3 (PlayStation 3 `{path}`)
- Cemu (Wii U `-g {path}`)
- MAME (Arcade `{path}`)
- xemu (Xbox `-dvd_path {path}`)
- ScummVM (`{path}`)
- RetroArch (NES, SNES, Nintendo 64, Game Boy, Game Boy Color, Game Boy Advance, Sega Saturn, Arcade)
- DuckStation (PlayStation `-batch {path}`)
- melonDS (Nintendo DS `{path}`)

**Install** adds the app from Flathub (adding the Flathub remote if missing) and, when done, adds its profiles to the editor (save to apply). **Install all available emulators** and **Update installed emulators** run bulk background jobs with per-emulator status. **Open** launches the emulator standalone. Detected native binaries (DOSBox, wine, mame, dolphin-emu, pcsx2-qt, ppsspp, rpcs3, duckstation-qt) appear as **Add N detected profiles**.

### Emulator definition packs

YAML definition packs in `emulator_defs/` (dolphin, duckstation, retroarch) map extensions to platforms and startup commands. **Scan ROM folder** in Settings imports a folder through these definitions, and an emulator scan config can auto-update on each startup. Detected profiles are merged into the profile list automatically at boot when missing.

## Archive extraction

A game with **Extract archive before launch** enabled is extracted at launch time into `<data-dir>/cache/archives`. ZIP extraction is native and strictly validated: at most 25,000 members, 2 GiB per member, 8 GiB total, no absolute or `..` paths, no duplicate entries, no symlinks or device nodes, and no symlinked destination. 7z and RAR need `7z` or `7zz` on PATH, which first validates the listing with the same limits. The largest non-artwork file becomes the launch target unless **Archive member** names one; extraction is cached per archive (content-addressed) with a `.complete` marker, so re-launches reuse the cache. A failed extraction raises before any process starts.

:::caution[Why the safe extractor refuses things]
The extraction limits exist because a malicious or malformed archive is the one place untrusted bytes enter the filesystem. The extractor refuses symlinks, `..` paths, device nodes, and oversized members *by design*; a "cannot extract" error here means the archive violated a safety rule, not that the extractor is broken. Do not bypass it — repackage the archive.
:::

## Dependency checks

`/api/emulators/dependencies` checks known BIOS/firmware locations per emulator and reports what is missing:

- DuckStation: `scph1001.bin` under `~/.local/share/duckstation/bios` (or the Flatpak data path)
- PCSX2: PS2 BIOS folder under `~/.config/PCSX2/bios` (or Flatpak)
- RPCS3: PS3 firmware under `~/.config/rpcs3/dev_flash` (or Flatpak)
- RetroArch: System/BIOS directory under `~/.config/retroarch/system` (or Flatpak)

Missing items are reported, not fixed; the emulator may still run, but games that need BIOS files will not.

## Launching and session controls

Launch starts the process in its own session group. Before launch, the game's play count and last-played stamp update, and any configured performance profile applies (see [Handheld performance](/guides/big-box-and-handhelds/performance/)). Plugins with a `before_launch` hook can modify or cancel the command. Launch fails cleanly (before any process starts) when:

- the game has no launch path,
- the path no longer exists,
- no command exists and the target is not executable,
- the working directory from a plugin is not a directory,
- archive extraction fails.

The **Running** dialog lists active sessions with PID, start time, paused state, and actions: Pause/Resume, Restart, Exit (SIGTERM), and Force close (SIGKILL, with a confirmation that unsaved progress may be lost). Session tracking modes (Settings, default per-game override possible) control when a session is considered ended:

- **Default** / **Process**: wait for the direct child process.
- **Original process**: wait for the originally spawned PID.
- **Install folder**: track processes whose cwd is inside the game's install folder or path parent.
- **Process name**: track processes matching a name (defaults to the game file stem).

Tracking start delay (0-600 s) and poll frequency (0.5-60 s) are configurable. When a session ends, play time and history record (if tracking is enabled, history keeps the last 500 sessions), progress automation runs, save backups on close and OBS auto-attach fire if enabled, and the TDP restore applies. A session that exits immediately (under 5 seconds) with a nonzero code shows "Session failed" with the exit code and a hint to check the Launch command and emulator install. Restart relaunches the same game with the same stable ID.

Storefront clients (Steam, Heroic, Lutris) can be shut down after a session ends (**Close storefront clients after a session ends**), launched with `-shutdown` or `flatpak kill` depending on how they were installed.

A missing launch command, missing profile, or non-executable game fails before a process is started. Check the detail pane's command and emulator installation when a session fails; see [Troubleshooting](/guides/troubleshooting/).
