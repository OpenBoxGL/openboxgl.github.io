# OpenBoxGL Docs — Coverage and Currency Audit

Updated **2026-10-19** against the application's **1.17.0** release. The version
literal lives only in `updates.py` (`VERSION = "1.17.0"`); `openbox.py` has none.
The application checkout is past the release and carries unreleased 1.18 work,
which this audit marks separately.

This file records the evidence for the current docs sweep. It is an internal
audit, not a published page. The site's own gates are the contract; this file
explains what they cover and where a human still has to look.

## Current coverage

| Surface | Source of truth | Current result |
| --- | --- | --- |
| API routes | `routes.py` and `@route` decorators | **381/381** method+path pairs documented in the current source tree (49 are 1.18-unreleased) |
| Settings | `settings_schema.KNOWN_SETTINGS` | **150/150** settings documented (39 are 1.18-unreleased) |
| Launch tokens | application launch-token table | **24/24** documented |
| Webhook payloads | webhook event table | **9/9** documented |
| Version currency | latest `##` entry in `content/docs/changelog.md` | every app-version claim reads **1.17.0** or is explicitly historical |
| Docs pages | `content/docs/**/*.md(x)` | **106** pages scanned |
| Built-site routes | `scripts/check-built-site.mjs` | every required route and internal link is checked after export |

Run the three content gates directly:

```bash
node scripts/check-contract-coverage.mjs
node scripts/check-api-coverage.mjs
node scripts/check-version-currency.mjs
```

The app's 1.17.0 cut recorded **316 route paths / 111 settings**. The current
source tree has **359 live paths / 381 method+path pairs / 150 settings**. The
current 381 includes **49 method+path pairs added after 1.17.0** (43 new paths
plus six new methods on existing paths), and 22 paths serve two methods, so
359 paths become 381 pairs for this site gate. The 49 routes and 39 settings
that postdate 1.17.0 are marked **1.18 unreleased** in the reference pages; do
not read the site's total as a 1.17.0 feature list.

The version gate also checks release assets against the real release when
`OPENBOX_RELEASE_REPO` is set. That lookup is intentionally best-effort in
local runs: a failed API call is reported and skipped rather than failing an
otherwise good build. CI sets the variable.

## What this sweep changed

- Added the **1.17.0 changelog entry** and the comparison links for 1.16.0,
  1.16.1, and 1.17.0. The previous changelog ended at 1.16.1 while the app
  shipped 1.17.0.
- Added **`reference/api/one-seventeen`** for Game Night decks and native
  Windows GOG, EA app, and Ubisoft Connect imports, and registered it in the
  sidebar.
- Closed the route-coverage gap: **55 routes** had shipped without a literal
  mention anywhere in `content/docs`. They are now grouped by surface in the
  API pages rather than dumped into one generated table. Of those, **49** are
  present only in the unreleased 1.18 tree and carry a **1.18 unreleased**
  marker.
- Closed the settings gap: **40 keys** existed in `KNOWN_SETTINGS` but not in
  `reference/configuration.md`. They now sit in the display/input/integration
  table with defaults and validation limits. **39** are 1.18-unreleased; only
  `currency` shipped in 1.17.0.
- Updated the **current-release claims** in install, downloads, Windows, Steam
  Deck, enterprise, compare, index, roadmap, parity, Play Insights, API
  examples, and the theme/command-builder version badges.
- Updated the **roadmap** so it no longer says the Game Night deck builder is
  unshipped (it shipped in 1.17.0) and so its "coming next" list matches the
  1.17.0 known limits.
- Separated the **unreleased 1.18 tree** from the 1.17.0 release: 49 routes and
  39 settings carry a 1.18-unreleased marker instead of reading as 1.17.0
  features.
- Corrected the **auto-import** wording: 1.17.0 is manual, but the unreleased
  1.18 build adds opt-in startup auto-import checkboxes for GOG, the EA app,
  and Ubisoft Connect on Windows. The false "no auto-import" claim was removed
  from the current-behaviour guides and API page.
- Dropped confirmed stale line-number citations in the setup-center and
  configuration pages in favour of file-plus-symbol references.
- Updated the **parity page** to v1.17.0 and added the four 1.17.0 capability
  rows, plus `parity_storefront_windows.py`.
