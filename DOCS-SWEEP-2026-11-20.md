# OpenBoxGL Docs — 3.0 Staleness and Gap Sweep

Audit date **2026-11-20** against application **3.0.0** (released 2026-11-19; GitHub release published 2026-11-20T04:41Z). Site HEAD at audit start: `0d47561` ("bring the site to 2.0 truth and add the two-zero reference"). Supersedes `DOCS-SWEEP-2026-10-28.md` (1.19.1).

**Status:** the 3.0 version, install, migration, API-prefix, Rust-architecture, plugin-v2, backup-format, configuration, CLI, and five new-feature gaps are fixed in this sweep. Remaining **OPEN** items are listed at the end; the most important are product-side defects, not missing prose.

## Verdict

The site was not one release behind; it was **two releases and one minor behind**. Its newest content was `2.0.0 (unreleased)`, while 2.0.0 shipped on 2026-10-31, 2.1.0 on 2026-11-02, and 3.0.0 on 2026-11-19. The app had migrated its entire backend from 170 Python modules to a 15-crate Rust workspace and 417 HTTP endpoints. The docs still described `web_app.py` as the composition root, taught `api_version: 1` plugins, documented `openbox --rollback-library` as a live recovery path, and called the 1.19-compatible backup export selectable.

The gates did not catch this because they were self-referential: the version gate derived "current" from the site's own changelog, the route gate scanned Python `@route` decorators, and the settings gate read a 153-key baseline. All three passed while the site was two releases stale.

## Method

Ten parallel read-only audits covered every page family:

1. API reference vs `api_contracts.json`, `docs/openapi.json`, and the Rust router/handlers.
2. Configuration, data paths, schema/migration, and privacy.
3. CLI, command tokens, shortcuts, and the native-host contract.
4. Install, downloads, updating, platform guides, release, and contributing.
5. Library, metadata, imports, storefronts, discovery, and integrations.
6. Saves, backups, sync, RetroAchievements, plugins, themes, Big Box, and troubleshooting.
7. Architecture, parity, hardware, jobs, search, localization, and plugin reference.
8. Site chrome, changelog, roadmap, FAQ, compare, policies, and gates.
9. A feature-by-feature 2.1/3.0 coverage inventory.
10. A mechanical Python-era claim sweep across all content and components.

Every P0/P1 finding was then checked against the 3.0 source: `crates/*`, `openbox.sh`, `openbox.ps1`, `native_host*.c/.m`, `static/*.js`, `settings_schema.py`, `api_contracts.json`, `docs/CHANGELOG.md`, `docs/RELEASE_NOTES.md`, `docs/upgrade-3.0.md`, `docs/state-format.md`, and the live v3.0.0 release asset list.

## Baseline

| Surface | Before | After |
| --- | --- | --- |
| Site current release | 2.0.0 "unreleased" | 3.0.0 (2026-11-19) |
| Changelog entries | newest 2.0.0 | 3.0.0, 2.1.0, 2.0.0 (dated) |
| API route baseline | 391 Python-decorator routes, 210 `/api/v2`, 1 `/api/v1`, 179 unversioned | 417 routes: 413 `/api/v2` + 4 `/api/host` |
| Settings baseline | 153 keys | 161 keys |
| Docs pages | 110 | 118 |
| Frontend module inventory | 53 | 60 |
| Formal scale | 20,000 (or unstated) | 50,000 |
| Plugin API | v1 and v2 | v2 only |
| Backup writes | formats 1 and 2 | format 2 only (format 1 reads) |
| Migration | automatic on open | explicit `openbox --migrate-library` for schema 6 |

## P0 — fixed

### P0-1 · Changelog was two releases behind and called a shipped release unreleased

`content/docs/changelog.md:7` said `## 2.0.0 (unreleased)`. 2.0.0 shipped 2026-10-31; 2.1.0 and 3.0.0 were absent. Every "current release" claim on the site derived from this page.

**Fixed:** added full `## 3.0.0 (2026-11-19)` and `## 2.1.0 (2026-11-02)` entries, dated 2.0.0, and added the 2.1/3.0 comparison links.

### P0-2 · Install commands installed 2.0.0, not 3.0.0

`install.mdx`, `downloads.md`, `windows.mdx`, `macos.mdx`, `steam-deck.md`, and `enterprise.md` pinned `VERSION=2.0.0` or `v2.0.0` and said the current release was 1.19.1. Following them installed the old Python-backend build.

