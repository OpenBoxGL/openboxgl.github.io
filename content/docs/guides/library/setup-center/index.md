---
title: Library Setup Center
description: Guided first-run setup with non-destructive scan previews, candidate resolution, and safe commits.
---

The **Library Setup Center** (`#setupLibraryButton`) provides a safe, guided workflow for importing games, checking emulator readiness, and resolving multi-platform ambiguities before altering your library.

## Workflow Stepper

The stepper runs eight stages: **Overview, Sources, Scan, Decisions, Readiness, Options, Confirm, Finish**.

1. **Overview**: Reviews library health and recommends the next step.
2. **Sources**: Choose game directories, ROM folders, or installed storefronts (Steam, Heroic, Lutris, Faugus).
3. **Scan**: OpenBox performs a read-only inspection (`POST /api/v2/setup/preview`), generating a transient preview document. The scanner reports discovered files and highlights items needing your decision.
4. **Decisions**: Review items in batches (`GET /api/v2/setup/preview/items`), inspect version candidates, resolve ambiguities, and set platform overrides.
5. **Readiness**: Launch Doctor preflight checks flag missing emulators or missing BIOS files with one-click fix buttons.
6. **Options**: Set metadata, media, region, and import behavior for the commit.
7. **Confirm**: Optionally **Revalidate preview** to re-scan sources against the current library, then **Continue** commits the reviewed plan (`POST /api/v2/setup/commit`). All imported items are tagged with an `import_batch_id` for easy filtering.
8. **Finish**: Shows completion counts (added, merged, skipped, unmatched, media/launch readiness, warnings, failed) with actions to view imported games, review unmatched metadata, fix launch blockers, or open the Activity Center.

## Safe by Design

- Previews are side-effect free and never mutate `library.json` until committed.
- Stale-preview guards (`PREVIEW_STALE`) prevent race conditions if underlying files change during review.
- Existing games are matched by canonical identity hashes, preventing duplicates.
