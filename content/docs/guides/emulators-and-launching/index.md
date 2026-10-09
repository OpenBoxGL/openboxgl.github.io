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
| `{path}` / `{Path}` / `{ImagePath}` | Absolute game or ROM path (after archive extraction, when enabled) |
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
| `{state_path}` / `{state_dir}` / `{state_config}` / `{state_name}` | Quick Resume state values from the adapter `state:` block (`launch_tokens.py:47-72`); empty for ordinary launch commands |

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

The same dialog lists supported emulators with install state, mode (native or Flatpak), platforms, and per-platform profiles (24 adapter YAML files in `emulator_defs/`):

- Dolphin (GameCube `-b -e {path}`, Wii, WiiWare)
- PPSSPP (PSP `{path}`)
- PCSX2 (PlayStation 2 `-batch {path}`)
- RPCS3 (PlayStation 3 `{path}`)
- Cemu (Wii U `-g {path}`)
- MAME (Arcade `{path}`)
- xemu (Xbox `-dvd_path {path}`)
- ScummVM (`{path}`)
- RetroArch (NES, SNES, Nintendo 64, Game Boy, Game Boy Color, Game Boy Advance, Arcade, Sega Saturn)
- DuckStation (PlayStation `-batch {path}`)
- melonDS (Nintendo DS `{path}`)
- Eden (Nintendo Switch `{path}`)
- Vita3K (PlayStation Vita)
- Xenia (Xbox 360)

**Install** adds the app from Flathub (adding the Flathub remote if missing) and, when done, adds its profiles to the editor (save to apply). **Install all available emulators** and **Update installed emulators** run bulk background jobs with per-emulator status. **Open** launches the emulator standalone. Detected native binaries (DOSBox, wine, mame, dolphin-emu, pcsx2-qt, ppsspp, rpcs3, duckstation-qt, eden) appear as **Add N detected profiles**.

### Authoritative Emulator Registry

Authoritative definitions in `emulator_defs/` map extensions to platforms and startup commands. `GET /api/v2/emulators/registry` provides real-time adapter and compatibility views. Custom user profiles in `library.json` always override registry defaults.

### Emulator definition updates

The 24 definitions in `emulator_defs/` ship inside the application. If a newer emulator build needs a newer definition, OpenBoxGL can now fetch one without you editing YAML by hand (v1.15.0).

