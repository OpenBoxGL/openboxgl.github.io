import Image from "next/image"
import { Gamepad2, Tv, Zap } from "lucide-react"

const perks = [
  { icon: Tv, title: "10-foot UI", body: "Living-room ready layouts that look right from the couch." },
  { icon: Gamepad2, title: "Controller-native", body: "Full navigation with a gamepad. Keyboard optional." },
  { icon: Zap, title: "Instant launch", body: "Pick a game, hit A, you're playing. No menus in the way." },
]

export function BigBoxShowcase() {
  return (
    <section id="bigbox" className="relative px-4 py-24">
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-2 font-mono text-xs tracking-widest text-cyan">Big Box mode</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
            From desktop to the couch, instantly.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            One shortcut flips OpenBox into a fullscreen, controller-first launcher. Perfect for the Steam Deck, a
            handheld, or a TV-connected battlestation.
          </p>
        </div>

        <div className="relative rounded-lg border border-border bg-card p-2 shadow-lg">
          <div className="overflow-hidden rounded-md border border-border">
            <Image
              src="/bigbox-mode.png"
              alt="OpenBox Big Box fullscreen mode showing Chrono Trigger box art, description and a large Play button with controller hints"
              width={1920}
              height={1080}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {perks.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.title} className="rounded-lg border border-border bg-card p-5">
                <Icon className="h-5 w-5 text-cyan" />
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
