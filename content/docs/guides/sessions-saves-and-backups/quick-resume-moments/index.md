---
title: Quick Resume, Moments, and Record That
description: Resume supported emulator sessions, capture play moments, and save local clips and reels.
---

OpenBox 1.11 keeps the context around a session close to the game. **Quick Resume** restores a stored emulator state where the selected adapter supports it; **Moments** bookmark a point in a session; and **Record That** saves a replay-buffer clip or a screenshot fallback.

## Quick Resume

Quick Resume is capability-aware. When a launch adapter has a `state` definition, OpenBox can capture a state at the end of a session and show a **Resume** action in the game detail surface. The state is stored locally under the data directory and is fingerprinted with the adapter/emulator information that produced it.

Current state-capable adapter families include Dolphin, DuckStation, MAME, PCSX2, PPSSPP, RetroArch, RPCS3, and ScummVM. Cemu, Eden, melonDS, Vita3K, xemu, and Xenia currently declare `state: none`; they can still use Moments screenshots and notes, but they do not expose a Quick Resume state. Custom per-game commands and profiles may also be unable to resume even when a related emulator has a state-capable definition.

To use it:

1. Leave **Quick Resume** enabled in Settings → Sessions & Saves.
2. Launch a game through its normal OpenBox profile and end the session normally when possible.
3. Use **Resume** from the game detail pane or call `POST /api/v2/resume` with the stable game id.
4. If the emulator or adapter changed, the state is marked stale. Start clean, or make an explicit decision to allow the stale state through the API; do not treat a stale state as guaranteed compatible.

`state_retention` controls how many archived state files are retained (1–20). Starting a game clean does not silently delete the stored resume state; use **Discard resume state** or `POST /api/v2/resume/discard` when you want to remove it.

## Moments

Press **M** in the desktop library, use the capture action in the pause/recap surface, or create a Moment from the API. A Moment can contain:

- a title, note, trigger, timestamp, and launch id;
- a screenshot captured by the first available local screenshot tool, or a supplied approved media path; and
- an immutable resume snapshot only when Quick Resume is enabled, available, non-stale, and supported by the adapter.

Automatic Moments (first boot, RetroAchievements unlock, progress, and milestones) are controlled by **Moments autocapture**. Screenshot capture is best effort: the note and trigger may still be useful when the host has no screenshot utility. Moment snapshots are copies, not references to the mutable current resume file.

The per-game detail pane's **Moments** tab lists the timeline. Selecting a Moment can resume from that immutable snapshot when its adapter fingerprint and file checks still match. Editing a title or note does not rewrite the captured media.

## Record That

**Record That** is local media capture, not a hosted upload service.

- With **OBS replay** enabled and an authenticated local OBS replay-buffer connection available, **Clip it** asks OBS to save the replay buffer and copies the approved recording into the game's clip gallery.
- Without OBS, OpenBox tries a local screenshot capture and records the clip as a screenshot fallback.
- If neither path is available, the action returns `CLIP_UNAVAILABLE` instead of pretending that a video exists.
- A game keeps a bounded gallery of clips. Existing files are validated as approved local media before they are exposed to the API.

Open the clip gallery from the game's detail pane, the Big Box pause/recap actions, or `GET /api/v2/clips?game_id=GAME_ID`. `POST /api/v2/clips/capture` accepts a stable `game_id` and an optional `launch_id`.

**Highlight reels** combine the game's local cover, clips, and Moments into a deterministic manifest. `POST /api/v2/reels/create` returns `202` and a durable `job_id`; poll the job routes from [Background jobs](/reference/background-jobs/). If `ffmpeg` is available, OpenBox may render an MP4. Otherwise it writes a scrollable local HTML reel. Remote URLs and unapproved paths are ignored.

## Imported memories

Moments are OpenBox-created bookmarks. The optional **memory import** feature brings existing screenshots from Steam, RetroArch, Dolphin, or user-configured folders into a per-game gallery. Enable **Import screenshots** and configure absolute roots in Settings before using **Scan for screenshots now**. The import is queued, bounded, SHA-256 deduplicated, and leaves ambiguous files in an unassigned bucket rather than guessing.

The memory read routes do not scan folders on every request: `GET /api/v2/memories/status` reports the last import state, `GET /api/v2/memories?game_id=GAME_ID` lists a game's imported entries, and `GET /api/v2/memories/media?...` serves an approved local file. `POST /api/v2/memories/import` starts the scan and returns a job id.

## API and deep links

All of the routes in this page are additive authenticated v2 routes. Use `X-OpenBox-Token: TOKEN`; the token grants local read/write access and should not be put in a URL or log. See [API 1.11 additions](/reference/api/one-eleven/) for request and response shapes.

The CLI supports `openbox://resume/GAME_ID`, `openbox://moment/MOMENT_ID`, and `openbox://clip/CLIP_ID`, as well as `openbox --play GAME_ID` for direct launch. See [Command line and deep links](/reference/cli/) and [Keyboard & Controller Shortcuts](/reference/shortcuts/) for the current entry points.
