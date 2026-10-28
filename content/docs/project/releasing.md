---
title: Releasing
description: Cut and publish an OpenBox release and its verified artifacts.
---

This page is for maintainers publishing a release from `master`. The AppImage, Windows portable, macOS app bundle, and Flatpak artifacts are built in CI when a `v*` tag is pushed; the steps below prepare the version, changelog, and metadata before that tag.

## Before you tag

1. Work from a clean `master` that tracks `origin/master`; confirm the target tag does not already exist.
2. Bump `updates.py` `VERSION` to the new semver.
3. Add a dated section to `docs/CHANGELOG.md` (Keep a Changelog format) and the comparison links, and update `docs/RELEASE_NOTES.md` (CI publishes it as the release body).
4. Prepend release metadata to `openbox.metainfo.xml`.
5. Update the README release badge, `PARITY.md` latest-release text, the bug-report template's version field, and any branch/version references that should track the current release. Review `SUPPORT.md`, the Flathub checklist, installer architecture examples, and this page. Leave historical version references in old changelog/metainfo entries and completed specs unchanged.
6. Run the local gates:
  ```bash
  ./run_all_tests.sh
  python3 -B tests/test_packaging.py
  appstreamcli validate --no-net openbox.metainfo.xml  # when available
  desktop-file-validate openbox.desktop         # when available
  git diff --check
  ```

## Build and verify the artifact locally

Prerequisites: `gcc`, `pkg-config`, and the WebKitGTK dev package (`libwebkit2gtk-4.1-dev` on Debian/Ubuntu, `webkit2gtk-4.1` on Fedora) — the build compiles `native_host.c` against `webkit2gtk-4.1` and bundles the host `python3` interpreter and stdlib.

```bash
bash build_appimage.sh
```

`OPENBOX_ARCH` overrides architecture detection (`x86_64` or `aarch64`); the output is `OpenBox-$arch.AppImage` (default `OpenBox-x86_64.AppImage`). Build each architecture separately when testing locally:

```bash
OPENBOX_ARCH=x86_64 ./build_appimage.sh OpenBox-x86_64.AppImage
OPENBOX_ARCH=aarch64 ./build_appimage.sh OpenBox-aarch64.AppImage
```

The build produces the architecture-specific AppImage and `.zsync` pair, but does not regenerate the `.sha256` sidecar. Regenerate it explicitly:

```bash
sha256sum OpenBox-x86_64.AppImage > OpenBox-x86_64.AppImage.sha256
sha256sum -c OpenBox-x86_64.AppImage.sha256
```

Confirm the embedded version matches the release by extracting the AppImage and checking `usr/share/openbox/updates.py` `VERSION`.

## Push and tag

1. Commit the version/changelog/metadata changes, push directly to `master`, and wait for the Python 3.10 and 3.12 CI jobs to pass for that exact commit.
2. Create and push an annotated tag:
  ```bash
  git tag -a vX.Y.Z -m "vX.Y.Z"
  git push origin vX.Y.Z
  ```

## What CI does

Pushing a `v*` tag triggers the AppImage/Windows release workflow and the Flatpak release workflow. The two publish jobs share a per-tag concurrency group because both update the same GitHub Release.

`release.yml` defines eight jobs: `test`, `build`, `attest`, `build-windows`, `attest-windows`, `build-macos`, `attest-macos`, and one shared `publish`. The Windows and macOS artifacts are uploaded by that same `publish` job, not by a separate one.

**test** (contents read): installs the build dependencies, compiles the native host, and runs the full test suite on the host.

**build** (contents read, needs `test`): validates the tag against `updates.py` `VERSION`, compiles the native host, and builds both `OpenBox-x86_64.AppImage` and `OpenBox-aarch64.AppImage` on architecture-matched runners. Each build is checked against the glibc floor, and gets a `.zsync`, `.sha256`, and architecture-appropriate CycloneDX SBOM, then uploads unsigned outputs as workflow artifacts.

