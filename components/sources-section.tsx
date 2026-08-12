import { Boxes, Disc3, Download, Gamepad, HardDrive, Joystick, Layers, Wine } from "lucide-react"

const sources = [
  { name: "Steam", icon: Download, note: "Full library sync" },
  { name: "GOG", icon: Disc3, note: "DRM-free imports" },
  { name: "Heroic", icon: Layers, note: "Epic + Amazon" },
  { name: "Lutris", icon: Wine, note: "Wine & runners" },
  { name: "ROMs", icon: HardDrive, note: "Drop-folder scan" },
  { name: "Arcade", icon: Joystick, note: "MAME / FBNeo sets" },
  { name: "Emulators", icon: Gamepad, note: "40+ cores" },
  { name: "Local", icon: Boxes, note: "Any executable" },
]

export function SourcesSection() {
  return (
    <section id="sources" className="relative border-y border-border bg-card/30 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-3 font-mono text-xs tracking-[0.25em] text-primary">// EVERY SOURCE</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Import from everywhere. Manage in one place.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            Point OpenBox at your stores, folders and emulators. It fetches art, metadata and achievements, then hands
            you one clean, deduplicated catalog.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sources.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.name}
                className="group flex items-center gap-3 rounded-xl border border-border bg-background/60 p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{s.note}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
