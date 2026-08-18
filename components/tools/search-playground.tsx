"use client"

import { useState, useMemo } from "react"
import { Search, Sparkles, Filter, CheckCircle2, XCircle, Info, Tag, Trophy, Save, Image as ImageIcon } from "lucide-react"

interface SampleGame {
  id: string
  title: string
  platform: string
  genre: string
  developer: string
  year: number
  hasSaves: boolean
  hasAchievements: boolean
  hasMedia: boolean
  tags: string[]
  status: string
}

const SAMPLE_GAMES: SampleGame[] = [
  {
    id: "1",
    title: "The Legend of Zelda: Ocarina of Time",
    platform: "Nintendo 64",
    genre: "Action-Adventure",
    developer: "Nintendo",
    year: 1998,
    hasSaves: true,
    hasAchievements: true,
    hasMedia: true,
    tags: ["classic", "favorite", "3d"],
    status: "completed",
  },
  {
    id: "2",
    title: "Metal Gear Solid",
    platform: "PlayStation",
    genre: "Stealth",
    developer: "Konami",
    year: 1998,
    hasSaves: true,
    hasAchievements: true,
    hasMedia: true,
    tags: ["classic", "stealth"],
    status: "playing",
  },
  {
    id: "3",
    title: "Castlevania: Symphony of the Night",
    platform: "PlayStation",
    genre: "Metroidvania",
    developer: "Konami",
    year: 1997,
    hasSaves: true,
    hasAchievements: true,
    hasMedia: true,
    tags: ["favorite", "2d", "masterpiece"],
    status: "completed",
  },
  {
    id: "4",
    title: "Super Mario World",
    platform: "SNES",
    genre: "Platformer",
    developer: "Nintendo",
    year: 1990,
    hasSaves: true,
    hasAchievements: true,
    hasMedia: true,
    tags: ["2d", "classic"],
    status: "completed",
  },
  {
    id: "5",
    title: "Final Fantasy VII",
    platform: "PlayStation",
    genre: "JRPG",
    developer: "Square",
    year: 1997,
    hasSaves: true,
    hasAchievements: false,
    hasMedia: true,
    tags: ["rpg", "classic"],
    status: "playing",
  },
  {
    id: "6",
    title: "Chrono Trigger",
    platform: "SNES",
    genre: "JRPG",
    developer: "Square",
    year: 1995,
    hasSaves: true,
    hasAchievements: true,
    hasMedia: true,
    tags: ["favorite", "rpg", "time-travel"],
    status: "completed",
  },
  {
    id: "7",
    title: "Super Smash Bros. Melee",
    platform: "GameCube",
    genre: "Fighting",
    developer: "HAL Laboratory",
    year: 2001,
    hasSaves: false,
    hasAchievements: true,
    hasMedia: true,
    tags: ["multiplayer", "competitive"],
    status: "unplayed",
  },
  {
    id: "8",
    title: "Cyberpunk 2077",
    platform: "PC",
    genre: "RPG",
    developer: "CD Projekt Red",
    year: 2020,
    hasSaves: true,
    hasAchievements: false,
    hasMedia: false,
    tags: ["steam", "open-world"],
    status: "playing",
  },
]

