---
title: Arcade Room, Museum, and kiosk mode
description: Browse a controller-friendly platform showroom and configure its local Museum convenience boundary.
---

**Arcade Room** is a controller-friendly canvas showroom for the library. It groups cabinets by platform, uses available local art and media, and lets you inspect or launch the selected game without leaving the room.

## Enter and move around

Open **Tools → Arcade Room**, or choose Arcade Room from the Ctrl/Cmd-K command palette. The current UI controls are:

| Control | Action |
| --- | --- |
| Left / Right | Walk between cabinets in the current platform zone |
| Up / Down | Move between platform zones |
| Home / End | Jump to the first/last cabinet |
| Enter | Open the selected game's details |
| Space or P | Play the selected game |
| M | Toggle Museum mode |
| Escape or Backspace | Close the room |
| Gamepad | D-pad/stick navigates; mapped Play, Back, Favorite, and Menu buttons launch, leave, select, and toggle Museum |

The room uses the same library and media projections as the main UI. Missing cover art or media produces a labeled placeholder; it is not a promise that every cabinet has artwork.

## Museum mode

Museum mode turns the room into a self-guided exhibit. It shows real facts available in the selected game record—such as title, year, developer, genre, play time, and achievement counts—and advances through the room while the exhibit is idle. Any keyboard, pointer, or controller activity exits Museum mode. Users with `prefers-reduced-motion: reduce` receive a static presentation rather than the animation loop.

## Kiosk PIN

The optional Museum kiosk PIN makes unattended browsing a little less casual. Configure it in the kiosk settings or through the API:

```bash
curl -s -X POST \
  -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pin":"2468","enabled":true}' \
  "http://127.0.0.1:$PORT/api/v2/arcade/kiosk/pin"
```

PINs are 4–12 digits. OpenBox stores only a salted PBKDF2-SHA256 digest locally. `GET /api/v2/arcade/kiosk/status` reports whether the feature is enabled and whether a PIN is set; `POST /api/v2/arcade/kiosk/verify` returns only `{"ok":true|false}`.

This is a convenience boundary for a local exhibit, not account authentication, network access control, or a security guarantee. The API still requires the normal per-launch token. Clear the PIN with `{"clear":true,"enabled":false}`.

## Entry points and caveats

There is no registered `openbox://arcade` URI in the current parser or SPA. Use Tools or the command palette. `openbox://bigbox` and `?deeplink=bigbox` open Big Box, which is a related fullscreen surface but not a deep link for the Arcade Room itself.

See [Big Box and handhelds](/guides/big-box-and-handhelds/), [Keyboard & Controller Shortcuts](/reference/shortcuts/), and [API 1.11 additions](/reference/api/one-eleven/) for the related controls and route contract.
