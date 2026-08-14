---
title: Localization
description: OpenBox ships in English today. How localization will arrive, and how to help.
sidebar: false
---

# Localization

OpenBox 1.0.0 ships in English. Earlier releases showed five interface languages, but only a handful of strings were ever translated, so the selector was honest about that and removed until real localization lands. The setting stays in **Settings > Interface language** with English as the only option, and the choice still persists in your library settings.

The UI string table in `parity_premium.strings_for(locale)` and `GET /api/premium/strings?locale=<code>` remain in the app source, so the seam for translation work is unchanged.

## When localization lands

Localization has not landed in 1.0.0; it is planned for a future release. The blocker is not the runtime seam; it is that the Web UI is one large script with roughly 2,600 lines of JavaScript and every label embedded in template literals. A real localization release means:

1. Extracting every user-facing string from `static/app.js` and the dialog markup into per-locale string files.
2. A check that fails CI when a new string ships without a key in every locale.
3. Shipping only languages that are complete, instead of partial dropdowns that mix languages.

## How to help

If you want a translation to exist:

1. Open an issue with the feature request template, naming the language.
2. When localization work starts, translations will live in the app repository as per-locale string files; open a pull request there.

## Related pages

- [Configuration](/reference/configuration/)
- [Contributing](/project/contributing/)
