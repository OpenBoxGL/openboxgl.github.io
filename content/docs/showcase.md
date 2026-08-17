---
title: Showcase
description: Real OpenBoxGL setups, library views, and Big Box on Linux.
---

# Showcase

Real screenshots from the repository, not renders. Regenerate them with `python3 scripts/capture_readme_screenshots.py` after `cd scripts && npm ci` when you need fresh captures. All images use real LaunchBox metadata and cover art when a metadata database is present.

<ProductShot src="/openbox-screenshot.png" alt="OpenBox library grid with platform filters, grouped covers, and detail pane" caption="Library, grid and list views, platform filters, and the detail pane in one workspace." />

<ProductShot src="/openbox-game-detail.png" alt="OpenBox game detail panel with cover art, metadata, and launch controls" caption="Game detail, metadata, ratings, history, hero art, and one click launch." />

<ProductShot src="/openbox-bigbox.png" alt="OpenBox Big Box Stage layout with cover art and controller hints" caption="Big Box Stage layout, fullscreen and controller first." />

## Add your setup

Open a pull request that adds one image under `public/showcase/` and a row here with hardware, distribution, and platform count. Keep the image under 2 MB and include no personal paths. See [Project and policies](/project/contributing/) for contribution guidance.

## What each view proves

| View | What to check |
| --- | --- |
| Library grid | Search scopes, platform filters, and the arrange bar jump on large sorts |
| Game detail | Metadata fields, launch command tokens, and save discovery entry points |
| Big Box Stage | Controller mapping, filter and sort menu, and screensaver delay |
