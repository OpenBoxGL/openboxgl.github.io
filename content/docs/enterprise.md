---
title: Enterprise
description: License, signing, and verification for production use.
---

# Enterprise

Use this page when you need to verify what you are running.

## License

OpenBox Game Launcher is released under GNU Affero General Public License v3.0. Source is at [vindeckyy/OpenBoxGL](https://github.com/vindeckyy/OpenBoxGL) and the full text is at [LICENSE](https://github.com/vindeckyy/OpenBoxGL/blob/master/LICENSE). Trademark references to LaunchBox, Steam, Heroic, Lutris, RetroArch, and other third party products are used for compatibility description only. See [Legal and trademarks](/policies/legal-and-trademarks/) and [Disclaimer](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/DISCLAIMER.md).

## Signed releases

Every AppImage release is signed with Ed25519. The installer verifies the release against a pinned public key and a published SHA-256 checksum.

| Artifact | What it is | Where to find it |
| --- | --- | --- |
| `OpenBox-x86_64.AppImage` | Release binary | [Releases](https://github.com/vindeckyy/OpenBoxGL/releases/latest) |
| `OpenBox-x86_64.AppImage.sig` | Ed25519 signature | Same release assets |
| `openbox-release.pub` | Pinned public key | Application repository at `openbox-release.pub`, pinned by SHA-256 in `scripts/install.sh` |
| `SHA256SUMS` | Checksums for the release | Same release assets |

Verify path: download the AppImage, the `.sig`, and the `openbox-release.pub` you pin, then run the installer with `OPENBOX_RELEASE_TAG="v1.5.1"` as shown in [Downloads](/downloads/). The installer refuses a release when the key, checksum, or signature does not match. See [Updating](/updating/) for rollback with `OpenBox-x86_64.previous.AppImage`.

## Build and CI

| Signal | Where to check |
| --- | --- |
| CI on push, pull request, and weekly | [Actions](https://github.com/vindeckyy/OpenBoxGL/actions) |
| Lint, type, and test gates | `make check` and `scripts/check_tests.py` |
| Release verification | `test_release_signing.py` |

The application uses only the Python standard library at runtime. Build tooling is described in [Project and policies](/project/contributing/).

## Data and privacy

Library data is local JSON at `~/.local/share/openbox-game-launcher/library.json`. Set `OPENBOX_DATA_DIR` before launch to relocate it. The server binds to `127.0.0.1` on a random port, requires a per launch token on every request, and never listens on the network. No account, no cloud, no telemetry. See [Interfaces and data](/interfaces-and-data/), [Data and recovery](/reference/data-and-recovery/), and [Privacy](/policies/privacy/).

## Support and notices

- Bug report: [Bug report template](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=bug_report.yml)
- Feature request: [Feature request template](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=feature_request.yml)
- Security: see [Security](/policies/security/), do not file public issues for sensitive reports.
- Copyright or trademark: see [DMCA](/policies/dmca/) and [Legal and trademarks](/policies/legal-and-trademarks/). Do not post notices in public issues.
