---
title: API local administrator
description: Local administrator operations that are not a stable remote contract.
---

Local administrator operations that are not a stable remote contract.

## Stability

This reference follows the current `master` implementation and focused tests. Exact route names, JSON keys, limits, and error envelopes are maintained from the application source.

## Contract

Use placeholders such as `TOKEN`, `GAME_ID`, and `/path/to/...`. Authenticate local API examples with `X-OpenBox-Token: TOKEN`. Treat exported library data, credentials, and local paths as sensitive.

## Errors and limits

Invalid input returns a validation error. Missing local prerequisites are reported before destructive work. Check the operation-specific response and diagnostic log before retrying.

## Source

See the corresponding module and test named by the [application repository](https://github.com/vindeckyy/OpenBoxGL).
