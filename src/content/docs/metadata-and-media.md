---
title: Metadata and media
description: Match games and manage local artwork and media jobs.
---

Metadata sync uses the LaunchBox Games Database when its local database is available. Search and apply metadata from the game detail view, then inspect cover, background, screenshot, trailer, and gallery groups.

Bulk metadata and media work runs as bounded jobs. Poll the operation-specific status endpoint and inspect errors before retrying. A missing metadata database returns HTTP 409 from readiness-dependent API routes.

Duplicate-media cleanup separates dry-run results from apply. Media downloads write local files and provider integrations may call external services, so check credentials and rate limits first.
