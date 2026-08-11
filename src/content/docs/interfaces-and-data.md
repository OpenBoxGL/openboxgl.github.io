---
title: Interfaces and data
description: Understand OpenBoxGL interfaces, local state, and environment selection.
---

The Web UI is the full-featured interface. Start it with `python3 web_app.py` or the `openbox` wrapper. The native Tk interface starts with `python3 openbox.py` or `openbox-native`.

The default state lives at `~/.local/share/openbox-game-launcher/library.json`. Set `OPENBOX_DATA_DIR` in the process environment before starting OpenBoxGL to use another location. Import-time data selection happens before `.env` bootstrap, so setting it only inside a discovered `.env` file is too late for this choice.

The Web UI uses a local session token. Keep `server.token` private and prefer the `X-OpenBox-Token` header for local API requests.

Related: [Configuration](/reference/configuration/), [Data and recovery](/reference/data-and-recovery/), [REST API](/reference/api/).
