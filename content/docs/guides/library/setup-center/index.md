---
title: Library Setup Center
description: Guided first-run setup with non-destructive scan previews, candidate resolution, and safe commits.
---

The **Library Setup Center** (`#setupLibraryButton`) provides a safe, guided workflow for importing games, checking emulator readiness, and resolving multi-platform ambiguities before altering your library.

## Workflow Stepper

1. **Sources & Scan Selection**: Choose game directories, ROM folders, or installed storefronts (Steam, Heroic, Lutris, Faugus).
2. **Preview Scan**: OpenBox performs a read-only inspection (`POST /api/v2/setup/preview`), generating a transient preview document.
3. **Storytelling Progress**: The scanner reports discovered files and highlights items needing your decision (e.g. "Found 342 games - 12 need your pick").
4. **Paginated Review**: Review items in batches (`GET /api/v2/setup/preview/items`), inspect version candidates, and set platform overrides.
5. **Emulator Readiness**: Launch Doctor preflight checks flag missing emulators or missing BIOS files with one-click fix buttons.
6. **Safe Commit**: Click **Finish & commit** (`POST /api/v2/setup/commit`) to import the resolved games. All imported items are tagged with an `import_batch_id` for easy filtering.

## Safe by Design

- Previews are side-effect free and never mutate `library.json` until committed.
- Stale-preview guards (`PREVIEW_STALE`) prevent race conditions if underlying files change during review.
- Existing games are matched by canonical identity hashes, preventing duplicates.
