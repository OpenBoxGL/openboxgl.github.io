---
title: Updating
description: Update AppImage installations and understand package boundaries.
---

The built-in updater handles AppImage releases from GitHub. It verifies the SHA-256 checksum, downloads trusted release assets, replaces the active AppImage, and keeps a `.previous.AppImage` rollback file.

Flatpak, source, and system installations follow their own package or source workflow. They are not updated by the AppImage updater.

Keep a library backup before major changes. See [Library backups](/reference/library-backups/) and [Data and recovery](/reference/data-and-recovery/).
