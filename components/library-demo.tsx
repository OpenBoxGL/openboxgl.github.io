"use client"

import { useEffect, useMemo, useState } from "react"

const sampleGames = [
  { name: "Chrono Trigger", platform: "SNES", status: "Installed" },
  { name: "Chrono Cross", platform: "PlayStation", status: "Not installed" },
  { name: "Hades", platform: "PC", status: "Playing" },
  { name: "Celeste", platform: "PC", status: "Completed" },
  { name: "Hollow Knight", platform: "PC", status: "Installed" },
  { name: "Metroid Dread", platform: "Switch", status: "Installed" },
]

export function LibraryDemo() {
  const [query, setQuery] = useState("chrono")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => setLoading(false), 140)
    return () => window.clearTimeout(timer)
  }, [query])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return sampleGames
    return sampleGames.filter((game) => `${game.name} ${game.platform}`.toLowerCase().includes(normalized))
  }, [query])

  const showError = query.trim().toLowerCase() === "error"

  return (
    <div className="ob-demo" aria-busy={loading}>
      <div className="ob-demo-toolbar">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" />
        </svg>
        <label htmlFor="sample-library-search" className="sr-only">Search the sample library</label>
        <input
          id="sample-library-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the sample library"
          autoComplete="off"
        />
        <span aria-live="polite">{loading ? "SEARCHING" : `${filtered.length} MATCH${filtered.length === 1 ? "" : "ES"}`}</span>
      </div>

      <div className="ob-demo-results" aria-live="polite">
        {loading ? (
          <div className="ob-demo-state">
            <strong>Searching the sample shelf</strong>
            <span>Matching titles and platforms on this page.</span>
          </div>
        ) : showError ? (
          <div className="ob-demo-state">
            <strong>The sample index stopped responding</strong>
            <span>This preview has an error state too. Clear the query to return to the shelf.</span>
            <button type="button" onClick={() => setQuery("")}>Clear the query</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ob-demo-state">
            <strong>No sample games match “{query}”</strong>
            <span>Try a title such as Hades or a platform such as PC.</span>
            <button type="button" onClick={() => setQuery("")}>Show the full sample</button>
          </div>
        ) : (
          filtered.map((game, index) => (
            <div key={game.name} className="ob-demo-row">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{game.name}</strong>
              <span>{game.platform}</span>
              <span>{game.status}</span>
            </div>
          ))
        )}
      </div>
      <p className="ob-demo-hint">Type “error” to inspect the fallback state.</p>
    </div>
  )
}
