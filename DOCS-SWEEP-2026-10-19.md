# OpenBoxGL Docs — Exhaustive Gap & Staleness Sweep (1.18.0)

Audit date **2026-10-19**, remediation completed **2026-10-20**, against app
**1.18.0** (`updates.py:30`, tag `v1.18.0`) and the docs site working tree.

Supersedes `DOCS-STALE-SWEEP.md` (that file audits 1.17.0 and is now behind both repos).
This is an internal audit record, not a published page.

**Scope**

- App repo: `/home/hayden/Desktop/projects/OpenBoxGL` — `README.md`, `AGENTS.md`, `docs/**`
  (CHANGELOG, RELEASE_NOTES, PARITY, plugin-api, native-host-contract, reliability,
  CONTRIBUTING, SECURITY, SUPPORT, TRIAGE, DISCLAIMER, flathub, api-v2, development/, adr/,
  archive/), `.github/ISSUE_TEMPLATE`, workflows.
- Docs site: `/home/hayden/Desktop/projects/openboxgl.github.io` — all 107 pages under
  `content/docs`, plus `components/`, `lib/docs.ts`, `scripts/`, `public/`.

**Method** — every claim traced to source (`handlers/`, `pkg/`, `static/`, `index.html`,
`tests/`, `scripts/`, workflows) rather than to the prior sweep. Gates were run first
(all pass), then the gates were supplemented with per-surface audits, a full MDX compile
of every page, a built-site link/fragment/image crawl, and a source-to-doc diff of every
1.18.0 changelog bullet. All P0/P1 findings below were re-verified by hand.

**Counts** — 1 build-blocking defect fixed, 2 P0, 24 P1, 61 P2, 6 coverage gaps, 2 stale
asset sets, 1 stale internal audit file.

---

## RESOLUTION (2026-10-20) — every finding closed

| Area | Outcome |
| --- | --- |
| Build-blocking (§0) | **Fixed.** 4 MDX pages repaired, 1 dead anchor repointed; the site exports 127 routes and `check-built-site.mjs` reports 0 broken links, fragments or images. |
| P0-1 backup redaction | **Fixed in code.** `pkg/parity/parity_redact.py` now redacts `obs_websocket_password` and the whole `integration_tokens` map; `merge_preserved_credentials()` re-merges the local copy on restore. New tests inspect the archive members (`tests/test_backup_redaction.py`). The three doc claims are now true and name what is redacted. |
| P0-2 Windows installer | **Fixed.** `scripts/install.ps1` now explains the supported flow when the verifier is missing instead of dying cryptically, and the site (install, downloads, Windows) documents the working zip → `Expand-Archive` → `OpenBox\scripts\install.ps1` flow the app README already used. The standalone asset is described accurately. A standalone Windows bootstrap would need a per-tag verifier pin — a trust-anchor design the project has not chosen — so the docs point at the flow that works. |
| P1-1 … P1-17 (API) | **Fixed** across `reference/background-jobs`, `reference/api/one-eighteen`, `reference/api/content-and-imports`, `reference/api/library-and-settings`, `reference/api/local-admin`, `reference/api/screenscraper-and-export`, `reference/api/saves-and-operations`, `reference/api/automation`. |
| P1-18 … P1-20 (plugins) | **Fixed** — the four fabricated plugin error strings are now the real literals, safe mode is scoped to the lifecycle hooks, and the trust claim is qualified. |
| P1-21 … P1-29 (guides) | **Fixed** — backup dialog, filter tri-state, Launch check rename, shortcuts/help table, search syntax, bulk-edit fields, Verify Steam files, watch-folder backoff, settings category. |
| P1-30 … P1-36 (public pages) | **Fixed** — privacy metadata-sync wording, the non-existent hero one-liner, the token wording, TDP sentence, reversed security sentence, `less install.ps1`, DMCA signing list, and the Windows install flow. |
| P1-37 … P1-40 (configuration) | **Fixed** — Gameyfin storage location, `.env` scope, per-provider credential precedence, Steam file-first precedence. |
| P1-41 … P1-45 (app repo) | **Fixed** — bug template version and diagnostic path, DISCLAIMER provenance, SECURITY signing scope, AGENTS.md macOS, CHANGELOG UI names, and the native-host deeplink. The deeplink gap was closed in the product too: `static/app.js` now handles `?deeplink=resume&id=` and scrolls the selected card, guarded by a new cross-file test (`tests/test_frontend_contract.py`) that fails if the host ever emits an action the page ignores. |
| P2 (61 items) | **Fixed** across both repos: design-system values (1120px, 24px 16px, `system-ui`), the app-release job list and asset inventory, `docs/RELEASE_NOTES.md` path, plugin catalog duplication, search-syntax keys and citation, command-token error and `{Path}` heuristic, snapshot naming and debounce, `default_state()` keys, stable-id payload, settings projection note, `.env` roots and mode, media-root cap, unsandboxed-plugin condition, data-dir fallback, validation wording, export filenames, native `403`, webhook validation, Explorer label, watch-folder interval, glossary terms, category label, integration-token coverage, controller-remapping coverage, startup-scan budget, `storefront_auto_import` migration note, macOS row, trademark and licence wording, and the localization key count (now the verified 52 of 55). |
| G-1 … G-6 (coverage gaps) | **Closed**: controller remapping (emulators guide), integration tokens (media-providers guide), glossary terms (library guide), scan budget (storefront guide), `storefront_auto_import` migration (configuration reference), and the two missing operation types (background jobs). |
| §5 stale assets | **Fixed** — the README and site screenshots were regenerated with `scripts/capture_readme_screenshots.py` against the 1.18.0 UI, so the top bar shows the single **Add games** menu instead of the four pre-1.18 buttons. |
| Gate gaps (§6) | **Closed where they were cheap**: the version gate now parses the release version the bug-report template advertises instead of looking for a version string anywhere in the file; the site gained a per-page MDX compile step so one bad page can no longer disable every other gate. |
| `DOCS-STALE-SWEEP.md` | Marked superseded and pointed here. |

