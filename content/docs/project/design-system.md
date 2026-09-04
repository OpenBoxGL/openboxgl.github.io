---
title: Design system
description: The real CSS variables, typography, layout, and component specs for theme authoring.
---

OpenBoxGL's base stylesheet uses a dark, warm game-room palette: near-black surfaces, warm off-white text, and brand orange (`#f06000`) as the focus/selection signal with orange-gold (`#e08a3c`) for launch actions. This page documents the actual variables shipped in the application's `static/app.css` (linked from `index.html`), not a separate token layer. Theme authors override these variables in a CSS file imported through **Themes**.

<Callout type="warning" title="These are the shipped tokens">

This page reflects the current `static/app.css` `:root` block (linked via `<link rel="stylesheet" href="/static/app.css">` in `index.html`). The application repository also contains a `DESIGN.md` that describes an earlier blue-black palette with cyan focus (`#35a9d5`) and green launch (`#08bf20`). That document is out of date relative to the shipped stylesheet: the running app uses the orange palette below, and the blue/cyan values in `DESIGN.md` are not what a theme overrides today. If you rely on this page's values, always confirm against `static/app.css` in the repository you are actually running.

</Callout>

## Base palette

All colors are dark by default. Neutral surfaces carry most of the screen; the orange family identifies focus, selection, and launch action.

### Neutral surfaces

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#11100e` | Page canvas, deepest fullscreen surfaces |
| `--topbar` | `#171513` | Command rail background |
| `--panel` | `#1b1916` | Sidebar, detail pane, dialogs, lifecycle surfaces |
| `--surface-deep` | `#141311` | Sticky library header and tools menu background |
| `--surface-card` | `#211e1a` | Detail cards, emulator items, result rows, history items |
| `--surface-field` | `#27231e` | Form controls, secondary buttons |
| `--surface-hover` | `#342d23` | Hovered raised panels |
| `--border-control` | `#4b4338` | Control borders |
| `--border-card` | `#534a3d` | Card and dialog borders |
| `--line` | `#3d3932` | Borders, dividers, separator rules |
| `--text` | `#f4efe6` | Primary titles, high-priority content |
| `--muted` | `#aaa094` | Metadata, labels, helper copy, inactive navigation |

### Accent colors

| Token | Value | Use |
| --- | --- | --- |
| `--focus` | `#f06000` | Focus ring, selected controls, active platform markers |
| `--brand` | `#f06000` | Brand identity color |
| `--active` | `#f06000` | Active navigation, selected cover borders, Big Box cover borders |
| `--action` | `#e08a3c` | Launch action (Play button), primary dialog confirmations |
| `--action-ink` | `#1c160d` | Dark text inside the orange-gold action surface |
| `--white` | `#fff` | Occasional pure white highlights |
| `--cyan` | `#72c9d4` | Teal accent (defined in `:root`) |
| `--gold` | `#e5b65c` | Achievement/gold signal, decorative highlights |
| `--rating` | `#ef8c38` | Rating star signal |
| `--launch-shadow` | `#e08a3c44` | Shadow tint under the Play button |
| `--danger` | `#743f3f` | Error/destructive state |
| `--empty-action` | `#e08a3c` | Empty-state action buttons |
| `--cover-title-start` | `#51412d` | Cover gradient start tone |
| `--achievement` | `#eaa54f` | RetroAchievements badge, achievement points |
| `--lifecycle-bg` | `#45351d` | Session lifecycle overlay background |
| `--bigbox-bg` | `#30261a` | Big Box cover backdrop |
| `--bigbox-copy` | `#d0c0a5` | Big Box secondary text |
| `--overlay-insight-cell-0` | `#1c1915` | Play Insights 0-playtime cell background |
| `--overlay-insight-cell-1` | `#4a2c0a` | Play Insights level 1 playtime cell background |
| `--overlay-insight-cell-2` | `#8a4f10` | Play Insights level 2 playtime cell background |
| `--overlay-insight-cell-3` | `#c97316` | Play Insights level 3 playtime cell background |
| `--overlay-insight-cell-4` | `#f06000` | Play Insights level 4 (peak) playtime cell background |
| `--border-insight` | `#3d3932` | Play Insights heatmap and stat card borders |
| `--shadow-insight` | `#00000066` | Play Insights card shadow |
| `--surface-insight-card` | `#1b1916` | Play Insights card surface background |
| `--focus-ring` | `#f06000` | Global accessible focus outline |

## Typography

The base stack is `ui-sans-serif, system-ui, sans-serif` (no bundled webfont in the base stylesheet). Font sizes come from `--font-*` variables.

