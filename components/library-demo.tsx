"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

const games = [
  { name: "Chrono Trigger", platform: "SNES", status: "Installed" },
  { name: "Chrono Cross", platform: "PlayStation", status: "Not installed" },
  { name: "Hades", platform: "PC", status: "Playing" },
  { name: "Celeste", platform: "PC", status: "Completed" },
  { name: "Hollow Knight", platform: "PC", status: "Installed" },
  { name: "Metroid Dread", platform: "Switch", status: "Installed" },
  { name: "Elden Ring", platform: "PC", status: "Playing" },
  { name: "Stardew Valley", platform: "PC", status: "Completed" },
]

export function LibraryDemo() {
  const [query, setQuery] = useState("chrono")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return games
    return games.filter((g) => `${g.name} ${g.platform}`.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-lg border border-border bg-card text-left">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search library"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search demo library"
        />
        <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {filtered.length} of {games.length}
        </span>
      </div>
      <div className="divide-y divide-border">
        {filtered.map((g) => (
          <div key={g.name} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm">{g.name}</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {g.platform} · {g.status}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">No matches</div>
        )}
      </div>
    </div>
  )
}
