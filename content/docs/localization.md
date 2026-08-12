---
title: Localization
description: OpenBox ships in five languages. How to switch, and how to contribute translations.
sidebar: false
---

# Localization

OpenBox ships with five interface languages. The setting lives in **Settings > Interface language**, and the choice persists in your library settings.

| Code | Language |
| --- | --- |
| `en` | English |
| `es` | Español |
| `de` | Deutsch |
| `fr` | Français |
| `pt` | Português |

The UI strings come from `parity_premium.strings_for(locale)` in the app source, and the REST API exposes the same strings through `GET /api/premium/strings?locale=<code>`. Locale values are capped at five characters, so a malformed or unknown code falls back to English.

## How to contribute a translation

Translations are source strings in the app repository, not separate files on the website. To add or fix one:

1. Open `parity_premium.py` in the OpenBox repository and find `strings_for`.
2. Add or correct the entries for your locale, keeping the key names identical across locales.
3. Run the test suite (`./run_all_tests.sh`) and open a pull request.

The keys are the same for every locale; only the values differ. A missing key falls back to the English string, so a partial translation degrades gracefully instead of showing a blank label.

## Related pages

- [Configuration](/reference/configuration/)
- [Contributing](/project/contributing/)
