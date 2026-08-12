"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Search, X } from "lucide-react"
import type { SearchEntry } from "@/lib/search"

export function SearchPage({ entries }: { entries: SearchEntry[] }) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return entries
      .map((e) => {
        const titleScore = e.title.toLowerCase().includes(q) ? 3 : 0
        const descScore = (e.description ?? "").toLowerCase().includes(q) ? 2 : 0
        const bodyScore = e.body.toLowerCase().includes(q) ? 1 : 0
        const score = titleScore + descScore + bodyScore
        return { ...e, score }
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
  }, [query, entries])

  return (
    <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary">// SEARCH</p>
      <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">Search the docs</h1>

      <div className="mt-8 flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 pl-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “import”, “backup”, “webhook”, “retroachievements”…"
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search docs"
        />
        {query && (
          <button onClick={() => setQuery("")} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {query && (
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
        </p>
      )}

      <div className="mt-4 space-y-2">
        {results.map((r) => (
          <Link
            key={r.slug}
            href={`/${r.slug}/`}
            className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <span className="font-mono text-[11px] uppercase tracking-widest text-primary">{r.slug}</span>
            <h2 className="mt-1 font-semibold">{r.title}</h2>
            {r.description && <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>}
          </Link>
        ))}
        {query && results.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No results for “{query}”. Try a broader term like “import”, “save”, or “theme”.
          </p>
        )}
      </div>
    </div>
  )
}