**Still open by design:** the app's `docs/api-v2.md` and `docs/reliability.md` needed no
change (both verified current), and ADRs 0080–0084 are untracked in the author's working
tree — they belong to that in-progress work, not to this sweep.

---

## 0. Build-blocking (fixed in this sweep)

The site **did not build**. `next build` aborted on the first MDX parse error, so none of
the site's own gates (link check, route check, sitemap check) could run against the
current content. Four pages contained raw `<...>` outside code spans, which MDX parses
as JSX.

| File | Line | Problem | Fix |
| --- | --- | --- | --- |
| `content/docs/guides/emulators-and-launching/index.md` | 82 | `<Platform> override` and **Reset `<Platform>` override** — two raw tags | wrapped in code spans |
| `content/docs/guides/library/index.md` | 28 | `"Not <field>: <value>"` | wrapped in code spans |
| `content/docs/guides/library/organizing/index.md` | 20 | `"Not <field>: <value>"` | wrapped in code spans |
| `content/docs/reference/api/one-eighteen/index.md` | 225 | `plugin:<id>:<source>.` inside a quoted error string | wrapped the whole string in a code span |
| `content/docs/guides/metadata-and-media/index.md` | 94 | link to `#generic-job-manager`; the heading is `### Job manager and durable operations` | repointed to `#job-manager-and-durable-operations` |

After the fixes: `npm run build` passes all three content gates, exports 127 routes, and
`check-built-site.mjs` verifies 127 HTML pages with **0** broken links, fragments, or
images. A standalone MDX compile of all 107 pages now reports **0** errors.

> Gate gap: `check-built-site.mjs` only runs *after* `next build`, so an MDX error hides
> every other gate. Consider adding a cheap "compile every page" pre-gate (the two lines
> used here) so a single bad page cannot disable the whole suite.

---

## 1. P0 — defects in the product that the docs describe incorrectly

### P0-1 Backups do not redact the tokens the docs promise are redacted

The docs promise blanket credential redaction, but the redaction key list does not
cover the two secret stores added later.

- `content/docs/reference/library-backups/index.md:31` — manifest example
  `"redacted_secrets": true`
- `content/docs/reference/library-backups/index.md:35` — "Backups automatically redact
  sensitive API keys/passwords, and local credentials are automatically preserved and
  remerged on restore."
- `content/docs/guides/sessions-saves-and-backups/library-backups/index.md:6` — "Local
  credentials are redacted from export and safely preserved on restore."
- `content/docs/guides/sessions-saves-and-backups/library-backups/index.md:21` — "a backup
  cannot leak a plugin secret or erase one on restore."

Source truth — `pkg/parity/parity_redact.py:9-15`:

```python
REDACTED_KEYS = frozenset({
    "gameyfin_password", "secret", "api_key", "access_token", "credentials",
})
```

`integration_tokens` (the per-provider IGDB / ScreenScraper / SteamGridDB / Gameyfin /
RetroAchievements store added in 1.18) and `obs_websocket_password`
(`settings_schema.py:119`) are **not** in that set, and `merge_preserved_credentials()`
iterates the same set. The backup writer serialises settings through `redact_settings()`
(`pkg/parity/parity_backup.py:237`) and the library through `redact_state_for_export()`
(`:239`), so both values are written into `settings.json` / `library.json` in cleartext
and are not preserved-and-remerged on restore.

**Impact** — a default backup (`library` + `settings`) contains provider tokens in
plaintext. This is the single most harmful documentation/behavior mismatch in the sweep.

**Correction (code first)** — add `integration_tokens` and `obs_websocket_password` to
`REDACTED_KEYS`, extend `merge_preserved_credentials()`, and add a test that reads the
archive members rather than the manifest flag. Until that ships, the three doc sentences
above must be narrowed to the keys that are actually redacted.

### P0-2 The site instructs users to download a Windows installer that cannot run

- `content/docs/install.mdx:22` — "download the release's `install.ps1`, inspect it, and
  run it"
- `content/docs/install.mdx:166-172` — standalone download, then `.\install.ps1 -Tag "v$Version"`
- `content/docs/downloads.md:83-86` — same flow (plus `less install.ps1`, which is not a
  PowerShell command)
- `content/docs/windows.mdx:26-40` — "Download the installer … then run the installer"

`scripts/install.ps1:115-119` resolves its verifier **one directory above itself**:

```powershell
$repoRoot = Split-Path -Parent $PSScriptRoot
$verifier = Join-Path $repoRoot 'updates.py'
if (-not (Test-Path -LiteralPath $verifier -PathType Leaf)) {
    Die "The release verifier was not found at $verifier. Run this script from a checkout."
}
```

