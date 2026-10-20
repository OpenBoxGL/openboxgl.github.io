---
title: API 1.17 additions
description: Request and response guidance for Game Night decks and native Windows storefront imports in OpenBox 1.17.0.
---

OpenBox 1.17.0 adds six authenticated, additive routes without changing the frozen v1 contract. Three belong to Game Night and three import games from launchers that were previously outside the library. One of the six is a `GET` on the same deck path used by the save route.

```bash
DATA_DIR="$HOME/.local/share/openbox-game-launcher"
TOKEN=$(cat "$DATA_DIR/server.token")
PORT=$(cat "$DATA_DIR/server.port")
BASE="http://127.0.0.1:$PORT"
```

Use `X-OpenBox-Token: TOKEN` in scripts. POST bodies are JSON objects and are subject to the shared 65,536-byte body limit. On Windows the data directory is `%LOCALAPPDATA%\openbox-game-launcher`.

## Game Night decks

A deck stores the inputs to a Game Night draw — a name, an optional filter query, a player count, and a minute budget — so the same setup can be reused. Saving is bounded to **20 decks**. Deck data stays in the local library state; it does not cross the library-sync protocol.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v2/party/decks` | List saved decks in insertion order. |
| `POST` | `/api/v2/party/decks` | Create or replace a deck by name. |
| `POST` | `/api/v2/party/decks/delete` | Delete one deck by its stored name. |

### `GET /api/v2/party/decks`

```json
{
  "decks": [
    { "name": "Friday couch", "query": "platform:SNES", "players": 4, "minutes": 45 }
  ]
}
```

The response is always `{"decks": [...]}`; an empty library returns an empty list. Malformed stored entries are repaired or dropped when the state is loaded, so every returned deck has all four fields.

### `POST /api/v2/party/decks`

Body:

```json
{
  "name": "Friday couch",
  "query": "platform:SNES",
  "players": 4,
  "minutes": 45
}
```

- `name` is required, trimmed, and capped at 60 characters. Matching is case-insensitive: posting an existing name replaces that deck rather than adding a duplicate. The stored spelling becomes the new name.
- `query` is optional, whitespace-collapsed, and capped at 500 characters. A non-empty query is parsed with the same grammar as library search; an invalid query returns `400` with code `PARTY_DECK_INVALID`.
- `players` is an integer from 2 to 8 (default 2).
- `minutes` is an integer from 0 to 1,440 (default 0, meaning no budget).
- Saving a 21st deck returns `400` with a message naming the 20-deck cap.

Returns `{"ok": true, "deck": {"name", "query", "players", "minutes"}}`.

The existing `POST /api/v2/party/queue` route builds the draw. Send the deck's `query`, `players`, and `minutes`; pass an optional eight-character lowercase hex `seed` to reproduce the same queue on another device. If no seed is supplied, the server returns one in the response so the draw can be repeated.

### `POST /api/v2/party/decks/delete`

Body: `{"name": "Friday couch"}`.

Deletion matches the stored name exactly, including case and spacing. Returns `{"ok": true, "deleted": "Friday couch"}`; an unknown name returns `404` with code `PARTY_DECK_NOT_FOUND`. An empty name is `400 PARTY_DECK_INVALID`.

## Native Windows storefront imports

These routes discover games installed by GOG Galaxy, the EA app, and Ubisoft Connect from their registry entries and launcher manifests. They are additive `/api/v2/*` routes; the older `/api/import/steam`, `/api/import/heroic`, and `/api/import/lutris` routes are unchanged.

| Method | Route | Source |
| --- | --- | --- |
| `POST` | `/api/v2/import/gog` | GOG Galaxy registry keys and each game's `.info` manifest. |
| `POST` | `/api/v2/import/ea` | EA app installer manifests (`installerdata.xml`). |
| `POST` | `/api/v2/import/ubisoft` | Ubisoft Connect `Installs` registry keys. |

Each route accepts an empty JSON object as its body; a non-object body returns `400`. Discovery is read-only and offline. On non-Windows hosts there is nothing to discover, so the route returns `{"added": 0, "found": 0, "errors": []}` rather than failing.

```bash
curl -s -X POST -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" -d '{}' \
  "$BASE/api/v2/import/gog"
```

All three return `{"added": <n>, "found": <n>, "errors": [...]}`:

- `found` is the number of discovered games; `added` is how many were new after merging by stable provider id.
- `errors` names a malformed registry entry, a missing install directory, or a manifest without a usable id. A malformed entry is skipped; it never aborts the whole import.
- GOG games are identified by `gog_id`, EA games by `ea_id`, and Ubisoft games by `ubisoft_id`. Re-running an import merges into the existing game rather than creating a duplicate.

### Launch behavior

- **GOG** keeps the launch task inside the install directory and runs the executable directly. Galaxy overlay and Galaxy cloud saves are not started by this path.
- **EA** launches through the registered `origin2://game/launch` handler.
- **Ubisoft** launches through the registered `uplay://launch/<id>/0` handler.

For EA and Ubisoft, a game whose launcher has been uninstalled stays in the library but cannot launch until the handler is registered again. GOG IDs, EA content IDs, and Ubisoft install IDs are validated as digits, install directories must exist, and an executable taken from a GOG manifest must stay inside that game's install directory.

In 1.17.0 these imports are manual. OpenBox 1.18.0 adds the opt-in **Auto-import GOG on startup**, **Auto-import EA app on startup**, and **Auto-import Ubisoft Connect on startup** checkboxes in the Windows Storefronts dialog, off by default. `include_uninstalled` stays false for these three sources, so owned-but-uninstalled catalogs are still not imported. The storefront scan added in 1.18.0 (`POST /api/v2/storefront/scan`) can refresh installed state for the built-in ids after the first import; see [API 1.18 additions](/reference/api/one-eighteen/).

## Related changes in 1.17.0

- **Price paid and cost per hour.** Game records gained `price_paid_cents` and `price_currency`; the default currency is the `currency` setting (three-letter code, default `USD`). Play Insights groups totals by currency and reports cost per hour only for a priced game with at least one minute played. There is no exchange-rate source and no conversion. No new route is required: the fields travel on the existing game read and edit routes.
- **Translated server notices.** Stored notifications from cloud sync, launch checks, rejected definition packs, and webhook failures now carry `title_key`/`body_key` plus parameters. The notification center resolves those keys in the active locale; older stored notifications keep their English `title`/`body` and still render.
- **ScreenScraper fix.** Requests now send the parameter names the API reads (`ssid`/`sspassword`, `softname`, `md5`/`sha1`/`crc` with `romtaille`, and `romtype=rom|iso`), and the Test button calls `ssuserInfos.php`. `SCREENSCRAPER_DEV_ID` and `SCREENSCRAPER_DEV_PASSWORD` are now required for lookups; see [Configuration](/reference/configuration/).

## Known limits in 1.17.0

- Xbox PC package scanning and owned-but-uninstalled GOG/EA/Ubisoft catalogs are not imported.
- Native storefront imports are manual in 1.17.0; 1.18.0 adds opt-in startup auto-import for them.
- Provider ids, price paid, and decks stay local. They do not cross the library-sync protocol, and Time Machine does not journal price changes.
- Cost totals are grouped by currency and are not converted. A rate is shown only for a priced game with at least one minute of playtime.
- GOG games launch their executable directly, so Galaxy overlay and cloud saves are not started.
- Notification titles and bodies are translated; other server responses and some dialog labels remain English.
- Windows ARM64 and macOS remain out of scope.

## Related pages

- [API overview and route groups](/reference/api/overview/)
- [API 1.16 additions](/reference/api/one-sixteen/)
- [Big Box and handhelds](/guides/big-box-and-handhelds/), including Game Night
- [Storefront manager](/guides/storefront-manager/) and [Import sources](/integrations/import-sources/)
- [Configuration](/reference/configuration/), including `currency` and ScreenScraper credentials
