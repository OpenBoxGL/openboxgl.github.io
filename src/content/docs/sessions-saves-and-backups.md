---
title: Sessions, saves, and backups
description: Track play and protect library and save data.
---

OpenBoxGL records session history, play count, play time, last played state, and exit outcomes when tracking is enabled. Save discovery and backup actions are available from game details.

Save restores create an automatic `before-restore` snapshot. Library backups use `OpenBoxBackup-*.zip` and can include settings, library, media, plugins, themes, and extension data. Running-game restore is refused. Older library archives require `force`.

Mounted-folder statistics sync uses `openbox-statistics.json` format 1, merges counters by maximum, and resolves progress by newer `last_played`. Deleted local games are not resurrected.