Downloaded alone into `Downloads\`, the script dies immediately. The working flow is the
zip: `README.md:64`, `README.md:389-404` — download `OpenBox-x86_64-windows.zip`, extract,
run `OpenBox\scripts\install.ps1` (the zip contains `updates.py`).

**Correction** — make `install.mdx`, `downloads.md`, and `windows.mdx` describe the
zip-extract flow, as the README does. Either make the standalone asset self-contained
(fetch and pin `updates.py` from the same tag) or stop advertising it as runnable.

---

## 2. P1 — materially wrong guidance

### 2.1 API reference (site)

| # | Location | Wrong | Source truth | Correction |
| --- | --- | --- | --- | --- |
| P1-1 | `reference/background-jobs/index.md:14,20,22` | operation object has `operation_id`, a `progress` object with `unit`, and `metadata` | `pkg/state/operations.py:195-223` — the snapshot has `job_id`, flat `phase`/`current`/`total`/`message`, and `input`; also `root_job_id`, `retry_of`, `resume_of`, `title`, `updated_at`, `can_cancel`/`can_retry`/`can_resume`, `checkpoint`, `result`; `error` is `{code, message, request_id}` (`:146-154`) | rewrite the table to the `_snapshot()` shape; note the page already uses `job_id` at `:52`, so it is internally inconsistent |
| P1-2 | `reference/api/one-eighteen/index.md:355,358`; `reference/api/content-and-imports/index.mdx:466` | scan example `{"sources": ["steam", "gog"]}` and "defaults to every built-in and enabled plugin source" | `pkg/state/imports.py:601` `STOREFRONT_SOURCES = ("steam", "heroic", "lutris", "gameyfin")`; `handlers/imports.py:110-126` builds the known set from that plus enabled plugin ids, so `"gog"` returns `400 "Unknown storefront source: gog"` (the Windows stores are import-only, not scan sources) | use `["steam", "heroic"]`; say the default is those four built-ins plus plugin sources |
| P1-3 | `reference/api/one-eighteen/index.md:450`; `reference/api/content-and-imports/index.mdx:409,415` | platform entries are "**effective** values … not just stored overrides" | `handlers/emulators.py:44-45` — `global` uses `effective_values(...)`, `platforms` uses `stored.get("platforms", {})` (raw partial overrides) | only `global` is effective; each `platforms` entry is a stored partial override |
| P1-4 | `reference/api/one-eighteen/index.md:363`; `reference/api/content-and-imports/index.mdx:472` | plugin storefront needs "installed, enabled, and declare the `storefront` capability" | `pkg/parity/parity_plugin_storefront.py:76-95,207-209` also calls `require_network_grant` → "Plugin does not declare network access." / "Grant network access to this plugin first." | add the declared **and granted** `network` permission to both pages |
| P1-5 | `reference/api/library-and-settings/index.mdx:78,85` | bulk edit returns `{"updated": n}` | `handlers/library.py:719,824-829` also returns `media_moved` and `media_errors` | document both counters |
| P1-6 | `reference/api/screenscraper-and-export/index.mdx:82,91` | export file `openbox-export-2026-09-03.json`; listing keys `size`/`created` | `pkg/parity/parity_export.py:21,97-98,146-159` — `openbox-library-YYYYMMDD-HHMMSS.<fmt>`; keys `name`, `bytes`, `modified` | correct both |
| P1-7 | `reference/api/saves-and-operations/index.mdx:35` | `POST /api/saves/scan/apply` "Returns `{"updated": …}`" | `handlers/data.py:603-645` returns `202 {"state": "queued", "job_id"}` | document `202` + job polling |
| P1-8 | `reference/api/saves-and-operations/index.mdx:161` | `POST /api/cloud/sync` "Returns `{"path", "games", …}`" | `handlers/health.py:174-179` returns `202 {"state": "queued", "job_id"}` | document `202` + job result |
| P1-9 | `reference/api/local-admin/index.mdx:428` | native dialog unauthorized → `401 {"error": "unauthorized"}` | `handlers/native.py:43-47,101-106` → `403 {"error": "Unauthorized"}` | fix status and capitalisation |
| P1-10 | `reference/api/automation/index.mdx:109`; `integrations/webhooks.md:74` | loopback checked "both by port match and by a live TCP probe" | `automation.py:556-572` only compares `openbox_port` to the URL port; `_port_in_use` (`:230`) is never called | drop the TCP-probe claim |
| P1-11 | `reference/api/automation/index.mdx:109`; `integrations/webhooks.md:73` | "unspecified, multicast, link-local, and reserved addresses are rejected" | `automation.py:466-472` rejects every address where `not ip.is_global` — private and CGNAT ranges too | say only globally routable addresses are accepted |
| P1-12 | `reference/api/one-eighteen/index.md:502`; `reference/api/library-and-settings/index.mdx:248` | Steam app id "numeric and below 100,000,000" | `handlers/data.py:270-271` requires `0 < int(app_id) < 100000000` | "a positive integer below 100,000,000" |
| P1-13 | `reference/api/one-eighteen/index.md:360` | "Sources with no library games are skipped" | `pkg/state/imports.py:762-781` skips only sources that are **not installed and** unrepresented in the library | qualify the condition |
| P1-14 | `reference/api/one-eighteen/index.md:112` | media cache cleanup: "a non-integer returns `400`" | `handlers/media.py:254-259` uses `int(days)` — `"30"` is accepted, `30.5` truncates | say "a value that cannot be converted to an integer" |
| P1-15 | `reference/background-jobs/index.md:26` | operation types stop at `updater.install` | `job_manager.py:40,45` also emit `storefront.scan` and `saves.restore` | add both |
| P1-16 | `reference/background-jobs/index.md:52` | interrupted states are `running` or `queued` | `pkg/state/operations.py:29,267` `ACTIVE_STATES = {"queued","running","cancelling"}` | add `cancelling` |
| P1-17 | `reference/api/local-admin/index.mdx:308` | "A local-only or unavailable catalog entry leaves the installed package in place" | `handlers/extensions.py:421-432` reinstalls from the recorded local package; only a missing package raises `400` | correct the behavior |

### 2.2 Plugin reference (site)

| # | Location | Wrong | Source truth | Correction |
| --- | --- | --- | --- | --- |
| P1-18 | `reference/plugins/process-and-errors/index.md:19,20,47,49` | four quoted plugin error strings that do not exist in the codebase | `plugins.py:1366` "Payload is too large for plugin execution."; `:1389` "Plugin output exceeded the payload limit."; `:1391` `f"Plugin exited with status {code}: {stderr}"`; `:1398` "Plugin returned invalid JSON."; `:1400` "Plugin output must be a JSON object." | replace with the real literals; a plugin author grepping for the documented text finds nothing today |
| P1-19 | `reference/plugins.md:17` | "Safe mode (`OPENBOX_SAFE_MODE=1`) bypasses plugin execution entirely" | `reference/plugins/overview/index.md:60` and `process-and-errors/index.md:69` say capability hooks still run; `pkg/state/cache.py:1212,1259` gates the lifecycle hooks only | say it bypasses the lifecycle hooks |
| P1-20 | `reference/plugins/overview/index.md:21,79`; `process-and-errors/index.md:86`; `guides/plugins/index.md:52,78`; `manifest/index.md:162`; `catalog/index.md:52` | "trust are preserved" / "without touching … trust" | `plugins.py:590-613` re-hashes the package; different bytes ⇒ `trusted` False and the grant is dropped | the trust *record* survives but is re-evaluated against the new checksum |

### 2.3 Guides and reference behaviour (site)

| # | Location | Wrong | Source truth | Correction |
| --- | --- | --- | --- | --- |
| P1-21 | `guides/sessions-saves-and-backups/library-backups/index.md:6,10-12`; `guides/sessions-saves-and-backups/index.md:50` | the Backup dialog has an item picker and a rotation control; "**Backup** dialog (top bar)" | `index.html:485-493` — the dialog has only **Create backup**, **Refresh**, the list, **Done**; `static/settings.js:1648-1650` always sends `items:['library','settings','media','plugins','themes'], keep:7`; `handlers/health.py:143` defaults to `["library","settings"]` when omitted; `index.html:61` puts Backup under **Tools** | rewrite the procedure: Tools → Backup → Create backup; the dialog has no item/rotation controls; `extension_data` is API/CLI-only |
| P1-22 | `guides/library/index.md:28`; `guides/library/organizing/index.md:20` | platform, category, source and smart-collection filters all cycle include → exclude → clear | `index.html:109` — Source is a `<select>` + an **Exclude** checkbox; `static/library.js:433-455`; smart collections (`:1919-1927`) load their saved query and have no exclude state; only platform and category use `cycleSingleFilter()` (`:957,981`) | describe the real per-widget behaviour; `exclude.source` is a preset/playlist rule |
| P1-23 | `guides/emulators-and-launching/index.md:168,170,207,211,212,220,227,240,250`; `guides/library/setup-center/index.md:16`; `guides/troubleshooting/launching/index.md:55` | current-tense "Launch Doctor" | `static/library.js:1641` renders `<h3>Launch check</h3>`; `index.html` renames it in 1.18 (see `docs/CHANGELOG.md:119-120`) | use **Launch check** for the UI, keep `parity_launch_doctor.py` / `/api/v2/launch/preflight` for internals |
| P1-24 | `reference/shortcuts/index.md:6,16` | the in-app Help table is "rendered from the same source the library navigation uses, so a remapped binding is what you see" | `static/help.js:21-30` is a frozen 8-row array (`Ctrl/Cmd+K`, `/`, `Enter`, arrows, `F`, `Shift+M`, `Esc`, `F1/?`) and never reads `keyboard_map`; `static/navigation.js:25-31` holds a different 5-row table | say the Help tab is a short static list that does not reflect remapping; the reference page is the authoritative table |
| P1-25 | `reference/search-syntax/index.md:72,76-83` | bare terms search the 16 listed fields, and acronym matching applies to bare terms | `static/util.js:72` maps a keyless token to `title` → `['name','sort_title','alternate_names']` (`:89`); the 16-field set is the explicit `all:` key (`:96`); the acronym branch is gated on `key === 'all'` (`:116`) | bare terms match title/sort title/alternate names; `all:<term>` searches the 16 fields; acronym matching runs in the command palette and `all:` |
| P1-26 | `guides/library/organizing/index.md:54` | Bulk Edit offers name, platform, genre, developer, publisher, region, source, notes, **progress**, **ESRB** | `index.html:471` — the **Find in field** select has 8 entries (name, notes, genre, developer, publisher, platform, region, source); the API also accepts `progress`/`esrb` (`pkg/parity/parity_bulk_edit.py:9-20`) | list the 8 UI fields, note the API extras |
| P1-27 | `guides/storefront-manager/index.md:41,60`; `guides/library/importing/index.md:44` | the button is "**Verify files**" | `static/library.js:1606` and `static/bigbox.js:586` render "**Verify Steam files**" | use the exact label |
| P1-28 | `guides/storefront-manager/index.md:45`; `integrations/import-sources.md:50` | watched folders re-import "every 10 seconds, backing off … when the library cannot be read" | `pkg/state/imports.py:458-476,596-597` — every tick that finds nothing (idle or unreadable) doubles the delay up to 300 s; a successful import resets to 10 s | say the backoff applies to any empty tick, so a new file can wait up to 5 minutes |
| P1-29 | `integrations/accounts-and-media.md:70`; `guides/metadata-and-media/index.md:30` | "Settings → Metadata" | `index.html:576` — the category is **Metadata & Media** | use the exact category name |
| P1-30 | `policies/privacy.md:22` | "Matching games against the LaunchBox Games Database sends the game title and platform identifiers for that lookup … on the schedule you set" | `metadata.py:27` + `handlers/metadata.py:478-489` — the app downloads `Metadata.zip` and matches locally (`metadata.py:368`); there is no per-title request and no schedule | describe a database download plus local matching |
| P1-31 | `policies/privacy.md:42` | "The install one-liner in the hero downloads the latest AppImage …" | `components/hero.tsx:31-35` renders a link to `/downloads/`; no one-liner exists on the landing page | point at /downloads/ and /install/ |
| P1-32 | `steam-deck.md:45` | "OpenBox does not control TDP; use Steam's QAM or your image's handheld tools" | two lines later (`:49`) the page documents per-launch TDP limits via `ryzenadj` (`pkg/parity/parity_perf.py:59-125`) | narrow the sentence to live in-game control |
| P1-33 | `install.mdx:69` | "older releases carry security fixes that are not backported" | `policies/security.md:14` — "None of them is backported, so upgrading is the fix" | the sentence is logically reversed; rewrite as "security fixes are not backported to older releases" |
| P1-34 | `downloads.md:85` | `less install.ps1` in a ```powershell block | `less` is not a PowerShell cmdlet or alias and is absent from stock Windows | use `Get-Content .\install.ps1` |
| P1-35 | `policies/dmca.md:15` | the Flatpak bundle, SBOMs and `install.sh` are "signed" | `.github/workflows/release.yml:499-517` publishes `.sha256`/`.sig` only for the AppImages, the Windows zip and the native host; `release-flatpak.yml:84,124-136` publishes an unsigned bundle | list what is actually signed; keep the installers described as verifiers |
| P1-36 | `policies/privacy.md:15` | "every request must carry a per-launch token" | `web_app.py:416-423,425-488,499-507` and `routes.py:9-60` — `/`, `/index.html`, `/static/*` and the locale JSON files are public | say "every API request" (as `index.mdx:29` and `enterprise.md:49` already do) |

