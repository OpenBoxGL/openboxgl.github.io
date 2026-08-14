---
title: Contributing
description: Develop, test, and document OpenBoxGL.
---

OpenBoxGL development requires Linux, Python 3.10+, and Git. The application repository is [vindeckyy/OpenBoxGL](https://github.com/vindeckyy/OpenBoxGL); this site lives in [OpenBoxGL/openboxgl.github.io](https://github.com/OpenBoxGL/openboxgl.github.io).

## Development setup

```bash
git clone https://github.com/vindeckyy/OpenBoxGL.git
cd OpenBoxGL
python3 web_app.py     # Web UI (development)
make native-host       # build the native host, then ./openbox-native.sh
```

Optional local configuration loads from `~/.env` or a project `.env` file (see `.env.example`). Never commit secrets, tokens, or personal credentials.

## Testing

Run the full suite before submitting a pull request:

```bash
./run_all_tests.sh
```

Each `test_*.py` is a standalone contract test (plain asserts or unittest) run directly with `python3 -B <file>`. Iterate on one module with `python3 test_catalog.py`. Packaging checks use `./build_appimage.sh` and `python3 test_packaging.py`. All tests must pass on CI before a PR merges.

## Coding guidelines

- Match the style of surrounding code; prefer focused changes over broad refactors.
- Target Python 3.10+ and the standard library only; new dependencies require approval.
- Use explicit, user-facing error messages for validation failures.
- Keep user-facing strings clear and neutral.
- Do not commit ROMs, BIOS images, API tokens, or personal library data.
- Update `README.md`, `PARITY.md`, and `CHANGELOG.md` when behavior changes (and `openbox.metainfo.xml`/`SECURITY.md` for releases and support policy).
- Commit messages are concise and imperative: `Add storefront startup auto-import setting`, `Fix emulator dependency check for missing flatpak`, `docs: update parity matrix for OBS attach workflow`.

## Plugins

Plugins require a manifest (`plugin.json` with `id`, `name`, `version`, optional `entry`, `hooks`) and an entry Python module that reads JSON from stdin and writes JSON to stdout. Supported hooks: `library`, `before_launch`, `after_session`. See [Plugins](/reference/plugins/) for the full contract.

## Documentation site

Documentation changes live in the [OpenBoxGL Pages repository](https://github.com/OpenBoxGL/openboxgl.github.io) and are checked with `bun run test` (`bun install --frozen-lockfile` first). Keep technical literals exact, use placeholders for secrets, and cite the source module or test for every claim.

## Licensing and security

Contributions are licensed under AGPL-3.0. Security issues must use the private [security advisory](https://github.com/vindeckyy/OpenBoxGL/security/advisories/new) route, never a public issue.
