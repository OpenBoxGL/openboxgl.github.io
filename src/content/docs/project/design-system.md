---
title: Design system
description: Complete public theme-author tokens, typography, layout, and component specs.
---

OpenBoxGL uses blue-black surfaces, cool text, cyan focus and selection, green launch actions, and orange lifecycle accents. The authoritative source is `DESIGN.md` in the application repository; this page provides every hex token, typography spec, and component detail you need for theme authoring or custom CSS.

## Base palette

All colors are dark by default. Saturated hues appear only on focus, launch state, or progress indicators. Theme authors override these tokens but should preserve the dark stage rule: neutral surfaces carry most of the screen; saturated colors identify state and action.

### Neutral surfaces

| Token | Value | Use |
| --- | --- | --- |
| `--ob-ink` | `#0d1018` | Page canvas, deepest fullscreen surfaces |
| `--ob-topbar` | `#11141d` | Command rail background |
| `--ob-panel` | `#171b29` | Sidebar, detail pane, dialogs, lifecycle surfaces |
| `--ob-raised` | `#202536` | Inputs, controls, related items, compact cards |
| `--ob-card` | `#1c2131` | Detail cards, emulator items, result rows, history items |
| `--ob-field` | `#24293a` | Form controls, secondary buttons, inline code backgrounds |
| `--ob-line` | `#30364a` | Borders, dividers, separator rules |
| `--ob-text` | `#f3f5fb` | Primary titles, high-priority content |
| `--ob-muted` | `#8e96aa` | Metadata, labels, helper copy, inactive navigation |

:::note[Contrast ratios]
The muted/text pair (`#8e96aa` / `#f3f5fb`) achieves a ratio of approximately 5.5:1 — passes WCAG AA for normal text. If your theme changes either value independently, verify the pair still reaches at least 4.5:1. Low contrast is explicitly called out in the "Do not" section.
:::

### Accent colors

| Token | Value | Use |
| --- | --- | --- |
| `--ob-focus` | `#35a9d5` | Focus ring, selected controls, active platform markers |
| `--ob-active` | `#45c4ef` | Active navigation, hover states on raised panels |
| `--ob-cyan` | `#25b7e8` | Cyan signal — focus outlines, selection borders, platform row dots |
| `--ob-green` | `#08bf20` | Launch action (Play button), successful session end |
| `--ob-action` | `#21aeda` | Dialog save buttons, explicit confirmation actions |
| `--ob-action-ink` | `#07131a` | Dark text inside green/action buttons |
| `--ob-white` | `#ffffff` | Occasional pure white highlights, cover-title overlays |
| `--ob-mark-start` | `#ffbf30` | Progress/milestone accent start (orange-yellow) |
| `--ob-mark-end` | `#f27022` | Progress/milestone accent end (deep orange) |
| `--ob-mark-ink` | `#18100a` | Text inside milestone gradient fills |

### Semantic states

| Token | Value | Use |
| --- | --- | --- |
| `--ob-achievement` | `#e8ba41` | RetroAchievements badge, achievement points display |
| `--ob-lifecycle-bg` | `#283651` | Session lifecycle overlay background |
| `--ob-lifecycle-kicker` | `#55c7ee` | Lifecycle kicker accent (cyan highlight) |
| `--ob-bigbox-bg` | `#26334f` | Big Box cover backdrop |
| `--ob-bigbox-copy` | `#aeb8ca` | Big Box secondary text |
| `--ob-empty-action` | `#2aaddb` | Empty-state action buttons |
| `--ob-danger` | *(theme-dependent)* | Error/destructive state — typically a muted red derived from the theme palette |

:::tip[State-color rule]
Cyan identifies **where the user is focused**; green identifies **where the user can launch or is actively playing**. Never swap those roles. Green for selection or cyan for launch-success are both explicitly forbidden.
:::

## Typography

All typefaces use Inter with fallbacks. Stock themes may replace the stack entirely — Midnight Circuit uses Syne + Manrope, Phosphor Terminal uses IBM Plex Mono + Share Tech Mono, Harbor Light uses Sora + Literata, Cinema Marquee uses Bebas Neue + Source Sans 3, and Nordic Mist uses Outfit + Fraunces. When you author a custom theme, consider replacing the entire Inter stack with a matching pair.

### Display hierarchy

Every size below targets Inter at `font-weight: 400` unless noted. All font families include `ui-sans-serif, system-ui, sans-serif` fallbacks.