**Fixed:** all current pins and release URLs now use 3.0.0; download sizes and asset names match the live v3.0.0 release.

### P0-3 · "Bundled Python" and "Python 3.10" were false for every 3.0 package

The site said the AppImage, Flatpak, Windows zip, and macOS bundle carried Python, and required Python 3.10. 3.0 packages ship the Rust `openbox-server` with **zero bundled CPython**; Python 3.11+ is needed only for the `OPENBOX_BACKEND=python` fallback, `.py` v2 plugins, and the signed installer verifiers.

**Fixed** across install, downloads, Windows, macOS, Steam Deck, FAQ, index, enterprise, contributing, and releasing. The source path now leads with `cargo build --release --locked -p openbox-cli`; `python3 web_app.py` is labeled as the fallback.

### P0-4 · No 3.0 upgrade path; the documented rollback was removed

`updating.md` stopped at 2.0 and said first launch migrates schema 6 and `openbox --rollback-library` restores the v6 file. 3.0 does not migrate on open; schema 6 raises `STATE_SCHEMA_TOO_OLD` until `openbox --migrate-library` runs; `--rollback-library` exits 4 and names 2.1.0.

**Fixed:** new [Upgrading to 3.0](/upgrading-3-0/) page and rewritten `updating.md`, `cli.md`, `data-and-recovery.md`, `interfaces-and-data.md`, and `state-recovery` sections.

### P0-5 · 450 unversioned `/api/*` references were dead

2.1 stopped dispatching unversioned `/api/*`; a path with a `/api/v2` twin returns `410 API_VERSION_REQUIRED`, `/api/v1/*` returns `410 V1_API_REMOVED`, and legacy host names return `410 HOST_CHANNEL_RETIRED`. The API reference pages, guides, troubleshooting pages, and curl examples used the unversioned forms throughout.

**Fixed:** 389 references rewritten to `/api/v2/*` across 54 files; the remaining unversioned mentions are deliberate historical/retired-surface explanations. The route baseline now holds the 417 v2/host routes and the gate accepts a documented route family.

### P0-6 · API contract shapes were stale

`POST /api/v2/shutdown` was documented with `force` and `{"stopped","forced"}`; it returns `{"ok":true,"shutting_down":true}`. `GET /api/v2/jobs` was documented as a job-name map with `history`; it is a cursor list with `jobs[]` and `next_cursor`, and items live at `/jobs/items`. `GET /api/v2/diagnostic` was documented as a Python `crash_report.py` payload with `games_count`/`running_count`; it returns a Rust preview with `system.python: "rust-native"`. `GET /api/v2/version` was missing `runtime: "rust"` and showed a Python version.

**Fixed** in `local-admin`, `api.mdx`, `api/overview`, `two-zero`, and the new `three-zero` page.

### P0-7 · Plugin API v1 was documented as supported; it is removed

Five plugin pages taught `"api_version": 1` (or omission) as the default, a one-shot `plugin_runner.py`, and a v1 output cap. 3.0 accepts only `"api_version": 2`; anything else fails with `PLUGIN_API_RETIRED`, and `plugin_runner.py` is gone.

**Fixed** in `guides/plugins`, `creating-a-plugin`, `reference/plugins.md`, `manifest`, `overview`, `process-and-errors`, and `catalog`. The docs now describe per-invocation JSON Lines, native executable entries, the 4 MiB output cap, and the unwired hooks.

### P0-8 · Architecture pages described the Python core as the shipped product

`reference/architecture/index.md` had a "Python Core Engine — web_app.py" mermaid node, `handlers/*`, 72 `pkg/parity` modules, and `ThreadingHTTPServer`. `how-it-works.mdx` named `web_app.py` as the composition root and `state_store.py` as persistence.

**Fixed:** `architecture/index.md` rewritten around the 15 Rust crates, `openbox-server`, native hosts, JSON store, Tokio jobs, and plugin boundaries; `frontend-modules.md` updated to 60 modules; `how-it-works.mdx` now carries a 3.0 banner and identifies the Python sections as fallback-only.

### P0-9 · Five 3.0 features and eight settings had no coverage

Save Vault, Achievement Trail, Deal Radar, Player's Log (Time Capsules/Milestones), and Backlog Itinerary were absent, as were `save_vault_*` and `deals_*`.

