---
title: Search syntax
description: The full grammar of the library search box.
---

The library search box supports field-targeted terms, quoted values, and negative terms. Terms are combined with implicit AND; a space-separated list narrows the results.

<Callout type="tip" title="Search runs against stable data">

Search filters operate on `library.json` at query time, not a pre-built index or database. Every filter you apply stays in place until you clear it or navigate away, so chaining multiple sidebar facets (e.g. genre → platform → installed) compounds filters without extra typing. The Explorer facets panel (sidebar) does the same thing visually by showing counts per value; clicking a facet injects the equivalent `field:value` term. See [Library overview](/guides/library/) for the full UI walk-through.

</Callout>

<SearchPlayground />

## Field terms

Prefix a term with a field name and a colon to target one field:

| Field | Matches |
| --- | --- |
| `title:` | Name, sort title, and alternate names |
| `platform:` (alias `plat:`) | Platform value (quote multi-word values: `platform:"PlayStation 2"`) |
| `dev:` (alias `developer:`) | Developer |
| `pub:` (alias `publisher:`) | Publisher |
| `series:` | Series |
| `genre:` | Genre |
| `region:` | Region |
| `notes:` | Notes |
| `source:` (aliases `store:`, `storefront:`) | Import source (Steam, Heroic, Lutris, ...) |
| `progress:` | Progress status |
| `status:` | Status |
| `play:` (alias `playmode:`) | Play mode |
| `rating:` | Rating |
| `favorite:` (alias `fav:`) | `favorite:yes` / `favorite:no` |
| `installed:` | `installed:yes` / `installed:no` |
| `hidden:` (alias `hide:`) | `hidden:yes` / `hidden:no` |
| `broken:` | `broken:yes` / `broken:no` |
| `portable:` | `portable:yes` / `portable:no` |
| `controller:` | Controller support |
| `tag:` (alias `tags:`) | Tag (see below) |

## Negative terms

Prefix any term with `-` to exclude it:

- `-tag:demo` excludes games carrying a `demo` tag.
- `-platform:Windows` excludes Windows games.
- `-title:hollow` excludes games whose name contains "hollow".

## Quoted values

Quote values that contain spaces or special characters:

- `platform:"PlayStation 2"`
- `title:"The Legend of Zelda"`

## Bare terms

A bare term searches across name, sort title, alternate names, platform, genre, developer, publisher, series, region, notes, source, play mode, status, progress, controller support, and tags.

## Acronym matching

Short bare terms (2 to 8 alphanumeric characters) automatically match game title acronyms and initials in addition to substring searches:

- `oot` matches *The Legend of Zelda: Ocarina of Time*
- `mgs` matches *Metal Gear Solid*
- `sotn` matches *Castlevania: Symphony of the Night*
- `ff` matches *Final Fantasy*

Leading articles (*The*, *A*, *An*) are handled cleanly so searches match with or without the leading word.

## Tags

- `tag:<name>` filters to a single tag. Clicking a tag in the Tags dialog applies exactly this.
- Tag search is case-insensitive; tags are stored canonicalized.

## Examples

| Query | Result |
| --- | --- |
| `title:hollow` | Games with "hollow" in the name/sort title/alternates |
| `platform:"PlayStation 2"` | PS2 games |
| `genre:rpg -tag:demo` | RPGs that do not carry the `demo` tag |
| `dev:team favorite:yes` | Favorited games by "team" |
| `installed:no` | Owned-but-uninstalled titles |

## Natural-language grammar (Backlog Radio query bar)

The query bar above the field syntax also accepts short natural phrases, parsed deterministically by `pkg/parity/parity_query.py:33-37` and rendered as removable chips. Thresholds are named constants, surfaced in the chips:

| Phrase | Meaning |
| --- | --- |
| `short` / `quick` | Time-to-beat at most **5.0h** (`SHORT_GAME_HOURS`) |
| `long` / `epic` | Time-to-beat at least **20.0h** (`LONG_GAME_HOURS`) |
| `highly rated` | Rating at least **4.0** (`HIGH_RATING_MIN`) |
| `top rated` / `best rated` | Rating at least **4.5** (`TOP_RATING_MIN`) |
| `retro` / `classic` | Released **2000 or earlier** (`RETRO_YEAR_MAX`) |
| `recently played` / `newly added` | Within the last **31 days** (`RECENT_DAYS`) |

Typed keys (`platform:PC`, `genre:rpg`, `source:`, `tag:`, `progress:`, ESRB, region, series, player counts, ratings, time/idle phrases) combine with implicit AND. `POST /api/v2/library/query/parse` accepts query text up to **2,000 characters** (`handlers/library.py:825-826`) and returns rules, clauses, `chips`, leftover `unparsed` words with a `hint`, and `plain_query`; input with nothing parsable stays a plain substring search. Clauses **fail closed** on missing metadata: `ttb`/`year`/`played_within` filters never match a game lacking the field (`None` → `False`), and idle/never-played semantics keep never-played games in the idle set (`True`) rather than guessing. See [Backlog Radio](/guides/discovery/backlog-radio/).

## Game DNA smart search

The sidebar search box has a **Title | Smart** toggle (default Title, persisted). Title mode is the grammar above. Smart mode runs fully offline — no cloud, no downloads — using classical information retrieval: BM25 plus a curated 151-concept lexicon (English, with German, Spanish, French, and Portuguese overlays) hashed into 1024 dimensions, with a 250 ms debounce. Smart results carry **why** explanation chips showing which concepts matched. **More like this** is available in the details pane, the card context menu, and Big Box (gamepad-operable toggle feeding the hybrid search, with why-chips as subtitle lines). The atomic sidecar index lives at `<APP_DIR>/dna_index.json` and is excluded from cloud sync; library mutations invalidate it automatically, and it can be rebuilt on demand.

## See also

- [Library overview](/guides/library/), browse and search in context
- [Library organizing](/guides/library/organizing/), saved filters, presets, and explorer facets
