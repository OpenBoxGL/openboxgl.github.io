"use client"

import { useState } from "react"
import { Terminal, Copy, Check, Play, Globe, Shield, RefreshCw } from "lucide-react"

interface EndpointDef {
  id: string
  method: "GET" | "POST" | "DELETE"
  path: string
  title: string
  description: string
  mockResponse: any
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: "library",
    method: "GET",
    path: "/api/v1/library",
    title: "Library Collection",
    description: "Fetch all games, metadata, launch profiles, and session statistics.",
    mockResponse: {
      count: 2,
      games: [
        {
          id: "game-01",
          name: "The Legend of Zelda: Ocarina of Time",
          platform: "Nintendo 64",
          year: 1998,
          developer: "Nintendo",
          genre: "Action-Adventure",
          play_time_seconds: 14200,
          launch_count: 18,
          status: "completed",
          favorite: true,
        },
        {
          id: "game-02",
          name: "Cyberpunk 2077",
          platform: "PC",
          year: 2020,
          developer: "CD Projekt Red",
          genre: "RPG",
          play_time_seconds: 35600,
          launch_count: 42,
          wine_prefix: "/home/deck/.local/share/bottles/prefixes/gaming",
        },
      ],
    },
  },
  {
    id: "wine-prefixes",
    method: "GET",
    path: "/api/wine/prefixes",
    title: "Wine & Proton Prefixes",
    description: "Discovers active Wine and Steam Proton prefixes across standard local directories.",
    mockResponse: {
      available: true,
      prefixes: [
        {
          path: "/home/deck/.local/share/bottles/prefixes/gaming",
          source: "Bottles",
          version: "caffe-9.2",
          wine_arch: "win64",
        },
        {
          path: "/home/deck/.var/app/com.heroicgameslauncher.hgl/data/prefixes/Cyberpunk",
          source: "Heroic",
          version: "Proton-GE-Latest",
          wine_arch: "win64",
        },
      ],
    },
  },
  {
    id: "faugus-scan",
    method: "GET",
    path: "/api/faugus/scan",
    title: "Faugus Launcher Scan",
    description: "Scans local Faugus launcher data directories and manifests.",
    mockResponse: {
      count: 2,
      installed: true,
      games: [
        {
          faugus_id: "fg-104",
          name: "Kingdom Come: Deliverance",
          path: "/home/deck/Games/Faugus/KCD/bin/Win64/KingdomCome.exe",
          wine_prefix: "/home/deck/.local/share/faugus/prefixes/kcd",
          launch_command: "umu-run {path}",
        },
      ],
    },
  },
  {
    id: "jobs",
    method: "GET",
    path: "/api/jobs",
    title: "Background Job Manager",
    description: "Returns active and historical background tasks (metadata sync, bulk backups, imports).",
    mockResponse: {
      active_count: 0,
      jobs: [
        {
          id: "job-metadata-sync-941",
          type: "metadata_sync",
          status: "completed",
          progress: 100,
          elapsed_seconds: 14.2,
          records_processed: 4850,
        },
      ],
    },
  },
  {
    id: "health",
    method: "GET",
    path: "/api/health",
    title: "System Health & Integrity",
    description: "Self-diagnostic audit checking database integrity, snapshot consistency, and disk state.",
    mockResponse: {
      status: "ok",
      version: "1.7.2",
      python_version: "3.12.3",
      db_integrity: "valid",
      snapshots_available: 5,
      offline_ready: true,
    },
  },
  {
    id: "backup-diff",
    method: "GET",
    path: "/api/v2/backup/diff?archive=library-2026-08-29",
    title: "Backup Diff (v1.7.2)",
    description: "Compare current library state against a named backup archive without restoring.",
    mockResponse: {
      added: ["game-03", "game-07"],
      removed: ["game-12"],
      changed: ["game-01", "game-05"],
      settings_changed: true,
      summary: { added: 2, removed: 1, changed: 2 },
    },
  },
  {
    id: "emulator-health",
    method: "GET",
    path: "/api/v2/emulators/registry?health=1",
    title: "Emulator Registry Health (v1.7.2)",
    description: "Emulator registry with per-adapter BIOS/firmware/core health status and SHA1 drift detection.",
    mockResponse: {
      adapters: [
        {
          id: "duckstation",
          name: "DuckStation",
          platforms: ["PS1"],
          installed: true,
          health: { bios_ok: true, firmware_ok: true, core_ok: true },
        },
        {
          id: "pcsx2",
          name: "PCSX2",
          platforms: ["PS2"],
          installed: true,
          health: { bios_ok: false, firmware_ok: true, core_ok: true, bios_status: "BIOS_SHA1_DRIFT" },
        },
      ],
    },
  },
  {
    id: "insights",
    method: "GET",
    path: "/api/v2/insights/summary",
    title: "Play Insights Summary (v1.7.1)",
    description: "Local-first playtime analytics: streaks, momentum, top platforms and genres.",
    mockResponse: {
      total_playtime_seconds: 540000,
      current_streak_days: 7,
      longest_streak_days: 23,
      momentum_30d_percent: 15.2,
      top_platforms: [{ platform: "PC", playtime_seconds: 280000 }, { platform: "SNES", playtime_seconds: 120000 }],
      top_genres: [{ genre: "RPG", playtime_seconds: 210000 }, { genre: "FPS", playtime_seconds: 180000 }],
    },
  },
  {
    id: "locales",
    method: "GET",
    path: "/locales/en.json",
    title: "Locale File (v1.7.2)",
    description: "Public JSON locale file for the i18n system. No auth required. Available for en, es, de, fr, pt.",
    mockResponse: {
      "nav.library": "Library",
      "nav.add_game": "Add game",
      "nav.import_folder": "Import folder",
      "nav.big_box": "Big Box",
      "settings.title": "Settings",
      "settings.interface_language": "Interface language",
    },
  },
]