**attest** (id-token and attestations write, needs `build`): downloads each build output and attests provenance for both AppImages.

**build-windows** (contents read): builds the portable runtime, compiles `native_host.exe`, packages `OpenBox-x86_64-windows.zip` with one top-level `OpenBox/` folder, and produces the standalone `OpenBox-x86_64-windows-native-host.exe` that source checkouts can drop in.

**attest-windows** (id-token and attestations write, needs `build-windows`): attests provenance for the zip and the standalone host. It only attests — the signing and the upload happen in the shared `publish` job.

**build-macos** (contents read): runs the test suite on the macOS runner, builds the universal app bundle with `scripts/build_macos_app.sh`, smoke-tests it, and produces the per-release SBOM. **attest-macos** (id-token and attestations write, needs `build-macos`): attests provenance for `OpenBox-macos.zip`. It only attests; the signing and upload happen in the shared `publish` job.

**publish** (requires the `release` environment, contents write; needs `build`, `attest`, `build-windows`, and `attest-windows`): checks out the exact tagged commit, confirms the annotated tag points at the build commit, signs and verifies the AppImages, the Windows zip, and the standalone host, compares the derived public key against the committed `openbox-release.pub`, re-checks each SHA-256, and verifies each signature. If `OPENBOX_SIGNING_KEY` is missing or the derived key does not match, the job fails before anything is published. It then copies `scripts/install.sh` and `scripts/install.ps1` and uploads both signed AppImages with their `.zsync`, `.sha256`, and `.sig`, the Windows zip and host with their sidecars, the release key, and the architecture-specific SBOMs — so the release publishes both installers. A tag containing `-` is marked prerelease.

For the macOS bundle, the same `publish` job signs `OpenBox-macos.zip` with the release key, verifies the signature against the committed `openbox-release.pub`, and uploads it with its `.sha256` and `.sig`, together with `install-macos.sh` and `verify_release.py`.

The Flatpak workflow (`release-flatpak.yml`) has two jobs:

**build**: validates packaging metadata, compiles the native host, runs packaging tests, installs the GNOME 49 runtime/SDK, and creates `OpenBox-x86_64.flatpak`.

**publish** (requires the `release` environment, contents write): uploads the x86_64 Flatpak to the same release and uses the same `docs/RELEASE_NOTES.md` body. Its publish job is serialized with the shared publish job for that tag.

The release body is `docs/RELEASE_NOTES.md`, so update it before tagging; GitHub does not generate the notes.

## Verify after publishing

- Confirm GitHub's latest-release API returns the new version and the architecture matrix: x86_64 and aarch64 AppImages with `.zsync`, `.sha256`, and `.sig`, the release key, architecture-specific SBOMs, `install.sh`, `install.ps1`, `install-macos.sh`, `verify_release.py`, `OpenBox-x86_64.flatpak`, the signed `OpenBox-x86_64-windows.zip` and `OpenBox-x86_64-windows-native-host.exe` with their sidecars, and the signed `OpenBox-macos.zip` with its sidecars.
- Download each AppImage and its `.sha256` remotely and run `sha256sum -c`.
- Verify both signatures with `scripts/verify_release.py --key openbox-release.pub OpenBox-x86_64.AppImage OpenBox-x86_64.AppImage.sig` and the matching aarch64 paths, then repeat for the Windows zip and standalone host.
- Check that the Windows zip contains a single top-level `OpenBox/` folder with `web_app.py` and the compiled `native_host.exe`.
- Start the AppImage and confirm the updater reports the new version as current with no update available.

## Pitfalls

- `build_appimage.sh` does not regenerate the `.sha256` sidecar; a stale checksum must be replaced manually.
- Release artifacts are Git-ignored and must be uploaded explicitly via the release workflow.
- Do not tag or publish before CI succeeds for the exact release commit.
- OpenBoxGL uses only `master`; there is no release branch or worktree.

## Related

- [Contributing](/project/contributing/)
- [Updating](/updating/)
- [Changelog](/changelog/)
