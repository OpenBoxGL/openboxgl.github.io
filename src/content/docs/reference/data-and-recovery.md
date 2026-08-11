---
title: Data and recovery
description: Understand schema version 4 state files and recovery behavior.
---

Schema version 4 stores the primary library, a `.bak` recovery copy, and `.library.json.lock` beside the data file. Writes are atomic and owner-only. Stable IDs use the `game-ID` form.

The persistent queue is capped at 500 entries and notifications at 200. Corrupt primary state is preserved before recovery. Recovery requires authentication and fails clearly when neither the primary nor a usable backup is available.

Back up the data directory before manual intervention. The application state store and `test_state_v4.py` are the maintenance sources.
