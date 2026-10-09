---
title: Themes
description: Choose stock themes or import a local CSS theme.
---

Themes are plain CSS files with instant apply: changing the active theme re-applies instantly without restarting. Six stock themes ship with OpenBoxGL and are installed into the user themes folder automatically at startup:

- **Midnight Circuit**: dark blue-black palette with cyan accents.
- **Phosphor Terminal**: dark green terminal palette.
- **Harbor Light**: light paper-toned palette with blue and coral accents.
- **Cinema Marquee**: dark cinema palette with gold accents.
- **Nordic Mist**: dark slate palette with muted teal accents.
- **High Contrast**: maximum-contrast palette added in v1.15.0 — body text at 21:1 against pure black, with AAA foregrounds.

<ThemePreviewer />

## Apply a theme

Click **Themes** in the top bar. Choose a scope: **All platforms** or one specific platform, then pick the theme from **Active theme** (Default resets). **Apply** saves the choice; per-platform themes override the global one when viewing that platform. The theme is served from the user themes folder (`<data-dir>/themes`) with revalidation headers, so editing a CSS file on disk shows up after reload.

## Import your own CSS

**Import CSS theme** takes an absolute path to a `.css` file and copies it into the themes folder. **Open themes folder** opens the folder (after ensuring stock themes are present). Imported themes are plain CSS: they override the base stylesheet, so they can restyle the library, detail pane, dialogs, and Big Box.

Stock themes carry a `/* OpenBox Stock Theme:` marker. On startup, missing stock themes are re-installed, but user edits to a stock file are preserved, and user-imported files without the marker are never touched.

## Authoring guidance

The public design tokens live in the [Design system](/project/design-system/) page. In short: the default look is dark, warm surfaces, off-white text, and a brand orange (`#f06000`) focus/selection signal with orange-gold (`#e08a3c`) launch actions. Themes may change palette and surface treatment while preserving the interaction structure; do not rely on undocumented theme-specific font-family claims. Keep readable contrast on both light and dark surfaces, visible focus states (the base stylesheet outlines focused controls), and legible controls; avoid permanent glow, deep shadows on every component, and low-contrast text. The base CSS defines variables such as `--bg`, `--panel`, `--text`, `--muted`, `--focus`, `--active`, `--action`, `--action-ink`, `--danger`, `--surface-card`, `--surface-field`, and `--border-card`; themes that override these variables inherit consistent behavior across dialogs and Big Box. `--accent` is defined by the base stylesheet as an alias of `--active` (`--accent: var(--active)`) and is consumed for focus rings, skeleton shimmer, and `--mood-secondary`; themes may override it directly.

<Callout type="tip" title="Author your first theme">

A theme is a plain `.css` file that overrides the design tokens. The smallest useful theme just sets the palette (use the base variables, not theme-local names):

```css
/* Your custom themes do not need the stock-theme marker. */
:root {
 --bg: #1a1020;
 --panel: #241628;
 --text: #f5eef7;
 --focus: #c77dff;
 --active: #c77dff;
 --action: #c77dff;
 --action-ink: #1a1020;
}
```

Drop the file somewhere on disk and use **Import CSS theme** with its absolute path. Stock themes carry a `/* OpenBox Stock Theme:` marker so the app knows they are managed; leave that marker out of personal themes unless you are replacing a managed stock file. To target one platform only, apply the theme from the Themes dialog with that platform selected.

</Callout>

Themes apply to the single UI rendered in both the native window and the web fallback.

## Adaptive cover theming (Mood Match, introduced in v1.9.0)

Two **Settings → Appearance** toggles personalize the UI from your games' art:

- **Adaptive cover theming** (`mood_match_enabled`) extracts a 5-color palette (primary, ink, secondary, glow, tint) from the selected cover and tints the selected card, detail hero, and play-button hover via `--mood-*` tokens.
- **Adaptive theming in Big Box** (`mood_match_bigbox`) extends the effect to the Big Box background and cover ring.

Both default off. Theme authors can restyle the effect through the `--mood-primary`, `--mood-ink`, `--mood-secondary`, `--mood-glow`, `--mood-tint`, and `--mood-transition` tokens.

## Motion and reduced motion

Every duration and easing in the UI is a **token**, not a literal: `--dur-fast` 150 ms, `--dur-base` 200 ms, `--dur-slow` 240 ms, `--dur-out` 140 ms for every exit, `--dur-spin` 2400 ms, `--dur-loop`, `--stagger`, plus `--ease-out`, `--ease-in`, `--ease-move`, and `--ease-linear`. These are structural, not part of the theme palette: a theme must not redeclare them, because the theme stylesheet loads after the base one and would otherwise defeat the override below. Authoring a new animation means choosing a token; a raw duration fails the token gate.

<Callout type="note" title="One switch, and nothing can be missed">

Reduced motion is correct by construction. A single `prefers-reduced-motion: reduce` block sets every duration token to approximately zero, and it is written with a specificity that outranks a theme's `:root` regardless of load order. Anything that cannot be zeroed — an infinite loop — is switched off instead, so a button in its busy state shows an ellipsis rather than a frozen spinner, cover shimmer and card skeletons stop, and the Big Box startup video and video snaps are hidden entirely.

</Callout>

Turn it on through your operating system's accessibility settings (Windows: **Settings → Accessibility → Visual effects → Animation effects**; GNOME and most Linux desktops: the same switch under Accessibility → Seeing), and OpenBox picks it up live — there is no in-app toggle, because a second one is a second thing that can be missed. Motion that JavaScript owns (the Game Night wheel, the Constellation layout, dialog exits, and the toast timers) reads the same tokens at call time rather than at load time, so the setting applies without a restart.

What you see with motion on:

- Dialogs animate in **and out**; the exit is not skipped for dialogs built lazily at runtime.
- Switching themes cross-fades rather than snapping.
- Covers reserve their box and fade in when the image loads, so the grid does not jump.
- The library grid's entrance animation plays for a view change only — not on every search keystroke, favorite, bulk toggle, or cover-ratio regroup.
- The Big Box stage slides in from the direction you moved.

## Contrast is checked, not assumed (v1.15.0)

Text and interactive colors use semantic ink tokens — `--ink-strong`, `--on-active`, `--on-danger`, `--border-input`, `--state-hover`, and `--state-press` — rather than raw palette entries. A contrast matrix in the test suite checks every stock theme against a fixed list of foreground/background pairs a component actually paints — body and muted text on the background, ink on card, field, hover, rating-badge, and insight-card surfaces, on-active on the active and accent colors, on-danger on danger, the four toast colors, the three health colors, and the input boundary and focus ring at the lower non-text threshold. The hover and press state tokens are alpha overlays rather than foregrounds, so they are excluded from the matrix by design. That matrix is how the High Contrast theme doubled as the proof that the token contract holds end to end: it redeclares `:root` only, uses no raw color outside `:root`, and any component that needed a hardcoded color to stay legible would show up there as an unreadable panel rather than a passing gate.

## Related pages

- [Custom themes](/guides/themes/custom-themes/) — authoring and importing your own theme CSS, and the token contract it must honor.
- [Design system](/project/design-system/) — the token names, spacing, and component conventions a theme builds on.
- [Localization](/localization/) — translating OpenBox into one of the five supported languages.
