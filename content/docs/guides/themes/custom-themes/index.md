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
| `--bg` | Main window background | `#0f141c` |
| `--panel` | Sidebar, dialogs, drawers, and panels | `#141a24` |
| `--surface-deep` | Tools menu backdrop and inset surfaces | `#0b0f16` |
| `--surface-card` | Game cards and elevated components | `#192230` |
| `--surface-field` | Form inputs, search fields, textareas | `#121822` |
| `--text` | Primary readable text color | `#eef3ff` |
| `--muted` | Secondary labels, platform tags, metadata | `#8490ab` |
| `--focus` | Focus rings, active keyboard / gamepad focus | `#61afef` |
| `--active` | Active tab and selection highlight | `#61afef` |
| `--action` | Primary action buttons and play controls | `#e06c75` |
| `--action-ink` | Text color on action buttons | `#ffffff` |
| `--border-card` | Card borders | `#2c384c` |
| `--border-control` | Input and button borders | `#242e3f` |
| `--line` | Divider lines and separators | `#1e2634` |

## Installing a Custom Theme

1. Create a CSS file named `theme-mytheme.css` in your themes directory:
   ```bash
   mkdir -p ~/.local/share/openbox-game-launcher/themes/
   nano ~/.local/share/openbox-game-launcher/themes/theme-mytheme.css
   ```
2. Paste your `:root` definition:
   ```css
   :root {
     --bg: #0f141c;
     --panel: #141a24;
     --surface-deep: #0b0f16;
     --surface-card: #192230;
     --surface-field: #121822;
     --text: #eef3ff;
     --muted: #8490ab;
     --focus: #61afef;
     --active: #61afef;
     --action: #e06c75;
     --action-ink: #ffffff;
     --border-card: #2c384c;
     --border-control: #242e3f;
     --line: #1e2634;
   }
   ```
3. Open OpenBox, navigate to **Settings** -> **Appearance**, and select **Mytheme** from the theme dropdown.

<Callout type="tip" title="Token Quality Gate">
Themes are validated by `scripts/check_tokens.py` in OpenBox CI to ensure no hardcoded hex values or un-tokenized styling exist.
</Callout>
