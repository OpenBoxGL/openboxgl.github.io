---
title: Search syntax
description: The full grammar of the library search box.
---

The library search box supports field-targeted terms, quoted values, and negative terms. Terms are combined with implicit AND; a space-separated list narrows the results.

## Field terms

Prefix a term with a field name and a colon to target one field:

| Field | Matches |
| --- | --- |
| `title:` | Name, sort title, and alternate names |
| `platform:` | Platform value (quote multi-word values: `platform:"PlayStation 2"`) |
| `dev:` | Developer |
| `pub:` | Publisher |
| `series:` | Series |
| `genre:` | Genre |
| `region:` | Region |
| `notes:` | Notes |
| `source:` | Import source (Steam, Heroic, Lutris, ...) |
| `store:` | Storefront |
| `progress:` | Progress status |
| `rating:` | Rating |
| `favorite:` | `favorite:yes` / `favorite:no` |
| `installed:` | `installed:yes` / `installed:no` |
| `hidden:` | `hidden:yes` / `hidden:no` |
| `broken:` | `broken:yes` / `broken:no` |
| `portable:` | `portable:yes` / `portable:no` |
| `controller:` | Controller support |
| `tag:` | Tag (see below) |

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
