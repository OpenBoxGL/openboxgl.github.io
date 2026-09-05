"use client"

import { useState } from "react"

const sources = [
  {
    name: "Steam",
    mark: "ST",
    action: "Sync the library you already own",
    detail: "OpenBox imports the installed and owned titles attached to your local Steam setup, then keeps the launch path with Steam.",
  },
  {
    name: "GOG",
    mark: "GG",
    action: "Bring over DRM-free games",
    detail: "GOG titles sit beside the rest of the shelf with their artwork and metadata, while the files stay exactly where you put them.",
  },
  {
    name: "Heroic",
    mark: "HR",
    action: "Fold Epic and Amazon into view",
    detail: "Heroic entries keep using Heroic to launch, but browsing, search, history, and collection tools happen in OpenBox.",
  },
  {
    name: "Lutris",
    mark: "LT",
    action: "Keep the runners that already work",
    detail: "Lutris games arrive with their existing launch relationship intact, including Wine-based setups managed by Lutris.",
  },
  {
    name: "ROM folders",
    mark: "RM",
    action: "Turn folders into a real shelf",
    detail: "Drop in folders or game files, match them to platforms, and attach local artwork, metadata, and emulator profiles.",
  },
  {
    name: "Arcade sets",
    mark: "AR",
    action: "Index MAME and FBNeo collections",
    detail: "Arcade sets join the same searchable library instead of living in a separate frontend or a forgotten directory.",
  },
  {
    name: "Emulators",
    mark: "EM",
    action: "Connect installed emulators",
    detail: "Detected binaries and bundled definition packs map platforms to launch profiles, with BIOS checks before a game starts.",
  },
  {
    name: "Local games",
    mark: "EX",
    action: "Add any executable",
    detail: "A local game can join the catalog directly, including per-game commands and overrides when the usual profile is not enough.",
  },
]

export function SourcesSection() {
  const [selected, setSelected] = useState(0)
  const source = sources[selected]

  return (
    <section id="sources" className="ob-sources" aria-labelledby="sources-title">
      <div className="ob-shell">
        <header className="ob-section-heading ob-section-heading-split" data-reveal>
          <p className="ob-index">Everybody’s invited</p>
          <div>
            <h2 id="sources-title" className="ob-display">Different places.<br/><em>One collection.</em></h2>
            <p>
              Pick a source. OpenBox turns it into one searchable collection without taking launch control away from
              the tools that already work.
            </p>
          </div>
        </header>

        <div className="ob-source-machine" data-reveal>
          <div className="ob-source-deck" role="tablist" aria-label="Supported game sources">
            {sources.map((item, index) => (
              <button
                key={item.name}
                type="button"
                role="tab"
                id={`source-tab-${index}`}
                aria-controls="source-panel"
                aria-selected={selected === index}
                tabIndex={selected === index ? 0 : -1}
                className={selected === index ? "is-selected" : undefined}
                onClick={() => setSelected(index)}
                onFocus={() => setSelected(index)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
                  event.preventDefault()
                  const direction = event.key === "ArrowRight" ? 1 : -1
                  const next = (index + direction + sources.length) % sources.length
                  setSelected(next)
                  document.getElementById(`source-tab-${next}`)?.focus()
                }}
              >
                <span className="ob-source-mark" aria-hidden="true">{item.mark}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          <div
            id="source-panel"
            role="tabpanel"
            aria-labelledby={`source-tab-${selected}`}
            className="ob-source-panel"
          >
            <div className="ob-source-readout" aria-hidden="true">
              <span>INPUT</span>
              <strong>{String(selected + 1).padStart(2, "0")}</strong>
              <span>READY</span>
            </div>
            <div className="ob-source-copy" key={source.name}>
              <p>{source.name}</p>
              <h3>{source.action}</h3>
              <span>{source.detail}</span>
            </div>
            <div className="ob-source-output" aria-hidden="true">
              <span>{source.mark}</span>
              <span>OPENBOX</span>
            </div>
          </div>
        </div>

        <div className="ob-section-links" data-reveal>
          <a href="/guides/library/importing/">Read the import guide</a>
          <a href="/guides/emulators-and-launching/">Set up emulator profiles</a>
        </div>
      </div>
    </section>
  )
}
