---
title: Creating Custom Themes
description: Author custom CSS themes using OpenBox's design system tokens.
---

OpenBox features a strict, token-driven CSS architecture. Every color, surface, font, and border is driven by standard CSS variables defined in `:root`.

<ThemePreviewer />

## Design System Tokens

When creating a custom theme, you only need to override `:root` variables. No component CSS rules are modified.

| Token | Purpose | Example |
| --- | --- | --- |
| `--background` | Main window and background surface | `#0b0e16` |
| `--surface-card` | Cards, dialogs, drawers, and panels | `#141926` |
| `--brand` | Primary brand color, play buttons, active highlights | `#ff7a00` |
| `--focus` | Focus rings, active keyboard / gamepad focus | `#00f0ff` |
| `--accent` | Secondary interactive accents and badges | `#00f0ff` |
| `--text-main` | Primary readable text color | `#f0f4fc` |
| `--text-muted` | Secondary labels, platform tags, metadata | `#8d9bb0` |
| `--border` | Card and modal borders | `#232a3d` |
| `--font-sans` | Primary UI typeface | `Space Grotesk, sans-serif` |
| `--font-mono` | Monospace typeface for paths, tokens, versions | `JetBrains Mono, monospace` |

## Installing a Custom Theme

1. Create a CSS file named `theme-mytheme.css` in your themes directory:
   ```bash
   mkdir -p ~/.local/share/openbox-game-launcher/themes/
   nano ~/.local/share/openbox-game-launcher/themes/theme-mytheme.css
   ```
2. Paste your `:root` definition:
   ```css
   :root {
     --background: #0f141c;
     --surface-card: #192230;
     --brand: #e06c75;
     --focus: #61afef;
     --accent: #98c379;
     --text-main: #abb2bf;
     --border: #2c384c;
   }
   ```
3. Open OpenBox, navigate to **Settings** -> **Appearance**, and select **Mytheme** from the theme dropdown.

<Callout type="tip" title="Token Quality Gate">
Themes are validated by `scripts/check_tokens.py` in OpenBox CI to ensure no hardcoded hex values or un-tokenized styling exist.
</Callout>
