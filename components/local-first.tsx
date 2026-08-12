import { CloudOff, GitBranch, Lock, ShieldCheck } from "lucide-react"

const pillars = [
  { icon: CloudOff, title: "No cloud", body: "Your library, saves and metadata never leave the device." },
  { icon: Lock, title: "No account", body: "Nothing to sign up for. Open the app and start playing." },
  { icon: ShieldCheck, title: "Zero telemetry", body: "We don't track you. There is nothing to track." },
  { icon: GitBranch, title: "Open source", body: "GPL-licensed and auditable, top to bottom." },
]

export function LocalFirst() {
  return (
    <section id="local" className="relative overflow-hidden border-y border-border bg-card/30 px-4 py-24">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs tracking-[0.25em] text-primary">// LOCAL-FIRST BY DESIGN</p>
            <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              Your games. Your machine.
              <br />
              <span className="text-muted-foreground">Nobody else&apos;s business.</span>
            </h2>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
              OpenBox is built on a simple promise: everything runs locally. No sync servers, no analytics beacons, no
              hidden network calls. It works perfectly offline because that&apos;s the whole point.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {pillars.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="rounded-2xl border border-border bg-background/60 p-5">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
