---
title: Enterprise
description: License, signing, and verification for production use.
---

# Enterprise

Use this page when you need to verify what you are running.

## License

OpenBox Game Launcher is released under GNU Affero General Public License v3.0. Source is at [vindeckyy/OpenBoxGL](https://github.com/vindeckyy/OpenBoxGL) and the full text is at [LICENSE](https://github.com/vindeckyy/OpenBoxGL/blob/master/LICENSE). Trademark references to LaunchBox, Steam, Heroic, Lutris, RetroArch, and other third party products are used for compatibility description only. See [Legal and trademarks](/policies/legal-and-trademarks/) and [Disclaimer](https://github.com/vindeckyy/OpenBoxGL/blob/master/docs/DISCLAIMER.md).

## Signed releases

Every release is signed with Ed25519. On Linux the installer selects the matching AppImage architecture and verifies the release against a pinned public key and a published SHA-256 checksum. On Windows the release asset `install.ps1` runs the same trust ladder: it fetches `openbox-release.pub` and checks its SHA-256 against a pinned bootstrap anchor (unless `-PublicKeyPath` is given), then verifies the archive's `.sha256` sidecar and its Ed25519 `.sig` before extracting. Windows installs land under `%LOCALAPPDATA%\OpenBox` by default (`-InstallDir` or `OPENBOX_INSTALL_DIR` overrides it), with the previous tree kept at `<InstallDir>\share\openbox.previous` for rollback.

| Artifact | What it is | Where to find it |
| --- | --- | --- |
| `OpenBox-x86_64.AppImage` | x86_64 release binary | [Releases](https://github.com/vindeckyy/OpenBoxGL/releases/latest) |
| `OpenBox-x86_64.AppImage.sig` | x86_64 Ed25519 signature | Same release assets |
| `OpenBox-aarch64.AppImage` | aarch64 release binary | Same release assets |
| `OpenBox-aarch64.AppImage.sig` | aarch64 Ed25519 signature | Same release assets |
| `OpenBox-x86_64-windows.zip` | x86_64 Windows portable source tree under one `OpenBox/` folder | [Releases](https://github.com/vindeckyy/OpenBoxGL/releases/latest) |
| `OpenBox-x86_64-windows.zip.sig` | Windows archive Ed25519 signature | Same release assets |
| `OpenBox-x86_64-windows.zip.sha256` | Windows archive SHA-256 checksum | Same release assets |
| `openbox-release.pub` | Pinned public key | Application repository at `openbox-release.pub`, pinned by SHA-256 in `scripts/install.sh` and in the bootstrap anchor of `scripts/install.ps1` |
| `OpenBox-x86_64.AppImage.sha256` and `OpenBox-aarch64.AppImage.sha256` | Architecture-specific SHA-256 checksums | Same release assets |
| `OpenBox-<version>-sbom.json` and arch-suffixed SBOM | CycloneDX 1.4 SBOM | Same release assets |
| `OpenBox-x86_64.flatpak` | x86_64 Flatpak bundle | Same release assets |
| `install.sh` | Cryptographically verified Linux installer | Same release assets |
| `install.ps1` | Cryptographically verified Windows installer (PowerShell 5.1, standard library only) | Same release assets |

Verify path: on Linux, download the AppImage matching your architecture, its `.sig` and `.sha256`, and the `openbox-release.pub` you pin, then run the installer with `OPENBOX_RELEASE_TAG="v1.13.1"` as shown in [Downloads](/downloads/). The installer refuses a release when the key, checksum, or signature does not match. On Windows, download `OpenBox-x86_64-windows.zip` with its `.sha256` and `.sig` and run the released `install.ps1`, which applies the same key-pin, checksum, and signature checks before extracting. See [Updating](/updating/) for architecture-matched rollback and [Windows](/windows/) for the platform guide.

## Build and CI

| Signal | Where to check |
| --- | --- |
| CI on push, pull request, and weekly | [Actions](https://github.com/vindeckyy/OpenBoxGL/actions) (Linux jobs plus a `windows-latest` job) |
| Lint, type, and test gates | `make check` and `scripts/check_tests.py` |
| Release verification | `test_release_signing.py` |

The application uses only the Python standard library at runtime (plus `ctypes` on Windows). Build tooling is described in [Project and policies](/project/contributing/).

## Data and privacy

Library data is local JSON at `~/.local/share/openbox-game-launcher/library.json`, or at `%LOCALAPPDATA%\openbox-game-launcher\library.json` on Windows. Set `OPENBOX_DATA_DIR` before launch to relocate it on either platform. The server binds to `127.0.0.1` on a random port, requires a per launch token on every request, and never listens on the network. No account, no vendor-hosted cloud, no telemetry. Local mounted-folder statistics and catalog synchronization remain opt-in. See [Interfaces and data](/interfaces-and-data/), [Data and recovery](/reference/data-and-recovery/), and [Privacy](/policies/privacy/).

## Support and notices

- Bug report: [Bug report template](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=bug_report.yml)
- Feature request: [Feature request template](https://github.com/vindeckyy/OpenBoxGL/issues/new?template=feature_request.yml)
- Security: see [Security](/policies/security/), do not file public issues for sensitive reports.
- Copyright or trademark: see [DMCA](/policies/dmca/) and [Legal and trademarks](/policies/legal-and-trademarks/). Do not post notices in public issues.
