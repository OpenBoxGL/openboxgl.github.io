---
title: Player's Log — Time Capsules and Milestone Cards
description: Sealed notes to your future self, plus nine deterministic milestone cards with PNG export.
---

Player's Log (ADR 0112, 3.0) has two halves: **Time Capsules**, sealed notes and questions that unlock on a date you choose, and **Milestone Cards**, deterministic snapshots of library and play milestones that export as 1200x630 PNGs.

## Time Capsules

Open **Player's Log** from the Tools menu, or use a game's **Seal a memory** action. A capsule has a `kind` of `note` or `question`, a body of up to 4,000 characters, and an unlock date.

- The body stays **redacted server-side** until the unlock date. `GET /api/v2/capsules` returns locked entries without their body.
- Unlocking happens once at **local midnight** on the unlock date. The Rust server's hourly tick calls `unlock_due_capsules`; `opened_at` is durable, so a missed tick does not reopen or lose the capsule.
- `game_id` is display metadata, not a foreign key: deleting a game keeps its capsules.

```bash
# Create
curl -X POST -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Before the finale","body":"What did you think of the ending?","kind":"question","unlock_at":"2027-01-01"}' \
  http://127.0.0.1:$PORT/api/v2/capsules

# Read (locked bodies are redacted), open, delete
curl -H "X-OpenBox-Token: $TOKEN" http://127.0.0.1:$PORT/api/v2/capsules
curl -X POST -H "X-OpenBox-Token: $TOKEN" -H "Content-Type: application/json" \
  -d '{"id":"CAPSULE_ID"}' http://127.0.0.1:$PORT/api/v2/capsules/open
```

## Milestone Cards

`GET /api/v2/insights/milestones` returns nine deterministic milestone kinds with binary-searched crossing dates:

1. Playtime total
2. First clear
3. RetroAchievements points
4. Active-week streak
5. Library age
6. Collection size
7. Completed games
8. Mastered games
9. A game-specific playtime milestone

The card renderer is offline and shared with Moments. It draws a **1200x630 PNG** using your active theme's tokens, so the card matches the app. Export from the milestone card or save the PNG directly.

## State and storage

`time_capsules` is a top-level `library.json` collection. Capsule bodies are not included in the public library projection while locked. Milestone cards are derived on demand; the only stored state is the capsule collection.

## Related pages

- [Library](/guides/library/)
- [Play Insights](/guides/library/insights/)
- [API 3.0 changes](/reference/api/three-zero/)