### 2.4 Configuration reference (site)

| # | Location | Wrong | Source truth | Correction |
| --- | --- | --- | --- | --- |
| P1-37 | `reference/configuration.md:101` | Gameyfin password persists in "`retroachievements.json`, `emumovies.json`, `settings.json`" | `handlers/settings.py:885` writes `gameyfin_password` into state settings, stored in `library.json` (`openbox.py:22`); `settings.json` exists only as a backup archive member (`pkg/parity/parity_backup.py:18,388-389`) | `library.json` — the same page already says so at `:193` |
| P1-38 | `reference/configuration.md:6,12-16,30`; `install.mdx:204` | `.env` "loads optional credentials and settings" | `env_config.py:12-27,108-114` loads only `ENV_KEYS` (provider credentials, GitHub token aliases, `OPENBOX_ALLOW_HTTP_WEBHOOKS`, `OPENBOX_ALLOW_HTTP_GAMEYFIN`); everything else is dropped silently — including `OPENBOX_MEDIA_ROOTS`, `OPENBOX_SAFE_MODE`, `OPENBOX_SNAPSHOT_DEBOUNCE`, `OPENBOX_EXECUTABLE`, `OPENBOX_ENABLE_DMABUF`, `OPENBOX_WEBKIT_HARDWARE_ACCELERATION`, `OPENBOX_ENABLE_SQLITE_READ` | state that `.env` is a credential/HTTP-allowlist file and mark the process-env-only rows |
| P1-39 | `reference/configuration.md:14` vs `integrations/accounts-and-media.md:81`, `guides/troubleshooting/integration-credentials/index.md:6,41` | credential precedence stated as a single global order (persisted settings "lowest" vs "resolve first") | precedence is per provider: RetroAchievements file → env (`retroachievements.py:70-78`); EmuMovies file → env (`pkg/parity/parity_integrations.py:148-158`); Steam per-field file wins, env fills gaps (`pkg/parity/parity_steam_achievements.py:58-76`); IGDB/ScreenScraper/SteamGridDB env only; Gameyfin settings only | replace with a per-provider table; keep the one universal rule (process env beats `.env`) |
| P1-40 | `reference/configuration.md:90-93` | `STEAM_API_KEY`/`STEAM_ID` are env credentials and `<data>/steam.json` is the fallback | `pkg/parity/parity_steam_achievements.py:58-76` — the file wins; and neither name is in `env_config.ENV_KEYS` or `.env.example`, so a value placed in `.env` is silently dropped | document file-first precedence and mark the pair process-env-only |

