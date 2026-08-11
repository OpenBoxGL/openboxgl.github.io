---
title: Emulators and launching
description: Configure profiles, tokens, archives, dependencies, and session controls.
---

Create a platform profile with an executable command, then use per-game overrides when one title needs a different path or argument. Commands are tokenized rather than interpolated through a shell.

Supported tokens are documented in [Command tokens](/reference/command-tokens/). Archive extraction, dependency checks, launch overlays, force-close behavior, session tracking, and optional save-tool hooks are handled around the local process.

A missing launch command, missing profile, or non-executable game fails before a process is started. Check the detail pane's command and emulator installation when a session fails.