export function SearchPlayground() {
  const [query, setQuery] = useState("oot")

  const PRESET_QUERIES = [
    { label: "Acronym 'oot'", q: "oot" },
    { label: "Acronym 'mgs'", q: "mgs" },
    { label: "Acronym 'sotn'", q: "sotn" },
    { label: "platform:SNES", q: "platform:SNES" },
    { label: "has:achievements", q: "has:achievements" },
    { label: "genre:JRPG", q: "genre:JRPG" },
    { label: "Complex: 'SNES -tag:classic'", q: "platform:SNES -tag:classic" },
    { label: "developer:Square", q: "developer:Square" },
  ]

  // Search filter logic mimicking OpenBox engine
  const results = useMemo(() => {
    const raw = query.trim()
    if (!raw) return SAMPLE_GAMES

    const tokens = raw.split(/\s+/).filter(Boolean)

    return SAMPLE_GAMES.filter((game) => {
      return tokens.every((tok) => {
        // Negative filter: -term or -field:value
        if (tok.startsWith("-")) {
          const sub = tok.slice(1)
          if (sub.startsWith("platform:")) {
            return !game.platform.toLowerCase().includes(sub.slice(9).toLowerCase())
          }
          if (sub.startsWith("tag:")) {
            return !game.tags.some((t) => t.toLowerCase() === sub.slice(4).toLowerCase())
          }
          if (sub.startsWith("genre:")) {
            return !game.genre.toLowerCase().includes(sub.slice(6).toLowerCase())
          }
          return !game.title.toLowerCase().includes(sub.toLowerCase())
        }

        // Field filter: platform:X
        if (tok.toLowerCase().startsWith("platform:")) {
          const val = tok.slice(9).toLowerCase()
          return game.platform.toLowerCase().includes(val)
        }

        // Field filter: genre:X
        if (tok.toLowerCase().startsWith("genre:")) {
          const val = tok.slice(6).toLowerCase()
          return game.genre.toLowerCase().includes(val)
        }

        // Field filter: developer:X
        if (tok.toLowerCase().startsWith("developer:")) {
          const val = tok.slice(10).toLowerCase()
          return game.developer.toLowerCase().includes(val)
        }

        // Field filter: tag:X
        if (tok.toLowerCase().startsWith("tag:")) {
          const val = tok.slice(4).toLowerCase()
          return game.tags.some((t) => t.toLowerCase() === val)
        }

        // Capability filters
        if (tok.toLowerCase() === "has:saves") return game.hasSaves
        if (tok.toLowerCase() === "has:achievements") return game.hasAchievements
        if (tok.toLowerCase() === "has:media") return game.hasMedia
        if (tok.toLowerCase() === "status:completed") return game.status === "completed"
        if (tok.toLowerCase() === "status:playing") return game.status === "playing"

        // Acronym match check: 2-8 chars matching initials
        const lowerTok = tok.toLowerCase()
        const words = game.title.toLowerCase().split(/[\s:.-]+/).filter((w) => w && !["the", "of", "a", "an", "and"].includes(w))
        const initials = words.map((w) => w[0]).join("")
        if (lowerTok.length >= 2 && lowerTok.length <= 8 && initials.startsWith(lowerTok)) {
          return true
        }

        // Regular substring matching across title, platform, developer, tags
        return (
          game.title.toLowerCase().includes(lowerTok) ||
          game.platform.toLowerCase().includes(lowerTok) ||
          game.developer.toLowerCase().includes(lowerTok) ||
          game.genre.toLowerCase().includes(lowerTok) ||
          game.tags.some((t) => t.toLowerCase().includes(lowerTok))
        )
      })
    })
  }, [query])

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Search className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Interactive Search & Acronym Playground</h3>
            <p className="text-xs text-muted-foreground">Test initials matching, capability rules, field tokens, and negative filters</p>
          </div>
        </div>
        <span className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-cyan">
          Live Filter Engine
        </span>
      </div>

      <div className="space-y-4 p-5">
        {/* Search Bar */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Try 'oot', 'platform:SNES', 'has:achievements', 'genre:RPG', or '-tag:classic'..."
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Query Presets */}
        <div>
          <span className="mr-2 text-xs font-semibold text-muted-foreground">Try query:</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PRESET_QUERIES.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setQuery(p.q)}
                className={`rounded border px-2 py-1 font-mono text-xs transition-colors ${
                  query === p.q
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary/70 text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {p.q}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info & Card Grid */}
        <div className="border-t border-border/80 pt-4">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Matches <strong className="text-foreground">{results.length}</strong> of {SAMPLE_GAMES.length} sample games
            </span>
            {query.length >= 2 && query.length <= 4 && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-cyan">
                <Sparkles className="h-3 w-3" /> Acronym matching active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {results.map((game) => (
              <div
                key={game.id}
                className="group flex flex-col justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:border-border/80 hover:bg-secondary/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-primary">
                      {game.title}
                    </h4>
                    <span className="shrink-0 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {game.platform}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{game.developer}</span>
                    <span>·</span>
                    <span>{game.genre}</span>
                    <span>·</span>
                    <span>{game.year}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {game.hasSaves && (
                      <span className="flex items-center gap-0.5 text-cyan" title="Has Save Backup">
                        <Save className="h-3 w-3" />
                      </span>
                    )}
                    {game.hasAchievements && (
                      <span className="flex items-center gap-0.5 text-primary" title="RetroAchievements Linked">
                        <Trophy className="h-3 w-3" />
                      </span>
                    )}
                    {game.hasMedia && (
                      <span className="flex items-center gap-0.5 text-lime" title="Media Catalog Downloaded">
                        <ImageIcon className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {game.tags.map((t) => (
                      <span key={t} className="rounded bg-secondary/80 px-1 py-0.2 font-mono text-[9px] text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
              No games matched query <code className="text-primary">"{query}"</code>.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
