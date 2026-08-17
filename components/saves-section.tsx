import { Archive, Download, HardDrive, History, RotateCcw, ShieldCheck } from "lucide-react"

const rows = [
  {
    icon: History,
    title: "Session history",
    body: "Every launch records start time, duration, and exit status. Play time and launch counts accumulate per game, with a progress status that updates automatically on first play.",
  },
  {
    icon: HardDrive,
    title: "Save discovery",
    body: "Scan for saves across Steam Cloud, RetroArch, PCSX2, PPSSPP, RPCS3, Dolphin, Cemu, and more. Found locations are attached to the game, ready to back up.",
  },
  {
    icon: Archive,
    title: "Versioned backups",
    body: "One click backs up a game's saves into a dated archive beside your library. Retention limits keep the folder from growing forever, and restore re-validates paths before writing anything.",
  },
  {
    icon: RotateCcw,
    title: "Restore with guards",
    body: "Restoring an older backup over a newer library is refused unless you explicitly force it. Every restore writes a new backup first, so the current state survives a mistake.",
  },
  {
    icon: Download,
    title: "Library backups",
    body: "Archive the whole library: games, settings, media metadata, playlists, and tags. Inspect what is inside, restore selectively, and rotate old archives automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Ludusavi and Hoard",
    body: "Detected CLI save tools hook into the same flows. One status check tells you which are available, and backups never touch game files or symlinked directories.",
  },
]

export function SavesSection() {
  return (
    <section id="saves" className="relative border-y border-border bg-card/30 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-2 font-mono text-xs tracking-widest text-primary">Saves and recovery</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Your saves, backed up before you need them.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            OpenBox finds where your saves live, versions them locally, and restores with safety checks. Nothing is
            uploaded, and game files are never touched.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const Icon = r.icon
            return (
              <div
                key={r.title}
                className="group rounded-lg border border-border bg-card p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{r.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/guides/sessions-saves-and-backups/"
            className="rounded-xl border border-border bg-background/50 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Sessions, saves, and backups guide
          </a>
          <a
            href="/guides/sessions-saves-and-backups/library-backups/"
            className="rounded-xl border border-border bg-background/50 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Library backups
          </a>
        </div>
      </div>
    </section>
  )
}
