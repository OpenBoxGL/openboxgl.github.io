---
title: Frontend modules
description: Inventory of the 35 static/ JS modules, entry wiring, and the search worker contract.
---

The web UI ships as `index.html` plus 35 ES modules in `static/` (33 domain modules plus `app.js` and `worker.search.js`), served from `/static/*` with cache headers. `app.js` is the entry point; every other main-thread module imports shared state and helpers from `state.js` / `util.js`.

## Module inventory

| Module | Responsibility |
| --- | --- |
| `app.js` | Entry/boot: wires all domain modules into the shell |
| `state.js` | `AppState`, `api` client, session token, search index (`filteredGames`, trigram helpers) |
| `util.js` | Shared helpers (`$`, `escapeHtml`, controller map, trigram utilities) |
| `library.js` | Library grid rendering, cover grouping, search worker client |
| `router.js` | Hash router for library view state (ADR 0021) |
| `navigation.js` | Keyboard + gamepad navigation for grid and list views |
| `dialogs.js` | Dialog manager (focus trap, Escape to close) |
| `settings.js` | Settings UI |
| `setup.js` | Library Setup Center workflow (preview/commit imports) |
| `imports.js` | Import dialogs (storefronts, ROM folders, arcade DATs, wizards) |
| `media.js` | Media audit, gallery, bulk downloads |
| `metadata.js` | Metadata dialog and batch auto-match |
| `insights.js` | Play Insights dashboard (heatmap, streaks, rankings; lazy-loaded) |
| `activity.js` | Activity Center (durable operations, jobs, SSE progress) |
| `sessions.js` | Sessions and play-history UI |
| `recap.js` | Session recap card and post-session actions |
| `moments.js` | Moments capture, timeline, and resume-from-moment UI |
| `clips.js` | Record That clip gallery and reel actions |
| `bigbox.js` | Big Box kiosk UI (stage/hybrid/coverflow, gamepad, screensaver) |
| `arcaderoom.js` | Controller-friendly Arcade Room and Museum canvas surface |
| `party.js` | Game Night queue, wheel, and round controls |
| `household.js` | Household members, challenges, shares, and leaderboard UI |
| `storefront.js` | Storefront manager (Gameyfin install/download, owned-vs-installed) |
| `constellation.js` | Library relationship graph |
| `picker.js` | “What should I play?” recommendation picker |
| `mood.js` | Adaptive cover theming |
| `mastery.js` | Mastery completion dashboard |
| `wrapped.js` | Printable Year in Games report |
| `timeline.js` | History timeline view |
| `timemachine.js` | Journal timeline, as-of view, and revert preview UI |
| `palette.js` | Ctrl/Cmd-K command palette and shortcut help |
| `whatsnew.js` | What's New panel and local tips |
| `reader.js` | Document/manual reader |
| `i18n.js` | Internationalization (`t(key, params)`, `data-i18n` attributes, locale loading) |
| `worker.search.js` | Off-main-thread trigram search worker (see contract below) |

## Search worker contract (`worker.search.js`)

Trigram expansion runs off the main thread with identical logic to the main-thread index (`util.js` / `state.js` `indexTerms`) so results match either path.

- Worker script: `static/worker.search.js`, spawned by `library.js` via `new Worker('./static/worker.search.js')`.
- Request: `postMessage {id, type, ...}` where `type` is `search` (`{query, games}`), `expand` (trigram expansion), or `warm`.
- Response: `postMessage {id, type: 'search', results, count}` (or `{id, type: 'expand', trigrams}`, `{id, type: 'warm', ok: true}`); unknown types and exceptions return `{id, error}`.
- Fallback: when `Worker` is unavailable, `library.js` uses the main-thread `filteredGames()` / index path directly — same results, main-thread cost.
