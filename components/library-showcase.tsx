import Image from "next/image"

const stats = [
  { value: "30+", label: "Platforms" },
  { value: "1-click", label: "Import" },
  { value: "134", label: "API routes" },
  { value: "5", label: "Themes" },
]

export function LibraryShowcase() {
  return (
    <section id="library" className="relative px-4 pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-xs tracking-[0.25em] text-primary">// THE LIBRARY</p>
            <h2 className="max-w-xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
              A command center for your entire collection.
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            Faceted filters, rich box art, per-game metadata, achievements and play history. Every detail, one keystroke away.
          </p>
        </div>

        {/* app window */}
        <div className="group relative rounded-2xl border border-border bg-card p-2 shadow-2xl">
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "linear-gradient(120deg, oklch(0.7 0.19 46 / 30%), oklch(0.8 0.13 210 / 25%))" }}
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-xl border border-border">
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-background/80 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-destructive/80" />
              <span className="h-3 w-3 rounded-full bg-primary/80" />
              <span className="h-3 w-3 rounded-full bg-lime/70" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">openbox — library</span>
            </div>
            <Image
              src="/library-view.png"
              alt="OpenBox library view showing a grid of game box art with a filter sidebar and a detailed metadata panel"
              width={1920}
              height={1080}
              className="w-full"
              priority
            />
          </div>
        </div>

        {/* stat row */}
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card px-5 py-4">
              <div className="text-2xl font-bold text-primary md:text-3xl">{s.value}</div>
              <div className="mt-1 font-mono text-xs tracking-widest text-muted-foreground">{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
