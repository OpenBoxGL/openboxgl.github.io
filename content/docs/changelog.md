---
title: Changelog
description: Release notes for OpenBox, from the latest release back to the first build.
sidebar: false
---

## 1.16.1 (2026-10-08) — Launch readiness everywhere

A fix release on the [1.16.0](#1160-2026-10-05--make-it-true) line. It finishes launch readiness, adds launch definitions for 18 more systems, and keeps the library live and responsive. No route is removed or changed. Five routes are added: `GET /api/v2/launch/audit/status`, `POST /api/v2/launch/grant`, `POST /api/v2/launch/grant/undo`, `GET /api/v2/launch/cores`, and `POST /api/v2/launch/core`. See [API 1.16 additions](/reference/api/one-sixteen/).

- **Launch readiness on the grid:** after a Launch Audit, a game it found blocked shows a **Won't launch** badge and one it found with warnings shows **Needs attention**. The badges come from the cached audit and disappear when the library has changed since the audit ran, so a stale report is never shown. Settings → Appearance has a switch to turn them off.
- **The Launch Audit runs on the library health schedule** (daily or weekly), so the badges follow the library without a setting of their own, and one notice reaches the notification feed when the blocked or warning totals change.
- **Group fixes and a scoped relink:** a group of games that share one Flatpak grant or one emulator install gets one button for all of them, and after a grant only that group's games are checked again — the merged result equals a full audit. A missing-file group gets a **Find moved files** button that opens the repair wizard limited to its games.
- **Choose the RetroArch core for one game:** the Launch Doctor's **Choose core** lists the installed cores, the game launches with the one you pick, and **Use the default core** restores the definition's. The choice now applies on Windows too.
- **A Flatpak emulator without folder access is no longer told to reinstall.** The Launch Doctor offers **Grant access**, which runs `flatpak override --user --filesystem=<folder>:ro <app>` after you confirm; **Remove access** reverses it until OpenBox restarts. The grant is read-only, the home folder itself cannot be granted, and the exact command is still shown with a Copy button.
- **Every system out of the box:** launch definitions for 18 more systems — RetroArch cores for Genesis, Master System, Game Gear, Sega CD, PC Engine, Neo Geo Pocket, Atari 2600, 7800, Lynx, Jaguar, WonderSwan, Virtual Boy, C64, MSX, and Amiga, plus standalone Dreamcast (Flycast), 3DS (Azahar), and MS-DOS (DOSBox Staging). Definitions use **schema 2**, and a pack written for a newer schema is refused with the version it needs.
- **Disc images ask which system they belong to.** `.bin`, `.cue`, and `.iso` files that several systems share wait for a platform choice in the import wizard instead of being guessed at, and a file cannot import until it has one.
- **Always live and fast:** one live connection per tab that every live feature shares (the server accepts 16 at a time, so a busy tab could previously be refused and lose updates), a search that no longer moves the panels below it, and a session event stream that reopens when the page is shown again.
- **Safer with your data:** a stale edit window can no longer overwrite a neighbouring game — a request naming a stable game id that no longer exists is refused. **Removing imported Steam games is undoable:** it moves them to the Trash with their position and playlist memberships instead of deleting outright, and the Trash's 200 entries are never evicted to make room. **Plugins trusted before this release need one re-approval**, because the trust check now covers file boundaries that the old checksum did not. **Recovery points stop getting lost:** a snapshot queued before a full save is now discarded by that save rather than being written over it, a mutation that raises no longer leaves its change half-applied in memory, a file changed by another process is no longer treated as the last commit, and snapshot rotation prunes in listing order — so the *newest* recovery point can no longer be the one deleted when modification times tie.
- **Fixed:**
  - Flatpak probes could hang a request; the status, open, setup, and install probes now give up after 5 s and count the emulator as not installed, and the two Windows `taskkill` calls are bounded too.
  - "Played recently" missed last-played values written with `Z` or an offset; all date rules now compare in local time through one parser, and a bulk edit rejects a value it cannot read rather than silently hiding the game from every date rule.
  - **Retry failed** in the media manager is now a button, enabled only when a download has failed games.
  - A failed setting save rolls back and says why instead of looking applied; startup storefront imports name the sources that failed.
  - Emulator Health no longer shows buttons that do nothing: the BIOS button reveals the folder where the host can, and a missing core or firmware is stated instead of offered as a dead button.
  - Both preflight endpoints reject a body that is not a JSON object, and two no-op launch-token validation blocks were removed.
  - Unescaped bridge ids on the Linux host: an id with an apostrophe, backslash, or line break no longer breaks the call and leaves the page's promise pending. The Windows host received the same fix.
  - The native window now starts in the active theme's colour instead of the dark default.

## 1.16.0 (2026-10-05) — Make it true

Two questions every big library raises now have a one-click answer: **will my games actually launch?** and **what will restoring this backup do?** This release answers both, closes several security holes, and fixes a long list of places where OpenBox said one thing and did another.

- **Find every game that won't launch, before you try it.** Open **Library health** and press **Check every game**. OpenBox runs the Launch Doctor over your whole library in the background; you can keep using the app and cancel at any time. Problems come back grouped by cause, so rather than 412 separate "won't launch" entries you see one line — **RetroArch is not installed — 412 games** — and fixing that one thing fixes all 412. A missing-emulator cause gets an **Install** button, a summary at the top counts ready, warning, and blocked games, and each group pages through the games behind it. It is read-only, fast on huge libraries because each emulator is looked up once rather than once per game, and it tells you when its results are out of date. Deep mode, which also looks inside zipped ROMs and checks BIOS files, is optional. See [Emulators and launching](/guides/emulators-and-launching/#check-every-game-v1160).
- **See what a restore will do before you do it.** In **Backups**, choose **Preview changes** next to any backup. OpenBox shows the games that would be removed, the games that would come back, and for each game that would change exactly which fields differ with your value and the backup's side by side. A line says whether your settings would move too, and long lists show true totals such as "showing 200 of 1,340". The **Restore** button only appears after a preview has loaded successfully; if it cannot load you get a **Retry** button and no way to restore. See [Sessions, saves, and backups](/guides/sessions-saves-and-backups/#preview-a-restore-before-you-restore).
- **Know when a game didn't start.** A game that closed the moment it opened used to look exactly like one you had played and quit. OpenBox now reads the exit code: an almost-immediate error exit shows **Session failed** with the code and a pointer to the launch command and emulator install, a longer run that errored shows **Session ended**, and a normal exit still shows "Play time and history were saved". The same information reaches webhooks, which also get a separate flag when a session ended because it timed out.
- **Imports you can trust.** Games the wizard cannot resolve — such as an unknown platform — now wait for your decision instead of being imported on a guess, and the final confirmation step counts how many are still waiting. Your own `.m3u` playlists are never overwritten by a generated one. LaunchBox and ES-DE imports ask first, showing how many games will be added, how many merged into games you already have, and how many entries are in the plan; the review list says when it is showing only the first 50.
- **Safer by default — upgrade if you are on 1.15.x or older.** These fixes are not backported, and 1.15.x is no longer supported: a crafted request could read any `.json` file on your computer including the settings file holding your metadata provider keys; a tampered ROM name in a high-score bundle could write outside the high-score folder; sandboxed plugins could read your library and settings if you had moved the data folder with `OPENBOX_DATA_DIR`; game names in the Wrapped report were inserted unescaped; and a third-party Python package that happened to be installed could change how your library was saved. See [Security](/policies/security/).
- **Fixed:**
  - **Playtime landing on the wrong game.** If you deleted a game while it was still running and then restarted OpenBox, those hours were added to whichever game happened to be last in your library. No game's playtime changes when the game it belongs to is gone.
  - **Changes lost during a cloud sync.** An edit made while a cloud sync was in progress could be overwritten when the sync finished; your edit and the synced changes are now merged.
  - **Dialogs closing abruptly.** Escape and backdrop clicks closed most dialogs instantly, without their closing animation, and left focus nowhere in particular. Every dialog now closes smoothly however you close it, and focus returns to the button that opened it.
  - **Notifications erasing each other.** A second notification arriving while one with an **Undo** button was showing could remove that button before you clicked it. Notifications now stack up to three at a time, each keeps its own button, and they pause while your mouse is over them or one is focused.
  - **Half-finished emulator-definition updates** now roll back completely if anything fails.
  - **Controller stops after alt-tab**, **the command palette launching a different game than the one highlighted**, and **session cards showing another game's cover** are all fixed.
  - **Big Box video and music** now stop and reset when Big Box closes instead of looping for the rest of the session.
  - **Searches.** Searching for just `-` emptied the library view and quoted phrases could be split apart; both are fixed. Searches matching more than 20,000 games now say they are showing only part of the results instead of silently cutting them off.
  - **Endless spinners.** If the server stopped responding, some screens spun forever; requests now give up after 60 seconds and tell you.
  - **The Constellation view** could freeze the page while laying out with reduced motion on, and its spinner never stopped if loading failed; it now works in short steps and shows an error.
  - **The Arcade Room** no longer closes when you cancel a launch, so you stay in the room with nothing launched. **Time Machine** no longer stops working after a quick double-click on **Load more**, and clicking a platform in the **Mastery** view now filters your library to that platform instead of doing nothing. **Timeline** covers load again — entries were asking for the cover of a game that no longer existed, so they came up blank.
  - **The museum-mode PIN prompt** now waits progressively longer after each failed or dismissed attempt instead of reappearing forever.
  - **Bulk-accepting metadata matches** now says that nothing was accepted, and why, instead of failing silently.
  - The **ScreenScraper credential aliases** are fixed: setting `OPENBOX_SCREENSCRAPER_*` names was accepted but ignored, leaving a provider that reported itself unconfigured.

### Corrections to 1.15.0

The [1.15.0 entry](#1150-2026-09-29--finish-the-surface) described four behaviours that had shipped as documentation only. They are corrected here rather than by editing that entry, and each is now backed by a gate that fails if the behaviour goes away.

- **"Every dialog now plays an exit"** held only when a dialog closed through JavaScript. Pressing Escape or clicking the backdrop bypassed that path, so 21 of 29 dialogs snapped shut and dropped keyboard focus to the page body. Every close path now routes through one exit point.
- **"An Undo toast is never overwritten"** was true of one element with several writers, so a second notification could destroy the first one's Undo button. A single owner now raises toasts, up to three at a time, each keeping its own button and pausing its timer while hovered or focused.
- **Definition-channel atomicity** did not hold on failure, so a failed definition update could leave a partly written set and a ledger that disagreed with it. Updates are now prepared in full and rolled back completely if anything fails.
- **The reduced-motion gate** accepted a module that read motion settings in either of two ways, so a module using neither still passed. It is now an AND over a reviewed list, and one helper is the only motion read.

[Full OpenBox 1.16.1 release notes](https://github.com/vindeckyy/OpenBoxGL/releases/tag/v1.16.1) · [Compare v1.16.0...v1.16.1](https://github.com/vindeckyy/OpenBoxGL/compare/v1.16.0...v1.16.1) · [1.16 API reference](/reference/api/one-sixteen/)

[Full OpenBox 1.16.0 release notes](https://github.com/vindeckyy/OpenBoxGL/releases/tag/v1.16.0) · [Compare v1.15.0...v1.16.0](https://github.com/vindeckyy/OpenBoxGL/compare/v1.15.0...v1.16.0) · [1.16 API reference](/reference/api/one-sixteen/)

## 1.15.0 (2026-09-29) — Finish the surface

The features that arrived without a screen finally have one, and the ones that had a screen got fixed. Motion respects your system setting, the light theme is readable, and nothing hides behind a dialog.

- **Motion that respects you:** dialogs now animate out as well as in, switching themes cross-fades instead of snapping, covers reserve their space and fade in rather than collapsing and jumping, and typing in search no longer replays the whole grid's entrance. Every duration and easing is a token, and one `prefers-reduced-motion` block zeroes all of them, so a system "reduce motion" setting makes the whole interface static — including the Game Night wheel, the Constellation layout, and the page header, which previously kept animating. The busy button state shows an ellipsis instead of a frozen spinner. See [Themes](/themes/#motion-and-reduced-motion).
- **A light theme you can actually read:** Harbor Light had white text on white inputs, card titles, and the active nav item, and insight cards were dark on dark. Text now uses semantic ink tokens (`--ink-strong`, `--on-active`, `--on-danger`, `--border-input`, `--state-hover`, `--state-press`), and a contrast matrix in the test suite now checks every theme rather than trusting each one to be right.
- **High Contrast theme:** a sixth stock theme, built by redeclaring every `:root` token at maximum contrast — 21:1 body text and AAA foregrounds. It ships with OpenBox; see [Themes](/themes/).
- **Toasts that stay put:** notifications now render in the browser's top layer, so they sit above dialogs and Big Box instead of behind them, and an **Undo** toast is never overwritten by a message that arrives while it is showing. Screen readers hear them through a separate always-present live region.
- **Emulator definition updates:** Settings → Emulators can check for, install, and roll back a signed community definition pack. The pack is verified with the release Ed25519 key before a single file is written, installs into your data directory where it shadows the bundled set without overwriting it, and a signature failure raises a security notification instead of failing quietly. A definition you already have is never clobbered, and rollback removes exactly what the pack installed. Until a pack is published the panel says so plainly — it is not an error. See [Emulators and launching](/guides/emulators-and-launching/#emulator-definition-updates).
- **Time Machine Compare:** a new Compare tab in Tools → Time Machine. Pick one date or two and see which games were added, removed, and changed, field by field, with true totals ("showing 200 of 1,340") and a warning when the start date predates the kept history. It is read-only, and revert stays exactly as bounded as before. See [Library Time Machine](/guides/library/time-machine/#compare-two-points-in-time).
- **Settings → About:** the version you are running, the platform, your data folder, and whether OpenBox is in its native window or a browser tab — read from the same host report the window itself uses. See [Windows](/windows/#which-window-am-i-using).
- **Windows uninstaller:** `scripts/uninstall.ps1` removes exactly what the installer creates — the install tree and its rollback copy, the user `PATH` entry, the Start Menu shortcut, and the `openbox://` registration. Your library and settings are never touched, and `-WhatIf` previews the whole thing. See [Windows](/windows/#uninstall).
- **Better for everyone:** the card grid is announced as a list with the real size and position of every card; Big Box, its menu, the pause panel, and the screensaver announce themselves as dialogs; job rows expose their progress; the result count is a live region; touch targets are larger; forced-colors system themes get outlines; and the "No games match this view" state has a **Clear filters** button.
- **Story PNG export:** a per-game Story card can be exported as a PNG, rendered entirely in the browser with no new endpoint and no new dependency.
- **Fixed:**
  - The light theme opened dark on some starts; the last theme is now remembered and applied before the page paints.
  - A circular import could leave the library empty on a cold start in some browsers.
  - The Constellation layout kept computing after its dialog closed, and ignored the reduced-motion setting.
  - Covers collapsed to zero height and jumped on load; the box is reserved and a failed cover falls back to the title tile.
  - Lightbox arrows jumped about 17 px on mouse-down, and busy buttons blanked their label instead of trailing a spinner.
  - The workspace clipped between 1101 and 1119 px wide.

[Full OpenBox 1.15.0 release notes](https://github.com/vindeckyy/OpenBoxGL/releases/tag/v1.15.0) · [Compare v1.14.0...v1.15.0](https://github.com/vindeckyy/OpenBoxGL/compare/v1.14.0...v1.15.0)

## 1.14.0 (2026-09-22) — Library intelligence

The library starts looking after itself: a health score that names every problem, artwork that can be repaired in one batch, a search that understands what you mean, and a personal backlog layer that is yours rather than the database's.

- **Library health score:** a 0–100 score with five weighted dimensions — file integrity 35, duplicates 20, artwork 20, metadata 15, launch readiness 10. Every deduction names the games behind it. The audit dialog gains a health card and a per-dimension breakdown, each with a **Fix all in this dimension** queue that previews first and stays undoable, a Big Box health tile with re-scan, and a scheduled rescan (daily, weekly, on startup, or off; default weekly) that skips an active game session. See [Organizing](/guides/library/organizing/#library-health-score-v1140).
- **Artwork Doctor:** scans the library for missing covers, missing game or media files, low-resolution and wrong-aspect artwork, and duplicate images, then fixes them all with SteamGridDB in one cancelable batch. Every replacement records which provider it came from, and the whole batch is undoable.
- **Repair missing files:** a wizard scans for missing game and media paths, matches them against a folder you pick, and relinks only the matches that are still missing — anything that changed since the scan is skipped rather than guessed at.
- **Duplicate merge:** duplicate detection now groups identity, path, and title collisions, and the merge preview picks the record with the most play history, unions media and list fields, and moves the absorbed entries to the Trash so a merge is reversible. The health dialog's dedupe button opens it.
- **Game DNA search:** the sidebar search box gains a **Title | Smart** toggle (default Title, remembered). Smart mode is fully offline — BM25 plus a curated 151-concept lexicon in English, German, Spanish, French, and Portuguese, with 1024-dimensional feature hashing — and shows "why" explanation chips next to each hit. **More like this** is available from the details pane, the card context menu, and Big Box. There is no AI cloud and nothing is downloaded; the index is a local sidecar file excluded from sync.
- **Plugins 2.0:** per-plugin checksum-bound trust instead of a global toggle, Android-style permission prompts at install and enable time (a `network` permission is what grants `--share-net`), per-plugin settings forms generated from a manifest JSON Schema subset (text, number, boolean, enum, password) and delivered to hooks as `payload["settings"]`, a `library_source` importer hook that merges plugin games into the library behind a source badge, a single `events` lifecycle hook (`app_startup`, `app_shutdown`, `scan_finished`, `playtime_milestone`, `game_added`, `game_removed`, `game_updated`), a catalog browser tab with per-entry Install/Update, and plugin commands in the command palette under the `>` prefix. Plugin API v1 is frozen: manifests declare `api_version` and a newer version is refused with an error rather than guessed at. See [Plugins guide](/guides/plugins/).
- **Backlog management:** every game gets a personal backlog layer on top of the existing progress field. Status shows as "Unplayed" wherever it is unset; "Abandoned" covers the dropped case. The query grammar gains `progress:unplayed`, `my 4 stars`, `unrated by me`, and `myrating:4` as their own clause kinds, distinct from the metadata `rating` predicates. A personal star rating (`user_rating`, 0–5, separate from the metadata rating) gets hover stars on cards and in details, a card badge, a "My rating" sort, a "My rating" bulk field, and picker weighting that favors highly-rated unplayed games with a stated reason. Manual playtime sessions (date, seconds, note) can be logged, edited, and deleted from the details pane and count toward stats and totals, while streaks still count observed sessions only. Notes are dated entries with add/edit/delete. An optional one-time **Mark as Playing?** prompt on first launch can be switched off in Settings and never sets progress silently.
- **Effortless metadata:** the setup wizard's Options step gains **Automatically match metadata and download media after import** (on by default) plus per-provider opt-ins for ScreenScraper, IGDB, and SteamGridDB (all off by default). One import queues exactly two jobs: an offline LaunchBox match preview plus the opted-in hash and exact-title passes, then media for confidently matched games and a SteamGridDB fill for whatever is still missing. Every provider respects its own budget, and one game's failure never aborts a pass. Settings live at `GET`/`POST /api/v2/metadata/scrape-settings`; unchecking every media type runs match-only.
- **ScreenScraper ROM-hash confidence:** an independent MD5-only and a CRC32-only lookup must agree on the same ScreenScraper game id before anything is applied automatically. Weaker evidence stays review-only, and `/api/v2/screenscraper/match` accepts `apply_confident` for bulk runs.
- **Thumbnail chooser:** every LaunchBox, SteamGridDB, and ScreenScraper search result now offers a **Thumbnails** button that opens a chooser with all image candidates grouped by media kind, so you can pick exactly the one you want instead of the provider's top pick. A chosen URL is only downloaded when it matches a candidate the provider returned for that record, so a client cannot make the server fetch an arbitrary URL.
- **Big Box boot and on-screen keyboard:** a **Start in Big Box mode** checkbox in Settings → Big Box (`bigbox_start_at_launch`) and a `--bigbox` flag open the UI straight into Big Box, so a Deck or HTPC boots into the shelf instead of the desktop grid. The hybrid search field has a d-pad-navigable QWERTY and symbols keyboard that types into the existing filter and sits on the gamepad loop just below the pause overlay.
- **Steam Bridge artwork:** bridged games are no longer grey tiles in Steam Game Mode. Cached SteamGridDB artwork is copied into your Steam grid directory after the shortcuts are applied — cover to capsule, background to hero, clear logo to logo. Original bytes are copied as-is with no resize, skips are reported, and nothing is ever written outside a detected Steam account directory.
- **Information card:** a "Time to beat" fact, validated `http:`/`https:` fact values rendered as safe links, and a Links row that derives the Steam store and custom website URLs.
- **Fixed:** the Big Box pause overlay trapped gamepad users — the pad kept driving the grid behind it, A launched the highlighted game, and B killed Big Box entirely. The overlay now owns the pad while it is open. Attract mode can no longer start over the pause panel or the Game Night overlay, and opening the pause overlay for a game with no documents no longer crashes. The three per-surface gamepad poll loops are unified into one `requestAnimationFrame` loop in `static/gamepad.js` that dispatches each frame to the highest-priority active surface, with no change to input behavior.

[Full OpenBox 1.14.0 release notes](https://github.com/vindeckyy/OpenBoxGL/releases/tag/v1.14.0) · [Compare v1.13.1...v1.14.0](https://github.com/vindeckyy/OpenBoxGL/compare/v1.13.1...v1.14.0) · [1.11 API reference](/reference/api/one-eleven/) · [1.12 API reference](/reference/api/one-twelve/)

## 1.13.1 (2026-09-22) — Fixes

The Windows release had sharp edges that made several everyday paths dead ends. This is the sweep that removes them; no new features.

- **Dialogs opened invisibly.** The utility dialogs — prompt, choice, confirm, and the Trophy Case — were rendered inside a `hidden` wrapper, so every path prompt and every confirmation was a silent dead end, including the unsaved-changes guard on the game editor. Clicking outside a nested dialog also closed *every* open dialog rather than only the topmost, which could dismiss the whole setup wizard mid-flow.
- **Setup wizard:** source tiles used emoji icons that render as tofu boxes without an emoji font (now monograms), a selected source was never highlighted, duplicates piled up with no way to remove one, completed steps were not clickable, "More sources" collapsed on every re-render, the scan-empty message told you to start a scan that had already run, the raw preview hash was shown on Confirm, and Finish offered actions that do nothing on an empty import. The wizard also re-opened on every library refresh while the library was empty; dismissing it now holds for the session.
- **Library and navigation:** the empty library hid "Start your library" below a full screen of empty insight widgets, so the insights panel now stays hidden until the library has games. Big Box on an empty view showed only a fleeting toast and now explains the prerequisite and opens the setup wizard. "View imported games" after a scan landed on an empty library because the batch id was stored but never projected into the payload. Setup wizard Readiness rows and Activity Center job titles showed raw candidate and job hashes instead of the detected title. "Scan all save paths" reported a bogus updated count and now points at the Activity Center, where the queued scan reports real progress.
- **Editor and settings:** saving with a required field on a hidden tab failed silently and now jumps to the invalid field. Switching tabs with a dirty form no longer prompts "Discard unsaved changes?" when nothing is discarded. Prev/Next navigation no longer appears while adding a new game. The Media tab showed about 22 path rows at once; the 16 rarely used media types are behind a "Show more media types" toggle that auto-expands when the game already has values there. "Hidden sidebar sections" is a checkbox group instead of a comma-separated free-text field, and hiding a section now hides its grid and not just its header. Play Insights no longer pushes the grid below the fold at short viewports, and the Activity badge no longer renders "0" before the job stream connects.
- **Session and reliability:** reloading the page dropped the session token and forced a fresh sign-in, so it is now kept in `sessionStorage` for the tab's lifetime. A malformed or rejected message on the native WebView2 bridge used to leave the frontend promise hanging forever; it now rejects so the UI can surface the error. When every server-sent-event subscriber slot was taken the server opened a stream that only ever sent heartbeats; it now answers `503 SSE_BUSY` with `Retry-After`. Reconnecting leaked the previous `EventSource`, and a hidden tab could send state-changing requests with stale state and overwrite newer state written by the visible tab — mutations from hidden tabs are now blocked and close on hide.
- **Windows specifics:** "Reveal in Explorer" never opened anything because the command line passed to `CreateProcessW` had no `explorer.exe` first token. A failed Start Menu or protocol registration left a half-registered installation behind; the installer now restores the previous installation tree. Static JS and CSS were served `immutable` for a year, so app updates could run stale modules until the cache expired; app statics now send `no-cache` and rely on the ETag.
- **Time and locale:** late-night moments were filed under the wrong day in the Story view and the history timeline, because timestamps were not converted to the viewer's local day before grouping. Six user-visible strings were never translated and now go through i18n in all five locales.
- **Reliability:** utility dialogs created lazily now share the same focus-restoration wiring as dialogs in the page markup, clicking outside a dialog routes through the shared close path, and every Setup Center open path goes through the single refresh-and-render entry point so reopening the wizard never shows stale content.

[Full OpenBox 1.13.1 release notes](https://github.com/vindeckyy/OpenBoxGL/releases/tag/v1.13.1) · [Compare v1.13.0...v1.13.1](https://github.com/vindeckyy/OpenBoxGL/compare/v1.13.0...v1.13.1)

## 1.13.0 (2026-09-19) — Windows

OpenBox runs natively on Windows x86_64 alongside Linux. The runtime is unchanged: standard library only (plus `ctypes` on Windows), no `pip install`, no `requirements.txt`, no virtualenv.

- **Native Windows host:** `native_host.exe` renders the same UI over the loopback server through WebView2 and exposes the same `window.openboxNative` bridge the page already uses. It remembers window geometry, provides the tray icon and minimize-to-tray, handles `openbox://` deeplinks, enforces a single instance per data directory through a named pipe (a second launch focuses the running window), shuts the server down gracefully on close, and force-kills the process tree through a job object if it does not exit. The WebView2 runtime is present on Windows 11 and most Windows 10 systems. The release ships the host compiled: the portable zip carries `native_host.exe`, and the same binary is attached to the release on its own as `OpenBox-x86_64-windows-native-host.exe` (with `.sha256` and `.sig`) so a source checkout gets the native window without the MSVC toolchain. `powershell -File scripts/build_native_host_windows.ps1` still builds it from `native_host_win.c` next to `web_app.py` for anyone compiling it themselves (Visual Studio Build Tools with the C++ workload; WebView2 SDK from the NuGet cache or from nuget.org). `OPENBOX_NATIVE_HOST` overrides the host binary path. Without `native_host.exe` the launchers open the same UI in the browser app window, so Windows works out of the box.
- **Windows launchers:** `openbox.cmd` is the double-clickable wrapper, `openbox.ps1` runs the ladder (native window, else browser app window; `--web` forces the browser), and `openbox-native.ps1` runs the native host or falls back. Python is located as `python.exe` or `py.exe` on `PATH`, or through `OPENBOX_PYTHON`; `OPENBOX_SHARE` points the launchers at the runtime directory.
- **Verified Windows installer:** the release asset `install.ps1` (`scripts/install.ps1`) runs on Windows PowerShell 5.1 with the standard library only — it needs neither curl nor OpenSSL — and follows the same verification ladder as the Linux installer: it fetches `openbox-release.pub`, checks its SHA-256 against a pinned bootstrap anchor (unless `-PublicKeyPath` is given), then verifies the archive's `.sha256` sidecar and its Ed25519 `.sig` before extracting.
- **Install layout:** `OpenBox-x86_64-windows.zip` (with its `.sha256` and `.sig`) is a portable zip of the full source tree under one top-level `OpenBox/` folder. `-InstallDir`, or `OPENBOX_INSTALL_DIR`, defaults to `%LOCALAPPDATA%\OpenBox`; the runtime lands in `<InstallDir>\share\openbox` and the previous tree is kept at `<InstallDir>\share\openbox.previous` for rollback. The installer registers a Start Menu shortcut and the `openbox://` protocol handler, and adds the bin root to the *user* PATH unless `-NoPathUpdate` is given.
- **Windows data directory:** `%LOCALAPPDATA%\openbox-game-launcher`, overridable with `OPENBOX_DATA_DIR`; the layout matches Linux — `library.json`, `server.token`, `server.port`, media, backups, themes, and logs.
- **Verified Windows updates:** the in-app updater checks the same key pin, SHA-256, and Ed25519 signature in pure Python (no OpenSSL), downloads `OpenBox-<arch>-windows.zip`, and swaps the installed tree; the previous tree stays in place for rollback.
- **Windows emulator support:** every bundled emulator definition carries its Windows executable name, so adapter detection, resume state, and Launch Doctor work with Windows builds (Dolphin, RetroArch, PCSX2, RPCS3, Cemu, melonDS, PPSSPP, Vita3K, xemu, Xenia, and the rest).
- **Platform seam and CI:** `pkg/platform_compat.py` holds the platform differences and uses only the standard library, plus `ctypes` on Windows. A new `windows-latest` CI job runs beside the Linux jobs.

**Fixed**

- Process liveness no longer probes with `os.kill(pid, 0)` — that call terminates the target on Windows — so reattaching to or shutting down a running game no longer kills it.
- Stored references use POSIX separators on Windows: SBOM symlink targets, emulator-directory token parents, and the runtime-module manifest.
- The metadata database closes cached SQLite handles before replacing the file, so a resync cannot fail with a locked database.

**Still Linux only:** gamescope and Game Mode, AppImage and Flatpak packaging, XDG desktop entries, `sudo make install`, Steam Deck and handheld tuning, and Flathub-aware emulator management. Linux remains the primary distro-integration target; Windows support is x86_64 only. See [Windows](/windows/) for the platform guide.

[Full OpenBox 1.13.0 release notes](https://github.com/vindeckyy/OpenBoxGL/releases/tag/v1.13.0) · [Compare v1.12.1...v1.13.0](https://github.com/vindeckyy/OpenBoxGL/compare/v1.12.1...v1.13.0)

## 1.12.1 (2026-09-15) — Hardening

Small, safe update on top of Living Library: a harder update path, clearer errors, and no more silent skips.

- **Verified updates:** the AppImage updater rejects order-8 Ed25519 small-order keys, fails closed on non-object release payloads, normalizes the signature digest before validation, resolves a symlinked install destination so the real AppImage is replaced (with directory fsync), and escapes `%` so paths cannot inject desktop-entry field codes.
- **Clearer errors:** unreadable Steam libraries surface an `errors[]` array naming the path and OS error; RetroAchievements 401/403 responses say the credentials were rejected; an unreachable metadata database reports a clean connection error instead of raw socket messages.
- **Reliability:** the last manual rows are now gated tests — `docs/reliability.md` has zero Manual rows — and coverage floors ratchet to 83% total / 58% `web_app.py`.
- **API fixes:** deleting a missing playlist returns 404, scoped exports without a name fail fast with 400, Game Night queues explain empties with an `empty_reason` plus an exclusion breakdown, background jobs carry typed operation kinds (`library.export`, `screenscraper.*`, `steamgrid.*`, `storefront.auto_import`, `clips.reel`), and Backlog Radio rows hydrated from stored playlists carry `estimated_minutes`.
- **Test isolation:** the suite no longer clobbers the developer library — an isolated `OPENBOX_DATA_DIR` is exported for test runs and guarded at import time.

[Full OpenBox 1.12.1 release notes](https://github.com/vindeckyy/OpenBoxGL/releases/tag/v1.12.1) · [Compare v1.12.0...v1.12.1](https://github.com/vindeckyy/OpenBoxGL/compare/v1.12.0...v1.12.1)

## 1.12.0 (2026-09-14) — Living Library

Searches you pinned become shelves that stay correct on their own, every game gets a story worth scrolling, and the launch-options sheet is complete down to environment variables.

- **Smart collections:** "Save as collection" turns the active query-bar interpretation into a named sidebar shelf (`GET/POST /api/v2/collections`, `POST /api/v2/collections/delete`). A collection stores the query — not a snapshot — so membership stays correct as the library changes.
- **Game Story:** a per-game Story tab in the detail pane (`GET /api/v2/story?game_id=`) narrates added date, first played, longest session, playtime milestones, progress, and captured Moments — a deterministic projection over the session journal, so it can never go stale.
- **Per-game environment overrides:** Edit game → Launch gains a `launch_env` field (`KEY=value` lines, validated at save) merged over the launch environment, plus an "Always confirm before launch" per-game flag.
- **Weekly automatic backups:** Settings gains an opt-in weekly library backup with retention and a "last automatic backup" line; the scheduler reuses the existing backup engine (`auto_backup_due()`).
- **SQLite self-enables for large libraries:** at 5,000+ games the FTS read model turns itself on; an explicit `OPENBOX_ENABLE_SQLITE_READ=0` opt-out is honored and small libraries see identical behavior.
- **Command palette learns:** recently chosen games and actions rank first, from local usage counts — no telemetry.
- **Fixed:** the per-game gamescope preset override now round-trips to the Edit game select, plus the full 1.11.1 hardening sweep — complete large-media responses, document-reader framing, scroll-stable grid virtualization, and focus restoration.

[Full OpenBox 1.12.0 release notes](https://github.com/vindeckyy/OpenBoxGL/releases/tag/v1.12.0) · [Compare v1.11.0...v1.12.0](https://github.com/vindeckyy/OpenBoxGL/compare/v1.11.0...v1.12.0) · [1.12 API reference](/reference/api/one-twelve/)

## 1.11.0 (2026-09-12) — Every Second Counts

### Never lose your place

- **Quick Resume** stores progress-aware session state when the selected emulator adapter exposes a safe state path. Session recaps and a per-game **Moments** timeline keep recent activity, notes, screenshots, and resumable snapshots together. Resume is capability-based: adapters without a state definition still support notes and screenshots, but do not claim resume support.
- **Record That** captures the replay buffer through OBS when the optional local replay integration is enabled. If OBS is unavailable, it falls back to a local screenshot; if neither capture path is available, the action reports an error. Clips stay in approved local media directories, and bounded deterministic reels can be queued when the local tooling is present.

### A library you can ask

- **Backlog Radio** builds up to five explainable recommendations from local play history and library data. It is deterministic and local; a new install without enough history uses a transparent fallback instead of inventing habits.
- The library query bar understands a small deterministic grammar such as `short unplayed rpg`. Interpretation is shown as editable, removable chips; unknown words remain ordinary text rather than becoming guessed filters.
- **Ctrl/Cmd-K** opens the command palette for games, actions, settings, and What's New discovery. The palette is a UI action, not a separate network service.

### Time Machine

- The journal-backed **Time Machine** exposes a bounded event timeline, read-only as-of inspection, and reviewable revert previews. The canonical state remains transactional; malformed or stale plans stop before mutation. The journal records catalog metadata and history, not media binaries, so it is not a media restore mechanism.

### Arcade Room and Household

- **Arcade Room** is a controller-friendly canvas showroom organized by platform. **Museum mode** turns it into a self-guided exhibit using real library facts, and reduced-motion settings use a static presentation.
- An optional salted Museum kiosk PIN is a local convenience boundary for browsing. It is not an account, network authentication, or security boundary.
- **Household** adds opt-in local members, challenges, results, shares, and leaderboard projections over the existing mounted sync folder. No account or hosted service is involved, and statistics remain off until a device opts in. Household is intentionally marked partial in the parity matrix because it does not provide hosted multiplayer.

### Handheld migration and artwork

- **Steam Bridge** previews, applies, and removes OpenBox entries in Steam's `shortcuts.vdf`, preserving unrelated records and rejecting stale reviewed plans. `openbox --play <id>` dispatches the same authenticated launch path for Steam Game Mode.
- **ES-DE** imports `gamelist.xml` through a bounded, explicit-identity preview/apply workflow with source digests, stale-plan rejection, and transactional application.
- The optional **SteamGridDB** provider can search, preview, apply, and bulk-match covers, backgrounds, clear logos, icons, and banners. It requires `STEAMGRIDDB_API_KEY` and can be disabled in Settings; results are cached locally and provider media is constrained to HTTPS.
- **OpenBox launcher trophies** are deterministic local awards evaluated from library and play-history data and persisted in a local trophy case. They are separate from the optional RetroAchievements account integration.

### Polish

- What's New and tips discovery, localized UI coverage across the five stock locales, detail-pane Moments and Clips tabs, quick query chips, kiosk settings, and the final release polish sweep round out 1.11.0.

[Full OpenBox 1.11.0 release notes](https://github.com/vindeckyy/OpenBoxGL/releases/tag/v1.11.0) · [Compare v1.10.0...v1.11.0](https://github.com/vindeckyy/OpenBoxGL/compare/v1.10.0...v1.11.0) · [1.11 API reference](/reference/api/one-eleven/)

## 1.10.0 (2026-09-08) — Safer migrations and synchronization

- **Causal catalog sync**: opt-in, content-addressed events carry device identity, ancestry, tombstones, recovery snapshots, and acknowledged outboxes. Preview incoming changes, resolve conflicts by field, and apply the reviewed plan transactionally; launch paths, commands, credentials, statistics, and media remain local.
- **Legacy sync safety**: the older whole-library `publish`/`pull` protocol now fails closed before mutation with `LIBRARY_SYNC_UNAVAILABLE`. Statistics sync remains available, while catalog publication requires the explicit v3 payload (`{"protocol":"v3"}`).
- **LaunchBox XML migration**: preview discovered games, deduplication, emulator mappings, exclusions, and path decisions before applying a bounded migration transaction.
- **Manual shelf entries**: create, update, filter, export, and explicitly convert pathless entries for physical games and other catalog records without executable files.
- **Large-library consistency**: search, facets, health, exports, and shelf records use the same canonical state model; the optional SQLite read model accelerates indexed search while JSON remains the source of truth.
- **Launch and packaging hardening**: atomic launch reservations prevent duplicate starts, and release validation publishes signed x86_64 and aarch64 AppImages plus an x86_64 Flatpak bundle with checksums, zsync metadata, SBOMs, and installer tooling.

[Full OpenBox 1.10.0 release notes](https://github.com/vindeckyy/OpenBoxGL/releases/tag/v1.10.0) · [Compare v1.9.0...v1.10.0](https://github.com/vindeckyy/OpenBoxGL/compare/v1.9.0...v1.10.0)

## 1.9.0 (2026-09-04) — Look, Discover, Play

### Mood Match — Adaptive Cover Theming
- New **Settings → Appearance** toggles "Adaptive cover theming" (`mood_match_enabled`) and "Adaptive theming in Big Box" (`mood_match_bigbox`), off by default. The UI tints itself from a 5-color palette extracted live from the selected cover.

### What Should I Play? (Picker)
- New picker replaces the random "Surprise me" button: pick by available time, mood (action/chill/story/retro/party), familiarity (new/favorite), and players. Top pick comes with an explanatory reason plus Launch / Details / Again actions (`POST /api/v2/library/pick`).

### Constellation
- New **Tools → Constellation**: full-screen, pan/zoomable relationship graph by series, developer, publisher, genre, platform family, and co-play history (`GET /api/v2/library/constellation`).

### Wrapped + Timeline + Mastery
- New **Insights → Wrapped**: printable "Your Year in Games" report (`GET /api/v2/insights/wrapped?year=YYYY`); **History → Timeline** tab groups sessions by day.
- New **Tools → Mastery**: completionist dashboard with per-platform/decade bars over local progress states plus a RetroAchievements column (`GET /api/v2/insights/mastery`).

### Game Night Party Mode
- New **Big Box → Game Night**: 2–8 players, couch-multiplayer queue, spinning wheel, persistent rounds, gamepad/keyboard control.

### Library Migration & Sync
- **LaunchBox XML migration**: preview then apply (`POST /api/v2/import/launchbox/preview`, `/apply`); emulator mappings are reported, never silently applied.
- **Full library sync (legacy design)** via mounted folder with tombstones and last-writer-wins (`POST /api/v2/library/sync/publish`, `/pull`). Superseded in 1.10.0: those legacy routes fail closed before mutation; use the reviewed causal catalog transport instead.
- **Manual shelf entries** for games without local files (`POST /api/v2/library/manual-entry`, `manual_entry: true`).
- **Big Box video snaps**: looping gameplay videos in stage mode with debounce, BGM ducking, and reduced-motion support.
- **SQLite read model graduation**: `OPENBOX_ENABLE_SQLITE_READ=1` now powers faceted search and `GET /api/v2/library/search` (FTS5 or LIKE fallback).

## 1.8.0 (2026-09-02)

### Navigation & Routing
- **Keyboard and gamepad navigation** for the library grid and list view (arrows/Home/End/Page, `f` favorite, Escape clear, gamepad via configurable controller map with edge detection) (ADR 0021).
- **Hash routing**: refresh and shared links restore platform/playlist/preset/query/selection/sort via `#/key/value` hash fragments (ADR 0021).
- **Sortable list-view columns** with persisted direction (`list_sort`/`list_sort_dir` settings); screenshot lightbox with prev/next/zoom; cover skeleton loading shimmer.

### ScreenScraper Provider
- **Per-ROM-hash metadata and media scraping** with credentials in `~/.env`, 1 req/s throttle, 429/5xx backoff, 30-day disk cache, region-priority media selection, and an https-only URL guard (ADR 0022).
- Additive v2 routes: status/test/search/info/match (batch, cancellable)/apply (durable job, downloads outside the state lock).
- Deliberately not wired into the LaunchBox match-review pipeline (ADR).

### Custom Gamescope Presets
- **User-defined presets** (≤16, unique names, bounded ints) with per-game override; per-game `gamescope_preset` wins over global (completes ADR 0016).

### Library Export
- **JSON/CSV export** with `all`/`platform`/`playlist` scopes, shareable-by-construction field projection, media paths opt-in, collision-safe filenames, and newest-10 rotation (ADR 0023).
- Additive v2 routes: queue durable job, download with Content-Disposition, list exports.

### ARM64 & Flathub Prep
- **aarch64 AppImage** release artifacts alongside x86_64; architecture-aware self-update refuses non-matching-arch releases (ADR 0024, un-defers ADR 0013).
- CI matrices build/attest/publish both arches (aarch64 on `ubuntu-24.04-arm`).
- Flatpak manifest runtime bumped `org.gnome.Platform 46` → `49`; AppStream `<content_rating>`, `<developer>`, and `<screenshots>` added; `docs/flathub-checklist.md` (submission stays a maintainer decision).

### Play Insights (Library)
- Play Insights now renders in the library with 30/90/365-day ranges, lazy IntersectionObserver load, debounced reload, and top-games deep links.

### Fixed
- `gamescope_preset`/`mangohud_enabled`/`show_insights` settings persisted instead of silently dropped (M0 whitelist bug).
- Context-menu "add to playlist" (`addGamesToPlaylist`) and Big Box "Achievements" (`openAchievements`) no longer throw ReferenceErrors.
- Chosen UI language now survives reload via `openbox-locale` localStorage.
- `app:state-refreshed` event dispatched (debounced) from `library.js refresh()`.
- Changed-line coverage gate skips unmeasured test/script files (ADR 0025).

## 1.7.2 (2026-09-01)

### Localization

- Full **i18n system** with `data-i18n` attributes in `index.html`, `t(key)` in JS via `static/i18n.js`, and JSON locale files for **English, Spanish, German, French, and Portuguese** in `locales/`.
- Settings → Interface language selector populated from `available_locales` in `public_settings`; switching re-translates the UI without reload.
- `scripts/check_i18n.py` gate verifies 100% key coverage across all locale files; wired into `make check`.

### Scale Foundation

- Optional **SQLite read model** (`pkg/state/sqlite_readmodel.py`) behind `OPENBOX_ENABLE_SQLITE_READ=1` env flag. Provides FTS5 full-text search (with LIKE fallback), indexed filtered queries, and GROUP BY facets. Disabled by default; zero behavior change when off.

### Deck Polish

- **Gamescope presets**: 8 profiles (Steam Deck, HD, 1080p, 1440p, 4K, integer, stretch, borderless) in `pkg/parity/parity_gamescope.py`; selectable in Settings → Controller.
- **MangoHud** performance overlay toggle; `apply_mangohud_env()` sets `MANGOHUD=1` on game launch when enabled.
- Controller bench tab in Settings with live gamepad SVG visualization.

### Emulator Health

- **BIOS SHA1 drift detection** in Launch Doctor: reports `BIOS_SHA1_DRIFT` when a BIOS file exists but its hash doesn't match the expected value in `emulator_defs/*.yaml`.
- Health badge CSS classes (ok/warn/fail) with tokens in `static/app.css` and all 5 themes.

### Smart Collections & Backup Diff

- **Visual chip builder** for filter presets: `rules_to_chips()` and `chips_to_rules()` in `pkg/parity/parity_filter_presets.py`.
- **Backup diff**: `GET /api/v2/backup/diff?archive=<name>` compares current library against a backup archive, returning added/removed/changed game IDs and settings change status.

### Gates & Release

- New runtime module `pkg/state/sqlite_readmodel.py` added to `runtime_modules.txt` (115 entries). 90% coverage (floor 85%).
- 7 new GET routes (1 static + 5 locale JSONs + 1 backup diff v2).
- ADRs: `docs/adr/0014-sqlite-read-model.md`, `docs/adr/0015-i18n-system.md`.
- 15 new design tokens (6 gamepad + 9 health) across `static/app.css` and all 5 stock themes. Token baseline: 0.

## 1.7.1 (2026-08-29)

### Play Insights

- Local-first **Play Insights** dashboard: 366-day heatmap (levels 0–4), current/longest streaks, top platforms/genres, and 30-day play momentum from local history with zero telemetry. Endpoints: `GET /api/v2/insights/summary` and `GET /api/v2/insights/heatmap`.

### Performance

- Virtual spacer-window library grid with `localStorage['openbox-virtual-grid']` kill-switch, `IntersectionObserver` + `contain-intrinsic-size`, and rAF coalescing for smooth 60 FPS scrolling with 20,000 games.
- Off-main-thread search indexing and trigram lookups via `static/worker.search.js` with instant acronym search matching.
- `pkg/state/cache.py` `FacetCache` LRU (capacity 64) with epoch bumping on state changes; `state_store.py` 50ms write coalescing with single fsync.

### Setup & Launch Doctor Polish

- Setup Center `preview_document` includes human-readable progress storytelling messages (`preview_document.message`).
- Launch Doctor blocking checks carry structured, actionable `fix_action` objects (`flatpak_install`, `reveal_bios_path`, `pick_core`, `explain_token`) with one-click fix buttons in the UI.

### Frontend & Themes

- New design system tokens: `--overlay-insight-cell-0` through `--overlay-insight-cell-4`, `--border-insight`, `--shadow-insight`, `--surface-insight-card`, and `--focus-ring`. All themes updated.
- Lazy-loaded `static/insights.js` dashboard panel rendered above the library grid.

## 1.7.0 (2026-08-26)

### Library Setup Center

- Guided **Library Setup Center** (`#setupLibraryButton`) with preview-before-commit scan, paginated review, decision overrides, emulator readiness, and idempotent commit.
- Side-effect-free scan previews with stale-preview guards and `import_batch_id` tagging for instant post-import filtering.

### Activity Center

- Durable Operation Service backed by `operations.json` (replacing in-memory job maps) with queued, running, cancelling, done, partial, error, cancelled, and interrupted states.
- Persistent topbar Activity button (`#activityButton`), live SSE progress events, task cancellation, and restart recovery with retry/resume.

### Launch Doctor

- Preflight validation for game paths, adapters, Flatpak/native executables, BIOS/firmware, and tokenized launch arguments before launching.
- Authoritative flat adapter-per-platform emulator registry (`emulator_defs/`) with explicit launch precedence rules and ambiguity handling.

### Additive v2 API

- Exact `/api/v2/*` routes for setup preview/commit, emulator registry, launch preflight, metadata match review, and durable operations.
- Canonical `library.json` schema remains version 6; previews and operations use separate isolated storage files.

### Packaging & Scale

- Formal performance support target of **20,000** games.
- AppImage release built on Ubuntu 22.04 LTS (x86_64); Flatpak targets runtime 25.08 (`org.gnome.Platform`) — superseded: current builds target runtime 49 (see 1.8.0).

## 1.6.0 (2026-08-23)

### Architecture & State Management

- **State Decomposition**: Decomposed `webapp_state.py` into focused state modules: `pkg/state/imports.py` (import orchestration, duplicate merging, auto-import), `pkg/state/commands.py` (command execution), and `pkg/state/registry.py` (process and session tracking with typed `Session` dataclass), keeping a lightweight backwards-compatible re-export facade.
- **Launch Token Centralization**: Centralized launch token expansions (`{path}`, `{name}`, `{dir}`, `{stem}`, `{platform}`, `{app_id}`, `{heroic_app_id}`, `{lutris_id}`, `{rom_name}`, `{DataDir}`, etc.) into `pkg/parity/launch_tokens.py`.
- **Cache Invalidation Hierarchy**: Consolidated caches and locks into coordinated `CacheEpoch` dataclass with atomic full invalidation (`_invalidate_all()`).

### Frontend & Accessibility

- **Accessible Tools Menu**: Replaced details/summary tools dropdown with fully accessible WAI-ARIA button and menu pattern (`#toolsButton`, `#toolMenu`, and `#toolsWrap.open`) supporting full keyboard navigation (Arrows, Home, End, Escape, Tab).
- **Memoized Search Index**: Implemented LRU cache, debounced input, and bounded trigram expansion for instant lookups across 20k+ games.
- **Dialog Focus Traps**: Added dialog focus management with inert fallbacks and proper focus restoration on close.
- **Virtual Grid Geometry**: Memoized grid geometry calculation for faster library view rendering.

### Security & Hardening

- **Content Security Policy**: Added `frame-ancestors` directive to Content-Security-Policy (CSP) headers.
- **Narrowed Exception Handling**: Hardened exception handling across handlers, state imports, commands, and SSE streams to eliminate broad except catches and add structured error logging.
- **Auth & Input Validation**: Added input validation and authentication checks to native dialog, window, and emulator scan endpoints.
- **Write-Path Performance Benchmark**: Added performance benchmark write-path gate (under 500ms for 10k games).

## 1.5.1 (2026-08-19)

### Performance

- **Optimized State Writes**: Added dirty-field tracking, batched snapshot persistence, and cached library projections for large libraries.
- **Import & Search Throughput**: Accelerated import scanning, metadata batching, archive inspection throughput, and BigBox CoverFlow title indexing.
- **Native Host Startup**: Improved native host responsiveness with non-blocking IPC polling.

### Changed

- **Cross-Store Consolidation**: Enhanced cross-store import consolidation across Steam, Heroic, Lutris, Faugus, and ROMs using canonical identity normalization.
- **CLI & Argument Parsing**: Hardened CLI help formatting and argument parsing for headless and native host invocations.
- **Parity Documentation**: Updated parity compatibility shims and LaunchBox feature matrix documentation.

### Fixed

- **Synchronous Future Cleanup**: Ensured completed background job futures are released synchronously to eliminate memory and future retention.
- **Import Validation**: Hardened import endpoint error handling and input validation against malformed payload structures.

## 1.5.0 (2026-08-18)

### Changed

- **Proton & Wine Prefix Manager**: Integrated Wine prefix and Proton discovery and assignment (`parity_wine.py`, `handlers/wine.py`, `GET /api/wine/prefixes`, `GET /api/wine/protons`, `GET /api/wine/prefix-for-game`), with UI integration in game settings and auto-detection for Windows titles.
- **Faugus Launcher Integration**: Added Faugus game discovery and import handlers (`parity_faugus.py`, `handlers/faugus.py`, `GET /api/faugus/status`, `GET /api/faugus/scan`, `POST /api/faugus/import`) with automated UMU prefix detection.
- **Eden Nintendo Switch Emulator**: Added emulator definitions and profile mapping for Eden (`emulator_defs/eden.yaml`) supporting NSP, XCI, NCA, and NRO packages.
- **Canonical Identity & Cross-Source Deduplication**: Added canonical identity resolver (`parity_identity.py`, `POST /api/health/dedupe`) to deduplicate cross-source titles accurately across Steam, Heroic, Lutris, Faugus, and local ROM libraries.
- **Game Dialog Next & Previous Navigation**: Added Previous (`← Prev`) and Next (`Next →`) navigation buttons directly to the Game Edit modal, allowing users to rapidly cycle and edit adjacent games in the active filtered and sorted library without closing the dialog.
- **Platform-Scoped Media Cleanup**: The media manager and `POST /api/media/cleanup` now accept an optional `platform` parameter, enabling duplicate media auditing and cleanup targeted to a single platform or across the entire collection.
- **Reset Play Statistics**: Added a "Reset play statistics" action to the game right-click context menu and the Bulk Edit dialog, resetting `play_count` (0), `playtime_seconds` (0), and `last_played` ("").
- **Smart Capability Playlist Rules**: Filter presets and smart filter playlists now support capability rules including `has_saves`, `has_achievements`, `has_missing_media`, and `has_highscores`.
- **Desktop Random Game Shortcut**: Added `Ctrl+Alt+Q` and `Ctrl+Alt+R` global desktop keyboard shortcuts to instantly pick, focus, and scroll to a random game in the active grid or list.
- **Acronym Title Search Matching**: Search and filter queries now recognize game title acronyms and initials (for example, `oot` matches *The Legend of Zelda: Ocarina of Time*, `mgs` matches *Metal Gear Solid*, `sotn` matches *Castlevania: Symphony of the Night*, `ff` matches *Final Fantasy*).
- **Expanded Launch Variables**: Emulator startup templates and per-game command overrides now expand `{ImagePath}`, `{dir}`, `{Dir}`, `{file}`, `{File}`, `{stem}`, `{FileNameWithoutExtension}`, `{Platform}`, `{EmulatorDir}`, and `{DataDir}`.
- **Window Resolution CLI Options**: Added `--fullscreen-width <W>`, `--fullscreen-height <H>`, and `--resolution <WxH>` CLI flags to customize viewport dimensions for kiosk and app window modes.

### Fixed

- Background job manager futures are now popped and cleaned up synchronously when worker jobs finish, preventing latent callback latency races in multi-threaded test and runtime environments.

### Hardened

- Standardized all newly added parity integration modules under `pkg/parity/` with root compatibility shims, adhering strictly to the frozen v1 contract.

## 1.4.0 (2026-08-17)

### Fixed

- AppImage and Flatpak builds now bundle every static JavaScript module (`util.js`, `state.js`, `library.js`, and related ES modules), preventing 404 errors during client-side navigation.
- AppImage packaging scripts now ensure parent directories are created for `pkg/parity` modules.
- Hardened background job manager queue slot cleanup on worker replacement, preventing in-flight job leakages.
- Handled non-standard filesystem mounts in `fsync_directory` and protected snapshot rotation against concurrent file removals.
- Resolved Big Box mode switch exit response hang and ensured full controller dropdown navigation.

### Changed

- Reorganized repository structure: documentation moved to `docs/`, tests to `tests/`, and parity integrations to `pkg/parity/` with backward-compatible shims at root.
- CI workflows, test runners, coverage gates, and token checkers updated to support both flat and packaged layouts.

## 1.3.0 (2026-08-16)

### Hardened

- Plugin execution now uses bubblewrap with isolated namespaces, no network access, and temporary mounts for home, temporary, runtime, and removable-media paths when the host supports it. If the sandbox cannot be created, enabled plugins are skipped by default; `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1` is an explicit opt-in for trusted local plugins.
- Gamescope regression tests now launch in their own process groups and terminate the full group on timeout, preventing nested gamescope processes from surviving the test gate.

### Changed

- Cloud sync, save and backup restore, launch handling, settings validation, metadata application, Lutris import, 7z validation, webhook validation, filter matching, and game resolution were split into focused helpers, keeping the security-sensitive paths easier to audit and test.
- The background job manager now has dedicated coverage for retries, cancellation, queue and name limits, bounded results, shutdown, and completed-future cleanup.
- Dead backend code and obsolete browser, screenshot, migration, and performance-capture scripts were removed.
- From-source setup documentation now explains the tokenized UI URL and the supported `OPENBOX_ENV_FILE`, data-directory, home-directory, and user-config locations.
- CI and release tooling now use the refreshed GitHub Actions and JavaScript dependencies, with CodeQL action components kept on one version and grouped Dependabot updates for future changes.

## 1.2.0 (2026-08-15)

**Security and SteamOS**

- SteamOS AppImages no longer export bundled libraries into the host shell, fixing startup failures where `/bin/bash` could not resolve `rl_print_keybinding`.
- Webhook delivery rejects non-public destinations, pins validated DNS results, disables proxies and redirects, and bounds response reads.
- Library and save backups use private atomic files, reject unsafe archive entries, and protect restore paths against symlinks and archive replacement races.
- Native bridge authorization now requires the exact OpenBox origin, including its dynamic port.
- Gameyfin validates IDs before path construction, keeps filesystem operations under the install root, requires HTTPS, and verifies supplied checksums.
- 7z extraction rejects links, operates on a bounded snapshot, and validates the staging tree before promotion.
- Media and document reads enforce approved roots, including symlinked parent checks.
- Environment loading accepts only owner-controlled files and supported keys, and no longer searches the current directory.
- Job and SSE queues have explicit capacity, expiry, cleanup, and slow-client behavior.

**Release hardening**

- Release artifacts require Ed25519 signatures against the pinned production public key.
- Release jobs separate build, provenance attestation, and publication permissions, and refuse asset overwrites.
- Build and CI inputs are pinned, the SBOM is generated from the completed AppImage, and Puppeteer 25.7.0 resolves the audited npm dependency issues.
- Plugin catalogs require a pinned digest, HTTPS package URLs, and package checksums.

## 1.1.0 (2026-08-15)

**Fixed**

- Cloud sync: the local-wins merge branch contained a dead condition (`remote_played > local_played` can never be true there), so newer per-field remote values were silently dropped.
- State backup now mirrors the latest committed primary, staged atomically, instead of aliasing the brand-new write.
- Plugin environment filtering fixed a typo (`GAMEFYIN_` -> `GAMEYFIN_`), so correctly spelled Gameyfin variables are stripped from plugin subprocesses.
- Play queue: skip flags recorded while advancing are written back to state before a valid item is returned, so they can no longer silently disappear.
- Queue `path_exists` checks the filesystem instead of reporting any nonempty path string as existing.
- OBS status: `recording` now requires a recording file produced within the last two minutes instead of reporting any running OBS process as actively recording.
- Steam and Lutris imports verify the Flatpak app is actually installed (`flatpak info`) before building a `flatpak run` command.
- IGDB: time-to-beat came from a nonexistent `time_to_beat` field on the games endpoint; it now queries the separate `game_time_to_beats` endpoint and converts its seconds value to hours.
- Gameyfin: the catalog requests the provider list once, raw responses are returned open and closed by the caller, and the tautological `str(folder) if installed else str(folder)` is gone.
- Job manager: completed futures are released via a done callback so job bookkeeping cannot accumulate indefinitely.
- Webhook retry: the injected clock now measures the sleep duration and warns when the wall-clock sleep overshoots.
- The emulator-defs YAML fallback parser no longer decides a key is a list based on whether its name ends in "s"; indented values build sequences from the actual shape.
- Native dialog bridge: selected paths are now JSON-quoted strings, so paths with spaces or quotes produce valid JSON and no longer leak the `g_strescape` allocation.
- Ed25519 point decoding rejects out-of-range coordinates, small-order points, and off-curve values in both `updates.py` and `scripts/verify_release.py`, and checks the canonical scalar before point arithmetic.
- `remove_exclusion` returns the number of removed entries; the API route reports `removed` truthfully.
- `sanitize_settings` no longer iterates a non-dict input into garbage dropped-key lists.
- The 7z archive validator counts a final member even when the listing omits the trailing blank separator.
- Screenshot capture: the previously ignored `window_hint` now selects active-window flags for gnome-screenshot, spectacle, and scrot.

**Changed**

- `_tdp_args` returns only the argument list; the unused milliwatt value is gone.

## 1.0.1 (2026-08-15)

**Fixed**

- Big Box hybrid mode: platform buttons were emitting a broken `data-bigbox-AppState.platform` attribute that the click handler never matched, so switching platforms did nothing. The attribute now matches the selector.
- IGDB search sent a malformed `&AppState.platform =` query parameter instead of `platform=`, dropping the platform hint from searches.
- Custom-field keys in the details pane were rendered without escaping; a crafted key could inject HTML. Keys and values are now both escaped.
- The session token stayed in the browser address bar after load. It is now scrubbed from history immediately, with deeplink parameters preserved.

**Changed**

- CSP tightened: `script-src 'self'` without `'unsafe-inline'`, plus `object-src 'none'` and `base-uri 'none'`.
- Requests without a Host header are now rejected instead of bypassing the loopback check.
- The SSE stream now carries the same security headers as every other response.
- The startup URL printed to stdout no longer contains the session token.
- The updater verifies an Ed25519 signature when a release publishes one, and skips with a loud warning while the public key is still the placeholder.
- WebKit rendering defaults changed: dmabuf renderer disabled unless `OPENBOX_ENABLE_DMABUF` is set (fixes silent window failures on AMD GPUs, including Steam Deck), and hardware acceleration switched to on-demand.

**Hardened**

- The native host now validates full URIs (scheme, host, no userinfo, no control characters) before handing anything to the default handler.
- Reveal-in-folder is restricted to paths under the data directory or home directory.
- The native bridge rejects suspicious payloads instead of evaluating them.
- Plugin catalog downloads now require a valid sha256 checksum; entries without one are refused.
- Plugin subprocess environments are scrubbed of token, password, secret, and API-key variables.
- `before_launch` plugin hooks can no longer swap the launch binary or move the working directory outside the game or data directories; tampered results fall back to the original command.

**Fixed (launch reliability)**

- AppImage launches now route through the fallback ladder instead of exec-ing the native host directly, and all launch failures are written to `~/.local/share/openbox-game-launcher/openbox-launch.log` instead of vanishing on a double-click.
- The native host writes its own log and the single-instance message is no longer invisible.
- Game Mode with no kiosk browser installed now prints the server URL instead of failing silently.

**Verification**

- `./run_all_tests.sh`: 47 test files, 0 failures at that tag; the then-current suite had 62 test files.
- `make check`: lint, compile checks, coverage floors green; then-current floors were `60%` total and `48%` `web_app.py` in `scripts/check_tests.py` (now `83.0%` / `58.0%`).
- CI smoke test now covers Big Box platform switching and IGDB search parameters; JS linting runs in CI; Dependabot watches GitHub Actions and npm.

## 1.0.0 (2026-08-14)

**Native-first**

- OpenBox now opens in a native WebKitGTK window by default, rendering the same library UI as the web app instead of a browser tab or the removed Tk interface. The C host (`native_host.c`) owns server lifecycle, single instance, window geometry, minimize-to-tray, and a fallback ladder to the system-browser app window (then your default browser) when WebKitGTK is missing; `openbox --web` remains the development opt-out.
- The `ui_window` app/browser split is removed; the Tk interface no longer ships, and AppImage dependencies drop python3-tk/tcl/tk for WebKitGTK 4.1. CI compiles the native host on every pull request.
- Native IPC: `/api/native/*` routes report host capabilities dynamically, and a JS↔C bridge drives native dialogs, external opens, reveal-in-file-manager, and Big Box fullscreen.
- Batch metadata auto-match binds every unmatched game whose title exactly matches the LaunchBox Games Database in one action, instead of matching one game at a time. Only exact normalized-title hits qualify; ambiguous titles are left unmatched.

**State and API contract**

- Schema v5 adds a host-owned `ui_state` block; existing games, settings, playlists, and history migrate untouched.
- The v1 API contract freezes (`contracts.py` + `v1_contracts.json`, 61 routes) with a CI check that fails when the contract drifts.

**Frontend**

- The topbar regroups into Library, Actions, and Tools zones; session and job events stream over Server-Sent Events with polling kept as a fallback.
- Grid covers group by aspect ratio by default (persisted as `cover_grouping`), and the dialog manager traps focus and closes on Escape.
- Scroll-lag fixes: rAF-coalesced grid rendering, backdrop blur removed from the base scroll path, hover-gated cover transitions, and a constrained workspace row.

**Under the hood**

- The 260-method `Handler` class splits into capability mixins under `handlers/` (library, media, imports, sessions, settings, extensions, health, emulators, native, data); `web_app.py` drops from 3,755 to 1,628 lines while response bytes and route wiring stay identical.
- `docs/adr/0001-native-host.md` and `docs/native-host-contract.md` document the host/server split and IPC contract.

**Verification**

- 47 test files, 0 failures at that tag; `make check` gates passed with the then-current floors. At that tag the suite had 62 test files with `60%` total coverage floor and `48%` `web_app.py` floor per `scripts/check_tests.py` (now `83.0%` / `58.0%`). The UI smoke test drives a real server and asserts the Tools menu opens under every stock theme.

## 0.9.0 (2026-08-12)


**LaunchBox media catalog and archive manuals**

- Media downloads now cover box backs, box spines, 3D boxes, clear logos, fanart, banners, title screens, cart fronts, cart backs, discs, and advertisement flyers, beyond covers, backgrounds, and screenshots. Every media surface (metadata dialog, bulk download, media audit, artwork gallery, image groups, auto-import) accepts the expanded set.
- Manuals are not in the LaunchBox feed, so the manual option pulls a PDF or text manual out of the game's own archive, ranking `manual.pdf` first and reporting a "no manual in this archive" note when nothing is found.
- Platform name mapping ranks exact LaunchBox matches first: `Game Boy` to `Nintendo Game Boy`, `PlayStation` to `Sony Playstation`, `GameCube` to `Nintendo GameCube`, `Xbox` to `Microsoft Xbox`, across 26 aliases.

**Engineering foundation**

- `make check` runs lint, compile checks, the full test suite under coverage, and coverage floors in one command. CI enforces it on push, pull requests, and weekly, and a version-sync check fails when `updates.py` disagrees with any published version spot.
- The 613-line GET and 195-line POST dispatch chains became a route registry (`routes.py`) with 104 GET and 124 POST entries (including v1 aliases, on top of 80 GET and 95 POST base routes), each mapped to a named handler (five via dotted `handlers.native.*` specs).
- Structured errors carry stable machine codes (`GAME_NOT_FOUND`, `MEDIA_JOB_RUNNING`, ...) plus a per-request id that appears in the UI and the diagnostic log; POST validation errors become `400 BAD_REQUEST` instead of leaking to the generic 500 path.
- A versioned `/api/v1` surface aliases the stable routes; legacy paths keep working.
- The library payload is gzip-compressed once per state change and served with conditional GET: 5,000 games serve in about 2 ms at 638 KB instead of 13.8 MB.
- Settings saves drop unknown keys against a 72-key whitelist instead of persisting junk. (The registry in `settings_schema.py` currently defines 72 known keys.)

**Reliability**

- Rolling state snapshots keep the last 5 committed states for point-in-time recovery; `/api/state/recover` gained dry-run preview and snapshot restore modes.
- Background jobs keep a 50-entry finished history at `/api/jobs`, rendered in the Library Audit dialog.
- Ctrl-C / SIGTERM stops running sessions and drains webhooks gracefully; the session poll drops to every 10 s when idle.
- Log redaction now covers RetroAchievements keys and `client_secret` shapes, and `/api/diagnostic` packages a redacted report for bug reports.

**Frontend**

- `index.html` shrank from 3,117 lines to a 485-line shell; JS and CSS serve from `/static/*` with cache headers.
- All 30 browser state globals moved into one `AppState` object; UI preferences persist through `localStorage`.
- Server errors surface in a dismissible banner with a "Copy details" action that includes the request id.
- Dialogs are `aria-modal`, toasts and lifecycle messages are live regions, and the label floor rose to 12px.
- The interface language selector is honestly English-only until real localization lands.
- A UI smoke test drives a real server with puppeteer and fails on page errors.

**Release and supply chain**

- CycloneDX 1.4 SBOM generation, Ed25519 release signing with a pure-stdlib verifier, and a release pipeline script that runs everything up to the human publish step.
- A 23-scenario reliability catalog (`docs/reliability.md`), a support matrix (`SUPPORT.md`), and a triage policy (`TRIAGE.md`).

**Fixed**

- Duplicate media cleanup now scans every media field, not just covers and backgrounds.
- Latent undefined names in `web_app.py` that would have crashed their code paths on first use.
- Lint debt across the gate rule set: default-argument calls, loop-variable closures, unused variables, lambda assignments, missing `check=` on `subprocess.run`, shebangs, and import placement.

**Verification**

- Ran `./run_all_tests.sh`: 45 test files, 0 failures.
- Ran `make check`: lint, compile, tests, and coverage gates pass (56% total, 44% `web_app.py`).
- UI smoke test boots a real server and drives the grid with no page errors.
- Perf bench at 5,000 games: gzip library 1.9ms / 638KB vs 13.7ms / 13.8MB plain.

## 0.8.2 (2026-08-12)

**Fixed**

- Box art now keeps its natural aspect ratio in the library grid, Big Box Stage, and CoverFlow views instead of being force-cropped into a single ratio, so games with non-standard artwork (for example SNES titles) display uncropped. Title-only covers keep the standard portrait box.

**Added**

- Web UI surfaces for the persistent play queue, normalized game tags, Notification Center, and signed webhook settings.
- `/api/queue`, `/api/tags`, `/api/notifications`, and `/api/webhooks` contracts with bounded state, secret redaction, and destination validation.

## 0.8.1 (2026-08-09)

**Fixed**

- Launching a game with no launch command and no matching platform profile now fails with a clear error before anything runs, instead of silently spawning a process that exits on the spot and reporting a normal session end. Games whose file is not executable get the same message.
- The web UI shows the real outcome of a failed session. An immediate exit with a non-zero code reports "Session failed" with the exit code and a hint to check the launch command and emulator install, instead of the generic "Play time and history were saved" toast.
- Emulator installs no longer re-add the Flathub remote when it already exists, which previously made `flatpak remote-add --user` exit non-zero and abort the install.

## 0.8.0 (2026-08-07)

**Added**

- Handheld performance profiles: per-launch-profile TDP limits applied via `ryzenadj` at launch, with an optional restore limit when the session ends, gated by an `Apply handheld performance limits` setting (auto / always / off). `auto` applies only on Steam Deck / Bazzite game mode and battery-powered handhelds; a missing `ryzenadj` or permission error logs a warning and never blocks a launch.

## 0.7.0 (2026-08-02)

**Fixed**

- Backup restore merges archived settings back into `library.json` instead of a sidecar file the app never reads.
- Restoring an older backup over a newer library is refused unless explicitly forced, and restore re-validates symlink parents after `mkdir`.
- Save backups resolve relative `save_paths` against the game instead of the process working directory, and reject symlinked backup directories.
- Cloud sync propagates local deletions and resolves per-game conflicts by `last_played`.
- The plugin `library` hook is TTL-cached so `/api/library` no longer blocks up to 5 seconds per plugin per request.
- `openbox://` deeplinks reject foreign hosts and fail clearly when no server port is known.
- Gamescope guest detection also recognizes `STEAM_GAMESCOPE_RESTRICTED` sessions.

## 0.6.0 (2026-07-30)

**Added**

- LaunchBox-style advanced search in the Web UI: field terms, quoted values, status filters, and negative terms.
- Ordered manual playlists with parent grouping, notes, membership editing, and keyboard-friendly reorder controls, alongside existing filter playlists.
- Game context actions, Ctrl/Shift multi-selection, configurable status badges, richer platform/category/playlist detail panes, related-game reasons, artwork galleries, and per-game launch profile overrides.
- Backup archive listing, manifest summaries, restore actions, expanded artwork groups, and metadata fields for controller support, disc count, portable games, and broken entries.

**Changed**

- State persistence uses schema migrations, stable game identities with legacy aliases, last-known-good recovery, process-safe transactions, atomic writes, and corruption preservation.

## 0.5.0 (2026-07-30)

**Added**

- Steam Game Mode guest support for Steam Deck, Bazzite, and similar gamescope sessions. Big Box opens fullscreen while Steam retains Input, Quick Access Menu, and TDP controls.
- Settings can remove all Steam-imported library entries at once, keeping game files and media on disk.
- Local rotating diagnostic logs with a Settings copy button. Tokens and passwords are redacted.

## 0.4.x (2026-07-24 to 2026-07-30)

- **0.4.8, Steam Game Mode guest:** `--game-mode` opens Big Box fullscreen under gamescope on Steam Deck, Bazzite, and similar handheld images. Guest sessions are detected automatically, and Steam keeps Input, QAM, and TDP while OpenBox tags its UI and non-Steam launches for Steam's overlay path.
- **0.4.9, library reliability:** session playtime and Gameyfin installs update the correct library entry after deletes or reorders, Gameyfin downloads stage then replace and stream to disk, Lutris CLI failures return JSON errors.
- **0.4.10, AppImage desktop launches:** via Gear Lever and similar integrators no longer leak bundled `LD_LIBRARY_PATH` into host `xdg-open`/browsers.

## 0.1.0 to 0.3.0 (2026-07-23 to 2026-07-24)

The first public builds: the local web UI and native Tk interface, folder and storefront imports, emulator profiles, metadata and media downloads, session history, save discovery and backups, Big Box layouts, themes, plugins, and the token-authenticated REST API.

## Related pages

- [Installation](/install/)
- [Updating](/updating/)
- [Security policy](/policies/security/)

## Related pages

- [Roadmap](/roadmap/) — what is shipping next and what is deferred.
- [Security](/policies/security/) — supported versions and what each release closed.
