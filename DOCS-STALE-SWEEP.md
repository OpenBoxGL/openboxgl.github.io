# OpenBoxGL Docs — Stale Content & Coverage Gap Sweep

**Date:** 2026-10-09
**Docs repo:** `/home/hayden/Desktop/Projects/openboxgl.github.io`
**App source (ground truth):** `/home/hayden/Desktop/Projects/OpenBoxGL`
**Corpus:** 104 docs pages, ~10,700 lines, 103 search-index entries

## Headline

The docs site is **two full releases stale**. `content/docs/changelog.md:7` stops at
**1.15.0 (2026-09-29)**; the app ships **1.16.1** (`OpenBoxGL/updates.py:30` —
`VERSION = "1.16.1"`, confirmed by the user).

The most serious defect is not a missing page — it is an **actively harmful one**:
`content/docs/policies/security.md` tells users to upgrade to **1.15.x**, which is
precisely the release carrying five security defects that only 1.16.0 fixes.

Structural quality is high: **0 broken internal links, 0 broken anchors, complete
frontmatter, balanced code fences, no leaked secrets.** The drift is entirely
*currency* — what the docs say about a product that has moved on.

---

## P0 — Critical

### 1. Security policy directs users to a vulnerable release

| | Docs site | App source (truth) |
|---|---|---|
| Current | `\| 1.15.x \| Yes (current) \|` | `\| 1.16.x \| Yes (current) \|` |
| 1.15.x | prose: "the 1.15.x line is the current maintained release … upgrade to 1.15.x to receive fixes" | `\| 1.15.x \| No — upgrade required (see above) \|` |

- `content/docs/policies/security.md` — table row + "Only the latest release on the
  `master` branch is maintained, and the 1.15.x line is the current maintained release."
- `OpenBoxGL/docs/SECURITY.md` — section heading *"Fixed in 1.16.0: what 1.15.x and
  earlier are exposed to"*, ending "None is backported, so upgrading is the fix."

**None of the five 1.16.0 security fixes appear anywhere on the docs site:**

1. Arbitrary `.json` read via a crafted `preview_id` (reaches `settings.json` with provider credentials).
2. Arbitrary file write via a game's `rom_name` during high-score bundle restore.
3. Plugin sandbox could read `library.json` / `settings.json` when `OPENBOX_DATA_DIR` pointed outside the masked paths.
4. Unescaped game names in the Wrapped report reaching `innerHTML`.
5. `orjson` hijack — a third-party package could change library serialization.

The site's only adjacent line — *"Restores and extractions validate archive members and
reject symlinks, absolute paths, and `..` traversal"* — describes archive extraction,
not the `rom_name` write path, and does not cover the **read** path at all.

### 2. `/api/v2/backup/diff` documents a superseded response shape

Docs describe only the v1.7.2 flat contract:
- `content/docs/reference/api/saves-and-operations/index.mdx:280-287`
- `content/docs/reference/library-backups/index.md:69-79`

Shipped code (`pkg/parity/parity_backup.py:552-585`) additionally returns:

- `restore.{will_remove, will_add, will_change}` — each `{total, truncated, rows}`, with
  per-field `{from, to}` on changed rows
- `settings.{restored, present, would_change, differs, redacted_secrets, keys_changed}`
- `truncated.{added, removed, changed, limit}`

Note: `settings_changed` **is still returned** (line 581, kept flat per ADR 0019), so the
docs are *incomplete rather than wrong* here. But the `restore` block is the only one the
UI reads, and it is undocumented — as is the entire 1.16.0 "Preview changes" flow that
gates the Restore button behind a successful preview.

### 3. Version currency is wrong on the three most-trafficked surfaces

| File | Claim | Truth |
|---|---|---|
| `content/docs/downloads.md:8` | "currently **v1.15.0**" | 1.16.1 |
| `content/docs/roadmap.md:13` | "The current release is **1.15.0** — Finish the surface" + whole "In the current release" list | 1.16.1 |
| `content/docs/reference/parity.mdx:18` | "Verified against **v1.15.0**" | `OpenBoxGL/docs/PARITY.md`: "latest release is **v1.16.1**" |

`parity.mdx:13,22,28` additionally frame "the 1.15.0 line" as the running platform line.

---

## P1 — High

### 4. Eight v2 routes are entirely undocumented

All exist in `OpenBoxGL/handlers/launch.py`; zero occurrences anywhere in `content/`:

```
GET  /api/v2/launch/audit          POST /api/v2/launch/audit/scan
GET  /api/v2/launch/audit/status   POST /api/v2/launch/audit/refresh
GET  /api/v2/launch/cores          POST /api/v2/launch/core
POST /api/v2/launch/grant          POST /api/v2/launch/grant/undo
```

These are the entire 1.16 "Launch Readiness" + 1.16.1 Flatpak-grant surface.

### 5. No 1.15 or 1.16 API additions page (nor 1.13)

