---
title: Releasing
description: Cut and publish an OpenBoxGL AppImage release.
---

This page is for maintainers publishing an AppImage release from `master`. The release is built in CI when a `v*` tag is pushed; the steps below prepare the version, changelog, and metadata before that tag.

## Before you tag

1. Work from a clean `master` that tracks `origin/master`; confirm the target tag does not already exist.
2. Bump `updates.py` `VERSION` to the new semver.
3. Add a dated section to `CHANGELOG.md` (Keep a Changelog format) and the comparison links, and update `RELEASE_NOTES.md` (CI publishes it as the release body).
4. Prepend release metadata to `openbox.metainfo.xml`.
5. Update the README release badge, `PARITY.md` latest-release text, the bug-report template's version field, and any branch/version references that should track the current release. Leave historical version references in old changelog/metainfo entries and completed specs unchanged.
6. Run the local gates:
  ```bash
  ./run_all_tests.sh
  python3 -B tests/test_packaging.py
  appstreamcli validate --no-net openbox.metainfo.xml  # when available
  desktop-file-validate openbox.desktop         # when available
  git diff --check
  ```

## Build and verify the artifact locally

```bash
bash build_appimage.sh
```

The build produces `OpenBox-x86_64.AppImage` and `OpenBox-x86_64.AppImage.zsync`, but does not regenerate the `.sha256` sidecar. Regenerate it explicitly:

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

Pushing a `v*` tag triggers `.github/workflows/release-appimage.yml`, which runs three jobs:

**build** (contents read): validates the tag against `updates.py` `VERSION`, compiles the native host, runs the full test suite, builds the AppImage, writes `OpenBox-x86_64.AppImage.sha256`, generates the CycloneDX SBOM, and verifies the zsync metadata. It uploads the unsigned build outputs as a workflow artifact.

**attest** (id-token and attestations write): downloads the build output and attests build provenance for the AppImage.

**publish** (requires the `release` environment, contents write): checks out the exact tagged commit, confirms the annotated tag points at the build commit, then signs and verifies the release. It writes the `OPENBOX_SIGNING_KEY` secret to a mode-0600 temp file, runs `scripts/sign_release.py` to produce `OpenBox-x86_64.AppImage.sig`, compares the derived public key against the committed `openbox-release.pub`, re-checks the SHA-256, and verifies the signature with `scripts/verify_release.py`. If `OPENBOX_SIGNING_KEY` is missing or the derived key does not match, the job fails before anything is published. Finally it copies `scripts/install.sh` and creates the release via `softprops/action-gh-release@v2` with `overwrite_files: false`, uploading the AppImage, `.zsync`, `.sha256`, `.sig`, `openbox-release.pub`, `install.sh`, and the SBOM. A tag containing `-` is marked prerelease.

The release body is `RELEASE_NOTES.md`, so update it before tagging; GitHub does not generate the notes.

## Verify after publishing

- Confirm GitHub's latest-release API returns the new version and all seven assets: the AppImage, `.zsync`, `.sha256`, `.sig`, `openbox-release.pub`, `install.sh`, and the SBOM.
- Download the AppImage and `.sha256` remotely and run `sha256sum -c`.
- Verify the signature with `scripts/verify_release.py --key openbox-release.pub OpenBox-x86_64.AppImage OpenBox-x86_64.AppImage.sig`.
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
