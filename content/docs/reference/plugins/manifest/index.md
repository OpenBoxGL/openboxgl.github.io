---
title: Plugin manifest reference
description: Required fields, ID validation, and entry module selection.
---

Every plugin package contains `plugin.json` at its root (or one directory deep, when the package is a ZIP wrapping a folder). The file is strict JSON; a missing or invalid manifest raises `"Plugin package needs a valid plugin.json."` during install.

## Required fields

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | Must match `^[a-z0-9][a-z0-9._-]{1,63}$` (lowercase start, 2-64 characters, only lowercase letters, digits, `.`, `_`, `-`). This is the install directory name and the API identifier. |
| `name` | string | Display name; must be non-empty. |
| `version` | string | Version string; must be non-empty (any format). |

A manifest missing any of these raises `"Plugin id, name, and version are required."`

## Optional fields

| Field | Type | Default | Rules |
| --- | --- | --- | --- |
| `entry` | string | `plugin.py` | Python file name inside the package. Must be a real file, with a `.py` suffix, and must resolve inside the package (no symlinks or `..` escapes); otherwise `"Plugin entry must be a Python file inside the package."` |
| `hooks` | array of strings | `[]` | Subset of `library`, `before_launch`, `after_session`, `command`, `library_source`, `events`. An unknown hook raises `"Plugin declares an unsupported hook."` |
| `description` | string | `""` | Free text, used by the catalog and plugin list. |
| `api_version` | integer | `1` | Plugin API version the package targets. Must be a positive integer; a version newer than the host supports raises and is surfaced with an error. |
| `commands` | array of objects | `[]` | Up to 32 `{id, label, description?}` entries, exposed in the command palette under the `>` prefix and run via the `command` hook. |
| `permissions` | array of strings | `[]` | Declared permissions. In 1.14.0 the only permission is `network`: declared permissions are denied by default and granted by the user at install/enable time in the Plugins manager (Android-style prompt). Granting `network` adds network access to the sandbox; grants are stored per plugin and cleared on removal. |
| `settings` | object | — | JSON Schema subset (`string`, `number`, `integer`, `boolean`, `enum`, plus `minLength`/`maxLength`/`minimum`/`maximum`). The Plugins manager renders a settings form from the schema and injects stored values into hook payloads as `payload["settings"]` — but only when the manifest declares a `settings` schema. Unset optional fields fall back to their `default`. |

## Example

```json
{
 "id": "example-plugin",
 "name": "Example Plugin",
 "version": "1.0.0",
 "api_version": 1,
 "entry": "main.py",
 "hooks": ["library"],
 "commands": [
   {"id": "stats", "label": "Show library stats", "description": "Reports a game count."}
 ]
}
```

## Validation summary

The `read_manifest` validator (in `plugins.py`) checks, in order:

1. `plugin.json` exists and decodes.
2. `id` matches the pattern, and `name` and `version` are non-empty.
3. `hooks` is a list and a subset of the six supported hooks.
4. `entry` is a `.py` file that resolves strictly inside the package directory.

Invalid packages are surfaced by `list_plugins` with `"valid": false` and the validation error (so the Plugins manager can explain why a package cannot run) and refused by `install_plugin`, so a bad manifest never lands in the installed set as a working plugin.

## Install behavior

- Source can be a directory or a `.zip`. ZIP extraction uses the safe extractor: no symlinks, no absolute or `..` paths, bounded sizes, no duplicate entries.
- Directories containing symlinks anywhere are refused: `"Plugin directories may not contain symlinks."`
- The package root is the directory containing `plugin.json`; a ZIP whose single top-level folder holds `plugin.json` is unwrapped automatically.
- The installed directory is named by `id`. Reinstalling an existing id updates it: the old version moves to `plugins/.backups/<id>-<timestamp>` during the swap, and any failure restores it, so a broken update never leaves the plugin uninstalled.

## Related

- [Plugin hooks reference](/reference/plugins/hooks/) for what the entry module must export
- [Plugin processes and errors](/reference/plugins/process-and-errors/) for the run contract
- [CONTRIBUTING.md](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/CONTRIBUTING.md#plugins) for the plugin author workflow