| Token | Value | Use |
| --- | --- | --- |
| `--font-micro` | `10px` | Tiny counters, badge numbers |
| `--font-label` | `12px` | Section labels, field labels, nav categories |
| `--font-meta` | `12px` | Release year, region tags, auxiliary metadata |
| `--font-body-small` | `13px` | Inline hints, status chips |
| `--font-body` | `14px` | Default application copy, form content |
| `--font-action` | `15px` | Button labels, chip text |
| `--font-dialog` | `16px` | Dialog body |
| `--font-title-large` | `18px` | Game card titles |
| `--font-heading` | `24px` | Section headings |
| `--font-brand` | `0.9375rem` | App title strip, breadcrumbs |
| `--font-nav` | `0.8125rem` | Topbar menu items, sidebar row labels |
| `--font-subtitle` | `19px` | Dialog section headers |
| `--font-bigbox` | `21px` | Big Box body |
| `--font-panel-title` | `28px` | Big Box panel headers |
| `--font-bigbox-display` | `clamp(38px,5vw,72px)` | Big Box headings |
| `--font-screensaver` | `clamp(44px,8vw,110px)` | Screensaver statements |

The lifecycle overlay uses a hardcoded `clamp(34px,6vw,78px)` rather than a `--font-*` variable.

Stock themes may replace the entire stack: Midnight Circuit uses Syne + Manrope, Phosphor Terminal uses IBM Plex Mono + Share Tech Mono, Harbor Light uses Sora + Literata, Cinema Marquee uses Bebas Neue + Source Sans 3, and Nordic Mist uses Outfit + Fraunces.

## Spacing

The base stylesheet does not expose `--sp-*` variables; spacing is hardcoded in each rule. Common values: `2px` for hairline gaps, `6px` for checkbox margins, `8px` for input padding, `12px` for card padding, `16px` for column gaps, and `25px` for wide form grids. When you add custom CSS, derive spacing from the nearest value already used in `static/app.css` rather than inventing new units.

## Rounded corners

Only four radius variables exist. Other radii are hardcoded in the rules that use them.

| Token | Value | Applies to |
| --- | --- | --- |
| `--radius-hairline` | `2px` | Thin decorative lines, narrow separators |
| `--radius-cover` | `5px` | Game cover art containers |
| `--radius-panel` | `12px` | Big Box panels, large panels |
| `--radius-pill-large` | `28px` | Big Box play/pill buttons |

Hardcoded values in the base: inputs use `4px` (some `3px`), cards and detail panels use `6px` to `8px`, dialogs use `8px`, the Play button uses `18px` (pill).

## Layout

The shell is a three-column workspace with responsive breakpoints:

| Breakpoint | Sidebar | Library | Detail Pane |
| --- | --- | --- | --- |
| Default | `190px` | `minmax(520px, 1fr)` | `410px` |
| ≤ 1100px | `150px` | `1fr` | `340px` |
| ≤ 760px | Stacked above library | Stacked | Stacked below grid |

### Cover grid

Auto-filled columns with a minimum cover width of `132px` (`105px` at ≤ 1100px, `100px` at ≤ 760px). Covers keep the aspect ratio of each image: portrait, square, and landscape box art all render uncropped. Games without artwork fall back to a portrait `0.72` box with the title centered. The default grid gap is `20px 16px` (row then column); the sticky header keeps collection title, sort, image group, and view actions visible while the grid scrolls.

### Big Box compositions

| Layout | Composition |
| --- | --- |
| Stage | One large cover + description + big Play button; controller footer hints |
| Hybrid | Platform rail on left + games + scoped search field |
| CoverFlow | Horizontal jewel-case cover strip; active cover straightens and scales |

## Shadows

Depth comes from tonal layering first, tokens second. The real token values in the base stylesheet (ADR 0004):

| Token | Value | Role |
| --- | --- | --- |
| `--shadow-cover` | `#0006` | Default card and box art elevation shadow |
| `--shadow-cover-strong` | `#0007` | Hovered and raised card shadow |
| `--shadow-cover-selected` | `#000a` | Selected and focused card shadow |
| `--shadow-dialog` | `#000c` | Modal dialog backdrop shadow |
| `--shadow-elevated` | `#0009` | Drawer and floating menu elevation |
| `--shadow-empty` | `#0005` | Empty-state container shadow |
| `--accent-ghost` | `#f0600055` | Strong translucent focus halo |
| `--accent-ghost-soft` | `#f0600044` | Medium focus glow |
| `--accent-ghost-faint` | `#f060002e` | Subtle focus glow |
| `--overlay-backdrop` | `#050403d9` | Dialog and modal screen overlay |
| `--overlay-backdrop-strong` | `#05070bd9` | Darkened backdrop overlay |
| `--overlay-backdrop-soft` | `#05070bcc` | Soft dimmed background overlay |
| `--overlay-screensaver-start` | `#05070bcf` | Screensaver top gradient |
| `--overlay-screensaver-mid` | `#05070b1f` | Screensaver middle gradient |
| `--surface-sheet` | `#171513dd` | Translucent bottom sheet surface |
| `--border-sheet` | `#ffffff55` | Sheet border highlight |
| `--hero-scrim` | `#0d0b0815` | Hero banner gradient tint |

