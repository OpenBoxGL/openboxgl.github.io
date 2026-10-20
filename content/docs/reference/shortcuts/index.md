---
title: Keyboard & Controller Shortcuts
description: Complete hotkey and gamepad bindings for the library, the tools menu, and Big Box kiosk mode.
---

OpenBox is designed for seamless navigation whether you are sitting at a desktop with a mechanical keyboard or holding a Steam Deck on the couch. Most of the library and reader keys below are defaults you can change in Settings → Controller. **Help & shortcuts** (F1 or ?) shows a short static list in the app; this page is the authoritative list.

<ControllerDiagram />

## Help & shortcuts

Press <kbd>F1</kbd> or <kbd>?</kbd> anywhere outside a text field and dialogs to open **Help & shortcuts**, also in the Tools menu. It has three tabs:

- **Start here** — cards for adding games, setting up emulators, fetching artwork, and playing, plus buttons to reopen setup, open Library checkup, and report an issue.
- **Glossary** — plain-language definitions of shelf, emulator, ROM, BIOS, metadata, artwork, profile, playlist, collection, Big Box, and resume.
- **Shortcuts** — a short static list (`Ctrl/Cmd+K`, `/`, `Enter`, the arrow keys, `F`, `Shift+M`, `Esc`, and `F1` / `?`). It is a frozen table in the app and does **not** reflect remapped bindings, so use this reference page for the full, current set.

## Desktop Keyboard Shortcuts

| Shortcut | Action | Description |
| --- | --- | --- |
| <kbd>Ctrl</kbd> + <kbd>,</kbd> | **Settings** | Opens the global settings dialog. Rebindable as *Open settings*. |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | **Command palette** | Searches games and opens actions, settings, and What's New discovery. |
| <kbd>/</kbd> | **Search** | Focuses and selects the search field. Rebindable as *Search*. |
| <kbd>Enter</kbd> | **Play / activate** | Launches or opens the focused game. Rebindable as *Play*. |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Q</kbd> | **Random Game** | Picks a random title from the active collection and focuses it. Fixed binding. |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd> | **Random Game (Alt)** | Alternative hotkey for random game picker. Fixed binding. |
| <kbd>Shift</kbd> + <kbd>M</kbd> | **Capture Moment** | Captures a note/screenshot for the running or selected game; state capture is added only when the adapter supports Quick Resume. Fixed binding. |
| <kbd>F</kbd> | **Favorite** | Toggles the focused game's Favorite flag in the library grid or list. Rebindable as *Favorite*. |
| <kbd>M</kbd> | **Filter and sort menu** | Opens the context menu for the focused game in the library. Rebindable as *Filter and sort menu*. |
| <kbd>R</kbd> | **Random game** | Moves focus to a random game. Rebindable as *Random game*. |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | **Page** | Moves one screen of games back or forward. Rebindable as *Previous page* / *Next page*. |
| <kbd>P</kbd> | **Pause menu** | Opens the running-game overlay in Big Box; in the library the key is consumed but has no target. Rebindable as *Pause menu*. |
| <kbd>F11</kbd> | **Fullscreen** | Toggles borderless fullscreen window mode. Fixed binding. |
| <kbd>Escape</kbd> | **Back / dismiss** | Clears the selection and blurs the grid, closes active dialogs, the tools menu, or a popup. Rebindable as *Back*. |

## Remapping keyboard and controller bindings

Open **Settings → Controller**. Every row in this table can be changed there; the settings are stored as `keyboard_map` and `controller_map` and take effect when you save Settings.

- **Keyboard actions.** Play, Back, Favorite, Random game, Previous page, Next page, Pause menu, Filter and sort menu, Search, Open settings, Reader previous page, and Reader next page each have a text field and a **Press a key** capture button. Click the button, press the combination, and the field fills in. Allowed specs are a single key, a digit, `F1`-`F12`, an arrow, `PageUp`/`PageDown`, `Home`, `End`, `Enter`, `Escape`, `Space`, `Tab`, `Backspace`, or one of those with `Ctrl`, `Alt`, and/or `Shift` in front. Modifier-only presses and unsupported keys are refused with a message naming the action and the key.
- **Clearing a binding.** Clear the field (or blank it) and save. An empty entry is dropped rather than stored, so the action becomes unbound.
- **Duplicates are refused for keyboard keys.** A shortcut already assigned to another action fails validation on the client and again on the server ("is assigned to both …"), and the offending field keeps focus.
- **Controller buttons are cleared the same way.** The eight controller actions are number inputs for button indices `0`-`31`; empty means unassigned. Clearing one frees that button for another action.
- **Duplicates ask before swapping for controllers.** Type a button that another action already uses and OpenBox asks **Swap controller buttons** with "Button N is already assigned to X. Swap assignments?". Confirming exchanges the two assignments; declining restores the previous value. Buttons `12`-`15` are the D-pad on most pads and trigger a second confirmation when assigned to an action other than the two paging actions.

