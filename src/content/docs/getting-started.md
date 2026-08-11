---
title: Getting started
description: Import one local executable and launch it safely.
---

This path is for a first run with a local executable folder. Use a disposable folder if you are testing, so the experiment cannot touch real games.

The goal is a full loop: install, import one game, see it in the library, launch it, and confirm the session was recorded. It also proves the data model works: the entry you import is the entry that launches, and the session you play is the session that appears in history.

## Before you start

- Follow [Installation](/install/) and start the Web UI. You should see the three-column workspace: filters on the left, an empty cover grid in the center, and the detail pane on the right.
- Make one folder containing a single executable `.sh` file. For a realistic first test, use a short script like this:

```bash
#!/bin/bash
echo "OpenBox launch works" && sleep 3
```

Make it executable (`chmod +x`). A non-executable file with no launch command is the most common first-launch failure, and the app now reports it explicitly instead of silently failing.

The Web UI workspace looks like this once you have a library entry — filters on the left, the cover grid in the center, and the selected game's detail pane on the right:

![The OpenBox Web UI showing the library grid, filter rail, and game detail pane](/openbox-screenshot.png)

## Steps

1. **Install and start the Web UI.** From the AppImage, Flatpak, or source as described on the [Installation](/install/) page. When the library is empty, the welcome wizard appears; you can close it and use the topbar buttons, or start from its **Import a ROM or game folder** step.

2. **Choose Import Folder.** Click **Import Folder** in the topbar (or the wizard's folder step). The web UI asks for the absolute path of the folder to import. Because the browser cannot browse your filesystem, you type or paste the path, for example `/home/you/test-game`.

3. **Select a folder containing one executable `.sh` file.** The import scans the folder for supported files (`.sh`, `.appimage`, `.exe`, `.iso`, `.rom`, common console extensions, and archives), checks each against existing library entries so nothing is duplicated, and adds what is new. If the import also finds a known emulator on your system, it may offer to install or configure a profile; with a plain `.sh` file, nothing extra is needed.

4. **Confirm the imported title in the library.** A grid card appears with the game's name. The detail pane on the right shows the launch path, the platform, and empty metadata fields that you can later fill from the LaunchBox Games Database or edit by hand.

5. **Open the game card to view its details.** Selecting the card opens its detail pane: the launch command, the launch profile for its platform, per-game overrides, save locations, and history stay together here. This is also where you review or fix a launch failure.

![The game detail pane with metadata, launch controls, save management, and history](/openbox-game-detail.png)

6. **Select PLAY and watch the session result.** PLAY runs the game's launch command without a shell. For a `.sh` file, that means `bash <path>`. A lifecycle overlay appears ("Starting"), the process starts, and after it exits, the overlay reports the outcome: either "Session ended, play time and history were saved" for a clean exit, or the actual exit code for a failure. The session is recorded with start time, duration, and exit status.

## Expected result

- One library entry, visible as a card in the grid.
- One completed session in the History view with a non-zero-free exit code and a play time of a few seconds.
- `play_count` incremented and `playtime_seconds` grown on the game card.

ROMs are the deliberate exception: they require a configured platform emulator profile before they can launch. An `.nes` file with no emulator profile produces a launch validation error until you set one, by design, so nothing half-configured ever runs.

## Common failures and recovery

### The game is missing after import

Check the folder path you typed. The import resolves `~` but does not guess; a wrong path imports nothing and reports it. Re-run Import Folder with the correct absolute path. Existing entries are never duplicated, so re-importing the same folder is safe.

### PLAY is disabled or launch fails with a validation error

Open the game detail view. The message tells you which part is missing:

- **"has no launch command and its file is not executable"**: make the file executable (`chmod +x`), or set a launch command for the platform in Emulator profiles, or set one per game under Edit game. This check runs before anything spawns, so no half-started process is left behind.
- **"The configured path no longer exists"**: the imported file was moved or deleted. Point the game at the new path under Edit game, or re-import the folder.
- **"Set a launch command for the platform"**: the platform has no profile. See [Emulators and launching](/guides/emulators-and-launching/).

### The session reports a failure

An immediate exit with a non-zero code reports "Session failed" with the exit code and a hint to check the launch command and emulator install. If your test script exits 0, the session is recorded as a normal end. If you never see the lifecycle overlay at all, check that the browser tab still holds the current token (closing and reopening the tab on the same server is fine; starting a second server instance opens a new token, and the old tab keeps working because the token lives in the URL).

### The browser did not open

Run the entry point from a terminal. OpenBoxGL prints `http://127.0.0.1:PORT/?token=...` and you can open that URL yourself. The server binds to loopback only; nothing is exposed to the network.

### I imported the wrong folder

Removing an entry is safe: select the game and use **Remove game** in the detail pane. Removal can optionally delete that game's media files, but it never deletes your game files on disk.

## Data safety during this walkthrough

Every change the walkthrough makes is contained in the data directory:

- The import appends one entry to `library.json`.
- The launch appends one session to the history in the same file.
- Writes are atomic, owner-only, and go through the last-known-good `.bak` copy, so an interrupted write cannot corrupt the library.

Nothing is sent anywhere: no account, no telemetry, and no network traffic unless you click a metadata or media action. If you used a disposable folder, removing the entry leaves the data directory back where it started.

## Next steps

- [Importing](/guides/library/importing/) for Steam, Heroic, Lutris, ROM folders, and arcade sets.
- [Emulators and launching](/guides/emulators-and-launching/) for command tokens and platform profiles.
- [Interfaces and data](/interfaces-and-data/) for where every file lives.
- [Metadata and media](/guides/metadata-and-media/) for enrichment after the first import.