## Component specs

### Buttons

| Variant | Background | Text color | Radius | Padding |
| --- | --- | --- | --- | --- |
| Launch (Play) | `var(--action)` → `#e08a3c` | `var(--action-ink)` → `#1c160d` | Pill (`18px`) | `10px` |
| Primary | `var(--action)` → `#e08a3c` | `var(--action-ink)` | `4px` | `9px 16px` |
| Secondary | `var(--surface-field)` → `#27231e` | `var(--text)` | `4px` | (rule-specific) |

Hover shifts secondary toward a lighter raised surface. Focused controls gain a `2px` focus border (`var(--focus)`) plus a one-pixel ring.

### Chips and badges

Rating, status, and ESRB chips use muted text on card surfaces. Achievement signals use `--achievement` (`#e8ba55`). Badges stay subordinate to cover art and the launch action.

### Cards

| Element | Radius | Padding | Background |
| --- | --- | --- | --- |
| Cover card | `var(--radius-cover)` (`5px`) | `12px` | Gradient (`#51412d` → `#1b1814`) or raised surface |
| Detail card | `6px` to `8px` | `12px` | `var(--surface-card)` |
| Big Box panel | `var(--radius-panel)` (`12px`) | `24px` to `26px` | `var(--bigbox-bg)` / `var(--panel)` |

### Inputs / Fields

Fields use `--surface-field` background, `--border-control` border, `4px` radius, and `7px 8px` padding. On focus, the border shifts to `--focus` (`#f06000`) and gains a one-pixel ring. Disabled actions reduce opacity and show `not-allowed` cursor. No separate error palette exists in the base system; errors reuse the standard flow with a textual message rather than a colored field.

### Navigation

Topbar items are borderless and transparent at rest, gaining a raised background on hover. Active platform rows use a darker panel tone with a small orange marker dot. Inactive navigation is muted and transparent. The rail scrolls horizontally; the workspace columns tighten at `1100px` and stack below `760px`.

## Big Box specifics

Big Box reuses the palette and typography tokens, then scales them:

- Titles use `--font-bigbox-display` (clamp 38-72px) and the screensaver uses `--font-screensaver` (clamp 44-110px).
- Controller footer hints use the `--font-label` weight mapped to the currently pressed button.
- Jewel-case perspective on CoverFlow uses CSS transforms, not asset files.
- Background music (`library_music` setting path) plays under covers; `video_bgm_mix` lowers volume when video audio is present.

## Light theme note

Harbor Light is the only bundled light theme. It overrides `--bg`, `--panel`, `--panel2`, `--line`, `--text`, `--muted`, `--cyan`, `--green`, `--accent`, and `--danger` with paper tones, but the base stylesheet does not define a `--sl-color-*` token set (those names are theme-local, not part of the base contract). Note `--accent` *is* part of the base contract: it defaults to `var(--active)` and is consumed for focus rings, skeleton shimmer, and `--mood-secondary`. If you author a light theme, ensure `--focus`, `--active`, `--action`, and `--action-ink` remain legible against your light surfaces and that text contrast stays at least 4.5:1.

## Token contract

The `:root` block in `static/app.css` currently defines 205 `--*` custom properties — that block is the theme contract. Every stock theme overrides `:root` and (almost) nothing else:

- `themes/Cinema Marquee.css`
- `themes/Harbor Light.css` (the only bundled light theme)
- `themes/Midnight Circuit.css`
- `themes/Nordic Mist.css`
- `themes/Phosphor Terminal.css`

`scripts/check_tokens.py` enforces the contract in CI: raw hex outside `:root` must stay at the ratcheted baseline of 0. A new visual value means a new `:root` token plus its entry in each of the five theme files. For the full per-token table, read the `:root` block in `static/app.css` in the repository you are running — this page documents the palette groups, not every one of the 205 names.

### Feature token families (v1.9.0)

- **Mood Match**: `--mood-primary`, `--mood-ink`, `--mood-secondary` (aliases `--accent`), `--mood-glow` (aliases `--accent-ghost`), `--mood-tint`, `--mood-transition`. Driven live from the selected cover when `mood_match_enabled` / `mood_match_bigbox` are on.
- **Constellation**: `--constellation-edge-series`, `--constellation-edge-developer`, `--constellation-edge-publisher`, `--constellation-edge-genre`, `--constellation-edge-platform_family`, `--constellation-edge-co_played`.
- **Mastery Map**: `--mastery-never`, `--mastery-played`, `--mastery-beaten`, `--mastery-completed`, `--mastery-mastered`.
- **`--accent`**: defined by the base stylesheet as `var(--active)` and consumed for focus rings, skeleton shimmer, and `--mood-secondary` — themes may override it directly.

## Related

- [Themes](/themes/) for the five stock CSS themes and the import workflow
- [How OpenBoxGL works](/reference/how-it-works/) for how tokens render at runtime
- `static/app.css` in the application repository for the authoritative `:root` block