**Fixed:** new pages for [Save Vault](/guides/sessions-saves-and-backups/save-vault/), [Achievement Trail](/guides/retroachievements/trail/), [Deal Radar](/guides/discovery/deal-radar/), [Player's Log](/guides/library/player-log/), and [Backlog Itinerary](/guides/library/itinerary/); all eight settings are in `reference/configuration.md`; a new [API 3.0 changes](/reference/api/three-zero/) page lists the routes.

### P0-10 · The 1.19-compatible backup export was documented as selectable

2.1 removed format 1 writes. The site said Settings still offered format 1 and that a 1.19-compatible export remained available.

**Fixed:** `library-backups` (guide and reference), `updating`, and `parity` now state format 2 is the only writable format; format 1 archives still restore and a new format 1 write returns `410 BACKUP_FORMAT_RETIRED`.

## P1 — fixed

- **Windows and macOS updater mechanics.** The 3.0 Rust server implements the verified install step for the AppImage only; Windows returns "Automatic updates require an installed OpenBox copy." and macOS "Automatic updates require the OpenBox.app bundle." Install pages now say to re-run the release installer. `install`, `downloads`, `windows`, `macos`, `updating`, and `local-admin` corrected.
- **Flatpak runtime 49 → 51** in install, downloads, and releasing.
- **glibc 2.35 floor** documented for the AppImage and source builds.
- **`media_manifest_enabled` "no consumer"** corrected: it gates record, verify, and repair since 2.1.
- **`OPENBOX_SNAPSHOT_DEBOUNCE`** marked Python-fallback-only; the Rust store hardcodes a zero debounce.
- **Scheduled jobs caveat.** The Rust server's hourly tick unlocks capsules and refreshes tray recents only; automatic backups, Save Vault schedules, Deal Radar polls, and health rescans are not wired. Configuration, Save Vault, Deal Radar, sessions, and architecture pages now say so.
- **Session-end automation caveat.** The Rust `finish_session` does not call save backup, vault on-close, OBS attach, resume capture, progress automation, or statistics sync. Sessions, saves, and architecture pages now say so.
- **History retention** corrected from 500 to 2,000 entries.
- **CLI flags.** `--rollback-library` removed; `--bigbox`, `--app-window`, `--fullscreen-*`, and `--resolution` marked Python-fallback-only; `--keep` removed from the CLI (not implemented); `--restore-backup` path rule corrected; `--repair-library` confirmation removed; `--web` described as tokenless URL output, not a browser opener; `--help` and `--game-mode` scoped to the server entry point; `--dump-contracts` and `--selftest` added; `--version` absence noted.
- **Command tokens.** `{Path}` double-append warning removed; append heuristic documented as case-insensitive and covering `{app_id}`/`{lutris_id}`/`{heroic_app_id}`; `launch_profile` and per-platform `emulator_platform_settings` marked Python-fallback-only; Rust warning strings and config paths corrected.
- **Shortcuts.** Tools `Filter tools…`, Enter/Home/End/Escape behavior, Big Box top-bar Exit, video-snap `F`/`↑`/`↓`, and Arcade `M` museum mode added.
- **Jobs/logs.** Tokio semaphore model, `operations_items/`, 64 KiB log tail, `/api/v2/events`, and retired `/api/jobs` corrected.
- **Plugin hooks.** `library`, `before_launch`, `after_session`, and `library_source` are marked Python-fallback-only; the Rust server emits only `app_startup`/`app_shutdown`; native executable entries and reserved plugin ids documented; catalog count 2 → 3.
- **Data and recovery.** Schema-7 top-level keys, `migration-acknowledged.json`, `save-vault/`, v6-backup provenance, no-migration-on-open, and `STATE_FUTURE_VERSION`/`STATE_SCHEMA_TOO_OLD` corrected.
- **Interfaces and data.** Native host spawns `openbox-server`; `openbox --backup`; Save Vault row; rollback artifacts marked legacy.
- **Parity.** 3.0 header, v2-only/rollback/format-1/migration/plugin rows corrected; Rust backend, 50k, Save Vault, Trail, Deal Radar, Player's Log, and Itinerary rows added; macOS no-CPython row corrected.
- **Site chrome.** Homepage CTA and 3.0 feature card; FAQ current-release and Python answers; roadmap shipped/coming-next split; compare 3.0 column; security support table; enterprise Rust runtime; contributing/releasing Rust toolchain and Python 3.11; 404 page wired through `app/not-found.tsx`; macOS added to the sidebar.
- **Gates.** API baseline regenerated from `api_contracts.json` (417); contract baseline regenerated from `KNOWN_SETTINGS` (161); API gate accepts documented route families and ignores deliberate retired/namespace mentions; version gate passes against the app and the live release.

## P1/P2 — OPEN

These are verified but not fixed in this sweep:

- **`reference/parity.mdx` implementation inventory.** The intro now says the table is the Python fallback inventory, but the ~70 rows still name `pkg/parity/*`. Remap them to `crates/openbox-*` or keep the fallback label.
- **UI redesign depth.** `guides/library/index.md` now has a 3.0 workspace section (94 px header, Display popover, Details collapse, Tools filter, More filters, Surprise Me). `big-box-and-handhelds`, `setup-center`, and `activity-center` still need the remaining 3.0 detail (Big Box Exit/Stage framing, sticky Settings/Filters, 1-6 Guided Setup, 2-column Edit Game).
- **`reference/hardware-matrix`.** The 50k scale statement and battery route are fixed; Windows/macOS hardware rows and minimum-spec guidance are still absent.
- **`reference/save-archives`, `reference/plugins/hooks`, and some troubleshooting pages.** Python module citations remain; they are behaviorally correct but point at fallback files.
- **`reference/configuration`** still has some Python-era wording in the credential/`.env` sections and a `STRIPE_SECRET_KEY` allowlist entry with no documented consumer.
- **Screenshots.** `public/*.png` are pre-3.0 captures; the 3.0 UI redesign needs a fresh capture pass.
- **`content/docs/404.md`** is now redundant with `app/not-found.tsx`; keep it as authored copy or delete it.
- **`package.json`** does not list `@mdx-js/mdx` directly; `check-mdx.mjs` resolves it transitively through `next-mdx-remote-client`.

## Product defects (docs corrected to shipped behavior; code not changed)

These are app-side issues found while verifying docs. They are not docs defects, but they change what the docs must say:

1. **Windows/macOS in-app update install is unimplemented in the 3.0 Rust server.** `crates/openbox-integrations/src/updates.rs` returns "Automatic updates require an installed OpenBox copy." / "Automatic updates require the OpenBox.app bundle." The check works; the install step is AppImage-only.
2. **The 3.0 hourly scheduler is incomplete.** `auto_backup_due`, `auto_vault_due`, `deals_due`, and `rescan_due` have no callers in `crates/`; the Python `web_app.py` scheduler still calls them.
3. **`finish_session` is a minimal Rust port.** It records history/playtime, closes store clients, and emits a recap/webhook, but does not run `backup_saves`, vault on-close, `apply_progress_automation`, `collect_resume_state`, OBS attach, `playtime_milestone` plugin events, or `sync_statistics`.
4. **Four plugin hooks are unwired in Rust.** `library`, `before_launch`, `after_session`, and `library_source` have no call sites; only `command`, `events`, and capability hooks run. `events` only emits `app_startup`/`app_shutdown`.
5. **`scripts/openbox-launcher.sh` still calls unversioned `/api/launcher/menu` and `/api/launch`.** In 3.0 those return `410`; `openbox --launcher` therefore does not work until the helper uses `/api/v2`.
6. **`--bigbox`, `--app-window`, `--fullscreen-*`, and `--resolution` are Python-only.** The Rust server and native host ignore them; the CLI docs now say so.
7. **`openbox --help` is not forwarded to the server.** It reaches the native host/GTK; use `openbox --web --help` or `openbox-server --help`.
8. **`docs/PARITY.md:3` in the app repo still says the formal scale stays 20,000 games**, while `CHANGELOG.md`, `RELEASE_NOTES.md`, `README.md`, and ADR 0116 say 50,000 on Rust. The site uses 50,000.
9. **`docs/upgrade-3.0.md` in the app repo says the AppImage/macOS bundle ship Python 3.12**, while `build_appimage.sh` says zero bundled CPython and only bundles `plugin_runner_v2.py`. The site uses the zero-CPython statement.

## Gate defects (fixed/open)

- **G-1 fixed.** The version gate compared the site to its own changelog when `OPENBOX_APP_DIR` was unset. It now passes with `OPENBOX_APP_DIR` (app 3.0.0) and with `OPENBOX_RELEASE_REPO` (latest 3.0.0, all 32 documented assets exist).
- **G-2 fixed.** The API baseline was a 391-route Python-decorator snapshot. It is now the 417-route `api_contracts.json` surface, and the gate accepts a documented route family instead of requiring a literal per route.
- **G-3 fixed.** The contract baseline was 153 keys. It is now 161.
- **G-4 fixed.** The API gate normalized `/api/v1` to `/api` and contained a stale `/api/v1/jobs`; both are gone.
- **G-5 open.** The version gate still scans only `content/docs`, not `components/`. The two tool version badges were updated by hand.
- **G-6 open.** `check-mdx.mjs` imports `@mdx-js/mdx` without declaring it in `package.json`; it works only because the package is hoisted transitively.
- **G-7 open.** The built-site gate validates fragments but not internal link targets. A link to a non-existent route still passes.
- **G-8 open.** The baselines are manual snapshots; CI does not check out the app repo or a pinned contract file, so a future release can drift them again.

## Verification

- `npm run test` passed on the final tree: MDX compile (118 pages), contract coverage (161 settings, 24 launch tokens, 9 webhook events), API coverage (417 routes, 118 pages), version currency (3.0.0), release-asset pairing, docs index (117 entries), Next static export (121 pages), redirect stubs, sitemap (119 URLs), and built-site check (138 HTML pages/routes). `out/404.html` now renders the authored "Page not found" content through `app/not-found.tsx`.
- `OPENBOX_APP_DIR=/home/spacekitty/Desktop/projects/OpenBoxGL node scripts/check-version-currency.mjs` passed (site 3.0.0, app 3.0.0).
- `OPENBOX_RELEASE_REPO=vindeckyy/OpenBoxGL node scripts/check-version-currency.mjs` passed (latest 3.0.0; all 32 documented assets exist).
- `OPENBOX_APP_DIR=... node scripts/check-api-coverage.mjs` and `check-contract-coverage.mjs` passed.
- The live release was queried directly: `v3.0.0`, published 2026-11-20T04:41Z, with x86_64/aarch64 AppImages, Flatpak, x86_64/ARM64 Windows zips and native hosts, universal macOS zip, three installers, `verify_release.py`, `openbox-release.pub`, and four SBOMs.

Not run: any packaged app launch, Windows/macOS installer, or emulator launch. Product-defect claims are from source inspection, not runtime tests.

## Changed files

Content: `changelog`, `install`, `downloads`, `updating`, `windows`, `macos`, `steam-deck`, `enterprise`, `compare`, `index`, `getting-started`, `faq`, `roadmap`, `policies/security`, `reference/architecture/index`, `reference/architecture/frontend-modules`, `reference/how-it-works`, `reference/parity`, `reference/configuration`, `reference/cli`, `reference/command-tokens`, `reference/shortcuts`, `reference/background-jobs`, `reference/data-and-recovery`, `reference/library-backups`, `reference/save-archives`, `interfaces-and-data`, `reference/api.mdx`, `reference/api/overview`, `local-admin`, `saves-and-operations`, `library-and-settings`, `content-and-imports`, `two-zero`, `plugins.md`, `reference/plugins/*`, `guides/plugins/*`, `guides/sessions-saves-and-backups/*`, `guides/troubleshooting/state-recovery`, `guides/troubleshooting/diagnostic-logs`, `project/contributing`, `project/releasing`, and the 3.0 feature/API pages.

Site: `lib/docs.ts`, `app/not-found.tsx`, `components/tools/command-builder.tsx`, `components/tools/theme-previewer.tsx`, `scripts/api-routes.baseline.json`, `scripts/contracts.baseline.json`, `scripts/check-api-coverage.mjs`, `public/docs-index.json` (generated), `out/` (generated).

## Remaining work

1. Decide the product-side fixes above, especially the Rust updater, scheduler, session-end hooks, plugin-hook wiring, and launcher script. The docs currently describe shipped behavior, which means they say those automations do not fire under `openbox-server`.
2. Finish the UI-redesign pass in the library/Big Box/setup/activity guides.
3. Relabel or remap the `pkg/parity/*` inventory on the parity page.
4. Refresh screenshots against 3.0.
5. Wire the app repo or a pinned `api_contracts.json` into CI so the 417-route and 161-setting baselines cannot drift again.