| Level | Weight | Size | Line-height | Case | Purpose |
| --- | --- | --- | --- | --- | --- |
| Display | 900 | `clamp(34px, 6vw, 78px)` | 1.0 | Normal | Fullscreen lifecycle messages, screensaver statements |
| Headline | 900 | `22px` | 1.05 | Normal | Selected-game hero titles, uppercase labels |
| Title | 800 | `1.0625rem` (17px) | 1.2 | Normal | Library heading, primary pane titles |
| Subtitle | 400 | `18px` | 1.2 | Normal | Dialog section headers, game card titles |
| Dialog | 400 | `15px` | 1.2 | Normal | Form labels inside dialogs, metadata labels |
| Action | 800 | `14px` | 1.25 | Uppercase | Button labels, chip text, ESRB badges |
| Body | 400 | `0.75rem` (12px) | 1.4 | Normal | Default application copy, form content |
| Panel Title | 400 | `28px` | 1.1 | Normal | Big Box panel headers |
| Brand | 800 | `0.8125rem` (13px) | 1.2 | Normal | Section breadcrumbs, app title strip |
| Label | 800 | `9px` | 1.25 | Uppercase, `letter-spacing: 0.1em` | Field labels, section identifiers, nav categories |
| Nav | 400 | `0.6875rem` (11px) | 1.25 | Normal | Topbar menu items, sidebar row labels |
| Meta | 400 | `10px` | 1.4 | Normal | Release year, region tags, auxiliary metadata |
| Micro | 400 | `8px` | 1.25 | Normal | Tiny counters, badge numbers |
| Body Small | 400 | `11px` | 1.4 | Normal | Inline hints, tool-tip text, status chips |

### Scan-first rule

Use weight, case, and letter-spacing to make labels and state readable **before** adding decoration. A label at `9px` must still be legible because its bold weight (`800`) and uppercase format create visual prominence. Don't rely solely on color difference.

## Spacing

The spacing scale is compact to support dense information density without overwhelming. All padding/margin values come from these units or multiples thereof.

| Token | Value | Typical use |
| --- | --- | --- |
| `--sp-xs` | `2px` | Icon-button padding, tight list gaps |
| `--sp-sm` | `6px` | Checkbox margins, mini-divider padding |
| `--sp-md` | `8px` | Input padding, small card padding, row gaps |
| `--sp-lg` | `12px` | Detail card padding, section gutters |
| `--sp-xl` | `16px` | Standard column gap, field margin-bottom |
| `--sp-2xl` | `25px` | Wide form grids, large section spacing |

When creating new components, derive spacing from the nearest scale step up or down — don't invent arbitrary values.

## Rounded corners

Form language moves from nearly-square inputs to pill-shaped action buttons. Cards use intermediate radii. Always round images/clipped areas to match their container context.

| Token | Value | Applies to |
| --- | --- | --- |
| `--rnd-hairline` | `2px` | Thin decorative lines, narrow separators |
| `--rnd-xs` | `3px` | Input fields, tiny chip corners |
| `--rnd-sm` | `4px` | Primary/secondary buttons, small control elements |
| `--rnd-md` | `6px` | Compact utility cards, detail cards |
| `--rnd-cover` | `5px` | Game cover art containers |
| `--rnd-lg` | `8px` | Big Box panels, larger info cards |
| `--rnd-xl` | `10px` | Dialog inner surfaces |
| `--rnd-pill` | `18px` | Primary Play/launch buttons, pill badges |
| `--rnd-pill-large` | `28px` | Large status pills, extended badge containers |
| `--rnd-panel` | `12px` | CoverFlow jewel-case perspective edges |

## Layout

The application shell uses three-column composition with responsive breakpoints:

| Breakpoint | Sidebar | Library | Detail Pane |
| --- | --- | --- | --- |
| Default (> 1100px) | `170px` min | `minmax(520px, 1fr)` | `410px` |
| Tablet (≤ 1100px) | `150px` min | `1fr` | `340px` |
| Mobile (≤ 760px) | Stacked above library | Stacked | Stacked below grid |

### Cover grid

Auto-filled columns with minimum cover width of `118px`, `14px` horizontal gaps, and `17px` row gaps. Covers maintain a `0.72` aspect ratio (height ÷ width). The sticky header keeps collection title, sort, image group, and view actions visible while the grid scrolls.

### Big Box compositions

Big Box enlarges the same state colors and material language but composes differently per layout:

| Layout | Composition |
| --- | --- |
| Stage | One large cover + description + big Play button; controller footer hints |
| Hybrid | Platform rail on left + games + scoped search field; similar to desktop but larger |
| CoverFlow | Horizontal jewel-case cover strip; active cover straightens and scales |

## Shadows

Depth comes from tonal layering first, shadows second. Use the lightest shadow that separates the surface from its neighbor. Stronger lifts are reserved for focus and selection states.

| Shadow | Values | Context |
| --- | --- | --- |
| Topbar ambient | `0 2px 12px rgba(0,0,0,0.03)` | Separates command rail from workspace |
| Cover lift | `0 8px 18px rgba(0,0,0,0.05)` | Resting cover cards |
| Selected cover | `0 0 0 2px rgba(40,185,229,0.27), 0 10px 23px rgba(0,0,0,0.06)` | Active/selected cover — combines cyan halo with separation |
| Detail pane | `-12px 0 30px rgba(0,0,0,0.03)` | Right pane distinction from grid |
| Dialog depth | `0 30px 80px rgba(0,0,0,0.05)` | Modal work above dimmed workspace |

## Component specs

### Buttons

