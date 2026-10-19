---
title: Play Insights
description: Local-first gameplay analytics, 366-day activity heatmap, streaks, and momentum tracking with zero telemetry.
---

OpenBox 1.9.0 introduced the built-in, local-first **Play Insights** dashboard. It is still shipped in the current 1.17.0 release, and it turns your recorded play sessions into meaningful analytics without external services, accounts, or telemetry.

## Features

- **366-Day Playtime Heatmap**: Visual activity grid (53 weeks x 7 days) color-coded across 5 intensity levels (0 to 4) reflecting your daily playtime.
- **Streaks & Momentum**: Real-time calculation of current daily streak, longest streak, and 30-day playtime momentum (comparing the last 30 days vs the preceding 30 days).
- **Top Platforms & Genres**: Aggregated playtime rankings across your collection.
- **What it cost (v1.17.0)**: Price-paid totals grouped by currency, plus cost per hour and best/worst value for priced games with at least one minute played. No conversion is performed.
- **Strict Privacy**: Computed on the fly from local session history (`history` in `library.json`) and cached in memory.

## Opening Play Insights

1. Open OpenBox.
2. In the top bar or Tools menu, choose **Play Insights** (or navigate to `#insightsPanel`).
3. The dashboard renders above the library grid with instant responsive updates.

## What it cost (v1.17.0)

Open a game's edit dialog and enter **Price paid** and its **Currency**. The default currency for new prices comes from Settings → Library (`currency`, a three-letter code; `USD` by default). Bulk Edit can set or clear a price for several games at once.

The **What it cost** card shows one row per currency with the total, the number of priced games, total hours, and cost per hour. It also lists the five best- and five worst-value games. A rate appears only when the game cost money and has at least one minute of playtime; a zero price or an unplayed game has no rate.

There is no exchange-rate source and no conversion. Two currencies are shown as two separate totals, never added together. Price paid, currency, and the derived rates stay on the device and do not cross the library-sync protocol; Time Machine does not journal price changes.

The data is part of the existing summary response at `GET /api/v2/insights/summary` under `spend`: `{"currencies": [{"currency", "total_cents", "games", "seconds", "cost_per_hour_cents"}], "best_value": [...], "worst_value": [...]}`. `cost_per_hour_cents` is `null` when no rate applies.

## Design System Tokens

The Play Insights heatmap and cards use dedicated design tokens:

- `--overlay-insight-cell-0`: Inactive / zero-playtime cell background
- `--overlay-insight-cell-1` through `--overlay-insight-cell-4`: Stepped playtime intensity levels
- `--border-insight`: Heatmap grid and stat card borders
- `--shadow-insight`: Elevated insight card shadows
- `--surface-insight-card`: Card background surface

## API Endpoints

- `GET /api/v2/insights/summary`: High-level analytics summary (total playtime, session count, active streaks, top platforms and genres, and the `spend` block described above).
- `GET /api/v2/insights/heatmap?days=366&end_date=YYYY-MM-DD`: Daily playtime array for rendering custom heatmaps.

## Year in Review (Wrapped)

The **Wrapped** report (**Insights → Wrapped**) aggregates your year into a printable "Your Year in Games" summary: playtime, sessions, streaks, progress, and top game/platform/genre. Backed by `GET /api/v2/insights/wrapped?year=YYYY`. The **History → Timeline** tab groups past sessions by day with covers and recording badges (`GET /api/v2/history/timeline?days=90`).

## Mastery Map

The **Mastery Map** (**Tools → Mastery**) is a completionist dashboard: stacked per-platform and per-decade bars over local progress states (never / played / beaten / completed / mastered), plus a RetroAchievements column read from the existing RA disk cache — no new network calls. Clicking a segment filters the library to that platform. Backed by `GET /api/v2/insights/mastery`.
