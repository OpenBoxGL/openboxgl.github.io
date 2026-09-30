---
title: Keyboard & Controller Shortcuts
description: Complete hotkey and gamepad bindings for the library, the tools menu, and Big Box kiosk mode.
---

OpenBox is designed for seamless navigation whether you are sitting at a desktop with a mechanical keyboard or holding a Steam Deck on the couch.

<ControllerDiagram />

## Desktop Keyboard Shortcuts

| Shortcut | Action | Description |
| --- | --- | --- |
| <kbd>Ctrl</kbd> + <kbd>,</kbd> | **Settings** | Opens the global settings dialog (scrapers, integrations, backups, themes). |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | **Command palette** | Searches games and opens actions, settings, and What's New discovery. |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Q</kbd> | **Random Game** | Picks a random title from the active collection and focuses it. |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd> | **Random Game (Alt)** | Alternative hotkey for random game picker. |
| <kbd>M</kbd> | **Capture Moment** | Captures a note/screenshot for the running or selected game; state capture is added only when the adapter supports Quick Resume. |
| <kbd>F</kbd> | **Favorite** | Toggles the focused game's Favorite flag in the library grid or list. |
| <kbd>F11</kbd> | **Fullscreen** | Toggles borderless fullscreen window mode. |
| <kbd>Escape</kbd> | **Dismiss** | Closes active dialog, tools menu, or context popup. |

## Library Grid Keyboard Navigation

These move the focus in the library grid and list once nothing is typing and no dialog is open.

| Shortcut | Action |
| --- | --- |
| <kbd>ArrowRight</kbd> / <kbd>ArrowLeft</kbd> | Next / previous game |
| <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> | Move one row (by the current column count) |
| <kbd>PageDown</kbd> / <kbd>PageUp</kbd> | Move one screen of games |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to the first / last game |
| <kbd>Escape</kbd> | Clear the current selection and blur the grid |

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

| Shortcut | Action | Description |
| --- | --- | --- |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowUp</kbd> | **Previous** | Moves back through the cover flow. |
| <kbd>ArrowRight</kbd> / <kbd>ArrowDown</kbd> | **Next** | Moves forward through the cover flow. |
| <kbd>Enter</kbd> | **Launch / Confirm** | Launches the selected game, confirms a screensaver pick, or applies the focused menu action. |
| <kbd>P</kbd> | **Session Control** | Opens the running session control overlay (pause, resume, kill). Only acts when a session is running. |
| <kbd>M</kbd> | **Filter Menu** | Opens the Big Box platform, playlist, and sort filter menu. |
| <kbd>R</kbd> | **Shuffle** | Jumps to a random title in the current list. |
| <kbd>F</kbd> | **Favorite** | Toggles the Favorite flag on the active title. |
| <kbd>Escape</kbd> | **Back / Exit** | Blurs the Big Box search field, closes the filter menu or the pause overlay, or exits Big Box mode. |
| <kbd>Backspace</kbd> | **Back / Exit** | Same as <kbd>Escape</kbd> inside the filter menu. |

## 1.11 deep-link shortcuts

The CLI can dispatch `openbox://resume/<id>`, `openbox://moment/<id>`, and `openbox://clip/<id>` for the current release; `openbox://launch/<id>` is also available for direct play. Arcade Room has no registered URI action: open it from Tools or the Ctrl/Cmd-K palette. See [Command line and deep links](/reference/cli/) for token, server, and stable-id details.

## Context menu

| Shortcut | Action |
| --- | --- |
| <kbd>ContextMenu</kbd> (or <kbd>Shift</kbd> + <kbd>F10</kbd>) | Open the context menu for the focused game |
| <kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> / <kbd>Home</kbd> / <kbd>End</kbd> | Move through context menu items |
| <kbd>Escape</kbd> / <kbd>Tab</kbd> | Close the context menu |

## Big Box Gamepad Bindings

OpenBox maps standard gamepad inputs (customizable via Settings for button indices 0–31):

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
