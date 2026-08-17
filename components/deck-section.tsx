import { BatteryCharging, Gamepad2, MonitorSmartphone, Rocket, Zap } from "lucide-react"

const perks = [
  {
    icon: Rocket,
    title: "Steam Game Mode guest",
    body: "Run as a guest inside Steam's gamescope session with --game-mode, so Steam Input, the Quick Access Menu, and MangoHud stay with Steam.",
  },
  {
    icon: MonitorSmartphone,
    title: "Kiosk fullscreen",
    body: "Under gamescope, OpenBox detects the guest session and opens Big Box fullscreen in the native window, so it is treated as a real app window while Steam keeps Input, QAM, and TDP.",
  },
  {
    icon: Zap,
    title: "TDP profiles",
    body: "Per-launch-profile TDP limits apply via ryzenadj on Deck and battery-powered handhelds, with an optional restore limit when the session ends.",
  },
  {
    icon: BatteryCharging,
    title: "Attract mode",
    body: "Big Box screensaver rotates games after a configurable delay and launches the displayed title on any input. Startup video and library BGM included.",
  },
]

export function DeckSection() {
  return (
    <section id="deck" className="relative px-4 py-20">
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 font-mono text-xs tracking-widest text-primary">Steam Deck and handhelds</p>
            <h2 className="max-w-xl text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Built for the couch and the handheld.
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            OpenBox targets Steam Deck, Bazzite, and handheld PCs. AppImage works on immutable systems, and Game Mode
            behaves like a native app.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.title} className="rounded-lg border border-border bg-card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/guides/big-box-and-handhelds/"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <Gamepad2 className="h-4 w-4" />
            Big Box and handhelds guide
          </a>
        </div>
      </div>
    </section>
  )
}
