---
title: Plugins
description: Build trusted local plugins with the documented manifest and hook contract.
---

A plugin manifest requires `id`, `name`, and `version`. IDs match `^[a-z0-9][a-z0-9._-]{1,63}$`. The implementation entry defaults to `plugin.py`; explicit entries such as `main.py` are supported.

Hooks are `library`, `before_launch`, and `after_session`. The runner exchanges one JSON object per stdin/stdout invocation, chains plugins in sorted order, caps input and output at 2 MiB, and stops a plugin after five seconds. The environment is cleaned before execution.

Plugins are local code. Review them before installation. Safe mode bypasses plugin execution, and failed installation rolls back.