`content/docs/reference/api/` contains `overview/`, `one-eleven/`, `one-twelve/`,
`one-fourteen/` + 6 topic pages. `reference/api/overview/index.mdx:83` states the v2
surface covers "v1.7.0 through **v1.14.0**" and the enumerated list terminates at
`Plugins 2.0 (v1.14.0)` (line 116). `reference/api.mdx:90` advertises 1.14 as newest.

### 6. Headline 1.16.0 features missing from all guides

| Feature | Status |
|---|---|
| "Check every game" library-wide Launch Doctor (grouped causes, Install action, ready/warn/blocked totals, deep mode) | **MISSING** — no guide section |
| Backup restore preview / "Preview changes" / Restore gating | **MISSING** from UI docs (endpoint only, stale shape) |
| LaunchBox / ES-DE apply confirmation with exact counts | **MISSING** |
| `.m3u` playlist ownership guard | **MISSING** |
| Import decision queue behaviour (uncertain candidates block import) | route listed; **behaviour undocumented** |
| Session failure via exit code | **PARTIAL** — "Session failed" covered; "Session ended" + webhook `timed_out` flag missing |
| 60 s request timeout; 20,000-result search cap; 3-toast stacking; controller alt-tab fix; playtime-after-delete fix | **MISSING** |

Backing source: `OpenBoxGL/docs/archive/release-notes-1.16.0.md`.

### 7. All of 1.16.1 is missing

Grid "Won't launch" / "Needs attention" badges + badge toggle, group fixes and scoped
relink, per-game RetroArch core choice, Flatpak Grant/Remove access, **18 additional
launch definitions** (Flycast, Azahar, DOSBox Staging, DuckStation … — 42 YAML defs now
in `emulator_defs/`, none of Flycast/Azahar/DOSBox Staging documented), definition
schema 2, plugin re-approval after upgrade, one-live-connection-per-tab.

### 8. Search-syntax reference is missing implemented clauses

`content/docs/reference/search-syntax/index.md` omits clauses that are implemented in
`pkg/parity/parity_query.py:340,490` and covered only in `guides/library/backlog/index.md:14`:

- `myrating:4`
- `unrated by me`
- `my 4 stars`
- `progress:unplayed` (listed, but not as a first-class clause alongside the others)

---

## P2 — Medium

### 9. Interactive tools ship stale version badges and a missing theme

- `components/automation-section.tsx:33` claims **"Six bundled CSS themes"** and
  `content/docs/themes.md:13` documents **High Contrast** (shipped 1.15.0).
  `components/tools/theme-previewer.tsx` hardcodes only **five** — High Contrast is absent.
- `components/tools/theme-previewer.tsx:302` → `v1.15.0`
- `components/tools/command-builder.tsx:147` → `OpenBox v1.15.0`
- `components/tools/api-explorer.tsx:185` → `Play Insights Summary (v1.9.0)`

### 10. Landing page never mentions 1.16

`content/docs/index.mdx:59-61` — "New in 1.12" / "New in 1.15" / "New in 1.14" cards.
No 1.16 entry exists.

### 11. Search index carries no 1.16 content

`public/docs-index.json` — 103 entries, 20 mentions of 1.15, **0** mentions of 1.16,
0 of `launch/audit`. Site search therefore cannot surface any current feature.

### 12. 29 pages are sidebar-only, reachable by no prose link

Every page has valid frontmatter and a sidebar entry, but **29 have zero inbound links
from any other content page**, including all 10 children of
`content/docs/guides/troubleshooting/index.md` — which links to **0** of them. Notable
orphans: `guides/troubleshooting/*` (all 9 children), `guides/library/setup-center`,
`guides/library/backlog`, `guides/library/export`, `guides/library/insights`,
`guides/plugins/creating-a-plugin`, `guides/sessions-saves-and-backups/activity-center`,
`guides/sessions-saves-and-backups/quick-resume-moments`, `guides/themes/custom-themes`,
`guides/wine-and-proton`, `roadmap`, `showcase`, `enterprise`, `localization`,
`project/releasing`, `reference/architecture`.

---

## Verified correct — do not "fix" these

These were checked against source and are **accurate**. Recorded so a future pass doesn't
waste effort or introduce regressions:

- **Link integrity: 0 broken page links, 0 broken anchors** across all 104 pages.
  *(My first checker reported 334 — that was a bug in the checker, not the site: it
  collapsed whitespace runs in heading slugs. The site's `slugifyHeading` in
  `lib/mdx.tsx:55-61` maps each whitespace char to its own hyphen, preserving the
  deliberate `source--system` double-hyphen shape. Corroborated independently by
  `scripts/check-built-site.mjs:80`, which already fails the build on a missing fragment.)*
- The two `/openbox-*.png` links in `getting-started.mdx:30,76` are **valid** — both
  assets exist in `public/`.
- **v2 route coverage is 153/161 (95%)**; the only 8 gaps are the 1.16 launch routes.
- **No leaked credentials.** The `<redacted>` hits are intentional prose about the app's
  own log redaction. Commits `3d6723c` / `6732537` were a *sanitizer* mangling `$TOKEN`
  into `<redacted>` in the 1.14 curl examples — already repaired, and benign.
