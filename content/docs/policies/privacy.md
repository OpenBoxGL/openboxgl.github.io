---
title: Privacy
description: What OpenBox does and does not collect, and how its data stays on your machine.
sidebar: false
---

# Privacy

OpenBox is designed so your library, saves, and metadata never leave your machine unless you explicitly trigger something. This page says exactly what that means and where the boundaries are.

## What OpenBox does not do

- **No telemetry.** No analytics beacons, no crash reports, no usage statistics are sent anywhere. There is nothing to opt out of.
- **No account.** There is no OpenBox account, no login, no license key. Downloading the AppImage or cloning the repository is the entire installation.
- **No cloud library.** Library data lives in `library.json` on your machine. The local server binds to `127.0.0.1` only and every request must carry a per-launch token, so the tab you open is the only client.
- **No hidden network calls.** The app does not phone home at startup or on any schedule.

## What leaves your machine, and when

Every outbound action is user-initiated and visible in the UI:

- **Metadata sync.** Matching games against the LaunchBox Games Database sends the game title and platform identifiers for that lookup, with your consent, on the schedule you set.
- **IGDB search.** A search you type is sent to IGDB. IGDB API failures surface readable errors.
- **RetroAchievements.** Your username and API key, plus ROM hashes for matching, go to RetroAchievements when you use that integration. The key is stored locally in a `0o600` file.
- **EmuMovies.** Media downloads authenticate with your EmuMovies credentials.
- **Webhooks.** If you configure webhooks, event deliveries go to the URLs you specify, signed with your HMAC secret. Destinations are validated against loopback and local address rules before anything is sent.
- **Statistics sync.** If you enable it, play statistics sync to a local folder you choose (for example a Syncthing folder). You control the destination.
- **Update checks.** Settings > Check for updates queries the GitHub releases API. It is read-only.

## What is stored locally

The data directory (`~/.local/share/openbox-game-launcher` by default, or `OPENBOX_DATA_DIR`) holds the library, settings, media, backups, save archives, themes, plugin installs, credentials, and the rotating diagnostic log. Credentials are stored owner-only (`0o600`). The diagnostic log redacts tokens, passwords, and API keys, but it can contain game names and local file paths, so review it before sharing it.

See [Interfaces and data](/interfaces-and-data/) for the full file layout and [Configuration](/reference/configuration/) for environment variables and persisted settings.

## The website

This documentation site is a static export served from GitHub Pages. It has no analytics scripts, no cookies, and no tracking. The install one-liner in the hero downloads the latest AppImage from GitHub Releases and verifies its SHA-256 checksum before installing.

## Reporting a concern

If you find behavior that sends data without a user action, or a credential that is stored too broadly, report it through the [security policy](/policies/security/) rather than a public issue.
