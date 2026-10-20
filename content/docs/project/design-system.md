---
title: Design system
description: The real CSS variables, typography, layout, and component specs for theme authoring.
---

OpenBoxGL's base stylesheet uses a dark, warm game-room palette: near-black surfaces, warm off-white text, brand orange (`#FF7A1A`) for selection and the action ramp, and teal (`#5FD3C4`) as the keyboard-focus signal. This page documents the actual variables shipped in the application's `static/app.css` (linked from `index.html`), not a separate token layer. Theme authors override these variables in a CSS file imported through **Themes**.

<Callout type="warning" title="These are the shipped tokens">

This page reflects the current `static/app.css` `:root` block (linked via `<link rel="stylesheet" href="/static/app.css">` in `index.html`). The application repository also ships `docs/development/DESIGN.md`, a design manifest that documents the same warm palette (orange action ramp, teal focus, warm surfaces). If you rely on this page's values, always confirm against `static/app.css` in the repository you are actually running.

</Callout>

## Base palette

All colors are dark by default. Neutral surfaces carry most of the screen; the orange family identifies selection and the launch action, while teal marks keyboard focus.

### Neutral surfaces

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0F0E0C` | Page canvas, deepest fullscreen surfaces |
| `--topbar` | `#151310` | Command rail background |
| `--panel` | `#1A1815` | Sidebar, detail pane, dialogs, lifecycle surfaces |
| `--surface-deep` | `#0B0A09` | Sticky library header and tools menu background |
| `--surface-card` | `#1F1C18` | Detail cards, emulator items, result rows, history items |
| `--surface-field` | `#26221D` | Form controls, secondary buttons |
| `--surface-hover` | `#322C24` | Hovered raised panels |
| `--border-control` | `#786B58` | Control borders |
| `--border-card` | `#5E5345` | Card and dialog borders |
| `--line` | `#3A342C` | Borders, dividers, separator rules |
| `--text` | `#F6F0E7` | Primary titles, high-priority content |
| `--muted` | `#B4A897` | Metadata, labels, helper copy, inactive navigation |

### Accent colors

| Token | Value | Use |
| --- | --- | --- |
| `--focus` | `#5FD3C4` | Focus ring, focused controls |
| `--brand` | `#FF7A1A` | Brand identity color |
| `--active` | `#FF7A1A` | Active navigation, selected cover borders, Big Box cover borders |
| `--action` | `#F58A2E` | Launch action (Play button), primary dialog confirmations |
| `--action-ink` | `#1A120A` | Dark text inside the orange action surface |
| `--white` | `#fff` | Occasional pure white highlights |
| `--cyan` | `#5FD3C4` | Teal accent (defined in `:root`) |
| `--gold` | `#F2C14E` | Achievement/gold signal, decorative highlights |
| `--rating` | `#F2A65A` | Rating star signal |
| `--launch-shadow` | `#FF7A1A44` | Shadow tint under the Play button |
| `--danger` | `#B8473F` | Error/destructive state |
| `--empty-action` | `#F58A2E` | Empty-state action buttons |
| `--cover-title-start` | `#3A2A1C` | Cover gradient start tone |
| `--achievement` | `#F2B55C` | RetroAchievements badge, achievement points |
| `--lifecycle-bg` | `#3A2A18` | Session lifecycle overlay background |
| `--bigbox-bg` | `#241A10` | Big Box cover backdrop |
| `--bigbox-copy` | `#D8C7AF` | Big Box secondary text |
| `--overlay-insight-cell-0` | `#1B1916` | Play Insights 0-playtime cell background |
| `--overlay-insight-cell-1` | `#4A2E1C` | Play Insights level 1 playtime cell background |
| `--overlay-insight-cell-2` | `#8A451A` | Play Insights level 2 playtime cell background |
| `--overlay-insight-cell-3` | `#CC5F17` | Play Insights level 3 playtime cell background |
| `--overlay-insight-cell-4` | `#FF7A1A` | Play Insights level 4 (peak) playtime cell background |
| `--border-insight` | `#4b4338` | Play Insights heatmap and stat card borders |
| `--shadow-insight` | `#0007` | Play Insights card shadow |
| `--surface-insight-card` | `#211e1a` | Play Insights card surface background |
| `--focus-ring` | `#000000` | Play Insights peak (level 4) cell border |

## Typography

The base stack is `system-ui, sans-serif` (no bundled webfont in the base stylesheet). Font sizes come from `--font-*` variables.

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

Stock themes override the design tokens in their own `:root` blocks. Do not assume a bundled webfont or a theme-specific font family; the base stylesheet's available system stack remains the typography fallback unless the running source explicitly declares another stack.

## Spacing

The base `:root` exposes a spacing scale — `--space-*` (`--space-3xs` through `--space-2xl`), `--gap-*` (`--gap-micro`, `--gap-tight`, `--gap-default`, `--gap-loose`, `--gap-spacious`), `--stack-*` (`--stack-xs/sm/md`), and `--leading-*` (`--leading-tight/normal/relaxed`) — plus `--inset-*` and `--measure-*`. Rules consume these tokens (e.g. `padding: var(--space-2xs) var(--space-xs)`); when you add custom CSS, derive spacing from these scale tokens rather than inventing new units.

## Rounded corners

Four `--radius-*` base tokens exist, alongside `*-radius` component tokens (e.g. `--moments-radius`, which aliases `--radius-cover`). Other radii are hardcoded in the rules that use them.

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
| ≤ 1120px | `150px` | `1fr` | `340px` |
| ≤ 760px | Stacked above library | Stacked | Stacked below grid |

