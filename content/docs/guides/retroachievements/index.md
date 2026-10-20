---
title: RetroAchievements
description: Connect RetroAchievements, match ROMs to achievement sets, and track progress.
---

OpenBoxGL integrates with [RetroAchievements](https://retroachievements.org/) to match your ROMs to achievement sets, show earned and hardcore progress, serve badges, and inject your credentials into emulator configs so emulators enable achievements themselves.

<Callout type="note" title="Why hash-based matching matters">
RetroAchievements matches games by content hash of the ROM or disc image, not by filename or size: MD5 for most cartridge and disc formats, Dolphin's SHA-1 for RVZ images, and the rcheevos TMD/content layout for WiiWare WADs. That's why two different dumps of "Super Mario Bros" (NES) can have different hashes, they're treated as separate games with separate achievement sets. If a ROM doesn't match any set, try a different dump from No-Intro, Redump, or a well-known source; header-stripping is applied automatically for NES, SNES, Atari 7800, Lynx, and PC Engine, and N64 byte order is normalised for `.v64` and `.n64` dumps.
</Callout>

## What it does

- Matches ROMs to achievement sets by content hash.
- Shows progress per game: earned, hardcore, beaten, mastered.
- Serves achievement badges in the game detail pane.
- Injects credentials into RetroArch, Dolphin, and PCSX2 configs so those emulators can enable achievements during play.

## Set it up

1. **Get credentials.** Create a RetroAchievements account and generate a web API key on your RetroAchievements profile page.
2. **Enter them in Tools → RetroAchievements account** (username + web API key), or set the environment variables in `~/.env`:
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
| Game Boy / Color / Advance | — |
| Sega Genesis / Mega Drive | — |
| Master System, Game Gear | — |
| Atari 2600 | Raw image hashed |
| Atari 7800, Lynx | Header stripping applied |
| PC Engine | Header stripping applied |
| Arcade | Matched by set name |
| Wii / WiiWare | `.wad` files are hashed with the rcheevos TMD/content layout RetroAchievements expects |
| GameCube / Wii | `.rvz` disc images are hashed through `dolphin-tool` |
| PlayStation | `.chd` images are hashed from their first data track through `chdman` |
| Multi-disc sets | A `.m3u` playlist resolves to its first existing disc image, relative to the playlist |

ROMs inside **ZIP and 7z archives** are hashed too (each archive's largest member is capped at 512 MiB, plain ROMs also capped at 512 MiB before hashing; larger files return `400` with `ROM file is too large`). For other platforms, enter a RetroAchievements Game ID manually in **Edit metadata**.

### Disc and playlist formats

- **M3U**: the first non-comment line that names an existing disc wins. Relative entries resolve beside the playlist; quoted entries are accepted. If no disc exists you get `"The M3U playlist does not reference an existing disc image."`
- **CHD (PlayStation)**: requires `chdman` on `PATH`. OpenBox runs `chdman extractcd` into a temporary directory and hashes the first data track, because RetroAchievements hashes the disc image data rather than the CHD container. A missing tool reports `"chdman is required to hash this game's format."`; CHD hashing is refused for non-PlayStation platforms.
- **RVZ (GameCube/Wii)**: requires `dolphin-tool` on `PATH`. OpenBox asks for Dolphin's SHA-1 (`dolphin-tool hash -a sha1`) and uses it as the content hash. A missing tool reports `"dolphin-tool is required to hash this game's format."`; RVZ hashing is refused outside GameCube/Wii.
- **WAD (WiiWare)**: hashed in-process using the TMD table and each content, mirroring rcheevos' `rc_hash_wiiware`; no external tool is needed. The platform must be Wii or WiiWare.

Both tools are optional: only the matching format needs them, and every other platform keeps working without them.

## Playing with achievements

- **Inject credentials** (Settings or the RA section) writes `cheevos_*` settings into RetroArch and the equivalent configs for Dolphin and PCSX2, for both native and Flatpak paths. With credentials injected, RetroArch enables achievements in-game (hardcore mode included) without further setup.
- Progress, earned, hardcore, beaten, mastered, is fetched from the RetroAchievements API and shown per game.
- Badges load from `media.retroachievements.org` on demand and are cached locally.
- **Provider totals and source filters.** The achievement tabs show every source a game has — RetroAchievements, Steam, and `plugin:<id>:<source>` — with each provider's earned/total counts. The library's smart filters can include or exclude an **Achievement source**, so "Steam games I have achievements in" is one rule.
- **Manual overrides.** Edit metadata can set earned/total for a source by hand (`POST /api/v2/achievements/override`); an override is marked `manual` and persists until cleared. Totals must satisfy `0 <= earned <= total <= 10000`.
- **Independent refresh.** Achievement tabs refresh Steam and plugin sources independently of RetroAchievements (`POST /api/v2/achievements/refresh` with `{game_id, source}`). Steam refresh re-reads the Steam Web API; plugin refresh reruns that plugin's `stats` hook. RetroAchievements uses its own match route, so a Steam refresh never re-hashes ROMs.

### Steam achievements and playtime

Steam is a second achievement source, not a RetroAchievements feature. With a Steam Web API key and 64-bit Steam ID saved under **Settings → Metadata & Media → Steam account**, OpenBox imports owned-game playtime and achievement totals. `POST /api/v2/integrations/steam/refresh` queues the playtime/last-played merge as a durable job; achievement totals for one game refresh through `POST /api/v2/achievements/refresh` with `source: "steam"`. The merge is monotonic: `playtime_seconds` takes the larger of the local and Steam values, and `last_played` only moves to a newer Steam timestamp, so importing again can never lower either value. Steam achievements are cached per app id for 24 hours under `cache/steam/`.

## Troubleshooting

| Problem | Cause / fix |
| --- | --- |
| `"Configure RetroAchievements first."` | No credentials saved. Add username + API key in Settings or `~/.env` and restart. |
| `"RetroAchievements rejected those credentials."` | The username/key did not validate against `API_GetUserProfile.php` (HTTP `401`/`403` or a profile without a `User`). Double-check the API key (it is not your password). |
| No match found for a ROM | The hash does not match a set on RetroAchievements, or the platform is not auto-matched. Verify the ROM is the exact dump; use a different ROM set; or enter the Game ID manually. |
| `"chdman is required to hash this game's format."` | Install `chdman` (MAME tools) and make sure it is on `PATH`; only PlayStation `.chd` files need it. |
| `"dolphin-tool is required to hash this game's format."` | Install `dolphin-tool` (Dolphin) and make sure it is on `PATH`; only GameCube/Wii `.rvz` files need it. |
| `"The M3U playlist does not reference an existing disc image."` | The playlist's disc paths are missing or point outside the playlist folder; fix the `.m3u` so one listed disc exists. |
| Achievements not showing in emulator | Run **Inject credentials** after launching once with the emulator, and confirm the emulator's achievements setting is enabled (RetroArch: Settings > Achievements). |
| System/game lists stale | Lists are cached for 7 days under `cache/retroachievements/`. |

## See also

- [Accounts and media](/integrations/accounts-and-media/), credentials and environment variables
- [API saves and operations](/reference/api/saves-and-operations/), `/api/ra/*` routes
- [Configuration](/reference/configuration/), `RETROACHIEVEMENTS_*` environment table
