import { Bell, Blocks, Braces, ListOrdered, Plug, Webhook } from "lucide-react"

const items = [
  {
    icon: Braces,
    title: "REST API",
    body: "A token-authenticated local API covers library, launch, saves, backups, themes, plugins, and automation. Loopback only, per-launch token, documented end to end.",
  },
  {
    icon: Plug,
    title: "Python plugins",
    body: "Plugins hook library loads, before_launch, and after_session. Install from a catalog or locally, with safe mode that disables everything on a bad plugin.",
  },
  {
    icon: Webhook,
    title: "Signed webhooks",
    body: "HMAC-signed event deliveries for queue, tags, notifications, and library changes. Destinations are validated against loopback and local address rules before anything is sent.",
  },
  {
    icon: ListOrdered,
    title: "Play queue",
    body: "Queue games to play next, with persistent state that survives restarts. Queue controls live in the web UI and the API.",
  },
  {
    icon: Bell,
    title: "Notification center",
    body: "Import results, job completions, and failures land in one deduplicated inbox. Mark read individually or all at once.",
  },
  {
    icon: Blocks,
    title: "Themes",
    body: "Five bundled CSS themes plus imported community themes, applied globally or per platform, with live reload.",
  },
]

export function AutomationSection() {
  return (
    <section id="automation" className="relative px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-2 font-mono text-xs tracking-widest text-primary">Extend and automate</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Scriptable, pluggable, and local.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            Power users get a real API, Python plugin hooks, and signed webhooks. Everything runs against your local
            library, no account, no external service.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <div key={it.title} className="rounded-lg border border-border bg-card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
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
            href="/reference/api/"
            className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            REST API reference
          </a>
          <a
            href="/guides/plugins/"
            className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Plugins guide
          </a>
          <a
            href="/integrations/webhooks/"
            className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Webhooks
          </a>
        </div>
      </div>
    </section>
  )
}
