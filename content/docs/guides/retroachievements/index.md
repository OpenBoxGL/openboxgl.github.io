---
title: RetroAchievements
description: Connect RetroAchievements, match ROMs to achievement sets, and track progress.
---

OpenBoxGL integrates with [RetroAchievements](https://retroachievements.org/) to match your ROMs to achievement sets, show earned and hardcore progress, serve badges, and inject your credentials into emulator configs so emulators enable achievements themselves.

<Callout type="note" title="Why hash-based matching matters">
RetroAchievements matches games by SHA-256 content hash of the ROM file, not by filename or size. That's why two different dumps of "Super Mario Bros" (NES) can have different hashes, they're treated as separate games with separate achievement sets. If a ROM doesn't match any set, try a different dump from No-Intro, Redump, or a well-known source; header-stripping is applied automatically for NES, SNES, N64, Game Boy, Genesis, SMS, GG, Atari 2600/7800, Lynx, and PC Engine.
</Callout>

## What it does

- Matches ROMs to achievement sets by content hash.
- Shows progress per game: earned, hardcore, beaten, mastered.
- Serves achievement badges in the game detail pane.
- Injects credentials into RetroArch, Dolphin, and PCSX2 configs so those emulators can enable achievements during play.

## Set it up

1. **Get credentials.** Create a RetroAchievements account and generate a web API key on your RetroAchievements profile page.
2. **Enter them in Settings > RetroAchievements** (username + web API key), or set the environment variables in `~/.env`:
  - `RETROACHIEVEMENTS_USERNAME` (aliases `RA_USERNAME`, `OPENBOX_RA_USERNAME`)
  - `RETROACHIEVEMENTS_API_KEY` (aliases `RA_API_KEY`, `RETROACHIEVEMENTS_KEY`, `OPENBOX_RA_API_KEY`)
3. Credentials are validated against `API_GetUserProfile.php` before saving and stored in `retroachievements.json` (mode `0o600`).
4. Open a game's detail pane. If its platform supports auto-matching, use the RetroAchievements section to match the ROM.

## Matching

RetroAchievements matching is by ROM hash, so the local file must be the exact ROM the achievement set expects. Hashing supports:

| Platform | Notes |
| --- | --- |
| NES, SNES | Header stripping applied |
| Nintendo 64 | Byte-swapped `.v64`/`.n64` handled |
| Game Boy / Color / Advance |, |
| Sega Genesis / Mega Drive |, |
| Master System, Game Gear |, |
| Atari 2600 / 7800, Lynx | Header stripping applied |
| PC Engine | Header stripping applied |
| Arcade | Matched by set name |

ROMs inside **ZIP and 7z archives** are hashed too (each archive's largest member is capped at 512 MiB, plain ROMs also capped at 512 MiB before hashing; larger files return `400` with `ROM file is too large`). For other platforms, enter a RetroAchievements Game ID manually in **Edit metadata**.

## Playing with achievements

- **Inject credentials** (Settings or the RA section) writes `cheevos_*` settings into RetroArch and the equivalent configs for Dolphin and PCSX2, for both native and Flatpak paths. With credentials injected, RetroArch enables achievements in-game (hardcore mode included) without further setup.
- Progress, earned, hardcore, beaten, mastered, is fetched from the RetroAchievements API and shown per game.
- Badges load from `media.retroachievements.org` on demand and are cached locally.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| `"Configure RetroAchievements first."` | No credentials saved. Add username + API key in Settings or `~/.env` and restart. |
| `"Rejected credentials"` | The username/key did not validate against `API_GetUserProfile.php`. Double-check the API key (it is not your password). |
| No match found for a ROM | The hash does not match a set on RetroAchievements, or the platform is not auto-matched. Verify the ROM is the exact dump; use a different ROM set; or enter the Game ID manually. |
| Achievements not showing in emulator | Run **Inject credentials** after launching once with the emulator, and confirm the emulator's achievements setting is enabled (RetroArch: Settings > Achievements). |
| System/game lists stale | Lists are cached for 7 days under `cache/retroachievements/`. |

## See also

- [Accounts and media](/integrations/accounts-and-media/), credentials and environment variables
- [API saves and operations](/reference/api/saves-and-operations/), `/api/ra/*` routes
- [Configuration](/reference/configuration/), `RETROACHIEVEMENTS_*` environment table
