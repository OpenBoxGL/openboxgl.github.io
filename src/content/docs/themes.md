---
title: Themes
description: Choose stock themes or import a local CSS theme.
---

Themes are plain CSS files with live reload: changing the active theme re-applies instantly without restarting. Five stock themes ship with OpenBoxGL and are installed into the user themes folder automatically at startup:

- **Midnight Circuit**: dark blue-black, Syne/Manrope type, cyan accents.
- **Phosphor Terminal**: dark green terminal look, IBM Plex Mono / Share Tech Mono.
- **Harbor Light**: light theme, Sora/Literata type, blue and coral accents.
- **Cinema Marquee**: dark cinema look, Bebas Neue / Source Sans 3, gold accents.
- **Nordic Mist**: dark slate, Outfit/Fraunces type, muted teal accents.

## Apply a theme

Click **Themes** in the top bar. Choose a scope: **All platforms** or one specific platform, then pick the theme from **Active theme** (Default resets). **Apply** saves the choice; per-platform themes override the global one when viewing that platform. The theme is served from the user themes folder (`<data-dir>/themes`) with revalidation headers, so editing a CSS file on disk shows up after reload.

## Import your own CSS

**Import CSS theme** takes an absolute path to a `.css` file and copies it into the themes folder. **Open themes folder** opens the folder (after ensuring stock themes are present). Imported themes are plain CSS: they override the base stylesheet, so they can restyle the library, detail pane, dialogs, and Big Box.

Stock themes carry a `/* OpenBox Stock Theme:` marker. On startup, missing stock themes are re-installed, but user edits to a stock file are preserved, and user-imported files without the marker are never touched.

## Authoring guidance

The public design tokens live in the [Design system](/project/design-system/) page. In short: the default look is blue-black surfaces, cool text, cyan focus and selection, green launch actions, and orange lifecycle accents. Themes may change palette, typography, and surface treatment while preserving the interaction structure. Keep readable contrast on both light and dark surfaces, visible focus states (the base stylesheet outlines focused controls), and legible controls; avoid permanent glow, deep shadows on every component, and low-contrast text. The base CSS defines variables such as `--bg`, `--panel`, `--text`, `--muted`, `--accent`, `--green`, `--danger`, and `--focus`; themes that override these variables inherit consistent behavior across dialogs and Big Box.

Themes are scoped to the Web UI; the native Tk interface has its own fixed palette.
