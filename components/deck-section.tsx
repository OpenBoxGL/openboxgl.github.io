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
    <section id="deck" className="relative overflow-hidden px-4 py-20">
      <div
        className="pointer-events-none absolute left-0 top-1/4 h-[400px] w-[500px] rounded-full opacity-40 blur-[130px]"
        style={{ background: "radial-gradient(closest-side, oklch(0.665 0.195 44 / 30%), transparent)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-xs tracking-[0.25em] text-primary">// STEAM DECK AND HANDHELDS</p>
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
              <div
                key={p.title}
                className="group rounded-xl border border-border bg-background/60 p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
            className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <Gamepad2 className="h-4 w-4" />
            Big Box and handhelds guide
          </a>
        </div>
      </div>
    </section>
  )
}
