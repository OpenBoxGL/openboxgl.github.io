---
title: Activity Center & Durable Operations
description: Monitor running tasks, background operations, cancellations, and restart recovery.
---

OpenBox manages all background operations through the durable **Operation Service** (`pkg/state/operations.py`), backed by `operations.json` in your data directory.

## Features

- **Activity Drawer**: Click the **Activity** button (`#activityButton`) in the top bar to inspect running and historical operations.
- **Real-Time Progress**: Live Server-Sent Events (SSE) stream progress updates, byte counters, and status messages (`GET /api/v2/jobs/events`).
- **Cancellation & Safety**: In-flight operations can be cancelled cleanly without leaving corrupted or half-written states (`POST /api/v2/jobs/{id}/cancel`).
- **Restart Recovery**: If OpenBox is closed or restarted while an operation is running, the task is marked `interrupted`. You can resume or retry it with one click.

## Supported Operations

- **Library Imports**: Folder scanning, archive inspection, and storefront auto-imports.
- **Metadata Synchronization**: LaunchBox Games Database downloads and batch matching.
- **Media Downloads**: Artwork, screenshot, and video fetching.
- **Emulator Management**: Flathub emulator installations and updates.
- **Backups**: Library backup creation and save state archiving.
