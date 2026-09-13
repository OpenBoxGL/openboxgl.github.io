---
title: Steam Bridge and ES-DE migration
description: Move handheld library entries with reviewable Steam shortcuts.vdf and ES-DE gamelist workflows.
---

OpenBox 1.11 adds two review-first migration paths for handheld users: **Steam Bridge** writes only OpenBox-owned entries to Steam's `shortcuts.vdf`, and **ES-DE import** reads a bounded `gamelist.xml` into the local catalog.

## Steam Bridge

Steam Bridge can find a recent `shortcuts.vdf` under the standard Steam userdata roots, or you can pass an explicit absolute `path`. It parses the file losslessly enough to preserve unrelated records and builds a plan containing additions, updates, removals, unchanged entries, and a source fingerprint.

Use the API in two phases:

```bash
curl -s -X POST \
  -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path":"/absolute/path/to/shortcuts.vdf","game_ids":["GAME_ID"]}' \
  "http://127.0.0.1:$PORT/api/v2/steambridge/preview"
```

Review the returned plan, then send it back to `POST /api/v2/steambridge/apply` with the same path. Removal follows the same pattern: `POST /api/v2/steambridge/remove/preview` with `targets`, then `POST /api/v2/steambridge/remove` with the reviewed removal plan. If the file changes between preview and apply, Steam Bridge returns a stale-plan conflict and leaves it untouched. Foreign Steam shortcuts are not OpenBox-owned and are preserved.

The status route, `GET /api/v2/steambridge/status`, reports the selected path, availability, OpenBox count, foreign count, and parse errors without exposing shortcut contents. Limit `game_ids` to the entries you intend to manage; the route caps the list and requires an absolute path when one is supplied.

### Launch from Game Mode

Bridge entries use the installed `openbox` launcher. `openbox --play <id>` accepts a stable OpenBox `game_id` or numeric library id, starts/uses the local authenticated server, and dispatches the same launch path as the UI. It does not copy game files or bypass Steam/emulator launch profiles. See [Command line and deep links](/reference/cli/) for the CLI and [Steam Deck and handhelds](/steam-deck/) for `--game-mode`.

## ES-DE gamelist import

Open the metadata/import surface and choose **ES-DE import**, or call the v2 routes directly. The request takes an absolute `xml_path` (the `gamelist` key is accepted as an alias) and optional `options` such as path mappings and overwrite choices.

Always preview first:

```bash
curl -s -X POST \
  -H "X-OpenBox-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"xml_path":"/absolute/path/to/gamelist.xml"}' \
  "http://127.0.0.1:$PORT/api/v2/import/esde/preview"
```

The preview parses the `gameList` XML, normalizes identity and metadata, maps supported media fields, reports counts/operations, and returns source digests plus a preview token. Review the additions and merges, then send the plan and token to `POST /api/v2/import/esde/apply`. The source XML, the OpenBox base state, and the reviewed plan are all checked again; a changed file or library produces `ESDE_STALE_PLAN` before mutation.

The parser is intentionally bounded and rejects a missing file, malformed XML, an unexpected root, or an oversized source. It preserves local path identity and does not silently install an emulator or rewrite launch commands. Configure the emulator profile separately; Vita3K and Xenia are in the current emulator catalog, and both currently declare no Quick Resume state capability.

See [Library importing](/guides/library/importing/), [API 1.11 additions](/reference/api/one-eleven/), and [Emulators and launching](/guides/emulators-and-launching/) for import precedence and launch validation.
