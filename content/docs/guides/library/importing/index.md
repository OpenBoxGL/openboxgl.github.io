---
title: Importing
description: Bring storefronts, executables, ROMs, and arcade sets into one catalog.
---

OpenBoxGL imports from installed storefront manifests, local ROM folders, standalone executables, and arcade DAT catalogs. Every importer reports how many games were found and added; entries that already exist are skipped, so re-running an import never creates duplicates. Imported games keep a stable identity (Steam App ID, Heroic App ID, Lutris ID, Gameyfin ID, or path) so later imports merge into the existing entry instead of adding a second copy.

<Callout type="tip" title="Why re-importing never duplicates">

Each imported game gets a `game_id` derived from a SHA-256 over its *identity* (normalized path, platform, and store ids). The importer computes the same hash on every run, so a game that already exists is recognized and updated, not duplicated. This is also why a game keeps its sessions, saves, queue entries, and history when you reorder or re-import. See [How OpenBoxGL works](/reference/how-it-works/#the-state-store) for the identity model.

</Callout>

## Library Setup Center (Recommended)

Click **Set up library** (`#setupLibraryButton`) in the top bar to launch the guided **Library Setup Center**:

1. **Preview Before Commit**: Setup Center performs a read-only scan of folders and storefronts (`POST /api/v2/setup/preview`). No changes are written to `library.json` until you approve them.
2. **Storytelling Progress**: Scans report discovered games, platforms, and actionable decision counts.
3. **Paginated Review & Candidate Resolution**: Review discovered titles in batches (`GET /api/v2/setup/preview/items`). Resolve shared extensions (e.g. `.iso` matching PS2 or GameCube) with your chosen platform/emulator.
4. **Idempotent Commit**: Confirm your choices (`POST /api/v2/setup/commit`). Imported games receive a unique `import_batch_id` for instant post-import filtering and batch metadata review.

## Direct Folder Import

Click **Import Folder** in the top bar (or **Add Game** for a single entry) and select an absolute path. OpenBoxGL scans recursively by extension and assigns a platform from the extension table:

- `.nes` NES, `.sfc`/`.smc` SNES, `.gba` Game Boy Advance, `.gb` Game Boy, `.gbc` Game Boy Color, `.n64`/`.z64`/`.v64` Nintendo 64, `.nds` Nintendo DS, `.3ds`/`.cia` Nintendo 3DS, `.wbfs`/`.wia`/`.wad` Wii / WiiWare, `.rvz`/`.gcm`/`.gcz` GameCube, `.xci`/`.nsp` Nintendo Switch, `.pbp` PSP, `.vpk` PlayStation Vita, `.xex` Xbox 360, `.cue`/`.chd`/`.ciso`/`.m3u` Disc image
- `.sh`, `.appimage`, `.exe`, `.rom`, `.zip`, `.7z`, `.rar` also import as-is.

### Ambiguous Extension Resolution

Per ADR 0012, shared disc extensions (such as `.iso`) no longer guess platforms silently. OpenBox flags ambiguous multi-platform extensions (`AMBIGUOUS_PLATFORM`) and presents explicit platform candidates for user resolution in Setup Center and Launch Doctor.

When several files share a base name with a `(Disc 1)`, `(Disc 2)`, `(CD 1)`, `(Side A)` style marker, they are grouped into one entry with a generated `.m3u` and the game name without the disc marker. When several files map to the same platform and name, only the best-ranked ROM is imported; the runner-up candidates are kept on the entry as `version_candidates`. Ranking prefers clean regional names (World and USA above Europe, then Japan), penalizes `(Beta)`, `(Proto)`, `(Demo)`, `(Sample)`, `(Unl)`, `(Pirate)`, `(Hack)`, and `(Translation)` tags, favors `.chd`, `.cue`, and `.m3u`, and treats a missing or unreadable file as the worst score.

After a folder scan OpenBoxGL recommends an emulator per detected platform. If exactly one emulator is suggested it is used; if several are, you pick one interactively. Picking one installs it from Flathub and adds its platform profile.

You can also drag a folder onto the **drop zone** ("Drop ROM folders or game files here to import") and confirm the path.

## Steam

Click **Import Steam**. OpenBoxGL reads installed libraries from standard Steam roots: `~/.local/share/Steam`, `~/.steam/steam`, and `~/.var/app/com.valvesoftware.Steam/.local/share/Steam`, plus every library folder listed in `steamapps/libraryfolders.vdf`. It parses `appmanifest_*.acf` files for the App ID, name, and install directory, and launches through `steam -applaunch {app_id}` (or the Flatpak equivalent, falling back to `xdg-open steam://rungameid/{app_id}`).

## Heroic

Click **Import Heroic**. OpenBoxGL reads Epic, GOG, and Amazon manifests from `~/.config/heroic` (or the Flatpak path), plus standalone Legendary installs at `~/.config/legendary`. Entries launch through `xdg-open heroic://launch/{runner}/{heroic_app_id}`. DLC records are skipped.

## Lutris

Click **Import Lutris**. OpenBoxGL runs `lutris --list-games --installed --json` (or the Flatpak variant) and imports installed entries. Entries tagged Xbox or Game Pass become source Xbox; Origin or EA App entries become EA; Ubisoft or Uplay entries become Ubisoft. Each entry keeps its Lutris numeric ID and launches through `lutris:rungameid/{lutris_id}`. Cover art is picked up from Lutris coverart folders when present.

## Faugus Launcher

OpenBox integrates with **Faugus Launcher** (`/api/faugus/*`), scanning native or Flatpak manifests from `~/.config/faugus` or `~/.var/app/io.github.Faugus.Launcher`. It reads installed Wine/Proton games, detects UMU prefix identifiers, and launches via Faugus runners.

## Arcade sets

Click **Import Arcade**, then enter the ROM folder, the source (**MAME** or **FinalBurn Neo**), and optionally a DAT/XML path. Without a DAT file OpenBoxGL runs `mame -listxml` to build the catalog. Imported games are classified as `parent`, `merged`, `split`, or `non-merged` based on whether the parent archive exists and whether the clone's merged ROMs are present in its own archive, and each entry stores its MAME name as `rom_name`. The launch command defaults to `mame -rompath <folder> {rom_name}` for MAME and the detected binary for FinalBurn Neo; you can override it with `{rom_name}` and `{path}` tokens. BIOS and non-runnable machines are skipped.

## ScummVM, RPCS3, Vita3K

From the **Storefronts** dialog: **Import ScummVM** reads `scummvm.ini` and imports each configured game with its section ID as the launch target. **Import RPCS3** reads `dev_hdd0/game` folders and titles from `PARAM.SFO`. **Import Vita3K** reads `ux0/app` folders and titles, preferring the `Title` value from `param.sfo` when it differs from the folder ID.

## Gameyfin

The **Storefronts** dialog configures a Gameyfin server URL, optional username and password, and a local install folder (empty by default; the field shows a `~/Games/Gameyfin` placeholder). **Test Gameyfin connection** lists the server's games and download providers. The catalog marks each title owned or installed; **Import owned / uninstalled** adds owned entries as placeholders with a note, and the Play button on such an entry becomes **INSTALL**, downloading through the configured provider into the install folder. Install staging protects existing files: a failed download keeps the previous copy, and uninstall refuses paths outside the install directory.

## Storefront Manager

The **Storefronts** dialog also browses owned versus installed catalogs for Steam, Heroic, Lutris, and Gameyfin. Steam's owned list comes from `userdata/*/config/localconfig.vdf`; Heroic's from `store_cache` library JSON. **Import installed** and **Import owned / uninstalled** buttons import either set, and the four **Auto-import on startup** checkboxes make the same imports run every launch (a background worker also re-imports watched folders every 10 seconds, backing off to 5 minutes when the library cannot be read). Per-source import exclusions let you keep specific titles out of future rescans.

## Failure recovery

Missing tools and malformed manifests are reported as import errors rather than silently creating unusable entries. A missing Steam binary, missing `xdg-open` for Heroic, or a Lutris list that is not valid JSON all raise a visible error and import nothing. Configure an emulator profile before launching ROMs; see [Emulators and launching](/guides/emulators-and-launching/).

<Callout type="caution" title="Storefront entries without local files">

Storefront imports that mark a title owned-but-uninstalled (`store_installed: false`) create a placeholder entry, its Play button stays disabled (or becomes **INSTALL** for Gameyfin) until the client actually has the game installed. These placeholders are intentional: they let your catalog include your whole owned library ahead of time.

</Callout>

See [Import sources](/integrations/import-sources/) for source-specific paths and [Emulators and launching](/guides/emulators-and-launching/) for profiles.