export function ApiExplorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0])
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const curlSnippet = `curl -s http://127.0.0.1:47990${selectedEndpoint.path}`

  const copyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* fallback */
    }
  }

  const triggerSimulatedRequest = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 200)
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Interactive REST API Explorer</h3>
            <p className="text-xs text-muted-foreground">Test local OpenBox endpoints, view response structures, and generate cURL requests</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-lime" />
          <span>Local loopback only (127.0.0.1:47990)</span>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Endpoint Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {ENDPOINTS.map((ep) => (
            <button
              key={ep.id}
              type="button"
              onClick={() => {
                setSelectedEndpoint(ep)
                triggerSimulatedRequest()
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
                selectedEndpoint.id === ep.id
                  ? "border-primary bg-primary/15 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span className="font-bold text-[10px] text-cyan">{ep.method}</span>
              <span>{ep.path}</span>
            </button>
          ))}
        </div>

        {/* Selected Endpoint Details */}
        <div className="rounded-lg border border-border/80 bg-background/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-cyan/15 px-2 py-0.5 font-mono text-xs font-bold text-cyan">
                {selectedEndpoint.method}
              </span>
              <code className="font-mono text-xs font-bold text-foreground">
                http://127.0.0.1:47990{selectedEndpoint.path}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerSimulatedRequest}
                className="flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
                Execute
              </button>
              <button
                type="button"
                onClick={copyCurl}
                className="flex items-center gap-1 rounded bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/25"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied cURL" : "Copy cURL"}
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{selectedEndpoint.description}</p>
        </div>

        {/* JSON Response View */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider">Simulated 200 OK JSON Response</span>
            <span className="font-mono text-[11px] text-lime">application/json · UTF-8</span>
          </div>
          <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3.5 font-mono text-xs text-foreground/90 leading-relaxed shadow-inner">
            {JSON.stringify(selectedEndpoint.mockResponse, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
