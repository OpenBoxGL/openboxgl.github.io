import { Database, Film, Image as ImageIcon, Search, Sparkles, Video } from "lucide-react"

const items = [
  {
    icon: Database,
    title: "LaunchBox Games Database",
    body: "Daily metadata sync matches your games and fills release dates, developers, publishers, ESRB, genres, and descriptions.",
  },
  {
    icon: Search,
    title: "IGDB search",
    body: "Search IGDB per game when a title is missing or ambiguous, and apply the result without leaving the detail pane.",
  },
  {
    icon: ImageIcon,
    title: "Artwork everywhere",
    body: "Box fronts, backgrounds, screenshots, clear logos, fanart, banners, and 3D boxes. Pick a preferred image group per platform or playlist.",
  },
  {
    icon: Film,
    title: "Video and trailers",
    body: "Game videos play in the detail pane and Big Box screensaver. Steam trailers and GOG media download per game.",
  },
  {
    icon: Sparkles,
    title: "EmuMovies and Bezel Project",
    body: "EmuMovies downloads media with your credentials, and bezels download into a staging swap so a bad archive never breaks the working set.",
  },
  {
    icon: Video,
    title: "Media packs",
    body: "Bundled packs add platform clear logos, controller prompt sets, and badge styles. No subscription required.",
  },
]

export function MetadataSection() {
  return (
    <section id="media" className="relative px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="mb-3 font-mono text-xs tracking-[0.25em] text-primary">// METADATA AND MEDIA</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Bare folders become rich library entries.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            OpenBox matches games to metadata sources and pulls artwork, videos, and extras into your local library.
            Bulk jobs are bounded so large collections stay responsive.
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
            href="/guides/metadata-and-media/"
            className="rounded-xl border border-border bg-background/50 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Metadata and media guide
          </a>
          <a
            href="/guides/media-providers/"
            className="rounded-xl border border-border bg-background/50 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Media providers
          </a>
        </div>
      </div>
    </section>
  )
}
