"use client"

import { useEffect, useState } from "react"

const systems = [
  {
    id: "backups",
    short: "Backups",
    title: "The mistake can happen. The save still comes back.",
    intro: "OpenBox finds saves, versions them locally, and refuses risky restores unless you explicitly override the guard.",
    details: [
      "Session history records launch time, duration, and exit status.",
      "Save discovery covers Steam Cloud plus common emulator locations.",
      "Every restore protects the current state with a fresh backup first.",
      "Library archives can restore games, settings, metadata, playlists, and tags selectively.",
    ],
    code: "backup → inspect → restore → verify",
    href: "/guides/sessions-saves-and-backups/",
    link: "Inspect the backup flow",
  },
  {
    id: "media",
    short: "Media",
    title: "A bare filename becomes something worth browsing.",
    intro: "Metadata matching and local media turn loose game files into a visual collection without locking the result in a cloud account.",
    details: [
      "LaunchBox Games Database fills core release and studio metadata.",
      "IGDB search handles titles that need a manual match.",
      "ScreenScraper can match ROMs by hash and cache results on disk.",
      "Box art, clear logos, screenshots, fanart, trailers, and videos stay local.",
    ],
    code: "match → review → apply → keep local",
    href: "/guides/metadata-and-media/",
    link: "Choose metadata sources",
  },
  {
    id: "launching",
    short: "Launching",
    title: "Know why a game will fail before pressing Play.",
    intro: "Emulator profiles and Launch Doctor validate the path, command, BIOS, firmware, and runtime before a process begins.",
    details: [
      "Bundled emulator definitions map file types to platforms and launch profiles.",
      "Tokenized arguments keep paths with spaces intact without shell interpolation.",
      "Archive extraction rejects traversal paths, symlinks, device nodes, and oversized members.",
      "Per-game overrides change one title without disturbing the platform default.",
    ],
    code: "{path}  {rom_name}  {platform}  {app_id}",
    href: "/guides/emulators-and-launching/",
    link: "Build a launch profile",
  },
  {
    id: "automation",
    short: "Automation",
    title: "Your library has an API because it is yours.",
    intro: "The local server exposes documented routes for the library, launch flow, saves, themes, plugins, and background jobs.",
    details: [
      "A per-launch token protects the loopback API.",
      "Python plugins can hook library load, before launch, and after session events.",
      "Signed webhooks validate destinations before delivery.",
      "Safe mode can disable every plugin when a bad extension blocks startup.",
    ],
    code: "http://127.0.0.1:47990/api/v2/library/search",
    href: "/reference/api/",
    link: "Read the API reference",
  },
]

export function SystemsSection() {
  const [selected, setSelected] = useState(0)
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const media = window.matchMedia("(max-width: 599px)")
    const update = () => setCompact(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  const system = systems[selected]

  return (
    <section id="systems" className="ob-systems" aria-labelledby="systems-title">
      <div className="ob-shell">
        <header className="ob-systems-heading" data-reveal>
          <p className="ob-index">For the particular collector</p>
          <h2 id="systems-title" className="ob-display">Good looks.<br/><em>Great instincts.</em></h2>
          <p>There’s a thoughtful toolkit underneath all that artwork.</p>
        </header>

        <div className="ob-systems-console" data-reveal>
          <div className="ob-system-tabs" role="tablist" aria-label="OpenBox systems" aria-orientation={compact ? "horizontal" : "vertical"}>
            {systems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`system-tab-${item.id}`}
                aria-controls="system-panel"
                aria-selected={selected === index}
                tabIndex={selected === index ? 0 : -1}
                className={selected === index ? "is-selected" : undefined}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => {
                  if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
                  event.preventDefault()
                  const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1
                  const next = event.key === "Home" ? 0 : event.key === "End" ? systems.length - 1 : (index + direction + systems.length) % systems.length
                  setSelected(next)
                  document.getElementById(`system-tab-${systems[next].id}`)?.focus()
                }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.short}</strong>
              </button>
            ))}
          </div>

          <article
            id="system-panel"
            role="tabpanel"
            aria-labelledby={`system-tab-${system.id}`}
            className="ob-system-panel"
            key={system.id}
          >
            <div className="ob-system-register" aria-hidden="true">
              SYSTEM / {String(selected + 1).padStart(2, "0")} / READY
            </div>
            <h3>{system.title}</h3>
            <p>{system.intro}</p>
            <ul>
              {system.details.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
            <code>{system.code}</code>
            <a href={system.href}>{system.link}</a>
          </article>
        </div>
      </div>
    </section>
  )
}
