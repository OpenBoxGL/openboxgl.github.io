---
title: Showcase
description: Real OpenBoxGL setups, library views, and Big Box on Linux.
---

# Showcase

Real screenshots from the repository, not renders. Regenerate them with `python3 scripts/capture_readme_screenshots.py` after `cd scripts && npm ci` when you need fresh captures. All images are user supplied captures of user supplied games and cover art belongs to its publisher. Cover art and game files are not vendored in the repository or the site. Contributions that add an image must state the source and that you have the right to submit it under the [Developer Certificate of Origin](/project/contributing/#developer-certificate-of-origin).

<ProductShot src="/openbox-screenshot.png" alt="OpenBox 3.0 library view with the compact single-row header, Display popover, top-bar Settings, collapsed More filters sidebar, and auto-collapsed Details pane" caption="Library: the 94 px single-row header, Display popover, top-bar Settings, collapsed More filters, and auto-collapsed empty Details pane." />

<ProductShot src="/openbox-game-detail.png" alt="OpenBox 3.0 game detail panel for Elden Ring with hero art, one-click Play, close button, and collapsible More actions, Save management, and Launch check cards" caption="Game detail: hero art, one-click Play, streamlined primary actions, collapsible More actions / Save management / Launch check, and a quick close button." />

<ProductShot src="/openbox-bigbox.png" alt="OpenBox 3.0 Big Box in Stage layout with portrait cover art, Play button, top-bar Exit button, and controller hints" caption="Big Box: fullscreen controller navigation in Stage layout with clean portrait framing and a top-bar Exit button." />

<ProductShot src="/openbox-picker.png" alt="The What should I play? picker with time, mood, familiarity, and player filters" caption="The smart picker narrows the library by time, mood, familiarity, and players — or just surprise me." />

<ProductShot src="/openbox-constellation.png" alt="OpenBox 3.0 Library Constellation graph showing connected game nodes with series, developer, and genre edges" caption="Constellation: an interactive library relationship graph with series, developer, and genre edges." />

<ProductShot src="/openbox-wrapped.png" alt="Your Year in Games report with playtime, sessions, streaks, and top games" caption="Your Year in Games: a printable annual report of playtime, sessions, streaks, and top picks." />

<ProductShot src="/openbox-mastery.png" alt="Mastery dashboard with per-platform completion bars" caption="Mastery tracks beaten, completed, and mastered progress per platform and decade." />

<ProductShot src="/openbox-game-night.png" alt="Game Night party mode with the multiplayer spin wheel and up-next queue" caption="Game Night builds a multiplayer queue from your library and spins the wheel for the next round." />

## Add your setup

Open a pull request that adds one image under the repository's root `public/` asset directory (alongside the existing `openbox-*.png` files) and a row here with hardware, distribution, and platform count. Reference it from the page as `/your-file.png`. Keep the image under 2 MB and include no personal paths. Sign the commit under the [Developer Certificate of Origin](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/CONTRIBUTING.md#developer-certificate-of-origin) and see [Project and policies](/project/contributing/) for contribution guidance.

## What each view proves

| View | What to check |
| --- | --- |
| Library grid | Search scopes, platform filters, and the arrange bar jump on large sorts |
| Game detail | Metadata fields, launch command tokens, and save discovery entry points |
| Big Box Stage | Controller mapping, filter and sort menu, and screensaver delay |
| Smart picker | Time, mood, familiarity, and player filters resolve to a playable pick |
| Constellation | Relationship graph pan/zoom, series and platform links, and node focus |
| Year in Games | Playtime totals, session counts, streaks, and the printable report |
| Mastery | Per-platform completion bars and the decade filter |
| Game Night | Player count, session length, the spin wheel, and the up-next queue |

## Related pages

- [Downloads](/downloads/) — every install method and its verify step.
- [Compare](/compare/) — how OpenBox lines up against LaunchBox.
- [Enterprise](/enterprise/) — commercial use, licensing, and deployment.
