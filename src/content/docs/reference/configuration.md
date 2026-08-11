---
title: Configuration
description: Configure environment values, local state, and application settings.
---

Configuration sources include process environment, discovered `~/.env` or project `.env`, and persisted application settings. Process environment values take precedence. `OPENBOX_DATA_DIR` is selected before `.env` bootstrap, so export it before launch.

Public examples must use placeholders. Keep `server.token`, provider credentials, and webhook secrets private. Restart OpenBoxGL after changing values consumed at process startup.

The authoritative sources are `.env.example`, `env_config.py`, settings validation, and the Settings dialog.