Defaults are Play `Enter`, Back `Escape`, Favorite `f`, Random `r`, Previous page `PageUp`, Next page `PageDown`, Pause `p`, Filter and sort menu `m`, Search `/`, Open settings `Ctrl+,`, and Reader previous/next `ArrowLeft`/`ArrowRight`. A remapped Back key does not inherit <kbd>Backspace</kbd>: that second key only works while Back is still `Escape`.

## Controller types

Settings → Controller also defines **controller types**, one per line as `id|name|kind`. Ids are unique lowercase identifiers (up to 32 characters), names up to 60 characters, `kind` must be one of the built-in kinds, and at most 40 types are accepted. The defaults are Gamepad, Arcade stick, Racing wheel, Light gun, Paddle, Trackball, Spinner, Keyboard, Mouse, and VR.

The game editor's **Controller support** field has a selectable chip for every configured type, and the text field stays editable for values outside the list. Library cards show one badge per type the game supports. Values already on a game that are no longer in your type list are kept and marked "(existing value)" so saving the dialog does not silently drop them. Those same values feed the controller filter, so the type list is what your library filters by.

## Library Grid Keyboard Navigation

These move the focus in the library grid and list once nothing is typing and no dialog is open.

| Shortcut | Action |
| --- | --- |
| <kbd>ArrowRight</kbd> / <kbd>ArrowLeft</kbd> | Next / previous game |
| <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> | Move one row (by the current column count) |
| <kbd>PageDown</kbd> / <kbd>PageUp</kbd> | Move one screen of games |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to the first / last game |
| <kbd>Escape</kbd> | Clear the current selection and blur the grid |

## Reader Keyboard Navigation

The document reader uses two rebindable actions, *Reader previous page* and *Reader next page*, defaulting to the arrow keys. These are separate from the library bindings, so the arrows can page a manual without moving the grid behind it.

| Shortcut | Action |
| --- | --- |
| <kbd>ArrowLeft</kbd> | Previous page (default for *Reader previous page*; rebindable in Settings → Controller) |
| <kbd>ArrowRight</kbd> | Next page (default for *Reader next page*; rebindable) |
| <kbd>Home</kbd> | First page (fixed) |
| <kbd>End</kbd> | Last page (fixed) |
| <kbd>Escape</kbd> | Close the reader (uses the *Back* binding, default `Escape`) |

Theme (light/dark) and layout (single/spread) are toggled with the reader's own buttons and persist across sessions. See [Big Box and handhelds](/guides/big-box-and-handhelds/) for where documents and manuals open.

## Command Palette Navigation

| Shortcut | Action |
| --- | --- |
| <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> | Move through palette results |
| <kbd>Enter</kbd> | Run the highlighted result |
| <kbd>Escape</kbd> | Close the palette |

## Arcade Room Keyboard Navigation

| Shortcut | Action |
| --- | --- |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | Move between cabinets |
| <kbd>ArrowUp</kbd> / <kbd>ArrowDown</kbd> | Move between zones within a cabinet |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to the first / last entry |
| <kbd>Enter</kbd> | Show the current game |
| <kbd>Space</kbd> / <kbd>P</kbd> | Launch the current game |
| <kbd>Escape</kbd> / <kbd>Backspace</kbd> | Leave Arcade Room |

## Tools Menu Keyboard Navigation (WAI-ARIA)