- **Keyboard shortcuts — all verified correct:** `Ctrl/Cmd+K` (`static/palette.js:185`),
  `Ctrl/Cmd+,` (`static/app.js:383`), `Ctrl+Alt+Q`/`R` (`static/app.js:384`),
  `M` (`static/navigation.js:64`), `F` (`static/navigation.js:94`),
  `F11` (`static/app.js:394`), `Escape` (`static/app.js:395`).
- **`reference/configuration.md`** — 32 `OPENBOX_*` vars documented; **0** present in
  `.env.example` / `env_config.py` are missing. The 14 documented-but-not-in-those-files
  vars (`OPENBOX_PYTHON`, `OPENBOX_NATIVE_HOST`, `OPENBOX_ARCH`, …) all exist in
  launcher/C sources.
- **`reference/cli.md`** — accurate. `--web` / `--uri` are real
  (`pkg/parity/parity_deeplinks.py:106,115`); `--share-net` is documented where it
  belongs, in the plugin permission docs.
- **Search grammar aliases** — `playmode:` (`static/util.js:91`), `plat:`, `fav:`, etc.
  all match the documented alias table.
- **Plugin manifest contract** — `api_version`, `id`, `name`, `description`, `entry`,
  `hooks`, `permissions`, `checksum`, `events`, `library_source` all align with `plugins.py`.
- **Locales** — 5 (`de, en, es, fr, pt`) confirmed in `OpenBoxGL/locales/`.
- **Themes** — 6 on disk (`Cinema Marquee, Harbor Light, High Contrast, Midnight Circuit,
  Nordic Mist, Phosphor Terminal`) matching `themes.md`.
- Frontmatter complete on all 104 pages; all code fences balanced.

---

## Suggested remediation order

1. **`policies/security.md`** — flip table to 1.16.x current / 1.15.x unsupported, add the
   "Fixed in 1.16.0" section. Copy from `OpenBoxGL/docs/SECURITY.md:5-36`. *Do this first —
   it is user-harmful today.*
2. **`changelog.md`** — add 1.16.1 and 1.16.0 sections from
   `OpenBoxGL/docs/archive/release-notes-1.16.0.md`.
3. **`reference/api/one-sixteen/`** — new additions page for the 8 launch routes.
4. **Correct `backup/diff`** in `saves-and-operations/index.mdx` and
   `reference/library-backups/index.md` to the shipped `restore` / `settings` / `truncated`
   shapes.
5. **Guide sections** for Launch Readiness and Restore Preview.
6. **Version strings** — `downloads.md`, `roadmap.md`, `parity.mdx`, `index.mdx`, and the
   three component badges.
7. **Add High Contrast** to `theme-previewer.tsx`.
8. **Add `myrating:` / `unrated by me` / `my N stars`** to `search-syntax/index.md`.
9. **Internal linking** — have `guides/troubleshooting/index.md` link its 10 children;
   add cross-links for the other 19 orphans.

---

## Method & confidence

- **Deterministic/mechanical (high confidence, reproducible):** slug map walked from
  `content/docs` mirroring `lib/docs.ts`; every markdown link and fragment validated with
  an exact port of `lib/mdx.tsx`'s `slugifyHeading`; route inventory extracted from the
  app's `@route(...)` decorators and diffed against every `/api/...` token in the docs.
- **Source-verified (high confidence):** every shortcut, env var, CLI flag, search clause,
  theme name, locale, and manifest field listed above was confirmed by direct read or grep
  in `OpenBoxGL`, with file:line citations.
- **From a delegated 1.16.x gap analysis** — independently spot-checked here: the
  `security.md` table, the `roadmap.md`/`downloads.md`/`parity.mdx` version strings, and the
  `backup/diff` response shape were each re-read against source before inclusion.
- **Not verified:** I did not render the deployed site, so a redirect or uncommitted page
  outside `content/` could in principle hide a page. The 1.16.0 changelog's full "Fixed"
  list was not audited bullet-by-bullet — additional obscure fixes may add rows to §6.

## Follow-up passes (after the initial report)

The audit continued past the report above. Two methodological traps worth recording, because both produced wrong conclusions:

**Version literals hide in code fences.** A plain `grep -rn "1\.15\.0"` finds them, but reading only the prose hits makes them look harmless example data. Five copy-pasteable installer blocks still pinned 1.15.0 after the first fix pass. Always parse fenced code blocks specifically, since those are what a reader actually runs.

**UI labels are not all in `locales/en.json`.** Searching the locale file alone reported that `Session ended` and `Retry failed` did not exist — both are hardcoded in `static/sessions.js:157` and `index.html:364`. The real UI string surface is `locales/en.json` **plus** `index.html` **plus** `static/*.js`. Search all three before concluding a label is missing; the one genuine mismatch found this way was `Choose core`, which is actually `Choose a RetroArch core` (`library.core.title`).

Current verified coverage, re-checked against source: 110/110 `KNOWN_SETTINGS`, 24/24 launch-token spellings, 9/9 webhook payloads field-for-field, 326/326 API routes, and every app-version literal in prose or code reads 1.16.1 or is explicitly historical.