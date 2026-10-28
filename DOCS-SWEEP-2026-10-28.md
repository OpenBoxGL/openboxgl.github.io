# OpenBoxGL Docs — Gap and Staleness Sweep (1.19.1)

Audit date **2026-10-28**, against app **1.19.1** (`updates.py:38`). The gap covered is the app's `v1.18.0` → `v1.19.1` range: 119 files changed in the app repo, including macOS support (1.19.0) and the platform capability contract (1.19.1). Supersedes `DOCS-SWEEP-2026-10-19.md`, which audited 1.18.0. This is an internal audit record, not a published page.

**Status:** every finding below is fixed unless marked **OPEN**. The docs-site changes are committed to `main` and pushed, which deploys the site through `docs.yml`. The app-repo changes remain uncommitted on `master` in the application repository.

## Method

- Diffed `v1.18.0..HEAD` in the app repo, then traced each changed surface to the docs that describe it.
- Checked every behavior claim against source: `pkg/platform_compat.py`, `handlers/native.py`, `handlers/imports.py`, `handlers/wine.py`, `updates.py`, `web_app.py`, `saves.py`, `importers.py`, `plugins.py`, `index.html`, `static/*.js`, `.github/workflows/release.yml`, `scripts/install-macos.sh`, and `emulator_defs/*.yaml`.
- Re-synced the route and settings baselines from the app. Both are unchanged (381 method-and-path pairs, 150 settings), so 1.19 added no routes or settings. Its drift is in how existing routes and surfaces behave per platform, which the literal-name gates cannot see.

## Findings

Severity: **P0** = a supported user cannot follow an install or update path, or the docs contradict a shipped guarantee. **P1** = materially wrong guidance or a documented behavior that does not exist. **P2** = precision (labels, defaults, scope wording). **GAP** = missing coverage. **G** = gate defect. **PD** = product defect: the docs are right and the code is wrong. PDs are not changed in this sweep.

### P0

| ID | Finding | Status |
|---|---|---|
| P0-1 | The site has no macOS install path. Install, downloads, updating, FAQ, compare, and enterprise pages stop at Linux and Windows. | Fixed: new `content/docs/macos.mdx`; macOS sections in `install`, `downloads`, `updating`, `faq`, `enterprise`, `compare`. |
| P0-2 | `install.mdx` and `updating.md` said only the AppImage and the Windows portable install get the built-in updater. The macOS bundle has a verified updater (`updates.py:_install_update_macos`). | Fixed. |
| P0-3 | `scripts/install-macos.sh` requires `python3` on `PATH` before it verifies anything. The app's 1.19.0 changelog says a Mac "needs nothing installed", and PARITY says it "needs no Python". | Docs corrected in the site and in app PARITY. The code is **PD-1**. |

### P1

