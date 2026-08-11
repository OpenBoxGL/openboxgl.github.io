---
title: Contributing
description: Develop, test, and document OpenBoxGL.
---

OpenBoxGL development requires Linux, Python 3.10+, and Git. Clone the application repository and run `python3 web_app.py` for the Web UI or `python3 openbox.py` for the native UI.

Run the full suite with `./run_all_tests.sh`. Packaging checks use `./build_appimage.sh` and `python3 test_packaging.py`. Match surrounding style, keep changes focused, do not commit ROMs, BIOS files, credentials, or personal library data, and update `README.md`, `PARITY.md`, and `CHANGELOG.md` when behavior changes.

Plugins require a manifest and an entry module. See [Plugins](/reference/plugins/). Documentation changes live in the [OpenBoxGL Pages repository](https://github.com/OpenBoxGL/openboxgl.github.io) and are checked with `npm test`.

Contributions are licensed under AGPL-3.0. Security issues must use the private advisory route.