### 2.5 App repository docs (this repo)

| # | Location | Wrong | Correction |
| --- | --- | --- | --- |
| P1-41 | `.github/ISSUE_TEMPLATE/bug_report.yml:10` | "The current release is [v1.16.0]" while the placeholder on `:17` says `v1.18.0` | say v1.18.0 or "the latest release"; the version gate only checks that the string `v{version}` appears *somewhere* (`scripts/check_version_sync.py:80-83`), which the placeholder satisfies — see P2-19 |
| P1-42 | `.github/ISSUE_TEMPLATE/bug_report.yml:73` | "Settings -> Library Audit -> the diagnostic log" | the dialog is **Library checkup** and the control is **Settings → Advanced → Copy diagnostic log** (`index.html:49,433,584,605`) |
| P1-43 | `docs/DISCLAIMER.md:35` | "No cover art or game files are vendored in the repository. Showcase and documentation images are user supplied captures of user supplied games." | `README.md:341-352` says the screenshots use real LaunchBox metadata and cover art, regenerated by `scripts/capture_readme_screenshots.py` (`:2,:10,:139,:167,:224`) | restate provenance accurately; this is a legal statement |
| P1-44 | `docs/CHANGELOG.md:89,102` | 1.18.0 uses "Tools > Netplay lobby" and "Library Audit" — the names renamed *in the same release* (`:119-120`) | "Tools > Online play", "Library checkup" |
| P1-45 | `docs/native-host-contract.md:131,148-150` | `?deeplink=showgame&id=` "Selects and scrolls to the game"; `openbox://resume/<id>` loads `?deeplink=resume&id=` | `static/app.js:610-627` has no `resume` action and `showgame` only selects (`static/app.js:613-619`); the host emits `resume` (`native_host.c:499-500,554-561`) | either add the frontend handler + table row, or change the host to `showgame`; drop "and scrolls" |

