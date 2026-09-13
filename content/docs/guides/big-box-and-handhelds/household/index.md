---
title: Household members, challenges, and sharing
description: Keep optional household records and leaderboards local while exchanging them through a mounted folder.
---

**Household** is an opt-in local record layer for people who share a library or a play space. It supports members, challenges, challenge results, stat shares, and leaderboard projections without an OpenBox account, hosted multiplayer, or telemetry.

## Start locally

Open **Tools → Household**. Add a member with a stable local `member_id` and display name, then create a challenge with a title, metric, target, and optional participants/game/deadline. Results are records, so another device can validate and merge them rather than receiving an opaque database dump.

The core routes are:

- `GET /api/v2/household?period=daily|weekly|monthly|all_time` for records, challenge progress, and the derived leaderboard;
- `GET /api/v2/household/leaderboard?period=weekly` for a leaderboard-focused response;
- `POST /api/v2/household/member` with `member_id`, `display_name`, and optional `avatar_color`/`stats_shared`;
- `POST /api/v2/household/challenge` with `title`, positive `target`, and optional `metric`, `description`, `game_id`, `deadline`, and `participant_ids`;
- `POST /api/v2/household/challenge/result` with `challenge_id`, `member_id`, and a non-negative `value`; and
- `POST /api/v2/household/share` with `member_id` and a period, after stats sharing is enabled.

## Stats sharing is explicit

Household records and play statistics are separate. Leaderboards that use play statistics stay empty or limited until **Household stats sharing** is enabled. A share request while it is off returns `HOUSEHOLD_STATS_DISABLED`. This is per-device opt-in; do not enable it on a device whose play history should remain private.

## Exchange records through a mounted folder

Configure the existing mounted **cloud sync folder** in Settings → Integrations. It can be a local path, Syncthing folder, Nextcloud mount, or another folder that both machines can read. Household does not upload to an OpenBox service.

1. Add or update local members/challenges/results.
2. Use **Publish** to write pending validated records to the shared folder.
3. On another device, use **Pull** to read and merge the records.
4. Review the resulting leaderboard and any new challenge progress.

The API equivalents are `POST /api/v2/household/sync/publish` and `POST /api/v2/household/sync/pull`. `POST /api/v2/household/merge` accepts a validated record list for a controlled integration, and `POST /api/v2/household/record` appends a raw record through the same validation boundary. The sync protocol accepts `v1` and the current household format; a missing mounted folder is an actionable error, not a fallback to a remote service.

## What Household does not do

Household is deliberately marked **partial** in the parity matrix. It converges local records and derives leaderboards, but it does not provide hosted accounts, real-time multiplayer, remote notifications, or a vendor cloud. Use [Statistics sync](/guides/sessions-saves-and-backups/statistics-sync/) when only play statistics should move between machines, and [API 1.11 additions](/reference/api/one-eleven/) for authenticated request/response examples.
