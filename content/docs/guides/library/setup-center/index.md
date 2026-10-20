---
title: Library Setup Center
description: Guided first-run setup with non-destructive scan previews, candidate resolution, and safe commits.
---

The **Library Setup Center** (`#setupLibraryButton`, reached from **Add games → Guided setup…`) provides a safe, guided workflow for importing games, checking emulator readiness, and resolving multi-platform ambiguities before altering your library. It opens on a **six-step quick path** and leaves two expert stages behind a **Show advanced options** toggle, so a first run never starts with a dashboard to interpret.

## Workflow Stepper

The quick path is **Where are your games? → Check what we found → Review matches → Choose emulators → Import games → You're done**. **Welcome** and **Artwork & details** appear only when **Show advanced options** is on; turning it off returns to the quick path at the Sources step. The stepper shows the current step as *Step N of 6* (or of 8 with advanced options) and a one-line explanation of what the step does.

1. **Welcome** (advanced): Reviews library health and recommends the next step.
2. **Sources**: Choose game directories, ROM folders, or installed storefronts (Folder, Steam, Heroic, Lutris, Gameyfin, plus the secondary sources such as Faugus).
3. **Check what we found** (Scan): OpenBox performs a read-only inspection (`POST /api/v2/setup/preview`), generating a transient preview document identified by `preview_id` at `revision` 1. The scanner reports discovered files and highlights items needing your decision.
4. **Review matches** (Decisions): Review items in batches (`GET /api/v2/setup/preview/items` with the `preview_id`/`revision` cursor), inspect version candidates and per-candidate `emulator_choices`, resolve ambiguities, and set platform overrides via decisions. The items cursor is bound to one preview revision — a stale cursor stops with `PREVIEW_STALE`.
5. **Choose emulators** (Readiness): the launch check preflight checks (`POST /api/v2/launch/preflight` for one game, `POST /api/v2/launch/preflight/batch` for many) flag missing emulators or missing BIOS files with one-click fix buttons.
6. **Artwork & details** (Options, advanced): Set metadata, media, region, and import behavior for the commit.
7. **Import games** (Confirm): Optionally **Revalidate preview** (`setup.revalidate`) to re-scan sources against the current library — this bumps the preview `revision` and marks it revalidated — then **Continue** commits the reviewed plan (`POST /api/v2/setup/commit` with `preview_id`, `revision`, and decisions). All imported items are tagged with an `import_batch_id` for easy filtering. Since 1.16.0 the Confirm step also **counts the candidates still waiting on a decision**: a game the wizard could not resolve is left undecided rather than imported on a guess, so the server's unresolved-candidate guard applies and nothing enters your library that the wizard said needed your attention.
8. **You're done** (Finish): Shows a completion **summary** (added, merged, skipped, unmatched, media/launch readiness, warnings, failed) with actions to view imported games, review unmatched metadata, fix launch blockers, or open the Activity Center.

## Safe by Design

- Previews are side-effect free and never mutate `library.json` until committed.
- Stale-preview guards (`PREVIEW_STALE`) prevent race conditions if underlying files change during review.
- Existing games are matched by canonical identity hashes, preventing duplicates.
