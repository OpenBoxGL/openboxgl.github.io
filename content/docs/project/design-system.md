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
| `--panel2` | `#24211d` | Secondary panel tone |
| `--surface-deep` | `#141311` | Sticky library header background |
| `--surface-header` | `#1c1916` | Header surface |
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
| `--active` | `#f06000` | Active navigation, selected cover borders, Big Box cover borders |
| `--action` | `#e08a3c` | Launch action (Play button), primary dialog confirmations |
| `--action-ink` | `#1c160d` | Dark text inside the orange-gold action surface |
| `--white` | `#ffffff` | Occasional pure white highlights |
| `--cyan` | `#72c9d4` | Teal accent (defined in `:root` but not consumed by the base stylesheet) |
| `--green` | `#8fbd8d` | Muted sage (defined in `:root` but not consumed by the base stylesheet) |
| `--gold` | `#e5b65c` | Achievement/gold signal, decorative highlights |
| `--rating` | `#e5b65c` | Rating star signal |
| `--launch-shadow` | `#e08a3c44` | Shadow tint under the Play button |
| `--danger` | `#743f3f` | Error/destructive state |
| `--empty-action` | `#e08a3c` | Empty-state action buttons |
| `--mark-start` | `#f0c36a` | Progress/milestone accent start |
| `--mark-end` | `#ba593d` | Progress/milestone accent end |
| `--mark-ink` | `#1c160d` | Text inside milestone fills |
| `--cover-title-start` | `#51412d` | Cover gradient start tone |
| `--achievement` | `#e8ba55` | RetroAchievements badge, achievement points |
| `--lifecycle-bg` | `#45351d` | Session lifecycle overlay background |
| `--lifecycle-kicker` | `#f0c36a` | Lifecycle kicker accent |
| `--bigbox-bg` | `#30261a` | Big Box cover backdrop |
| `--bigbox-copy` | `#d0c0a5` | Big Box secondary text |

<Callout type="note" title="Defined vs consumed">

`--cyan` and `--green` are declared in `:root` but the base stylesheet never reads them with `var()`. The launch action uses `--action` (orange-gold), not `--green`. A theme that sets `--green` alone will not change the Play button; set `--action` and `--action-ink` for that. `--focus`, `--active`, `--action`, and `--launch-shadow` are the orange tokens the base stylesheet actually consumes.

</Callout>

### State-color rule

Orange (`#f06000` / `#e08a3c`) identifies both **where the user is focused** and **where the user can launch or is actively playing**. The brand orange (`#f06000`) carries the high-energy focus/selection/glow roles; the orange-gold primary (`#e08a3c`) carries launch and confirmation surfaces. The base stylesheet does not split these roles across two hue families the way earlier `DESIGN.md` text described. If you author a theme that does split focus from launch, keep the two roles visually distinct and never make launch read as a destructive or muted state.

## Typography

The base stack is `ui-sans-serif, system-ui, sans-serif` (no bundled webfont in the base stylesheet). Font sizes come from `--font-*` variables.

| Token | Value | Use |
| --- | --- | --- |
| `--font-micro` | `9px` | Tiny counters, badge numbers |
| `--font-label` | `11px` | Section labels, field labels, nav categories |
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

Depth comes from tonal layering first, shadows second. The real values in the base stylesheet:

| Context | Value |
| --- | --- |
| Cover lift | `0 8px 18px #0007` |
| Cover (Cinema Marquee theme) | `0 14px 32px #000a` |
| Dialog depth | `0 30px 80px #000c` |
| Big Box cover | `0 0 0 6px #f0600022, 0 40px 90px #000c` |
| Play button | `0 5px 14px var(--launch-shadow)` |

Hover and selection add an orange separation border plus stronger lift. The selected cover uses a cyan-family halo only in the historical `DESIGN.md`; the shipped base uses orange (`--active`).

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

Harbor Light is the only bundled light theme. It overrides `--bg`, `--panel`, `--panel2`, `--line`, `--text`, `--muted`, `--cyan`, `--green`, `--accent`, and `--danger` with paper tones, but the base stylesheet does not define a `--accent` variable or a `--sl-color-*` token set. Those names are theme-local, not part of the base contract. If you author a light theme, ensure `--focus`, `--active`, `--action`, and `--action-ink` remain legible against your light surfaces and that text contrast stays at least 4.5:1.

## Related

- [Themes](/themes/) for the five stock CSS themes and the import workflow
- [How OpenBoxGL works](/reference/how-it-works/) for how tokens render at runtime
- `static/app.css` in the application repository for the authoritative `:root` block
