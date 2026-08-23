---
title: Keyboard & Controller Shortcuts
description: Complete hotkey and gamepad bindings for desktop window management and Big Box kiosk mode.
---

OpenBox is designed for seamless navigation whether you are sitting at a desktop with a mechanical keyboard or holding a Steam Deck on the couch.

<ControllerDiagram />

## Desktop Keyboard Shortcuts

| Shortcut | Action | Description |
| --- | --- | --- |
| <kbd>Ctrl</kbd> + <kbd>,</kbd> | **Settings** | Opens the global settings dialog (scrapers, integrations, backups, themes). |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Q</kbd> | **Random Game** | Picks a random title from the active collection and focuses it. |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd> | **Random Game (Alt)** | Alternative hotkey for random game picker. |
| <kbd>F11</kbd> | **Fullscreen** | Toggles borderless fullscreen window mode. |
| <kbd>Escape</kbd> | **Dismiss** | Closes active dialog, tools menu, or context popup. |

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
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | **Previous / Next** | Cycles through game titles or cover flow items. |
| <kbd>Enter</kbd> | **Launch / Confirm** | Launches the selected game or applies the focused menu action. |
| <kbd>P</kbd> | **Session Control** | Opens the running session control overlay (pause, resume, kill). |
| <kbd>M</kbd> | **Filter Menu** | Opens the Big Box platform, playlist, and sort filter menu. |
| <kbd>R</kbd> | **Shuffle** | Jumps to a random title in the current list. |
| <kbd>F</kbd> | **Favorite** | Toggles the Favorite flag on the active title. |
| <kbd>Escape</kbd> / <kbd>Backspace</kbd> | **Back / Exit** | Exits Big Box mode or returns from submenus. |

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