Site:
- **P1-1** Battery was described as Linux-only in nine site locations, including the `GET /api/native/battery` reference. Source: `pkg/platform_compat.py:battery_status` reads `GetSystemPowerStatus` on Windows and `pmset -g batt` on macOS, cached for 30 seconds. Fixed.
- **P1-2** `GET /api/v2/storefronts` was documented as listing all seven built-ins. Source (`handlers/imports.py`) lists `steam` and `gameyfin` always, `heroic` on Linux and Windows, `lutris` on Linux, and `gog`, `ea`, and `ubisoft` on Windows. Fixed in `api/one-eighteen` and `api/content-and-imports`.
- **P1-3** The Windows-only import routes were documented as returning an empty result off Windows. Source: `_require_native_storefronts` raises `BadRequest`, which is a 400. Fixed in `api/one-seventeen`, `api/overview`, and `integrations/import-sources`.
- **P1-4** The `features` object of `GET /api/native/capabilities` was undocumented. Fixed in `api/local-admin` and the new `api/one-nineteen`.
- **P1-5** Off-Linux behavior was undocumented: `/api/wine/*` returns `available: false`, `/api/faugus/*` finds no data, and `POST /api/v2/launch/grant` returns 400. Fixed in `api/one-nineteen` and `guides/wine-and-proton`.
- **P1-6** `--game-mode` off Linux exits with status 2 and a fixed message. That was undocumented. Fixed in `reference/cli` and `api/one-nineteen`.
- **P1-7** The default data directory was documented for Linux and Windows only, in roughly two dozen places. Source: `default_data_dir()` uses `~/Library/Application Support/openbox-game-launcher` on macOS. Fixed across the home, install, getting-started, compare, enterprise, FAQ, interfaces-and-data, how-it-works, configuration, privacy, library, plugin, theme, diagnostic-log, API-example, and Windows pages.
- **P1-8** Storefront scope: the Storefront Manager said Heroic and Lutris were available "on both platforms". Source: Heroic is refused on macOS (`importers.py:import_heroic`), and Lutris is gated by `features.lutris`, which is Linux only. Fixed in `guides/storefront-manager`, `integrations/import-sources`, `guides/troubleshooting`, `guides/library/importing`, and the Heroic and Lutris API rows.
- **P1-9** Save discovery lacked the macOS roots: Steam Cloud under Application Support, PPSSPP, RPCS3, Dolphin, and RetroArch under Documents. Source: `saves.py:_discover_save_paths_darwin`. Fixed in `sessions-saves-and-backups`, `saves`, and `api/saves-and-operations`.
- **P1-10** The plugin sandbox is unavailable on macOS because there is no bubblewrap, so plugins are skipped unless trusted. The docs described this as a Windows condition only. Fixed in `guides/plugins`.
- **P1-11** The emulator schema table omitted `native_exe_macos`, and the 37-of-44 macOS build status was undocumented. Fixed in `guides/emulators-and-launching`, `macos.mdx`, `faq`, and `compare`.
- **P1-12** "Current release" was pinned to 1.18.0 on the install commands, Windows snippets, Flatpak URL, enterprise verify path, compare, home, Steam Deck, roadmap, and parity pages. The version gate did not catch them (G-1). Fixed.
- **P1-13** The site changelog stopped at 1.18.0. Added the 1.19.1 and 1.19.0 entries with comparison links.
- **P1-14** Release docs were incomplete. `project/releasing` listed six jobs where the workflow has eight plus `publish`, and it had no macOS artifacts. The `downloads` and `enterprise` asset tables lacked `OpenBox-macos.zip` with its `.sha256` and `.sig`, `install-macos.sh`, `verify_release.py`, and the macOS SBOM. The `dmca` signed and unsigned list was incomplete. Fixed. Source: `.github/workflows/release.yml` and `scripts/build_macos_app.sh`.
- **P1-15** `updating.md` lacked the macOS update rules: refusal while a game runs, the writable-folder check, `codesign --verify --strict`, and `OpenBox.app.previous` rollback. Fixed.
- **P1-16** `roadmap`, `windows.mdx`, and `parity` said macOS "remains out of scope". The Windows About row also listed only Windows and Linux, but About shows macOS (`static/settings.js:549`). Fixed.
- **P1-17** Landing copy said "Install on Linux or Windows", "For Linux, Windows & Steam Deck", and "Built for Linux, Windows…", and the metadata keywords had no macOS. Fixed in `components/cta-footer.tsx`, `components/hero.tsx`, and `app/layout.tsx`.

App:
- **P1-18** `docs/native-host-contract.md`: the battery paragraph and the `navigator.getBattery` row omitted Windows `GetSystemPowerStatus`. Fixed.
- **P1-19** `.github/ISSUE_TEMPLATE/bug_report.yml` had no Windows or macOS install option. The "Interface" dropdown mixed install methods with window types, and the environment prompt was Linux-only. Fixed: a separate "Install method" dropdown with five options, and an environment prompt that covers OS and version.
- **P1-20** `README.md`: the one-line description and the library data path omitted macOS, and there was no macOS FAQ entry. Fixed.
- **P1-21** `docs/PARITY.md`: the lead said "for Linux environments", the tray row said Linux and Windows, several 1.18 rows were still marked "(1.18 unreleased)" after 1.18.0 shipped, and the no-install row said a Mac needs no Python. Fixed.
- **P1-22** `docs/flathub-checklist.md` listed "Windows/macOS" as ruled out, which contradicts the supported platforms. Fixed.
- **P1-23** `docs/TRADEMARKS.md` described OpenBox as a Linux manager and named no Apple or Microsoft platform marks. Fixed.

### P2 (precision, selected)

- Site: Linux-only labels for TDP and Steam Game Mode (`performance`, `hardware-matrix`, `faq`); macOS shlex quoting in `command-tokens`; `openbox.sock` and tray menus in `interfaces-and-data` and `data-and-recovery`; the launcher pickers in `cli`; scope notes on `faugus` and `wine`; the `parity` summary range; the privacy data path; the battery description in `frontend-modules`.
- App: `docs/README.md` ADR index stopped at 0079 (now 0086); the emulator-gate description omitted `native_exe_macos` (ADR 0085); the `CONTRIBUTING` release-authority list omitted the macOS and Windows artifacts; `AGENTS.md` did not reference the capability contract (ADR 0086); `RELEASE_NOTES` said every artifact is signed, but the installer scripts are not; the README Big Box feature line was not Linux-scoped.

