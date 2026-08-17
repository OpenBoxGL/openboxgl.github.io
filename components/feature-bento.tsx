import { Award, Blocks, Clock, Palette, Search, Star } from "lucide-react"

export function FeatureBento() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 font-mono text-xs tracking-widest text-primary">Built for collectors</p>
          <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Every feature a serious library deserves.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-2">
          <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6 md:col-span-2 md:row-span-2">
            <div className="flex items-center gap-2 text-primary">
              <Search className="h-5 w-5" />
              <p className="font-mono text-xs tracking-[0.2em]">SEARCH</p>
            </div>
            <h3 className="mt-4 max-w-md text-balance text-2xl font-bold">
              Find anything the moment you type.
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              The sidebar search fuzzy-matches across every platform and field — start typing a title, platform, tag, or
              filter and jump straight to the game. No mouse required.
            </p>

            <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm text-muted-foreground">chrono</span>
                <span className="ml-auto rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  FILTERS APPLIED
                </span>
              </div>
              {[
                { name: "Chrono Trigger", meta: "SNES · Installed" },
                { name: "Chrono Cross", meta: "PSX · Not installed" },
                { name: "Chrono series in Playlists", meta: "Filter" },
              ].map((row, i) => (
                <div
                  key={row.name}
                  className={`flex items-center justify-between px-4 py-2.5 ${
                    i === 0 ? "bg-primary/10 text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="text-sm">{row.name}</span>
                  <span className="font-mono text-[11px]">{row.meta}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:col-span-2 md:row-span-2 sm:grid-cols-2">
            <BentoCard icon={Award} title="RetroAchievements" body="Match ROMs to achievement sets and track hardcore, beaten, and mastered progress." />
            <BentoCard icon={Clock} title="Play history" body="Session times, launch counts and last-played, per game." />
            <BentoCard icon={Palette} title="Themes" body="Import your own CSS, or pick from five bundled themes." />
            <BentoCard icon={Blocks} title="Plugins" body="Extend imports, scrapers and views with an open API." />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-5">
            <Star className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Rate, tag and organize.</span> Star ratings, custom
              categories, smart playlists and saved filter presets keep even a 10,000-game backlog navigable.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function BentoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}
