---
title: Design system
description: Public theme-author tokens and interaction rules.
---

OpenBoxGL uses blue-black surfaces, cool text, cyan focus and selection, green launch actions, and orange lifecycle accents. The application source of truth is `DESIGN.md` in the application repository; this page is the public theme-author summary.

## Base palette

| Role | Color |
| --- | --- |
| Ink (page background) | `#0d1018` |
| Topbar | `#11141d` |
| Panel | `#171b29` |
| Raised panel | `#202536` |
| Card | `#1c2131` |
| Field | `#24293a` |
| Line (borders) | `#30364a` |
| Text | `#f3f5fb` |
| Muted text | `#8e96aa` |
| Focus / selection (cyan) | `#25b7e8` / `#35a9d5` |
| Active (cyan) | `#45c4ef` |
| Launch action (green) | `#08bf20` |
| Lifecycle accents (orange) | `#ffbf30` -> `#f27022` |

## Interaction rules

- Keep the base surface dark; let cyan focus and green launch states carry the strongest chroma.
- Cover art is the main browsing surface; metadata stays near the selected game.
- Use layered surfaces, restrained shadows, small radii (`3px` fields, `4px-5px` controls, `5px-8px` cards), readable labels, and visible focus states (focus border plus a one-pixel ring).
- Preserve the three-pane workspace (filter sidebar, cover grid/list, detail pane) and its fullscreen Big Box relationship when adding a surface.
- Stock themes may change palette, typography, and surface treatment while preserving the interaction structure: theme overrides are intentional, not bug reports.

## Do not

- Do not introduce a bright neutral page background that competes with cover art.
- Do not use green for ordinary selection or cyan for a launch-success state.
- Do not replace the dense library workflow with a generic dashboard of oversized cards.
- Do not add a new type family or palette role to the base system without a theme or product decision.
- Do not use permanent glow or deep shadows on every component; reserve them for state and elevation.
- Do not use low-contrast text.

## Typography

Base type family is Inter (falling back to ui-sans-serif/system-ui). Display sizes clamp responsively (headline up to `clamp(34px, 6vw, 78px)`); body is small (`0.75rem` base) with compact tracked uppercase labels for section and navigation identifiers. Ratings and status chips use small muted slate surfaces.

## Big Box

Big Box enlarges the same cover, title, green launch action, cyan active border, dark panels, and muted navigation hints for controller and handheld use. Stage, Hybrid, and CoverFlow layouts vary composition while keeping the same state colors and material language. Jewel-case depth styling on CoverFlow comes from CSS, not assets.

## Related

- [Themes](/themes/) for the stock CSS themes
- [Design tokens in the application](https://github.com/vindeckyy/OpenBoxGL/blob/master/DESIGN.md)
