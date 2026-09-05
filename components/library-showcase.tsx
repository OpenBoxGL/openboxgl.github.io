"use client"

import Image from "next/image"
import { useRef, useState } from "react"

const views = [
  { label: "The collection", src: "/library-view.png", title: "A shelf worth getting lost in.", detail: "Every platform, every cover shape, every forgotten favorite. Search and filter your collection without leaving the library.", alt: "OpenBox game library with cover art grouped by shape and platform filters", href: "/guides/library/" },
  { label: "The details", src: "/openbox-game-detail.png", title: "Every game has a story.", detail: "Artwork, release details, play history, and launch controls together. The detail pane stays beside your collection so you never lose your place.", alt: "OpenBox game detail pane showing Elden Ring metadata and launch controls", href: "/guides/metadata-and-media/" },
  { label: "The couch", src: "/bigbox-mode.png", title: "A little further from the screen.", detail: "Switch to Big Box for a controller-first view of the same library. Made for handhelds, living rooms, and a very comfortable chair.", alt: "OpenBox Big Box fullscreen view showing Chrono Trigger with controller hints", href: "/guides/big-box-and-handhelds/" },
]

export function LibraryShowcase() {
  const [selected, setSelected] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const view = views[selected]
  return (
    <section id="library" className="ob-library" aria-labelledby="library-title">
      <div className="ob-shell">
        <header className="ob-library-heading" data-reveal>
          <div><p className="ob-index">A closer look</p><h2 id="library-title" className="ob-display">Less launcher hopping.<br /><em>More “one more game.”</em></h2></div>
          <p>A familiar home for a wonderfully<br />unreasonable collection.</p>
        </header>
        <div className="ob-viewer" data-reveal>
          <div className="ob-viewer-toolbar">
            <div className="ob-viewer-tabs" role="tablist" aria-label="Product views">
              {views.map((item, index) => <button key={item.label} id={`view-tab-${index}`} role="tab" type="button" aria-selected={selected === index} aria-controls="product-view" tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
                event.preventDefault()
                const next = event.key === "Home" ? 0 : event.key === "End" ? views.length - 1 : (selected + (event.key === "ArrowRight" ? 1 : -1) + views.length) % views.length
                setSelected(next); document.getElementById(`view-tab-${next}`)?.focus()
              }}><span aria-hidden="true">0{index + 1}</span>{item.label}</button>)}
            </div>
            <span className="ob-viewer-note">Actual app. Your library goes here.</span>
          </div>
          <div id="product-view" role="tabpanel" aria-labelledby={`view-tab-${selected}`}>
            <button type="button" className="ob-viewer-image" onClick={() => dialog.current?.showModal()} aria-label={`Enlarge ${view.label.toLowerCase()} screenshot`}>
              <Image key={view.src} src={view.src} alt={view.alt} width={1920} height={1080} sizes="(max-width: 1200px) 94vw, 1160px" />
              <span className="ob-enlarge-label">View full size <span aria-hidden="true">⤢</span></span>
            </button>
            <div className="ob-viewer-caption"><h3>{view.title}</h3><p>{view.detail}</p><a href={view.href}>Read the guide <span aria-hidden="true">↗</span></a></div>
          </div>
        </div>
        <dialog ref={dialog} className="ob-image-dialog" aria-label={view.alt} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close() }}>
          <button type="button" className="ob-dialog-close" onClick={() => dialog.current?.close()}>Close <kbd>Esc</kbd></button>
          <Image src={view.src} alt={view.alt} width={1920} height={1080} sizes="96vw" />
        </dialog>
      </div>
    </section>
  )
}
