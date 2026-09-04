---
title: Creating Custom Themes
description: Author custom CSS themes using OpenBox's design system tokens.
---

OpenBox features a strict, token-driven CSS architecture. Every color, surface, font, and border is driven by standard CSS variables defined in `:root`.

<ThemePreviewer />

## Design System Tokens

When creating a custom theme, you only need to override `:root` variables. No component CSS rules are modified.

The table below is the minimal starter subset (matching the warm default look). The full contract is much larger — mood-match (`--mood-*`), constellation edge (`--constellation-edge-*`), mastery (`--mastery-*`), overlay-insight, gamepad, health, toast, and font tokens — and is documented on the [Design system](/project/design-system/) page. Start with these, then override more as needed.

| Token | Purpose | Example |
| --- | --- | --- |
| `--bg` | Main window background | `#11100e` |
| `--panel` | Sidebar, dialogs, drawers, and panels | `#1b1916` |
| `--surface-deep` | Tools menu backdrop and inset surfaces | `#141311` |
| `--surface-card` | Game cards and elevated components | `#211e1a` |
| `--surface-field` | Form inputs, search fields, textareas | `#27231e` |
| `--text` | Primary readable text color | `#f4efe6` |
| `--muted` | Secondary labels, platform tags, metadata | `#aaa094` |
| `--focus` | Focus rings, active keyboard / gamepad focus | `#f06000` |
| `--active` | Active tab and selection highlight | `#f06000` |
| `--action` | Primary action buttons and play controls | `#e08a3c` |
| `--action-ink` | Text color on action buttons | `#1c160d` |
| `--border-card` | Card borders | `#534a3d` |
| `--border-control` | Input and button borders | `#4b4338` |
| `--line` | Divider lines and separators | `#3d3932` |

## Installing a Custom Theme

1. Create a CSS file named `theme-mytheme.css` in your themes directory:
   ```bash
   mkdir -p ~/.local/share/openbox-game-launcher/themes/
   nano ~/.local/share/openbox-game-launcher/themes/theme-mytheme.css
   ```
2. Paste your `:root` definition:
   ```css
   :root {
     --bg: #11100e;
     --panel: #1b1916;
     --surface-deep: #141311;
     --surface-card: #211e1a;
     --surface-field: #27231e;
     --text: #f4efe6;
     --muted: #aaa094;
     --focus: #f06000;
     --active: #f06000;
     --action: #e08a3c;
     --action-ink: #1c160d;
     --border-card: #534a3d;
     --border-control: #4b4338;
     --line: #3d3932;
   }
   ```
3. Open OpenBox, click **Themes** in the top bar, choose a scope (**All platforms** or one specific platform), pick your theme from **Active theme**, and click **Apply**. Alternatively, use **Import CSS theme** with the absolute path to your file.

<Callout type="tip" title="Token Quality Gate">
Themes are validated by `scripts/check_tokens.py` in OpenBox CI to ensure no hardcoded hex values or un-tokenized styling exist.
</Callout>
