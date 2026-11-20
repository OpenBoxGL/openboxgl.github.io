---
title: Command tokens
description: Use exact placeholders in emulator and launch profile commands.
---

Launch commands are tokenized strings: OpenBoxGL substitutes exact placeholders into argv, never through a shell. This page documents every token, how substitution works, and the errors you can hit.

## Tokens

The Rust launch engine resolves the command in `crates/openbox-emulators/src/defs.rs` (`resolve_launch`) and applies tokens in `tokens.rs` (`build_launch_args`). The Python `openbox.py` / `crates/openbox-emulators` / `crates/openbox-emulators/src/tokens.rs` path is the `OPENBOX_BACKEND=python` fallback. The command is split with the platform's quoting rules first: POSIX shell quoting on Linux and macOS, and Windows command-line quoting on Windows. Markers are then replaced inside each resulting argument:

| Token | Value | Example |
| --- | --- | --- |
| `{path}` (aliases `{Path}`, `{ImagePath}`) | Absolute path to the game file, ROM, or extracted archive member | `/home/you/roms/zelda.nes` |
| `{dir}` (alias `{Dir}`) | Parent directory containing the game file or ROM | `/home/you/roms` |
| `{file}` (alias `{File}`) | Filename with extension | `zelda.nes` |
| `{stem}` (alias `{FileNameWithoutExtension}`) | Filename without extension | `zelda` |
| `{name}` (alias `{Name}`) | Game title from the library entry | `The Legend of Zelda` |
| `{platform}` (alias `{Platform}`) | Platform name | `NES` |
| `{rom_name}` | ROM filename (for example, the MAME set name or archive member name) | `zelda` |
| `{app_id}` | Steam application ID (`steam_app_id` field) | `22380` |
| `{heroic_app_id}` | Heroic application ID (`heroic_app_id` field) | `1091500` |
| `{lutris_id}` | Lutris game identifier (`lutris_id` field) | `1` |
| `{EmulatorDir}` | Parent directory of the resolved emulator executable | `/usr/bin` |
| `{retroarch_core}` | Core file name the game uses (v1.16.1+), expanded from the emulator definition before anything else. Set by choosing a per-game core in Launch check, or left empty to use the definition's default. The per-platform `emulator_platform_settings` override is applied by the Python fallback only; the Rust launch engine does not consume it yet. | `snes9x_libretro.so` |
| `{DataDir}` | OpenBox user data directory | `/home/you/.local/share/openbox-game-launcher` |

`{Path}` is a plain alias of `{path}` and substitutes the same value. The append heuristic is case-insensitive, so `{Path}` is recognised and the path is not appended a second time.

### Quick Resume state tokens (v1.11.0+)

Emulator-def `state:` templates can use these additional tokens, resolved per game when a Quick Resume state is saved or restored. They are meaningless in an ordinary launch command and substitute empty there:

| Token | Value | Example consumer |
| --- | --- | --- |
| `{state_path}` | Absolute path of the emulator state file OpenBox manages for the game | Dolphin `--save_state={state_path}`, PPSSPP `--state={state_path}` |
| `{state_dir}` | Per-game directory OpenBox manages for state files | MAME `-state_directory {state_dir}` |
| `{state_name}` | State name OpenBox assigns inside the state directory | MAME `-state {state_name}` |
| `{state_config}` | Path to the generated adapter config fragment (RetroArch auto-save into `state_dir`, command net enabled) | RetroArch `--appendconfig {state_config}` |

When a game has no per-game `launch` command, resolution walks the precedence chain: a matching emulator adapter from `emulator_defs/` first, then the platform profile from `profiles`, then platform detection. The definition packs and `discover_profiles` provide defaults such as `dosbox {path}`, `dolphin-emu -b -e {path}`, and `pcsx2-qt {path}`. A per-game `launch_profile` is applied by the Python fallback only; the Rust launch engine does not consult it yet, so use a per-game command or adapter when you need a specific profile. See [Emulators and launching](/guides/emulators-and-launching/#launch-precedence-hierarchy) for the full five-level order.

## Substitution behavior

- Each marker is replaced wherever it appears in the tokenized argv parts. An unrecognized `{...}` marker is not passed through verbatim: settings and launch-profile validation reject it, so a typo fails at save time rather than reaching the emulator command line.
- If a game command or platform profile does not contain `{path}`, `{ImagePath}`, `{app_id}`, `{lutris_id}`, or `{heroic_app_id}`, the resolved path is appended as the final argument. Matching is case-insensitive, so `{Path}` counts.
- A `.sh` file with no command launches as `bash <path>` (or `sh` when `bash` is unavailable).
- Paths containing spaces stay intact because substitution happens per-argument after the command is split with POSIX shell quoting (Linux/macOS) or Windows command-line quoting, and the resulting parts are spawned directly without a shell. Quote the marker in your command when the target executable expects a single argument.
- Storefront imports set their own tokenized commands: Steam uses `steam -applaunch {app_id}` (or `flatpak run com.valvesoftware.Steam -applaunch {app_id}`, or `xdg-open steam://rungameid/{app_id}`), Heroic uses `xdg-open heroic://launch/legendary/{heroic_app_id}`, and Lutris uses `lutris:rungameid/{lutris_id}`.
- After substitution, OpenBox applies emulator settings when the emulator is managed: MAME flags are inserted before the final ROM argument, and a RetroArch `--appendconfig` file is attached before the final ROM argument. A platform's extra launch arguments are then appended last. See [MAME and RetroArch settings](/guides/emulators-and-launching/#mame-and-retroarch-settings).

Example:

```ini
[SNES]
command = retroarch -L /usr/lib/libretro/snes9x_libretro.so "{path}"
```

Use quotes where the target command requires them, as above.

## Errors

A launch fails with a validation error before any process starts when:

- The game has no `path` (empty path): `"<name> has no launch path."`
- The configured path no longer exists: the message is `"The configured path no longer exists:"`, then a newline, then the path.
- No command resolves — no per-game command, matching adapter, or platform profile — and the file is not executable. The Python fallback raises `"<name> has no launch command and its file is not executable. Set a launch command for the platform in Emulator profiles, or per-game in Edit game."`; the Rust engine falls through to a direct spawn and reports the OS spawn error instead.
- An archive extraction fails because `7z`/`7zz` is missing (for non-ZIP archives): `"7z or 7zz is required to extract this archive."`

A missing token value is not an error: an empty field substitutes the empty string. The `before_launch` plugin hook is part of the Python fallback; the Rust 3.0 server does not currently invoke it, so a `before_launch` plugin does not alter a Rust launch.

## Archive extraction

When `extract_archive` is set on a game, `{path}` resolves to the extracted file inside the cache (`DATA/cache/archives/<digest>/`), not the original archive. ZIP extraction is built-in and bounded (25,000 members, 2 GiB per member, 8 GiB total, no symlinks, no duplicate entries, no `..` paths). 7z and RAR require an installed `7z` or `7zz` binary and are listed and extracted with the same limits. A `.complete` marker makes repeated launches use the cached extraction.
