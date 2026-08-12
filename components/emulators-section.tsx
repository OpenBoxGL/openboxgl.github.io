import { Cpu, Download, FileArchive, Gamepad2, ShieldAlert, TerminalSquare } from "lucide-react"

const items = [
  {
    icon: Download,
    title: "Install from Flathub",
    body: "Dolphin, PPSSPP, PCSX2, RPCS3, Cemu, MAME, xemu, ScummVM, RetroArch, DuckStation, and melonDS install with one click, adding the Flathub remote when missing.",
  },
  {
    icon: TerminalSquare,
    title: "Tokenized launch commands",
    body: "Platform profiles use tokens like {path}, {rom_name}, and {app_id}. Commands are split with shell rules, never interpolated, so paths with spaces stay one argument.",
  },
  {
    icon: FileArchive,
    title: "Safe archive extraction",
    body: "ZIP, 7z, and RAR extract at launch into a content-addressed cache. The extractor refuses symlinks, .. paths, device nodes, and oversized members by design.",
  },
  {
    icon: ShieldAlert,
    title: "Dependency checks",
    body: "Known BIOS and firmware locations are checked per emulator, and missing items are reported before you wonder why a game won't boot.",
  },
  {
    icon: Cpu,
    title: "Detected profiles",
    body: "Native emulator binaries on PATH are detected and merged into the profile list automatically. YAML definition packs map extensions to platforms.",
  },
  {
    icon: Gamepad2,
    title: "Per-game overrides",
    body: "A game can pick a different launch command or a named profile without touching the platform default. Steam, Heroic, and Lutris entries launch through their own clients.",
  },
]

export function EmulatorsSection() {
  return (
    <section id="emulators" className="relative border-y border-border bg-card/30 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-3 font-mono text-xs tracking-[0.25em] text-cyan">// EMULATORS AND LAUNCHING</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Emulators installed and configured for you.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            OpenBox installs emulators from Flathub, writes the platform profiles, and validates launches before a
            process starts. Failures name the missing piece instead of silently dying.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <div
                key={it.title}
                className="group rounded-xl border border-border bg-background/60 p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-cyan transition-colors group-hover:bg-cyan group-hover:text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{it.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/guides/emulators-and-launching/"
            className="rounded-xl border border-border bg-background/50 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Emulators and launching guide
          </a>
          <a
            href="/guides/big-box-and-handhelds/performance/"
            className="rounded-xl border border-border bg-background/50 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Handheld performance
          </a>
        </div>
      </div>
    </section>
  )
}