### GAP

- **GAP-1** No macOS platform guide. Added `content/docs/macos.mdx`, covering requirements, install, first launch, the launcher, the native window, updates, data location, storefronts, emulators, saves, battery, what is hidden, source builds, and troubleshooting.
- **GAP-2** No page for the 1.19 behavior changes to existing routes. Added `content/docs/reference/api/one-nineteen/`, linked from the API overview and the 1.17 and 1.18 pages.
- **GAP-3** No macOS development notes. Added to `project/contributing`.
- **GAP-4** No macOS FAQ entry on the site or in the README. Added both.
- **GAP-5** **OPEN.** No macOS screenshot exists. The screenshots in `public/` and `assets/` are Linux captures. The 1.19 UI changes are hidden controls only, so the Linux captures remain accurate. A macOS capture needs `scripts/capture_readme_screenshots.py` run on a Mac.

### Gate defects

- **G-1** `scripts/check-version-currency.mjs` took "current" from the site's own changelog, so a site a full release behind passed every gate. The site stayed at 1.18.0 while the app was at 1.19.1. **Fixed:** the gate now reads the app's `VERSION` when `OPENBOX_APP_DIR` is set, and the latest published release when `OPENBOX_RELEASE_REPO` is set. Verified: it passes at 1.19.1, and it fails when a fake app reporting `1.20.0` is injected.
- **G-2** **OPEN.** Literal-name and key-presence gates cannot see behavior drift: payloads, status codes, and host gating. This sweep is the only check for that class. A per-platform fixture test would close it.
- **G-3** **OPEN.** The version gate misses bolded or prose versions, such as `current release is **1.18.0**`.
- **G-4** **OPEN.** No gate covers screenshots or UI labels against the current app.

### Product defects (docs are correct; code not changed here)

- **PD-1** **OPEN.** `scripts/install-macos.sh` requires `python3` on `PATH` before it verifies the release. It checks presence only, although its message asks for 3.10 or newer. This contradicts the "needs nothing installed" claim. Options: verify with a tool a stock Mac already has, or run the verifier with the bundle's own Python. This needs a decision.
- **PD-2** **OPEN.** `POST /api/import/lutris` has no host gate, unlike the GOG, EA, and Ubisoft routes. On Windows and macOS it runs and returns a Lutris-not-found error rather than the 400 the 1.19.1 contract uses.
- **PD-3** **OPEN.** The released 1.19.0 entry in `docs/CHANGELOG.md` says "a Mac needs nothing installed". Released entries are not edited (ADR 0064), and the site changelog states the correct requirement. Maintainer decision.

## Verification

Run:
- **Docs site `npm run build`** passed: MDX compile (109 pages); contract, API, and version gates; release-asset pairing; Next static export (112 pages); redirect stubs; sitemap (110 URLs); and the built-site check (129 HTML pages and routes, with no broken links, fragments, or images reported).
- **Version gate fault injection:** passes against the app at 1.19.1, and fails against an injected 1.20.0.
- **App repo:** `make ratchets` passed (settings 150, emulator definitions 44, frontend modules 51, reliability catalog 112 rows with every Tested row naming a real test, clock coupling, exec modes). `scripts/check_version_sync.py` passed. `scripts/gen_api_docs.py --v2 --check` reported the API docs fresh.

Not run:
- **The app test suite and `make check`.** The app repo changed in documentation and templates only.
- **Any macOS installer or app run.** No macOS host was available. macOS statements are verified against source and the release workflow, not by running them on a Mac.

## Changed files

- **Docs repo:** 55 modified (54 content, components, app, and tooling files, plus the supersession note in `DOCS-SWEEP-2026-10-19.md`), and 3 added (`DOCS-SWEEP-2026-10-28.md`, `content/docs/macos.mdx`, `content/docs/reference/api/one-nineteen/`). The baselines `scripts/api-routes.baseline.json` and `scripts/contracts.baseline.json` are unchanged.
- **App repo:** 10 modified: `README.md`, `AGENTS.md`, `docs/PARITY.md`, `docs/README.md`, `docs/CONTRIBUTING.md`, `docs/RELEASE_NOTES.md`, `docs/TRADEMARKS.md`, `docs/flathub-checklist.md`, `docs/native-host-contract.md`, and `.github/ISSUE_TEMPLATE/bug_report.yml`.
