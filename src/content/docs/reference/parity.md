---
title: Parity matrix
description: Capability status and Linux replacement decisions.
---

The application repository's `PARITY.md` is the maintenance source for capability status, acceptance checks, and Linux replacement decisions. This page is the single rendered status authority for the documentation site.

## What OpenBoxGL targets

OpenBoxGL targets mixed-library management, imports, metadata, launch profiles, Big Box, sessions, saves, integrations, plugins, and local automation. Every workflow in `PARITY.md` is marked `done`, `partial`, or `missing`:

- `done` means the workflow is usable end to end on Linux.
- `partial` means a deliberate Linux equivalent exists but LaunchBox's Windows/premium surface is broader or unavailable.
- `missing` means no usable equivalent yet.

The current matrix lists every LaunchBox-aligned capability as `done`, including the Premium-equivalent workflows (custom fields, ESRB filters, list view, media packs, cloud statistics sync), all without a subscription. OpenBoxGL sets `premium_features_free: true` in settings and ships bundled media packs without a license gate.

## Intentionally not replicated on Linux

Windows-only workflows without a Linux equivalent remain documented as boundaries rather than implied support:

| LaunchBox feature | OpenBox decision |
| --- | --- |
| Windows shell replacement | Not applicable on Linux desktop environments |
| LEDBlinky / cabinet LED control | Use external Linux arcade I/O tools instead |
| Teknoparrot arcade launcher | Use Lutris/Wine launch profiles for supported titles |
| Native Xbox PC package scanning | Use Heroic/Lutris/Xbox Cloud entries instead |
| Bundled proprietary media packs | Replaced by free bundled media packs in OpenBox |
| LaunchBox Premium account cloud library | Replaced by mounted-folder sync plus local backups |
| LaunchBox online theme storefront | Replaced by local CSS theme import and open-folder workflow |

## How to read the evidence

Each `done` row carries an acceptance check, and the parity test modules (`test_parity_*.py`) exercise the underlying helpers. The authoritative row-level evidence lives in the source parity matrix:

[Source parity matrix](https://github.com/vindeckyy/OpenBoxGL/blob/master/PARITY.md)

## Status updates

When behavior changes, `PARITY.md` is updated in the application repository and this page follows it. Do not claim a capability here before the source matrix and its acceptance check agree.
