---
title: Play Insights
description: Local-first gameplay analytics, 366-day activity heatmap, streaks, and momentum tracking with zero telemetry.
---

OpenBox includes a built-in, local-first **Play Insights** dashboard. It turns your recorded play sessions into meaningful analytics without external services, accounts, or telemetry.

## Features

- **366-Day Playtime Heatmap**: Visual activity grid (53 weeks x 7 days) color-coded across 5 intensity levels (0 to 4) reflecting your daily playtime.
- **Streaks & Momentum**: Real-time calculation of current daily streak, longest streak, and 30-day playtime momentum (comparing the last 30 days vs the preceding 30 days).
- **Top Platforms & Genres**: Aggregated playtime rankings across your collection.
- **Strict Privacy**: Computed on the fly from local session history (`history` in `library.json`) and cached in memory.

## Opening Play Insights

1. Open OpenBox.
2. In the top bar or Tools menu, choose **Play Insights** (or navigate to `#insightsPanel`).
3. The dashboard renders above the library grid with instant responsive updates.

## Design System Tokens

The Play Insights heatmap and cards use dedicated design tokens:

- `--overlay-insight-cell-0`: Inactive / zero-playtime cell background
- `--overlay-insight-cell-1` through `--overlay-insight-cell-4`: Stepped playtime intensity levels
- `--border-insight`: Heatmap grid and stat card borders
- `--shadow-insight`: Elevated insight card shadows
- `--surface-insight-card`: Card background surface

## API Endpoints

- `GET /api/v2/insights/summary`: High-level analytics summary (total playtime, session count, active streaks, top platforms and genres).
- `GET /api/v2/insights/heatmap?days=366&end_date=YYYY-MM-DD`: Daily playtime array for rendering custom heatmaps.