- Updated the guides for the **1.17.0 features**: native Windows imports in
  Import sources / Importing / Storefront Manager / Windows, decks in Big Box,
  price and cost per hour in Play Insights, translated notices in the
  notification guide, and the local-only fields in library sync and Time
  Machine.
- Corrected the **ScreenScraper** setup: all four values are required,
  including `SCREENSCRAPER_DEV_ID`/`SCREENSCRAPER_DEV_PASSWORD`, in the
  configuration table, provider guide, and API page.
- Wrapped stale **1.17.0 feature history** into getting started and the FAQ,
  which stopped at 1.15 and 1.16 respectively.
- App repository docs: regenerated `docs/api-v2.md` with
  `python3 scripts/gen_api_docs.py --v2`, fixed the changelog's `Unreleased`
  comparison link and added the missing 1.16/1.17 links, corrected the archive
  entry that still called 1.17.0 release-pending, and updated the ADR range to
  0079.

## What the gates do not prove

- **Route coverage is literal-name coverage.** A route passes when its exact
  path appears in a doc. A wrong description, a stale body shape, or an
  example that no longer matches the handler still passes. The reverse
  direction catches a documented route that no longer exists.
- **Settings coverage is key-presence coverage.** The configuration table can
  state a wrong default and still pass. Defaults in the table were checked
  against `handlers/settings.py` and the public projection in
  `pkg/state/cache.py` during this sweep.
- **Version currency is literal-driven.** It knows how to find installer
  assignments, release URLs, asset filenames, and "current release" prose. It
  does not understand every English sentence. Historical version mentions are
  legitimate and deliberately not rewritten.
- **The app repository is not covered by the site gates.** `docs/api-v2.md` is
  generated; `docs/CHANGELOG.md`, `docs/README.md`, and `docs/PARITY.md` are
  hand-maintained. Check them when a release changes a count, a status, or a
  comparison link.
- **Asset verification needs network access and a repo name.** Without
  `OPENBOX_RELEASE_REPO`, a documented asset name is only checked for version
  currency, not for existence on the release.
- **Line-number citations drift.** Prefer a file plus a symbol name (for
  example `pkg/state/cache.py`, `public_settings`) over `file.py:NNN`; the
  confirmed stale citations in the setup-center and configuration pages were
  reduced to file-plus-symbol form during this sweep.

## Manual audit recipe

Use this when a future release adds routes, settings, or a feature surface:

1. Sync the route baseline from the application:
   ```bash
   OPENBOX_APP_DIR=/path/to/OpenBoxGL npm run routes:sync
   ```
2. Sync the contract baseline after every intentional surface change:
   ```bash
   OPENBOX_APP_DIR=/path/to/OpenBoxGL npm run contracts:sync
   ```
3. Run the three gates above and let them name every missing route, setting,
   launch token, webhook event, and stale version literal.
4. Search for current-release prose, not just the previous version number:
   `current release`, `currently v`, `still shipped`, `latest release`.
5. Search version literals inside fenced code blocks separately. A
   copy-pasteable installer with a stale `VERSION=` is worse than prose.
6. Read the new feature's guides, not only the API table: a route can be
   documented while the screen a user actually clicks is missing.
7. Run `npm run test`, which builds the static site, generates redirects and
   the sitemap, and checks the built routes and links.

## Known limitations in the application docs

These are stated in the release notes and are not docs defects:

- Xbox PC package scanning and owned-but-uninstalled GOG/EA/Ubisoft catalogs
  are not imported.
- Native Windows storefront imports are manual in 1.17.0. The unreleased 1.18
  build adds opt-in per-source startup auto-import checkboxes (off by default),
  so the 1.17.0 release-note wording must not be repeated as current behaviour.
  Owned-but-uninstalled catalogs are still not imported.
- Cost totals are grouped by currency and are not converted. A cost-per-hour
  rate needs a priced game with at least one minute played.
- GOG launches its executable directly, so Galaxy overlay and cloud saves are
  not started. EA and Ubisoft depend on their registered URI handlers.
- Notification titles and bodies are translated; other server responses and
  some dialog labels remain English.
- Windows ARM64 and macOS remain out of scope.