| Shortcut | Action | Description |
| --- | --- | --- |
| <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> | **Navigate Items** | Cycles through tools dropdown items with circular wrapping. |
| <kbd>Home</kbd> / <kbd>End</kbd> | **First / Last** | Jumps focus to the first or last tools menu option. |
| <kbd>Escape</kbd> | **Close Menu** | Dismisses the menu and returns focus to the Tools trigger button. |
| <kbd>Tab</kbd> | **Exit Focus** | Closes the menu when tabbing away. |

## Big Box Keyboard Navigation

The same `keyboard_map` bindings drive Big Box, so a key you remap for the library changes here too.

| Shortcut | Action | Description |
| --- | --- | --- |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowUp</kbd> | **Previous** | Moves back through the cover flow. |
| <kbd>ArrowRight</kbd> / <kbd>ArrowDown</kbd> | **Next** | Moves forward through the cover flow. |
| <kbd>Enter</kbd> | **Launch / Confirm** | Launches the selected game, confirms a screensaver pick, or applies the focused menu action. Rebindable as *Play*. |
| <kbd>P</kbd> | **Session Control** | Opens the running session control overlay (pause, resume, kill). Only acts when a session is running. Rebindable as *Pause menu*. |
| <kbd>M</kbd> | **Filter Menu** | Opens the Big Box platform, playlist, and sort filter menu. Rebindable as *Filter and sort menu*. |
| <kbd>R</kbd> | **Shuffle** | Jumps to a random title in the current list. Rebindable as *Random game*. |
| <kbd>F</kbd> | **Favorite** | Toggles the Favorite flag on the active title. Rebindable as *Favorite*. |
| <kbd>Space</kbd> | **Video pause** | Pauses or resumes the Big Box preview video while one is showing. |
| <kbd>Escape</kbd> | **Back / Exit** | Blurs the Big Box search field, closes the filter menu or the pause overlay, or exits Big Box mode on a tap. Holding Back opens the Big Box menu instead; the hold time defaults to 0.8 s and is configurable from 0 to 2 s (0 exits immediately). |
| <kbd>Backspace</kbd> | **Back / Exit** | Same as <kbd>Escape</kbd> while Back is still bound to `Escape`. |

## 1.11 deep-link shortcuts

The CLI can dispatch `openbox://resume/<id>`, `openbox://moment/<id>`, and `openbox://clip/<id>` for the current release; `openbox://launch/<id>` is also available for direct play, and the tray menu uses the `?deeplink=launch&id=<id>` form. Arcade Room has no registered URI action: open it from Tools or the Ctrl/Cmd-K palette. See [Command line and deep links](/reference/cli/) for token, server, and stable-id details.

## Context menu

| Shortcut | Action |
| --- | --- |
| <kbd>ContextMenu</kbd> (or <kbd>Shift</kbd> + <kbd>F10</kbd>) | Open the context menu for the focused game |
| <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> / <kbd>Home</kbd> / <kbd>End</kbd> | Move through context menu items |
| <kbd>Escape</kbd> / <kbd>Tab</kbd> | Close the context menu |

## Big Box Gamepad Bindings

OpenBox maps standard gamepad inputs. Every action below uses a button index `0`-`31`, editable in Settings → Controller; clear an index to unassign it, and a duplicate index asks for confirmation before the two assignments are swapped.

| Button | Default Index | Action | Description |
| --- | --- | --- | --- |
| <kbd>A</kbd> | `0` (`play`) | **Launch / Confirm** | Launch centered game / confirm selection |
| <kbd>B</kbd> | `1` (`back`) | **Back / Exit** | Return to menu / exit Big Box mode |
| <kbd>X</kbd> | `2` (`favorite`) | **Toggle Favorite** | Toggle Favorite flag for current game |
| <kbd>Y</kbd> | `3` (`random`) | **Random Shuffle** | Jump to a random game |
| <kbd>LB</kbd> / <kbd>RB</kbd> | `4` / `5` (`page_left` / `page_right`) | **Page Scroll** | Rapidly page backward and forward through library |
| <kbd>Select</kbd> / <kbd>View</kbd> | `8` (`pause`) | **Session Control** | Open running session pause and management overlay |
| <kbd>Start</kbd> / <kbd>Menu</kbd> | `9` (`menu`) | **Quick Menu** | Open Big Box platform filter and sort menu |
| <kbd>D-Pad</kbd> / <kbd>Stick</kbd> | Axes / Hats | **Directional Navigation** | Move focus across game cards and carousel |