---

## 3. P2 — precision defects (61)

### App repository

1. `AGENTS.md:6` — launch paths "on Linux/macOS" while macOS is explicitly out of scope (`docs/CONTRIBUTING.md:19`, `docs/SUPPORT.md:11-23`, `docs/CHANGELOG.md:208`, `docs/flathub-checklist.md:32`).
2. `docs/SECURITY.md:110` — release signing described as AppImage-only; the workflow also signs the Windows zip, the Windows native host, and the emulator definition pack (`.github/workflows/release.yml:385-473`).
3. `docs/CONTRIBUTING.md:127-130` — claims the version gate checks the bug template; it only does a substring test (`scripts/check_version_sync.py:80-83`).
4. `docs/native-host-contract.md:129-138` — the deeplink table omits `resume` entirely.
5. `docs/development/DESIGN.md` and the site design page disagree on numbers — see P2-8/P2-9.

### Docs site — API/reference precision

6. `reference/api/content-and-imports/index.mdx:309-312` — the older `/api/media/queue` description still shows the pre-1.18 `{"queue": [...]}` shape; the 1.18 page has the correct `items`/`queue`/`counts` shape.
7. `reference/api/one-eighteen/index.md:112` — see P1-14 (also listed as P2 wording).
8. `project/design-system.md:117` — breakpoint "`≤ 1100px`"; `static/app.css:1050` is `@media(max-width:1120px)`.
9. `project/design-system.md:122` — "grid gap is `20px 16px`"; `static/app.css:437` uses `gap:var(--space-lg) var(--space-md)` = **24px 16px** (`app.css:238`).
10. `project/design-system.md:68` — base stack "ui-sans-serif, system-ui, sans-serif"; `app.css:120` defines `system-ui,sans-serif` only.
11. `project/design-system.md:199` — claims `--green` is theme-local; `--green:#74D08A` is a base `:root` token (`app.css:10`).
12. `project/releasing.md:61-73` — job names do not match `release.yml` (`test, build, attest, build-windows, attest-windows, publish`; one shared publish job).
13. `project/releasing.md:12,75` — "`RELEASE_NOTES.md` (CI publishes it as the release body)"; the file is `docs/RELEASE_NOTES.md` (`release.yml:494`).
14. `project/releasing.md:79` and `policies/dmca.md:15` — release-asset inventories omit `install.ps1`.
15. `reference/how-it-works.mdx:164-179` — `default_state()` list omits `trash`, `party_decks`, `emulator_settings`, `achievement_overrides` (`state_store.py:80-96`).
16. `reference/how-it-works.mdx:224`; `reference/data-and-recovery.md:26` — the 1 MiB compact-JSON threshold is applied to the **pretty-printed** form (`state_store.py:722-728`).
17. `reference/data-and-recovery.md:49` — stable-id payload list omits `gog_id`, `ea_id`, `ubisoft_id` (`state_store.py:109-112`).
18. `reference/architecture/index.md:56` — snapshot name is `<stamp>-<token>.json`; the real name is `<stamp>-<sequence>-<token>.json` (`state_store.py:795`); and the debounce is off by default (`OPENBOX_SNAPSHOT_DEBOUNCE` default `0.0`, `state_store.py:71`).
19. `reference/command-tokens.md:64` — the quoted error is `"The configured path no longer exists: <path>"`; the code emits a newline separator (`openbox.py:261`).
20. `reference/command-tokens.md:14` — the `{Path}` alias is documented, but the "already contains the path" heuristic only tests `{path}` and `{ImagePath}` (`pkg/parity/parity_emulator_defs.py:932,947`), so a `{Path}`-only command can get the path appended twice.
21. `reference/search-syntax/index.md:102` — cites `pkg/parity/parity_query.py:33-37`; the constants are at `:38-39`.
22. `reference/search-syntax/index.md:20-41` — the field table omits `import_batch_id:`/`import_batch:` and `all:` (`static/util.js:95-96`).
23. `reference/plugins/catalog/index.md:17` — duplicates `:15` and ends in a dangling parenthetical.
24. `reference/plugins/hooks/index.md` and `reference/plugins/manifest/index.md` — verified accurate against `plugins.py` (ids, caps, `api_version` rules, error strings).
25. `reference/hardware-matrix/index.md:36` — battery order reversed: it says sysfs first with the browser API as fallback; `static/battery.js:1,21-27` tries the browser API first.
26. `reference/plugins.md:17` — see P1-19.

### Docs site — configuration and settings precision

