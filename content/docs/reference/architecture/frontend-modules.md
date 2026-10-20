---
title: Frontend modules
description: Inventory of the 51 static/ JS modules, entry wiring, and the search worker contract.
---

The web UI ships as `index.html` plus 51 ES modules in `static/` (49 domain modules plus `app.js` and `worker.search.js`), served from `/static/*` with cache headers. `app.js` is the entry point; every other main-thread module imports shared state and helpers from `state.js` / `util.js`.

## Module inventory

| Module | Responsibility |
| --- | --- |
| `activity.js` | Activity Center (durable operations, jobs, SSE progress) |
| `app.js` | Entry/boot: wires all domain modules into the shell |
| `arcaderoom.js` | Controller-friendly Arcade Room and kiosk canvas surface |
| `battery.js` | Big Box battery indicator (browser API first, Linux sysfs bridge second) |
| `bigbox.js` | Big Box kiosk UI (stage/hybrid/coverflow, gamepad and pointer input, screensaver) |
| `clips.js` | Record That clip gallery and reel actions |
| `constellation.js` | Library relationship graph |
| `defs.js` | Settings > Emulators: check, install, and roll back the signed definition pack |
| `details.js` | Popped-out game details window: URL detection, geometry memory, and opening |
| `dialogs.js` | Dialog manager (focus trap, Escape to close) |
| `dna.js` | Game DNA smart-search toggle, results panel, and why-chips |
| `emulators.js` | Shared emulator-settings form helpers |
| `events.js` | The tab's single server-sent event stream (`/api/events`) with backoff retry |
| `gamepad.js` | Unified gamepad rAF poll loop shared by every controller surface |
| `health.js` | Library health score card, breakdown dialog, and fix queue |
| `help.js` | Help & shortcuts dialog with start, glossary, and shortcut tabs |
| `household.js` | Household members, challenges, shares, and leaderboard UI |
| `i18n.js` | Internationalization (`t(key, params)`, `data-i18n` attributes, locale loading) |
| `imports.js` | Import dialogs (storefronts, ROM folders, arcade DATs, wizards) |
| `insights.js` | Play Insights dashboard (heatmap, streaks, rankings; lazy-loaded) |
| `library.js` | Library grid rendering, cover grouping, search worker client |
| `mastery.js` | Mastery completion dashboard |
| `media.js` | Media audit, gallery, bulk downloads, and media queue |
| `metadata.js` | Artwork & details dialog and batch auto-match |
| `model3d.js` | CSS-only 3D cover models (box, jewel, cassette) and rotation |
| `moments.js` | Moments capture, timeline, and resume-from-moment UI |
| `mood.js` | Adaptive cover theming |
| `navigation.js` | Keyboard and gamepad navigation for grid and list views |
| `netplay.js` | RetroArch netplay lobby browser |
| `osk.js` | Big Box on-screen keyboard |
| `palette.js` | Ctrl/Cmd-K command palette and shortcut help |
| `party.js` | Game Night queue, wheel, and round controls |
| `picker.js` | "What should I play?" recommendation picker |
| `plugin_form.js` | JSON-Schema subset renderer for plugin settings forms |
| `pointer_nav.js` | Pointer, wheel, trackball, and spinner navigation for Big Box |
| `pure.js` | DOM-free helpers exercised directly by `node --test` |
| `reader.js` | Document/manual reader |
| `recap.js` | Session recap card and post-session actions |
| `router.js` | Hash router for library view state (ADR 0021) |
| `sessions.js` | Sessions, play-history, and save-management UI |
| `settings.js` | Settings UI |
| `setup.js` | Library Setup Center workflow (preview/commit imports) |
| `sfx.js` | Theme sidecar music and navigation sounds |
| `state.js` | `AppState`, `api` client, session token, search index (`filteredGames`, trigram helpers) |
| `storefront.js` | Storefront manager (Gameyfin install/download, owned-vs-installed) |
| `timeline.js` | History timeline view |
| `timemachine.js` | Journal timeline, as-of view, and revert preview UI |
| `util.js` | Shared helpers (`$`, `escapeHtml`, controller map, trigram utilities) |
| `whatsnew.js` | What's New panel and local tips |
| `worker.search.js` | Off-main-thread trigram search worker (see contract below) |
| `wrapped.js` | Printable Year in Games report |

## Search worker contract (`worker.search.js`)

Trigram expansion runs off the main thread with identical logic to the main-thread index (`util.js` / `state.js` `indexTerms`) so results match either path.

- Worker script: `static/worker.search.js`, spawned by `library.js` via `new Worker('./static/worker.search.js')`.
- Request: `postMessage {id, type, ...}` where `type` is `search` (`{query, games}`), `expand` (trigram expansion), or `warm`.
- Response: `postMessage {id, type: 'search', results, count}` (or `{id, type: 'expand', trigrams}`, `{id, type: 'warm', ok: true}`); unknown types and exceptions return `{id, error}`.
- Fallback: when `Worker` is unavailable, `library.js` uses the main-thread `filteredGames()` / index path directly — same results, main-thread cost.
