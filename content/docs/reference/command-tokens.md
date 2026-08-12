---
title: Command tokens
description: Use exact placeholders in emulator and launch profile commands.
---

Launch commands are tokenized strings: OpenBoxGL substitutes exact placeholders into argv, never through a shell. This page documents every token, how substitution works, and the errors you can hit.

## Tokens

`build_launch` (`openbox.py`) replaces these markers in a launch command before splitting it with `shlex.split`:

| Token | Value | Example |
| --- | --- | --- |
| `{path}` | Absolute path to the game file, ROM, or extracted archive member | `/home/you/roms/zelda.nes` |
| `{name}` | Game title from the library entry | `The Legend of Zelda` |
| `{rom_name}` | ROM filename (for example, the MAME set name or archive member name) | `zelda` |
| `{app_id}` | Steam application ID (`steam_app_id` field) | `22380` |
| `{heroic_app_id}` | Heroic application ID (`heroic_app_id` field) | `1091500` |
| `{lutris_id}` | Lutris game identifier (`lutris_id` field) | `1` |

When a game has no per-game `launch` command, the platform profile from `profiles` is used; the emulator definition packs and `discover_profiles` provide defaults such as `dosbox {path}`, `dolphin-emu -b -e {path}`, and `pcsx2-qt {path}`. Per-game `launch_profile` overrides select a different named profile for that game only.

## Substitution behavior

- Each marker is replaced wherever it appears in the tokenized argv parts.
- If a game uses a platform profile (no per-game command) and that command does not contain `{path}`, the resolved path is appended as the final argument.
- A `.sh` file with no command launches as `bash <path>`.
- Paths containing spaces stay intact because substitution happens before `shlex.split` and the resulting parts are passed to `subprocess.Popen` directly without a shell. Quote the marker in your command when the target executable expects a single argument.
- Storefront imports set their own tokenized commands: Steam uses `steam -applaunch {app_id}` (or `flatpak run com.valvesoftware.Steam -applaunch {app_id}`, or `xdg-open steam://rungameid/{app_id}`), Heroic uses `xdg-open heroic://launch/legendary/{heroic_app_id}`, and Lutris uses `lutris:rungameid/{lutris_id}`.

Example:

```ini
[SNES]
command = retroarch -L /usr/lib/libretro/snes9x_libretro.so "{path}"
```

Use quotes where the target command requires them, as above.

## Errors

A launch fails with a validation error before any process starts when:

- The game has no `path` (empty path): `"<name> has no launch path."`
- The configured path no longer exists: `"The configured path no longer exists: <path>"`
- The game has no launch command and its file is not executable: `"<name> has no launch command and its file is not executable. Set a launch command for the platform in Emulator profiles, or per-game in Edit game."`
- A platform profile is missing for a ROM platform: the same no-command error applies.
- An archive extraction fails because `7z`/`7zz` is missing (for non-ZIP archives): `"7z or 7zz is required to extract this archive."`

A missing token value is not an error: an empty field substitutes the empty string. What matters is that the final argv is non-empty and every part is a non-empty string. A plugin that returns an invalid launch command also raises a validation error ("A plugin returned an invalid launch command." / "A plugin returned an invalid working directory.").

## Archive extraction

When `extract_archive` is set on a game, `{path}` resolves to the extracted file inside the cache (`DATA/cache/archives/<digest>/`), not the original archive. ZIP extraction is built-in and bounded (25,000 members, 2 GiB per member, 8 GiB total, no symlinks, no duplicate entries, no `..` paths). 7z and RAR require an installed `7z` or `7zz` binary and are listed and extracted with the same limits. A `.complete` marker makes repeated launches use the cached extraction.
