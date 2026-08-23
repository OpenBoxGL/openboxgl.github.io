---
title: System Architecture & Reliability
description: Deep dive into OpenBox's offline-first engine, loopback server, WebKitGTK native host bridge, and state recovery model.
---

OpenBox is engineered with a strict **local-first, dependency-free runtime** architecture. It operates entirely on your machine without requiring remote accounts, cloud sync dependencies, or background telemetry services.

## Core Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
│  ┌─────────────────────────┐   ┌─────────────────────────┐  │
│  │   Desktop Web App       │   │    Big Box Kiosk UI     │  │
│  │   (Vanilla JS + CSS)    │   │  (Gamepad / CoverFlow)  │  │
│  └────────────┬────────────┘   └────────────┬────────────┘  │
│               │                             │               │
│               └──────────────┬──────────────┘               │
│                              │                              │
│                    WebKitGTK Native Host                    │
│                 (Hardware-accelerated View)                 │
└──────────────────────────────┼──────────────────────────────┘
                               │ Local HTTP / JSON REST
┌──────────────────────────────┴──────────────────────────────┐
│                    Python Core Engine                       │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │   HTTP Request Router │       │   Job Manager Worker  │  │
│  │   (Zero-dependency)   │       │   (ThreadPool Engine) │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              │                               │              │
│  ┌───────────┴───────────┐       ┌───────────┴───────────┐  │
│  │   Subsystems & Parity │       │  Save & Backup Engine │  │
│  │   (Steam/Wine/Stores) │       │  (Content-Addressed)  │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              │                               │              │
│              └───────────────┬───────────────┘              │
│                              │                              │
│                    Atomic State Store                       │
│    (library.json + Atomic Writes + Rotating Snapshots)      │
└─────────────────────────────────────────────────────────────┘
```

## 1. Zero-Dependency Loopback Core

The runtime engine uses Python 3's built-in standard library (`http.server`, `urllib`, `sqlite3`, `json`, `concurrent.futures`, `hashlib`, `gzip`). 
- Runs locally bound to ephemeral loopback ports (or configured host/port) with strict Host and Origin validation.
- No third-party Python packages are bundled or required at runtime.
- Fast cold start under 120ms.

<ApiExplorer />

## 2. WebKitGTK Native Host & IPC Bridge

When launched via native binary or AppImage, OpenBox spawns a native C/WebKitGTK host process:
- Hardware-accelerated WebGL and 2D canvas rendering
- Native window management, borderless fullscreen, and Wayland/X11 display protocol compatibility
- SDL2 controller input polling with sub-frame response latency

## 3. Atomic State Store & Recovery

OpenBox treats library state as critical user data:
- **Atomic File Writes**: Mutations are written to temporary staging files (`.<path>.tmp`), flushed with `fsync`, and swapped into place using POSIX `rename(2)` / `os.replace` to prevent corruption on sudden power loss.
- **Automated Snapshot Rotation**: Rotating snapshots (`library.json.snapshots/<stamp>-<token>.json`) are retained automatically on committed mutations using zero-copy hardlinks and debouncing.
- **Deduplication Engine**: Canonical identity hashing prevents duplicate entries when games exist simultaneously across Steam, Heroic, and ROM folders.

## 4. Asynchronous Background Job System

Heavy operations (metadata database synchronization, bulk save backups, full emulator catalog scans) run in non-blocking worker threads managed by `JobManager`. Progress, speed, and error telemetry are polled via `GET /api/jobs`.
