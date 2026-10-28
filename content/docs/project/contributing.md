---
title: Contributing
description: Develop, test, and document OpenBoxGL.
---

OpenBoxGL development requires Python 3.10+ and Git, on Linux, Windows, or macOS. The Linux workflow below uses bash and `make`; Windows is covered in [Windows development](#windows-development), and macOS in [macOS development](#macos-development). The application repository is [vindeckyy/OpenBoxGL](https://github.com/vindeckyy/OpenBoxGL); this site lives in [OpenBoxGL/openboxgl.github.io](https://github.com/OpenBoxGL/openboxgl.github.io).

## Development setup

```bash
git clone https://github.com/vindeckyy/OpenBoxGL.git
cd OpenBoxGL
python3 web_app.py   # Web UI (development)
make native-host    # build the native host, then ./openbox-native.sh
```

Optional local configuration loads from an explicit `OPENBOX_ENV_FILE`, the data directory or its parent, `~/.env`, or `~/.config/openbox-game-launcher/.env` (see `.env.example`). Never commit secrets, tokens, or personal credentials.

## Testing

Run the full suite before submitting a pull request:

```bash
./run_all_tests.sh
make check      # scripts/check_tests.py runs the repository's current lint, runtime-module, v1-contract, version-sync, frontend (eslint), i18n-key, CSP-framing (check_csp.py), compile, test, coverage, module, and token gates; also `make version-check` for updates.py sync
```

Each `test_*.py` is a standalone contract test (plain asserts or unittest) run directly with `python3 -B <file>`. Iterate on one module with `python3 -B tests/test_catalog.py`. Packaging checks use `./build_appimage.sh` and `python3 -B tests/test_packaging.py`. All tests must pass on CI before a PR merges.

The version-sync gate (`scripts/check_version_sync.py`, also `make version-check`) compares the single version declared in `updates.py` against every published spot: the README release badge and its installer `VERSION=` line, the latest release in `openbox.metainfo.xml`, the lead paragraph of `docs/PARITY.md`, the advertised `current release is [vX.Y.Z]` in the bug report template, the `SUPPORT.md`, `SECURITY.md`, and Flathub checklist markers, the `CHANGELOG.md` section for that version, and the shipped-release line in `docs/README.md`. A stale claim in any of them fails the gate, so bump them together with `updates.py`.

## Windows development

On Windows the source tree, tests, and configuration steps are the same, but there is no bash or `make`, so the test and gate commands below replace the Linux ones above. Python 3.10 or newer is required, as `python.exe` or `py.exe` on `PATH` (CI runs the Windows job on 3.12); there is no `python3` on Windows — the name is a Microsoft Store alias that does not run scripts — so the examples use `python`.

`python -B scripts/run_windows_tests.py` runs every `tests/test_*.py` in its own subprocess with a 120-second timeout, prints each file as `pass`/`fail`/`timeout`, and writes a JSON report to `%TEMP%\openbox-windows-test-results.json` (`OPENBOX_TEST_RESULTS` overrides the path). Pass test file names exactly as they appear in `tests/` to run a subset; the runner exits non-zero when any file fails.

```powershell
python -B scripts/run_windows_tests.py                  # every test file
python -B scripts/run_windows_tests.py test_catalog.py  # one test file, by name from tests/
```

The gates that need no bash run unchanged on Windows; these are the ones the `windows-latest` CI job runs after the test suite:

```powershell
python -B scripts/check_runtime_modules.py   # runtime module manifest
python -B scripts/check_v1_contract.py       # v1 route contract
python -B scripts/check_version_sync.py      # version sync
python -B scripts/check_i18n.py              # i18n keys
python -B scripts/check_csp.py               # CSP framing contract
python -B scripts/check_tokens.py            # design tokens
```

The frontend gate needs Node.js — install the pinned tooling under `scripts/`, then run the eslint and tsc checks:

```powershell
$env:PUPPETEER_SKIP_DOWNLOAD = "true"   # the checks never need Puppeteer's browser
npm ci --ignore-scripts --prefix scripts
python -B scripts/check_frontend.py
```

`make check` / `scripts/check_tests.py` stays the authoritative full gate: it adds ruff, the compile, and the coverage stages, including the coverage floors and changed-line coverage. CI runs it on Linux, and the `windows-latest` job runs the Windows suite and the portable gates above.

The WebView2 native host only needs rebuilding when `native_host_win.c` changes: CI builds it on every push and the release ships the compiled `native_host.exe`, and a source checkout without it still opens the browser app window. The build needs the MSVC toolchain — Visual Studio Build Tools with the "Desktop development with C++" workload — and takes the WebView2 SDK from the NuGet cache when present, otherwise from nuget.org. See [Windows](/windows/) for the launcher ladder and the native window.

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build_native_host_windows.ps1
```

## Coding guidelines

- Match the style of surrounding code; prefer focused changes over broad refactors.
- Target Python 3.10+ and the standard library only; new dependencies require approval.
- Use explicit, user-facing error messages for validation failures.
- Keep user-facing strings clear and neutral.
- Do not commit ROMs, BIOS images, API tokens, or personal library data.
- Update `README.md`, `docs/PARITY.md`, and `docs/CHANGELOG.md` when behavior changes (and `openbox.metainfo.xml`/`SECURITY.md` for releases and support policy).
- Commit messages are concise and imperative: `Add storefront startup auto-import setting`, `Fix emulator dependency check for missing flatpak`, `docs: update parity matrix for OBS attach workflow`.

## Plugins

Plugins require a manifest (`plugin.json` with `id`, `name`, `version`, optional `entry`, `hooks`, and optional `capabilities`) and an entry Python module that exports one function per declared hook (each takes the decoded JSON payload and returns a dict; the runner handles stdin/stdout). Base hooks are `library`, `before_launch`, `after_session`, `command`, `library_source`, and `events`. Since 1.18.0 a manifest can also declare storefront, metadata, media, stats, emulator-settings, and discovery capabilities alongside their hooks; capability hooks receive a bounded data bag, plugin settings, and a credential store, and may request read-only library, achievement, profile, activity, leaderboard, catalog, metadata, and media services in one round. See [Plugins](/reference/plugins/) for the full contract.

## macOS development

On macOS the Linux workflow works with bash and `make`. The system `python3` is older than the 3.10 floor on many Macs, so install a current interpreter first (for example `brew install python@3.12`) and run the examples with it.

The native window is built from `native_host_mac.m` with `scripts/build_native_host_macos.sh`. The whole universal app bundle is built with `scripts/build_macos_app.sh`, and `scripts/install-macos.sh` is the release installer. CI runs the test suite and the portable gates on `macos-15` and `macos-15-intel`.

## Documentation site

Documentation changes live in the [OpenBoxGL Pages repository](https://github.com/OpenBoxGL/openboxgl.github.io) and are checked with `bun run test` — `package.json` defines the same `test` and `build` scripts for npm, so `npm test` works too. Install dependencies first with `bun install --frozen-lockfile` (or `npm install`). Keep technical literals exact, use placeholders for secrets, and cite the source module or test for every claim.

## Licensing and security

Contributions are licensed under AGPL-3.0. Security issues must use the private [security advisory](https://github.com/vindeckyy/OpenBoxGL/security/advisories/new) route, never a public issue.

## Developer Certificate of Origin

OpenBox uses the [Developer Certificate of Origin](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/CONTRIBUTING.md#developer-certificate-of-origin). Sign commits with `git commit -s` to record that you have the right to submit the work under the project license.

## Related pages

- [Releasing](/project/releasing/) — how a release is cut, signed, and verified.
- [Design system](/project/design-system/) — the token and component conventions new UI must follow.
- [Architecture](/reference/architecture/) — the module map a change has to fit into.