| Variant | Background | Text color | Radius | Padding |
| --- | --- | --- | --- | --- |
| Launch (Play) | `{colors.green}` → `#08bf20` | `{colors.action-ink}` → `#07131a` | Pill (`18px`) | `9px` vertical |
| Primary | `{colors.action}` → `#21aeda` | `{colors.action-ink}` | `sm` (`4px`) | `8px` 16px |
| Secondary | `{colors.field}` → `#24293a` | `{colors.text}` → `#f3f5fb` | `sm` (`4px`) | `7px` 10px |

Hover shifts secondary toward a lighter raised panel. Focused controls gain a `2px` focus border plus a one-pixel ring.

### Chips

Rating, status, and ESRB chips use small muted surfaces (`{colors.muted}` text on `{colors.card}` background) with compact body-small size (`11px`). Achievement signals use their semantic color (`#e8ba41` gold). Chips always stay subordinate to cover art and the launch action.

### Cards

| Element | Radius | Padding | Background |
| --- | --- | --- | --- |
| Cover card | `md` (`6px`) | `12px` | Gradient or raised panel |
| Detail card | `md`–`lg` (`6px`–`8px`) | `12px` | Card surface |
| Big Box panel | `lg` (`8px`) | `24px`–`26px` | Big Box bg (`#26334f`) |
| Related items | `md` (`6px`) | `12px` | Raised panel |

Resting covers use cover lift shadow. Hover and selection add cyan separation border (`2px solid #28b9e544`) and stronger lift.

### Inputs / Fields

Fields use `{colors.field}` → `#24293a` background, `{colors.white}` → `#ffffff` text, `xs` (`3px`) radius, `7px 8px` padding. On focus, the border shifts to `{colors.focus}` → `#35a9d5` and gains a one-pixel focus ring. Disabled actions reduce opacity and show `not-allowed` cursor. No separate error palette exists in the base system — errors reuse the standard flow with a textual message rather than a colored field.

### Navigation

Topbar items are borderless and transparent at rest, gaining a raised panel background on hover. Active platform rows use a darker panel tone (`{colors.panel}`) with a small cyan marker dot. Inactive navigation is muted (`{colors.muted}`) and transparent. The rail scrolls horizontally; the workspace columns tighten at `1100px` and stack below `760px`.

## Big Box specifics

Big Box reuses all palette tokens, typography sizes, and component styles from the desktop UI. Key differences:

- Titles scale up using `fullscreen-heading` (clamp 38–72px) and `screensaver` (clamp 44–110px) levels.
- Controller footer hints use `label` weight (800, 9px, uppercase, tracked) mapped to the currently pressed button.
- Jewel-case perspective on CoverFlow uses CSS transforms, not asset files.
- Background music (`library_music` setting path) plays under covers; `video_bgm_mix` lowers volume when video audio is present.

## Color theory notes

The palette is intentionally low-chroma on neutrals so cover art dominates visually. Chromatic saturation concentrates into two roles:

1. **Cyan** (`#25b7e8` family): Identifies presence — where the user's attention *is*. Focus rings, active platform dots, selected cover borders, active topbar items.
2. **Green** (`#08bf20`): Identifies agency — where the user can *act*. The Play button, session-end success banner, online-status indicator.

Orange (`#ffbf30` → `#f27022`) appears only as a progressive marker — play-time progress bars, milestone achievements — never as a primary action or state signal. Gold (`#e8ba41`) is reserved for achievements specifically.

## Light theme adjustments

When a theme enters light mode (most prominent in Harbor Light), the mapping shifts from dark ink to paper:

| Dark token | Light equivalent |
| --- | --- |
| `--ob-ink` → `#0d1018` | `--sl-color-black` → `#eef2f6` |
| `--ob-topbar` → `#11141d` | `--sl-color-bg-nav` → `#f7f8fa` |
| `--ob-panel` → `#171b29` | `--sl-color-bg-sidebar` → `#f7f8fa` |
| `--ob-raised` → `#202536` | `--sl-color-gray-6` → `#f7f8fa` |
| `--ob-card` → `#1c2131` | `--sl-color-bg` → `#eef2f6` |
| `--ob-field` → `#24293a` | `--sl-color-bg-inline-code` → `#e7ecf2` |
| `--ob-text` → `#f3f5fb` | `--sl-color-white` → `#152033` |
| `--ob-muted` → `#8e96aa` | `--sl-color-gray-1` → `#52637c` |
| `--ob-focus` → `#35a9d5` | `--sl-color-accent` → `#0b7ea8` |
| `--ob-green` → `#08bf20` | `--sl-color-launch` → `#0a9e23` |

Light themes invert the chroma direction: accents move from bright (cyan/green) to deep (navy/dark green) against light paper surfaces. Contrast ratios must remain ≥ 4.5:1.

## Related

- [How OpenBoxGL works](/reference/how-it-works/) for how these tokens render at runtime
- [Themes](/themes/) for the five stock CSS themes and import workflow
- [Design tokens in the application](https://github.com/vindeckyy/OpenBoxGL/blob/master/DESIGN.md) for the full YAML specification
