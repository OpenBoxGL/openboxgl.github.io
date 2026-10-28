---
title: Creating Custom Themes
description: Author custom CSS themes using OpenBox's design system tokens.
---

OpenBox features a strict, token-driven CSS architecture. Every color, surface, font, and border is driven by standard CSS variables defined in `:root`.

<ThemePreviewer />

## Design System Tokens

When creating a custom theme, you only need to override `:root` variables. No component CSS rules are modified.

The table below is the minimal starter subset for the default palette: warm near-black surfaces, off-white text, a teal focus signal, a brand-orange selection/action ramp, and a matching action-ink. The full contract is much larger — mood-match (`--mood-*`), constellation edge (`--constellation-edge-*`), mastery (`--mastery-*`), overlay-insight, gamepad, health, toast, and font tokens — and is documented on the [Design system](/project/design-system/) page. Start with these, then override more as needed.

The Themes dialog renders every theme, including Default, as a card with five swatches sampled from `--bg`, `--surface-card`, `--brand`, `--text`, and `--muted`, so define all five for a representative preview. The gallery reads the values from your CSS file; it does not execute the stylesheet.

Text and interactive colors should use the **semantic ink tokens** rather than raw palette entries: `--ink-strong` for primary headings, `--on-active` for text on an active tab or selection, `--on-danger` for text on a danger surface, `--border-input` for form borders, and `--state-hover` / `--state-press` for interaction states. A contrast matrix in the test suite checks every stock theme against a fixed list of foreground/background pairs — text and ink on their surfaces, the on-active and on-danger pairs, toasts, health colors, and the non-text boundary and focus ring — so authoring against those tokens is what keeps a theme legible in all six bundled palettes. The hover and press tokens are alpha overlays rather than foregrounds and are deliberately not part of the matrix.

<Callout type="caution" title="Do not redeclare the motion tokens">

The duration and easing tokens (`--dur-fast`, `--dur-base`, `--dur-slow`, `--dur-out`, `--dur-spin`, `--dur-loop`, `--stagger`, and the `--ease-*` family) are **structural, not themable**. The reduced-motion block targets `:root:root`, so it outranks a theme's `:root` regardless of load order; redeclaring the tokens in a theme does not change motion, it only splits the contract in two. Animate through the existing tokens, or set a property without a duration. See [Motion and reduced motion](/themes/#motion-and-reduced-motion).

</Callout>

| Token | Purpose | Default |
| --- | --- | --- |
| `--bg` | Main window background | `#0F0E0C` |
| `--panel` | Sidebar, dialogs, drawers, and panels | `#1A1815` |
| `--surface-deep` | Tools menu backdrop and inset surfaces | `#0B0A09` |
| `--surface-card` | Game cards and elevated components | `#1F1C18` |
| `--surface-field` | Form inputs, search fields, textareas | `#26221D` |
| `--text` | Primary readable text color | `#F6F0E7` |
| `--muted` | Secondary labels, platform tags, metadata | `#B4A897` |
| `--focus` | Focus rings, active keyboard / gamepad focus | `#5FD3C4` |
| `--active` | Active tab and selection highlight | `#FF7A1A` |
| `--brand` | Brand accent and the gallery's action swatch | `#FF7A1A` |
| `--action` | Primary action buttons and play controls | `#F58A2E` |
| `--action-ink` | Text color on action buttons | `#1A120A` |
| `--border-card` | Card borders | `#5E5345` |
| `--border-control` | Input and button borders | `#786B58` |
| `--line` | Divider lines and separators | `#3A342C` |

### Token requirements

- Override `:root` variables only; a theme is not a component stylesheet.
- Define the starter set above, including `--brand`, which feeds the Themes dialog swatch.
- Keep text tokens readable on the surfaces you ship: `--text` on `--bg`/`--panel`/`--surface-card`, `--action-ink` on `--action`, and `--on-active` on `--active`.
- Use the semantic ink tokens for foregrounds and `--border-input` for form boundaries rather than raw palette names.
- Do not redeclare the motion tokens; they are structural, and the reduced-motion override owns them.

## Installing a Custom Theme

1. Create a CSS file named `theme-mytheme.css` in your themes directory:
   ```bash
   mkdir -p ~/.local/share/openbox-game-launcher/themes/
   nano ~/.local/share/openbox-game-launcher/themes/theme-mytheme.css
   ```
   On macOS, the themes folder is `~/Library/Application Support/openbox-game-launcher/themes/`. On Windows it is `%LOCALAPPDATA%\openbox-game-launcher\themes\`.
2. Paste your `:root` definition:
   ```css
   :root {
     --bg: #0F0E0C;
     --panel: #1A1815;
     --surface-deep: #0B0A09;
     --surface-card: #1F1C18;
     --surface-field: #26221D;
     --text: #F6F0E7;
     --muted: #B4A897;
     --focus: #5FD3C4;
     --active: #FF7A1A;
     --brand: #FF7A1A;
     --action: #F58A2E;
     --action-ink: #1A120A;
     --border-card: #5E5345;
     --border-control: #786B58;
     --line: #3A342C;
   }
   ```
3. Open OpenBox, open **Tools → Themes**, choose a scope (**All platforms** or one specific platform), pick your theme from **Active theme**, and click **Apply**. Alternatively, use **Import CSS theme** with the absolute path to your file.

<Callout type="tip" title="Token Quality Gate">
Themes are validated by `scripts/check_tokens.py` in OpenBox CI to ensure no hardcoded hex values or un-tokenized styling exist.
</Callout>

## Theme music and sounds (v1.18.0)

A theme may also provide background music and navigation sounds. Put a sidecar JSON file next to the stylesheet with the same base name: `theme-mytheme.css` pairs with `theme-mytheme.json`.

```json
{
  "music": "audio/theme.ogg",
  "sounds": {
    "move": "audio/move.wav",
    "select": "audio/select.wav",
    "back": "audio/back.mp3"
  }
}
```

- Paths are relative to the theme folder. Absolute paths and `..` segments are rejected, and only `.ogg`, `.mp3`, and `.wav` files are served.
- The sidecar is capped at 64 KiB. Unknown sound keys are ignored; only `move`, `select`, and `back` are read.
- `music` loops in Big Box at low volume. The three sounds play on navigation, confirm, and back.
- A missing, oversized, or malformed sidecar is silent, never an error: a theme without audio needs no JSON file.
- **Play theme music and navigation sounds in Big Box** (`bigbox_sounds_enabled`, default on) controls both. Music starts when Big Box opens and stops when Big Box closes.

The app reads the config from `GET /api/theme-sounds?name=<theme>` and serves each relative file through `GET /api/theme-asset?name=<theme>&path=<relative>`, so dropping the CSS and JSON pair into the user themes folder is enough.