27. `reference/configuration.md:105,222,275` — "an invalid value aborts the whole save with a `400`" / "nothing is written" is too strong: `spinner_sensitivity` and `obs_websocket_timeout` clamp (`handlers/settings.py:796-798,866-867`), `attract_mode_seconds` is unbounded (`:877-878`), `locale` truncates to 5 (`:876`), `list_sort_dir` truncates to 10 (`:873`), webhook attempts/timeout are cast at save and clamped at delivery.
28. `reference/configuration.md:116,118` — `list_sort_dir` and `locale` choices are descriptive only; the code truncates, it never validates membership.
29. `reference/configuration.md:45` — "Up to 32 roots"; `pkg/state/media_probe.py:178-194` prepends the built-in `<data>/media` and rejects when the total exceeds 32, so at most 31 additional roots.
30. `reference/configuration.md:44` — the unsandboxed condition is "when bubblewrap is unavailable"; `plugins.py:103-106,247-254` disables the sandbox whenever `OPENBOX_ALLOW_UNSANDBOXED_PLUGINS=1`, even when `bwrap` exists (`.env.example:31` has it right).
31. `reference/configuration.md:28`; `install.mdx:204` — `.env` "mode `0o600`" is stricter than the code (`pkg/platform_compat.py:966-979` accepts any owner-only file).
32. `reference/configuration.md:20-27`; `install.mdx:204` — the Windows `.env` roots (`%APPDATA%`, `%LOCALAPPDATA%`) are missing (`pkg/platform_compat.py:229-246`).
33. `reference/configuration.md:38` — the default data dir always `~/.local/share/...`; `pkg/platform_compat.py:148-163` falls back to `cwd/openbox-game-launcher` with no home directory.
34. `reference/cli.md:35` — "`--app-window` … instead of a normal tab"; `web_app.py:833-840` makes the chrome-less app window the desktop default and `--no-app-window` opts into a normal window.
35. `reference/cli.md:49` — `--uri` actions are described as opening the UI; `pkg/parity/parity_deeplinks.py:120-125,155-166` dispatches with `open_browser=False`, so `start` returns 0 without opening and the others only print a URL.
36. `install.mdx:229` — the printed URL includes the token; `web_app.py:827-828` prints the tokenless URL (`reference/cli.md:27` is correct).
37. `reference/configuration.md:105` — the projection rationale ("omitted keys are read from stored state") is wrong for `health_rescan` and `list_sort`/`list_sort_dir`, which are absent from `public_settings()` and are read from `GET /api/settings` (`static/settings.js:626`, `static/library.js:2442-2448`).
38. `integrations/import-sources.md:13,28` — quoted prerequisite errors differ from `importers.py:81,312` (the Flatpak variants are missing).

### Docs site — UI naming and labelling

39. `guides/library/index.md:16` — the Help glossary is listed as 9 terms; `static/help.js:18` has 11 (`metadata` and `artwork` are missing from the list).
40. `reference/parity.mdx:100` — "Library Audit (Tools > Library checkup)" mixes both names.
41. `guides/sessions-saves-and-backups/index.md:44` — the `before-restore` safety backup is described as unconditional; `guides/sessions-saves-and-backups/saves/index.md:66` correctly notes it is skipped when no save root exists.
42. `guides/library/importing/index.md:44`; `guides/storefront-manager/index.md:41,60` — "Verify files" (P1-27).
43. `guides/media-providers/index.md:10,16-26` — the 1.18 optional **Integration tokens** store is missing from the credential table.
44. `policies/privacy.md:15` — "every request" (P1-36).
45. `windows.mdx:168` — the About table lists macOS; qualify it as out of scope.

### Cross-repo / consistency

46. `policies/legal-and-trademarks.md:25` says "trademarks"; `docs/DISCLAIMER.md:21` says "**registered** trademarks" — pick one and verify.
47. `openbox.metainfo.xml:7` uses `AGPL-3.0-only`; README/site use `AGPL-3.0` — align on the SPDX id.
48. `DOCS-STALE-SWEEP.md:3` still audits "1.17.0" and is behind both repos.
49. `content/docs/reference/api/local-admin/index.mdx:28` still carries a placeholder URL.
50. `guides/plugins/index.md:87` — "Review `plugin.py` after install (it lives in `plugins/<id>/`)" — the packaged file is `plugin.json` + the entry file; the exact installed name is not guaranteed.
51. `docs/api-v2.md` — **verified current** (`scripts/gen_api_docs.py --v2 --check` reports "api docs fresh"); no action.
52. `docs/reliability.md` — **verified current**: 122 rows, every `Tested` row names a real test, 0 regressions.
53. ADR range — **verified**: ADRs 0001–0084 exist with no gaps (0080–0084 are untracked in the working tree and should be committed).

---

## 4. Coverage gaps (shipped but under-documented)

| # | Gap | Evidence | Where to add |
| --- | --- | --- | --- |
| G-1 | 1.18 **controller remapping and controller types** are only in `reference/shortcuts/index.md` and the Big Box guide | `docs/CHANGELOG.md:38-42` (Settings → Controller records shortcuts, buttons can be cleared, duplicates swapped only after confirmation); `static/settings.js:132-175` | `guides/emulators-and-launching/index.md` |
| G-2 | **Integration tokens** (masked per-provider store) are absent from the media/metadata provider guide | `index.html:620`, `pkg/parity/parity_integration_tokens.py:10` | `guides/media-providers/index.md`, `guides/metadata-and-media/index.md` |
| G-3 | The **Help glossary** terms are not enumerated in the library overview | `static/help.js:18` (11 terms) | `guides/library/index.md:16` |
| G-4 | The **scan budget** (30 s) and per-source progress are only in the API pages | `pkg/state/imports.py:600` `STOREFRONT_SCAN_TIMEOUT = 30` | `guides/storefront-manager/index.md` |
| G-5 | The **`storefront_auto_import` migration** (legacy boolean → `{enabled, platform, include_uninstalled}`) is described in the changelog and the storefront guide but not in the configuration reference | `handlers/settings.py` migration; `docs/CHANGELOG.md:127-130` | `reference/configuration.md` |
| G-6 | **`storefront.scan` / `saves.restore`** operation types are missing from the job-type list | `job_manager.py:40,45` | `reference/background-jobs/index.md:26` |

---

## 5. Stale assets

| Asset | Problem | Evidence |
| --- | --- | --- |
| `public/openbox-screenshot.png` (used by `getting-started.mdx:30`, `index.mdx:13`, `showcase.md:10,12`) | the top bar shows the pre-1.18 four-button layout — **Set up library**, **Add game**, **Add shelf entry**, **Import folder** — which 1.18 folded into one **Add games** menu | `index.html:18-24`; inspected image |
| `public/openbox-game-detail.png` (used by `getting-started.mdx:76`) | same vintage; the detail pane no longer matches the 1.18 card | `index.html`; inspected image |
| app repo `assets/openbox-screenshot.png` and `assets/openbox-game-detail.png` (byte-identical to the site copies) | the **README** shows the same pre-1.18 top bar | `README.md:341-352`; `scripts/capture_readme_screenshots.py` |

