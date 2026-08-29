---
title: Emulators and launching
description: Configure profiles, tokens, archives, dependencies, and session controls.
---

OpenBoxGL launches games through tokenized commands, never shell interpolation. A launch command is split with shell rules into an argument list, and tokens are replaced per argument; a path with spaces stays one argument.

<Callout type="tip" title="Read the launch pipeline first">

Launching is a fixed sequence, resolve path → extract archive → resolve command → substitute tokens → apply perf → run `before_launch` plugins → spawn → track → `after_session`. The full order and where each validation error fires is documented in [How OpenBoxGL works](/reference/how-it-works/#the-launch-pipeline). Knowing the order tells you exactly which step a failure came from.

</Callout>

## Profiles

The **Emulators** button opens the Emulator profiles dialog. Profiles are one per line: `Platform = command`. Tokens available in any command:

| Token | Value |
| --- | --- |
| `{path}` / `{ImagePath}` | Absolute game or ROM path (after archive extraction, when enabled) |
| `{name}` / `{Name}` | Game title |
| `{dir}` / `{Dir}` | Parent directory of the target game file |
| `{file}` / `{File}` | Filename with extension |
| `{stem}` / `{FileNameWithoutExtension}` | Filename without extension |
| `{rom_name}` | ROM filename |
| `{platform}` / `{Platform}` | Platform name |
| `{EmulatorDir}` | Emulator parent directory |
| `{DataDir}` | OpenBox data directory path |
| `{app_id}` | Steam application ID |
| `{heroic_app_id}` | Heroic application ID |
| `{lutris_id}` | Lutris game identifier |

<CommandBuilder />

If a profile command has no `{path}` and the game has no per-game command, the resolved path is appended. A `.sh` game with no command launches with `bash`; otherwise the path itself runs when it is executable.

### Launch Precedence Hierarchy

When launching a title, OpenBox resolves the executable and arguments using a strict 5-level hierarchy (ADR 0012):

1. **Per-Game Launch Command**: Explicit command configured in Edit Metadata (`launch_command`).
2. **Per-Game Selected Adapter/Profile**: Profile override set on the game entry (`emulator_adapter_id` or `emulator_id`).
3. **Platform-Level Profile**: User-configured platform profile in Emulator Profiles.
4. **Authoritative Adapter Registry**: Auto-detected matching adapter from `emulator_defs/` (`GET /api/v2/emulators/registry`).
5. **Direct Executable Fallback**: Native binary execution if target file has executable permissions (`+x`).

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
- RetroArch (NES, SNES, Nintendo 64, Game Boy Advance, Game Boy, Game Boy Color, Nintendo DS, Sega Master System, Game Gear, Sega Genesis)
- DuckStation (PlayStation `-batch {path}`)
- melonDS (Nintendo DS `{path}`)
- Eden (Nintendo Switch `{path}`)

**Install** adds the app from Flathub (adding the Flathub remote if missing) and, when done, adds its profiles to the editor (save to apply). **Install all available emulators** and **Update installed emulators** run bulk background jobs with per-emulator status. **Open** launches the emulator standalone. Detected native binaries (DOSBox, wine, mame, dolphin-emu, pcsx2-qt, ppsspp, rpcs3, duckstation-qt, eden) appear as **Add N detected profiles**.

### Authoritative Emulator Registry

Authoritative definitions in `emulator_defs/` map extensions to platforms and startup commands. `GET /api/v2/emulators/registry` provides real-time adapter and compatibility views. Custom user profiles in `library.json` always override registry defaults.

## Archive extraction

A game with **Extract archive before launch** enabled is extracted at launch time into `<data-dir>/cache/archives`. ZIP extraction is native and strictly validated: at most 25,000 members (`MAX_ARCHIVE_MEMBERS`), 2 GiB per member (`MAX_ARCHIVE_MEMBER_BYTES`), 8 GiB total (`MAX_ARCHIVE_TOTAL_BYTES`), no absolute or `..` paths, no duplicate entries, no symlinks or device nodes, and no symlinked destination; the listing itself is capped at 16 MiB (`MAX_ARCHIVE_LISTING_BYTES`). 7z and RAR need `7z` or `7zz` on PATH, which first validates the listing with the same limits. The largest non-artwork file becomes the launch target unless **Archive member** names one; extraction is cached per archive (content-addressed) with a `.complete` marker, so re-launches reuse the cache. A failed extraction raises before any process starts. Snapshot copies use `O_NOFOLLOW` to avoid replacement races.

<Callout type="caution" title="Why the safe extractor refuses things">

The extraction limits exist because a malicious or malformed archive is the one place untrusted bytes enter the filesystem. The extractor refuses symlinks, `..` paths, device nodes, and oversized members *by design*; a "cannot extract" error here means the archive violated a safety rule, not that the extractor is broken. Do not bypass it, repackage the archive.

</Callout>

## Launch Doctor & Preflight Checks

Launch Doctor (`POST /api/v2/launch/preflight` and `POST /api/v2/launch/preflight/batch`) inspects game readiness before any process spawns:

- **Executable & Path**: Verifies that files exist on disk and have executable permissions.
- **Emulator Readiness**: Checks for required emulators (`EMULATOR_REQUIRED`) or ambiguous platform extensions (`AMBIGUOUS_PLATFORM`).
- **BIOS & Firmware**: Checks required system files (e.g. DuckStation `scph1001.bin`, PCSX2 BIOS, RPCS3 `dev_flash`, RetroArch system assets).
- **Structured Fix Actions (`fix_action`)**: When a preflight check fails, Launch Doctor presents structured remedy buttons directly in the UI:
  - `flatpak_install`: One-click button to install the missing Flathub emulator.
  - `reveal_bios_path`: Opens or displays the target directory where required BIOS files must be placed.
  - `pick_core`: Prompts for Libretro core selection when multiple cores are available.
  - `explain_token`: Displays guidance on resolving unexpanded or invalid command tokens.

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
- **Process name**: track processes matching a name. The name comes from the per-game `tracking_process_name` field (set in Edit metadata); when unset, it defaults to the game file stem.

Tracking start delay (0-600 s) and poll frequency (0.5-60 s) are configurable. When a session ends, play time and history record (if tracking is enabled, history keeps the last 500 sessions), progress automation runs, save backups on close and OBS auto-attach fire if enabled, and the TDP restore applies. A session that exits immediately (under 5 seconds) with a nonzero code shows "Session failed" with the exit code and a hint to check the Launch command and emulator install. Restart relaunches the same game with the same stable ID.

Storefront clients (Steam, Heroic, Lutris) can be shut down after a session ends (**Close storefront clients after a session ends**), launched with `-shutdown` or `flatpak kill` depending on how they were installed.

A missing launch command, missing profile, or non-executable game fails before a process is started. Check the detail pane's command and emulator installation when a session fails; see [Troubleshooting](/guides/troubleshooting/).
