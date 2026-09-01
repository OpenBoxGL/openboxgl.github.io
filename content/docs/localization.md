---
title: Localization
description: OpenBox ships in 5 languages. How the i18n system works, and how to add more.
sidebar: false
---

# Localization

OpenBox ships with full internationalization support for **English, Spanish, German, French, and Brazilian Portuguese** as of v1.7.2. The locale selector is in **Settings > Interface language**; switching re-translates the entire UI without a page reload.

## How it works

The i18n system uses three layers:

1. **Locale files**: JSON files in `locales/{en,es,de,fr,pt}.json` with a nested key structure (e.g. `nav.library`, `sidebar.search`, `settings.title`).
2. **HTML translation**: `data-i18n="key"` attributes on translatable elements; `data-i18n-placeholder`, `data-i18n-title`, and `data-i18n-aria-label` for attribute translation.
3. **JS translation**: `t(key, params)` from `static/i18n.js` with `{placeholder}` interpolation and automatic English fallback for missing keys.

The locale is loaded via `fetch('/locales/{locale}.json')` on page load, with `en.json` as the canonical fallback. The available locales are exposed in `public_settings` as `available_locales`.

## Gate enforcement

`scripts/check_i18n.py` runs on every `make check` and verifies:

- All 5 locale files have 100% key coverage (no missing keys in any locale).
- All `data-i18n` and `t()` references in the codebase have corresponding keys in `en.json`.

A locale file with missing keys will fail CI. This prevents shipping partial translations.

## Adding a new language

1. Create `locales/{code}.json` with the same key structure as `locales/en.json`.
2. Add the locale code to `SUPPORTED_LOCALES` in `static/i18n.js`.
3. Add the locale file route in `routes.py` and `web_app.py`.
4. Add the locale to `PUBLIC_GET_PATHS` in `routes.py`.
5. Add the locale to `available_locales` in `pkg/state/cache.py`.
6. Run `python3 scripts/check_i18n.py` to verify 100% key coverage.
7. Run `make check` to verify the full gate passes.

## Related pages

- [Configuration](/reference/configuration/)
- [Contributing](/project/contributing/)