The capture script exists (`scripts/capture_readme_screenshots.py`), so re-shooting is a
local operation — but it needs LaunchBox art and a running app, so it is a task, not a
docs edit. Until then, consider dropping the images rather than advertising a superseded UI.

---

## 6. What the gates do not prove

The three content gates all pass, and they passed while the site was broken. Known blind
spots, in order of cost:

1. **MDX/JSX correctness** — the build aborts on the first bad page and the remaining
   gates never run. Add a per-page compile pre-gate.
2. **Route coverage is literal-name coverage** — a route passes when its path string
   appears anywhere in `content/docs`. A wrong description, wrong payload, or wrong
   status code still passes (that is how P1-1 … P1-17 survived).
3. **Settings coverage is key-presence coverage** — a row can state the wrong default and
   still pass. Every 1.18 default in `reference/configuration.md` was re-checked against
   `settings_schema.py` and `handlers/settings.py` in this sweep; the table is correct
   apart from the wording issues in §3.
4. **Version currency is literal-driven** — it knows installer assignments, release URLs,
   asset filenames and "current release" prose. It cannot read a sentence, which is why
   `install.mdx:69` (P1-33) passed.
5. **The app repository is not covered by the site gates at all** — `docs/api-v2.md` is
   generated; `docs/CHANGELOG.md`, `docs/README.md`, `docs/PARITY.md`,
   `docs/DISCLAIMER.md`, the issue template and `AGENTS.md` are hand-maintained. P1-41,
   P1-43 and P1-44 live there.
6. **Asset existence needs network access and a repo name** — without
   `OPENBOX_RELEASE_REPO` a documented asset name is only checked for version currency.
7. **Screenshots are never checked** — a 1.12-era screenshot passes every gate (§5).

---

## 7. Updated sweep recipe

1. Sync the route baseline: `OPENBOX_APP_DIR=../OpenBoxGL npm run routes:sync`.
2. Sync the contract baseline after any intentional surface change:
   `OPENBOX_APP_DIR=../OpenBoxGL npm run contracts:sync`.
3. Run the gates: `node scripts/check-contract-coverage.mjs`,
   `node scripts/check-api-coverage.mjs`, `node scripts/check-version-currency.mjs`.
4. **Compile every page** before trusting a green build (the MDX pre-gate from §0).
5. Search current-release prose, not just version numbers: `current release`,
   `currently v`, `still shipped`, `latest release`, `on the schedule you set`.
6. Read the new feature's *guide*, not only its API row — a route can be documented
   while the screen a user clicks is missing (that is how G-1 and G-2 arose).
7. Check the strings, not the shapes — quoted error messages and button labels are the
   most common source of P1 drift (P1-18, P1-27, P1-42).
8. Re-capture the screenshots and grep the new UI labels through the old ones:
   `Library Audit`, `Launch Doctor`, `Netplay`, `Museum`, `Health`.
9. `npm run test` (build, redirects, sitemap, built-route and link check).

---

## 8. Verified accurate (do not re-litigate)

- Route coverage: **381/381** method+path pairs documented; 49 pairs are 1.18 additions
  across 43 paths; no v1 route removed or changed; `v1_contracts.json` (61 routes) matches.
- Settings: **150/150** keys documented; the 26-key public projection, masked
  `integration_tokens`, and the `*_set` booleans all match `pkg/state/cache.py`.
- Launch tokens: **24/24** match `contracts.baseline.json` exactly.
- Webhook events: **9/9** names, allowlists, envelope, HMAC signature, retry statuses,
  backoff, timeouts and worker limits all match `automation.py`.
- `docs/api-v2.md` is current (201 v2 routes, 61 v1 routes).
- `docs/reliability.md` is current (122 rows, 0 regressions).
- ADRs 0001–0084 exist with no gaps; all local markdown links in the app repo resolve.
- Theme token values, contrast claims, stock-theme list, and the token gate baseline (0
  raw hex) all match `static/app.css` and `themes/*.css`.
- Plugin manifest schema, hook contracts, capability-service limits, catalog pinning,
  and lifecycle semantics match `plugins.py` / `pkg/parity/parity_plugin_*.py`.
- Save-archive manifest fields, limits (50,000 members, 4 GiB/member, 32 GiB total),
  restore validation order and error strings match `saves.py`.
- Release asset list, signature sidecars, install-flag tables, updater trust ladder and
  uninstall steps match `release.yml`, `scripts/install.sh`, `scripts/install.ps1`,
  `scripts/uninstall.ps1`, and `updates.py`.
- AppImage/Flatpak/Windows platform support, no-telemetry, no-account and 127.0.0.1
  binding claims are consistent across both repos.
- 44 emulator definitions, 6 stock themes, 5 locales, 218 test files, 8 gamescope
  presets, 151 DNA concepts — all counts agree wherever they are stated.
- The 1.18 feature matrix is well covered: platform rename/delete, media moves, durable
  media queue, EmuMovies, provider ordering, save manifests and selective restore,
  plugin capabilities/services/repair, emulator settings and per-platform overrides,
  filter exclusions, bulk find-and-replace, progress labels, sidebar ordering, Steam
  missing/verify, PICO-8/MSU-1/WHDLoad/RPCS3 imports, startup scan behaviour, Gameyfin
  exclusions, tray recents, Steam achievements, MAME high scores, netplay, 3D models and
  Big Box input/video/sound are each documented in at least one guide and match source.
