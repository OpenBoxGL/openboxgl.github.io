---
title: Deal Radar
description: Opt-in Steam price watchlist and manual price tracker, restricted to store.steampowered.com.
---

Deal Radar (ADR 0111, 3.0) tracks prices for games you are waiting to buy. It is **off by default** and only talks to `https://store.steampowered.com`; it does not use a Steam account, cookies, or telemetry.

## Enable it

Open **Tools > Deal Radar**, or set:

| Setting | Default | Meaning |
| --- | --- | --- |
| `deals_enabled` | `false` | Opt in to the watchlist and price polling. |
| `deals_poll_hours` | `168` | Hours between polls, 24-720. |
| `deals_min_drop_pct` | `10` | Minimum drop for an alert, 1-90. |
| `deals_store_cc` | `"us"` | Two-letter Steam store country code. |

**3.0 scheduling note:** the Rust server's hourly tick does not currently call `deals_due`, so the automatic poll does not fire under `openbox-server`. Use **Refresh now** (`POST /api/v2/deals/refresh`) until the scheduler is wired.

## Watch a game

From a game's Details pane, choose **Deal Radar watch**, or call:

```bash
curl -X POST -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"app_id":"22380"}' \
  http://127.0.0.1:$PORT/api/v2/deals/watch
```

The watchlist is capped at 200 items and keeps at most 50 price points per item. **Unwatch** removes the item and purges its history. **Manual entry** adds a non-Steam title with a price you track yourself.

## Alerts

A price drop at or above `deals_min_drop_pct` produces one notification. `last_notified_price_cents` deduplicates, so the same price point does not nag twice, even when the notification feed evicts older entries at its 200-item cap.

## Network boundary

Every request and every HTTP redirect is pinned to `https://store.steampowered.com`. A redirect to any other host is refused, and the feature sends only the app id or search term plus the store country code. It does not send your library, account, or play history. The [privacy policy](/policies/privacy/) lists Deal Radar as the only scheduled outbound call besides update checks.

## API

| Route | Behavior |
| --- | --- |
| `GET /api/v2/deals` | Watchlist, retained price history, and last-notified prices. |
| `GET /api/v2/deals/search` | Steam store search for a candidate app id. |
| `POST /api/v2/deals/watch` | Add a watched app id. |
| `POST /api/v2/deals/unwatch` | Remove a watch and purge its history. |
| `POST /api/v2/deals/entry` | Add or update a manual entry. |
| `POST /api/v2/deals/refresh` | Poll now. |

## Related pages

- [Discovery](/guides/discovery/)
- [API 3.0 changes](/reference/api/three-zero/)
- [Privacy policy](/policies/privacy/)
