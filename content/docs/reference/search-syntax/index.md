---
title: Search syntax
description: The full grammar of the library search box.
---

The library search box supports field-targeted terms, quoted values, and negative terms. Terms are combined with implicit AND; a space-separated list narrows the results.

<Callout type="tip" title="Search runs against stable data">

Search filters operate on `library.json` at query time — not a pre-built index or database. Every filter you apply stays in place until you clear it or navigate away, so chaining multiple sidebar facets (e.g. genre → platform → installed) compounds filters without extra typing. The Explorer facets panel (sidebar) does the same thing visually by showing counts per value; clicking a facet injects the equivalent `field:value` term. See [Library overview](/guides/library/) for the full UI walk-through.

</Callout>

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

## See also

- [Library overview](/guides/library/) — browse and search in context
- [Library organizing](/guides/library/organizing/) — saved filters, presets, and explorer facets