**Tools → Emulators** is the home for the channel. This is a top-level entry in the **Tools** menu — not a Settings category; the Emulator profiles dialog it opens also holds the platform profile editor, the handheld performance profiles, and the emulator install catalog. The Emulator definitions panel at the bottom of that dialog shows the installed pack, which definitions you have edited (these are never overwritten), and the three actions: check for an update, install it, and roll it back. Since 1.16.1 each tagged release also publishes a signed [`community-defs.tar.gz`](https://github.com/vindeckyy/OpenBoxGL/releases/tag/emulator-defs) with its signature and an index, and OpenBox checks that release for updates. If no pack is available for you yet, the panel says **No community definition pack is published yet** — that is a normal state, not an error.

How it behaves:

- **Signed, and verified before anything is written.** The archive is verified with the same Ed25519 verifier the application updater uses, against `openbox-release.pub`. A signature failure raises a security notification rather than being skipped quietly.
- **All or nothing.** The pack is fetched, verified, parsed, and validated in full before a single file lands.
- **Local wins.** The pack installs into your per-user data directory and shadows the bundled set; it never overwrites the bundled definitions, and a definition you already have is kept as-is. Rollback removes exactly what the channel installed and restores the bundled set.
- **Retractions are honored.** If a newer pack stops shipping a definition the previous one installed, the old file is removed rather than left shadowing the bundled set.
- **No restart needed.** A definition update refreshes the emulator list, the platform map, and the folder-import extension list in place, so a newly added definition is recognized on the next scan.

The API equivalents are `GET /api/v2/emulators/defs/status` (what is installed, what is local, whether anything is available), `GET`/`POST /api/v2/emulators/defs/update` (check, then install), and `POST /api/v2/emulators/defs/rollback`. They are additive `/api/v2` routes; the v1 surface is unchanged.

### Emulator-def schema

Each `emulator_defs/*.yaml` file uses these fields (example: `emulator_defs/dolphin-gamecube.yaml`):

| Field | Meaning |
| --- | --- |
| `schema_version` | Def format version (currently `1`) |
| `adapter_id` | Unique adapter id (e.g. `dolphin-gamecube`) |
| `emulator_id` | Backend id, usually the Flatpak app id |
| `label` | Display name (e.g. `Dolphin`) |
| `platform` | Platform name (e.g. `GameCube`) |
| `extensions` | ROM extensions this adapter claims (`gcm`, `gcz`, `rvz`, …) |
| `native_exe` | Native binary name (`dolphin-emu`) |
| `flatpak_app_id` | Flatpak app id (`org.DolphinEmu.dolphin-emu`) |
| `startup_args` | argv template; `{path}` is replaced with the game path (`-b -e {path}`) |
| `recommended` | Whether this adapter is the recommended default |
| `priority` | Precedence when several adapters match (higher wins) |
| `executable_patterns` | Binary names detected as native installs |
| `bios_path` | Expected BIOS file or directory checked by Launch Doctor (with optional SHA1 drift detection), e.g. `~/.config/PCSX2/bios` |
| `firmware_path` | Expected firmware directory checked by Launch Doctor, e.g. `~/.config/rpcs3/dev_flash` |
| `core_path` | libretro core path for RetroArch-family adapters, e.g. `/usr/lib/libretro/fceumm_libretro.so` |
| `state` | Quick Resume block (`kind`, `template`, `capture`, `glob`) declaring how the adapter saves/restores state files; `template`/`capture` may use the `{state_path}`, `{state_dir}`, `{state_name}`, and `{state_config}` tokens (v1.11.0+) |

## Archive extraction

A game with **Extract archive before launch** enabled is extracted at launch time into `<data-dir>/cache/archives`. ZIP extraction is native and strictly validated: at most 25,000 members (`MAX_ARCHIVE_MEMBERS`), 2 GiB per member (`MAX_ARCHIVE_MEMBER_BYTES`), 8 GiB total (`MAX_ARCHIVE_TOTAL_BYTES`), no absolute or `..` paths, no duplicate entries, no symlinks or device nodes, and no symlinked destination; the listing itself is capped at 16 MiB (`MAX_ARCHIVE_LISTING_BYTES`). 7z and RAR need `7z` or `7zz` on PATH, which first validates the listing with the same limits. The largest non-artwork file becomes the launch target unless **Archive member** names one; extraction is cached per archive (content-addressed) with a `.complete` marker, so re-launches reuse the cache. A failed extraction raises before any process starts. Snapshot copies use `O_NOFOLLOW` to avoid replacement races.

<Callout type="caution" title="Why the safe extractor refuses things">

The extraction limits exist because a malicious or malformed archive is the one place untrusted bytes enter the filesystem. The extractor refuses symlinks, `..` paths, device nodes, and oversized members *by design*; a "cannot extract" error here means the archive violated a safety rule, not that the extractor is broken. Do not bypass it, repackage the archive.

</Callout>

## Launch Doctor & Preflight Checks

Launch Doctor (`POST /api/v2/launch/preflight` and `POST /api/v2/launch/preflight/batch`) inspects game readiness before any process spawns:

- **Executable & Path**: Verifies that files exist on disk and have executable permissions.
- **Emulator Readiness**: Checks for required emulators (`EMULATOR_REQUIRED`) or ambiguous platform extensions (`AMBIGUOUS_PLATFORM`).
- **BIOS & Firmware**: Checks required system files (e.g. DuckStation `scph1001.bin`, PCSX2 BIOS, RPCS3 `dev_flash`, RetroArch system assets). When an emulator definition includes an expected SHA1 hash for a BIOS file, Launch Doctor computes the file's SHA1 and reports `BIOS_SHA1_DRIFT` if it doesn't match — catching corrupted or wrong-version BIOS files before launch (v1.7.2+). For definitions pointing to a BIOS directory, checks directory existence and non-empty status.
- **Structured Fix Actions (`fix_action`)**: When a preflight check fails, Launch Doctor presents structured remedy buttons directly in the UI:
  - `flatpak_install`: One-click button to install the missing Flathub emulator.
  - `reveal_bios_path`: Opens or displays the target directory where required BIOS files must be placed.
  - `pick_core`: Prompts for Libretro core selection when multiple cores are available.
  - `explain_token`: Displays guidance on resolving unexpanded or invalid command tokens.

### Check every game (v1.16.0)

Launch Doctor answers "why won't *this* game launch?". **Check every game** answers "which of my games will not launch, and why?" for the whole library.

Open **Library health** and press **Check every game**. OpenBox runs the same Doctor over every game in the background — you can keep using the app and cancel at any time. The audit is read-only and never changes your library.

- **Problems come back grouped by cause.** Rather than 412 separate "won't launch" entries, you see one line: **RetroArch is not installed — 412 games**. That single line tells you the real problem and that fixing that one thing fixes all 412 games. Groups are causes, not games.
- **One click for a missing emulator.** When the cause is an emulator that isn't installed, the group has an **Install** button that installs it once for every game waiting on it.
- **A summary at the top** shows how many games are ready, how many have warnings (no cover art, no save folder set), and how many are blocked and will not start.
- **The games behind each cause.** Open a group to page through its games, then click one to jump straight to it; its details panel shows the full Launch Doctor result for that game.
- **Fast, even on huge libraries.** Each emulator is looked up once rather than once per game, so a 20,000-game library is checked in seconds rather than an hour. The audit also runs on the scheduled library check (daily or weekly), so a report is usually already there.
- **It tells you when it is out of date.** If you add or remove games after a check, OpenBox says the results describe an older version of your library and suggests running it again.
- **Optional deep mode.** Deep mode also looks inside zipped ROMs and checks BIOS files against their expected versions. It is off by default because it reads every file and takes longer.

### Launch badges and group fixes (v1.16.1)

After an audit, a blocked game shows a **Won't launch** badge on the grid and a warning game shows **Needs attention**. The badges come from the cached audit and disappear when the library has changed since it ran, so a stale report is never shown. Settings → Appearance has a switch to turn them off.

When a group shares one fix — one Flatpak grant, one emulator install — the group gets **one button for all of them**, and afterwards only that group's games are checked again. A missing-file group gets a **Find moved files** button that opens the repair wizard limited to its games.

### Flatpak folder access (v1.16.1)

A Flatpak emulator that cannot see a folder used to be reported as "not installed", and the suggested fix was a reinstall — which cannot grant access. The Launch Doctor now offers **Grant access** instead. After you confirm it runs:

```bash
flatpak override --user --filesystem=<folder>:ro <app-id>
```

**Remove access** reverses it until OpenBox restarts. The grant is read-only, and the home folder itself cannot be granted. The exact command is still shown with a Copy button. See [Flatpak installation](/install/#flatpak) for the packaging basics.

### Choosing a RetroArch core per game (v1.16.1)

The Launch Doctor's **Choose a RetroArch core** lists the cores actually installed on this machine, and the game launches with the one you pick. **Use the default core** restores the definition's choice. The per-game choice applies on Windows as well as Linux, and resume states record it.

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

## Related guides

- [Wine and Proton](/guides/wine-and-proton/) — Windows games through Wine and Proton, prefix management, and the Eden Switch.
- [Big Box and handhelds](/guides/big-box-and-handhelds/) — fullscreen kiosk layouts, controller navigation, and gamescope tuning.
- [Troubleshooting launching](/guides/troubleshooting/launching/) — when a launch fails before or after a process starts.
