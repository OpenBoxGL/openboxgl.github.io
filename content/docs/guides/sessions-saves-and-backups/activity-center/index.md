---
title: Activity Center & Durable Operations
description: Monitor running tasks, background operations, cancellations, and restart recovery.
---

OpenBox manages all background operations through the durable **Operation Service** (`pkg/state/operations.py`), backed by `operations.json` in your data directory.

## Features

- **Activity Drawer**: Click the **Activity** button (`#activityButton`) in the top bar to inspect running and historical operations.
- **Real-Time Progress**: Live Server-Sent Events (SSE) stream progress updates, byte counters, and status messages (`GET /api/events`).
- **Cancellation & Safety**: In-flight operations can be cancelled cleanly without leaving corrupted or half-written states (`POST /api/v2/jobs/cancel` with `job_id` in the JSON body).
- **Restart Recovery**: If OpenBox is closed or restarted while an operation is running, the task is marked `interrupted`. You can resume or retry it with one click.

## Supported Operations

- **Library Imports**: Folder scanning, archive inspection, and storefront auto-imports (`storefront.auto_import`).
- **Metadata Synchronization**: LaunchBox Games Database downloads and batch matching (`metadata.db_sync`, `metadata.match_preview`, `metadata.apply`).
- **Media Downloads**: Artwork, screenshot, and video fetching (`media.bulk_download`, `media.cleanup`, `media.memories_import`).
- **ScreenScraper and SteamGridDB**: hash scraping and artwork jobs (`screenscraper.match`, `screenscraper.apply`, `steamgrid.match`, `steamgrid.apply`).
- **Library Export**: JSON/CSV projections queued as durable jobs (`library.export`).
- **Clips and Reels**: local reel creation (`clips.reel`).
- **Emulator Management**: Flathub emulator installations and updates.
- **Backups**: Library backup creation and save state archiving.
