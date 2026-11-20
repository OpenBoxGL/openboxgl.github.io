---
title: Plugin manifest reference
description: Required fields, ID validation, capabilities, messages, and entry module selection.
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
| `api_version` | integer | — | **Required. Must be `2` in 3.0.** A missing value or `1` fails with `PLUGIN_API_RETIRED`. Version 2 uses the JSON Lines runner and unlocks `min_openbox` and `subscriptions`. |
| `min_openbox` | string | — | v2 only: oldest OpenBox release that may serve the plugin (for example `"2.0.0"`); an older host refuses the plugin at load. |
| `subscriptions` | array of strings | `[]` | v2 only: up to 8 named events the runner delivers — `library.changed`, `library.progress`, `session.started`, `session.ended`, `game.launched`. |
| `entry` | string | `plugin.py` | File inside the package. A `.py` entry runs through `plugin_runner_v2.py`; any other executable entry runs directly. Must be a real file and resolve inside the package (no symlinks or `..` escapes); otherwise `"Plugin entry must be a Python file inside the package."` (the message predates native entries). |
| `hooks` | array of strings | `[]` | The six base hooks plus the capability hooks: `before_launch`, `after_session`, `library`, `command`, `library_source`, `events`, `storefront`, `metadata`, `media`, `stats`, `emulator`, `discovery`. An unknown hook raises `"Plugin declares an unsupported hook."` |
| `commands` | array of objects | `[]` | Up to 32 unique `{id, label, description?}` entries used by the `command` hook. `id` must match `^[a-z0-9][a-z0-9._-]{0,63}$`; `label` is required; `description` is capped at 280 characters. |
| `permissions` | array of strings | `[]` | Subset of the declared-permission whitelist, which currently contains exactly one permission: `network`. Anything else raises `"Plugin requests unknown permissions: <names>."` |
| `settings` | object | `null` | A JSON Schema **subset** describing the plugin's settings form. See [Settings](#settings-form-schema) below. |
| `capabilities` | object | `{}` | Named capability declarations; each requires its hook. See [Capabilities](#capabilities) below. |
| `messages` | object | `{}` | Localized notification templates. See [Localized messages](#localized-messages) below. |
| `description` | string | `""` | Free text, used by the catalog and plugin list; truncated to 500 characters. |
| `author` | string | `""` | Optional author name shown with the plugin; truncated to 80 characters. |
| `homepage` | string | `""` | Optional HTTPS URL of at most 300 characters; anything else raises `"Plugin homepage must be an HTTPS URL of at most 300 characters."` |

## Capabilities

A capability declaration is additive on top of the frozen v1 hook set. A capability is accepted only when the plugin also declares the hook that implements it, so a capability can never widen what the host is willing to invoke. Declaring a capability without its hook raises `"Plugin capability <name> requires the <hook> hook."`

| Capability | Required hook | Extra fields |
| --- | --- | --- |
| `storefront` | `storefront` | optional `platform` |
| `metadata` | `metadata` | optional `platform` |
| `media` | `media` | optional `media_kinds` |
| `stats` | `stats` | — |
| `emulator_settings` | `emulator` | list of `{emulator_id, label, schema, scopes}` |
| `discovery` | `discovery` | — |

Every capability except `emulator_settings` takes `{id, name}`:

- `id` must match the plugin id pattern (`^[a-z0-9][a-z0-9._-]{1,63}$`) and must be unique across the manifest.
- `name` must be non-empty and is truncated to 80 characters.
- `platform` is text truncated to 40 characters.
- `platform` applies to `storefront` and `metadata`; `media_kinds` applies to `media`.
- `media_kinds` is a list of at most 20 supported media kind names. It defaults to `["cover", "background"]`; an unknown kind raises `"Plugin capability media declares an unknown media kind."`

`emulator_settings` is a list of at most 8 entries, with unique `emulator_id`s:

```json
{
  "emulator_id": "retroarch",
  "label": "RetroArch",
  "schema": {"type": "object", "properties": {"video_scale": {"type": "integer", "minimum": 1, "maximum": 6}}},
  "scopes": ["global", "platform"]
}
```

`schema` is required and uses the same settings subset as below. `scopes` defaults to both `global` and `platform`; it may contain only those two values and must contain at least one. Example:

```json
{
  "id": "vendor.plugin",
  "name": "Vendor Plugin",
  "version": "1.2.0",
  "api_version": 2,
  "entry": "plugin.py",
  "hooks": ["metadata", "storefront"],
  "capabilities": {
    "metadata": {"id": "vendor.metadata", "name": "Vendor metadata", "platform": "Nintendo Switch"},
    "storefront": {"id": "vendor.store", "name": "Vendor store"}
  }
}
```

## Localized messages

A bounded `messages` table lets notifications resolve against the active locale:

```json
"messages": {
  "sync_done": {"en": "{count} games synced", "de": "{count} Spiele synchronisiert"}
}
```

Rules:

- At most 64 keys; each key matches `^[a-z0-9._-]{1,64}$`.
- Each key maps locales to text. Supported locales are `en`, `es`, `de`, `fr`, and `pt`; a translation for any other locale is dropped rather than failing the manifest.
- Each template is truncated to 500 characters; a non-string translation is rejected.
- A hook notification references a key as `{"level": "success", "key": "sync_done", "params": {"count": 12}}`. The host resolves the active locale, then English, then the raw key. A formatting failure falls back to the raw template, and the resolved message is capped at 2,000 characters.

## Example

```json
{
 "id": "example-plugin",
 "name": "Example Plugin",
 "version": "1.0.0",
 "api_version": 2,
 "entry": "main.py",
 "hooks": ["library"],
 "commands": [
   {"id": "stats", "label": "Show library stats", "description": "Reports a game count."}
 ]
}
```

## Validation summary

The manifest validator (`crates/openbox-plugins/src/host.rs`; `plugins.py` mirrors it for the Python fallback) checks, in order:

1. `plugin.json` exists and decodes.
2. `id` matches the pattern, and `name` and `version` are non-empty.
3. `hooks` is a list and a subset of the twelve supported hooks (six base, six capability).
4. `api_version` is exactly `2` (a v2 manifest may add `min_openbox` and `subscriptions`); anything else fails with `PLUGIN_API_RETIRED`.
5. `entry` resolves strictly inside the package directory and is either a `.py` file or an executable file.
6. The plugin id is not one of the reserved ids `data`, `credentials`, or `plugins-state.json`.
7. `commands`, `permissions`, `settings`, `messages`, and `capabilities` each validate against their own rules, including capability-hook pairing and unique capability ids.

Invalid packages are **not** hidden: `list_plugins` surfaces them with `valid: False` and a sandbox status so the Plugins manager can explain why they cannot run, and `install_plugin` refuses them, so a bad manifest never lands in the installed set.

## Settings form schema

`settings` is a structural subset of JSON Schema, validated at manifest-read time. Supported types are `string`, `number`, `integer`, and `boolean`; `enum`, `default`, `minLength`/`maxLength`, `minimum`/`maximum`, and `required` are honored. `title`, `description`, and `format` (for example `"password"`) are presentation hints the Plugins manager renders but the validator does not enforce.

```json
{
  "id": "vendor.plugin",
  "name": "Vendor Plugin",
  "version": "1.2.0",
  "api_version": 2,
  "min_openbox": "2.0.0",
  "permissions": ["network"],
  "settings": {
    "type": "object",
    "properties": {
      "api_key": {"type": "string", "format": "password", "title": "API key"},
      "region": {"type": "string", "enum": ["us", "eu"], "default": "us"},
      "timeout": {"type": "integer", "minimum": 1, "maximum": 60, "default": 10}
    },
    "required": ["api_key"]
  }
}
```

Stored values are validated on every save: an unknown key, a value outside `enum`, or a value that breaks a type/range rule is rejected. Values reach the plugin as `payload["settings"]`, and only for plugins whose manifest declares a `settings` schema. Unset optional fields fall back to their `default`; a schema change that invalidates previously stored values falls back to defaults rather than breaking the plugin.

Password-format fields are never returned to the UI or included in a capability hook's `credentials`; the settings form shows a stored placeholder and a **Clear stored** action instead. Blank password values are excluded from backups.

## Install behavior

- Source can be a directory or a `.zip`. ZIP extraction uses the safe extractor: no symlinks, no absolute or `..` paths, bounded sizes, no duplicate entries.
- Directories containing symlinks anywhere are refused: `"Plugin directories may not contain symlinks."`
- The package root is the directory containing `plugin.json`; a ZIP whose single top-level folder holds `plugin.json` is unwrapped automatically.
- The installed directory is named by `id`. Reinstalling an existing id updates it: the old version moves to `plugins/.backups/<id>-<timestamp>` during the swap, and any failure restores it, so a broken update never leaves the plugin uninstalled.
- `POST /api/v2/plugins/repair` reinstalls from the catalog (or the recorded local package) while preserving settings and stats. The trust record is kept but re-evaluated against the new package checksum, so changed bytes ask for approval again.

## Related

- [Plugin hooks reference](/reference/plugins/hooks/) for what the entry module must export
- [Plugin processes and errors](/reference/plugins/process-and-errors/) for the run contract
- [CONTRIBUTING.md](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/CONTRIBUTING.md#plugins) for the plugin author workflow