### Cover grid

Auto-filled columns with a minimum cover width of `132px` (`105px` at ≤ 1120px, `100px` at ≤ 760px). Covers keep the aspect ratio of each image: portrait, square, and landscape box art all render uncropped. Games without artwork fall back to a portrait `0.72` box with the title centered. The default grid gap is `24px 16px` (row then column); the sticky header keeps collection title, sort, image group, and view actions visible while the grid scrolls.

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
| `--accent-ghost` | `#FF7A1A55` | Strong translucent focus halo |
| `--accent-ghost-soft` | `#FF7A1A44` | Medium focus glow |
| `--accent-ghost-faint` | `#FF7A1A2E` | Subtle focus glow |
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
| Launch (Play) | `var(--action)` → `#F58A2E` | `var(--action-ink)` → `#1A120A` | Pill (`18px`) | `10px` |
| Primary | `var(--action)` → `#F58A2E` | `var(--action-ink)` | `4px` | `9px 16px` |
| Secondary | `var(--surface-field)` → `#26221D` | `var(--text)` | `4px` | (rule-specific) |

Hover shifts secondary toward a lighter raised surface. Focused controls gain a `2px` focus border (`var(--focus)`) plus a one-pixel ring.

### Chips and badges

Rating, status, and ESRB chips use muted text on card surfaces. Achievement signals use `--achievement` (`#F2B55C`). Badges stay subordinate to cover art and the launch action.

### Cards

| Element | Radius | Padding | Background |
| --- | --- | --- | --- |
| Cover card | `var(--radius-cover)` (`5px`) | `12px` | Gradient (`#3A2A1C` → `#171410`) or raised surface |
| Detail card | `6px` to `8px` | `12px` | `var(--surface-card)` |
| Big Box panel | `var(--radius-panel)` (`12px`) | `24px` to `26px` | `var(--bigbox-bg)` / `var(--panel)` |

### Inputs / Fields

Fields use `--surface-field` background, `--border-control` border, `4px` radius, and `7px 8px` padding. On focus, the border shifts to `--focus` (`#5FD3C4`) and gains a one-pixel ring. Disabled actions reduce opacity and show `not-allowed` cursor. No separate error palette exists in the base system; errors reuse the standard flow with a textual message rather than a colored field.

### Navigation

Topbar items are borderless and transparent at rest, gaining a raised background on hover. Active platform rows use a darker panel tone with a small orange marker dot. Inactive navigation is muted and transparent. The rail scrolls horizontally; the workspace columns tighten at `1120px` and stack below `760px`.

## Big Box specifics

Big Box reuses the palette and typography tokens, then scales them:

- Titles use `--font-bigbox-display` (clamp 38-72px) and the screensaver uses `--font-screensaver` (clamp 44-110px).
- Controller footer hints use the `--font-label` weight mapped to the currently pressed button.
- Jewel-case perspective on CoverFlow uses CSS transforms, not asset files.
- Background music (`library_music` setting path) plays under covers; `video_bgm_mix` lowers volume when video audio is present.

## Light theme note

Harbor Light is the only bundled light theme. It overrides `--bg`, `--panel`, `--line`, `--text`, `--muted`, `--cyan`, `--accent`, and `--danger` with paper tones. Note `--accent` *is* part of the base contract: it defaults to `var(--active)` and is consumed for focus rings, skeleton shimmer, and `--mood-secondary`. If you author a light theme, ensure `--focus`, `--active`, `--action`, and `--action-ink` remain legible against your light surfaces and that text contrast stays at least 4.5:1.

## Token contract

The `:root` block in `static/app.css` is the theme contract. Every stock theme overrides `:root` and (almost) nothing else:

- `themes/Cinema Marquee.css`
- `themes/Harbor Light.css` (the only bundled light theme)
- `themes/High Contrast.css` (added in 1.15.0; dark, pure-black base)
- `themes/Midnight Circuit.css`
- `themes/Nordic Mist.css`
- `themes/Phosphor Terminal.css`

`scripts/check_tokens.py` enforces the contract in CI: raw hex outside `:root` must stay at the ratcheted baseline of 0. A new visual value means a new `:root` token plus its entry in each of the six theme files. For the full per-token table, read the `:root` block in `static/app.css` in the repository you are running — this page documents the palette groups, not a frozen count of names.

### Feature token families (introduced in v1.9.0)

- **Mood Match**: `--mood-primary`, `--mood-ink`, `--mood-secondary` (aliases `--accent`), `--mood-glow` (aliases `--accent-ghost`), `--mood-tint`, `--mood-transition`. Driven live from the selected cover when `mood_match_enabled` / `mood_match_bigbox` are on.
- **Constellation**: `--constellation-edge-series`, `--constellation-edge-developer`, `--constellation-edge-publisher`, `--constellation-edge-genre`, `--constellation-edge-platform_family`, `--constellation-edge-co_played`.
- **Mastery Map**: `--mastery-never`, `--mastery-played`, `--mastery-beaten`, `--mastery-completed`, `--mastery-mastered`.
- **`--accent`**: defined by the base stylesheet as `var(--active)` and consumed for focus rings, skeleton shimmer, and `--mood-secondary` — themes may override it directly.

## Related

- [Themes](/themes/) for the six stock CSS themes and the import workflow
- [How OpenBoxGL works](/reference/how-it-works/) for how tokens render at runtime
- `static/app.css` in the application repository for the authoritative `:root` block
