"use client"

import { useRef, useState, type CSSProperties } from "react"

const games = [
  { title: "Elden Ring", platform: "Windows", studio: "FromSoftware", x: 209, y: 276, w: 142, h: 212, color: "#a89a62" },
  { title: "Half-Life 2", platform: "Windows", studio: "Valve", x: 369, y: 276, w: 141, h: 200, color: "#b6aa87" },
  { title: "Hollow Knight", platform: "Windows", studio: "Team Cherry", x: 529, y: 276, w: 141, h: 212, color: "#8b9cb5" },
  { title: "Metroid Prime", platform: "GameCube", studio: "Retro Studios", x: 688, y: 276, w: 140, h: 212, color: "#c4a06e" },
  { title: "Red Dead Redemption 2", platform: "Windows", studio: "Rockstar Games", x: 846, y: 276, w: 141, h: 212, color: "#ce684d" },
  { title: "Sonic the Hedgehog 2", platform: "Genesis", studio: "Sonic Team", x: 1006, y: 276, w: 140, h: 195, color: "#6fa8ba" },
  { title: "Breath of the Wild", platform: "Switch", studio: "Monolith Soft", x: 1166, y: 276, w: 140, h: 230, color: "#a9be91" },
]

export function Hero() {
  const [selected, setSelected] = useState(2)
  const [hovered, setHovered] = useState<number | null>(null)
  const startX = useRef<number | null>(null)
  const active = games[selected]
  const choose = (index: number) => setSelected((index + games.length) % games.length)

  return (
    <section id="top" className="ob-hero" style={{ "--shelf-color": active.color } as CSSProperties} aria-labelledby="hero-title">
      <div className="ob-hero-atmosphere" aria-hidden="true" />
      <div className="ob-shell">
        <div className="ob-hero-intro">
          <div>
            <p className="ob-kicker"><span className="ob-status-dot" /> An open home for your games</p>
            <h1 id="hero-title" className="ob-display">All your games.<br /><em>Together at last.</em></h1>
          </div>
          <div className="ob-hero-aside">
            <p>Your Steam favorites. That folder of ROMs.<br className="ob-desktop-break" /> The game you forgot you owned.<br />One beautiful library, on your machine.</p>
            <a href="/downloads/" className="ob-button ob-button-primary">Download OpenBox <span aria-hidden="true">↗</span></a>
            <span className="ob-platform-note">For Linux & Steam Deck · Free & open source</span>
          </div>
        </div>

        <div className="ob-shelf"
          role="region" aria-label="Interactive sample game shelf"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault()
              const next = (selected + (event.key === "ArrowRight" ? 1 : -1) + games.length) % games.length
              choose(next)
              document.getElementById(`shelf-game-${next}`)?.focus({ preventScroll: true })
            }
          }}
          onTouchStart={(event) => { startX.current = event.touches[0].clientX }}
          onTouchEnd={(event) => {
            if (startX.current === null) return
            const delta = event.changedTouches[0].clientX - startX.current
            if (Math.abs(delta) > 45) choose(selected + (delta < 0 ? 1 : -1))
            startX.current = null
          }}
        >
          <div className="ob-shelf-stage">
            {games.map((game, index) => {
              let offset = (index - selected + games.length) % games.length
              if (offset > 3) offset -= games.length
              return (
                <button key={game.title} id={`shelf-game-${index}`} type="button"
                  aria-label={`Select ${game.title}`} aria-pressed={selected === index}
                  tabIndex={selected === index ? 0 : -1}
                  className={`ob-game-case ${selected === index ? "is-selected" : ""}`}
                  style={{
                    "--offset": offset,
                    "--distance": Math.abs(offset),
                    "--case-angle": `${offset === 0 ? 0 : offset > 0 ? -22 : 22}deg`,
                    "--case-lift": hovered === index && selected !== index ? "-18px" : "0px",
                    zIndex: 10 - Math.abs(offset),
                  } as CSSProperties}
                  onClick={() => choose(index)}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="ob-cover-art" aria-hidden="true" style={{
                    backgroundImage: 'url("/library-view.png")',
                    backgroundSize: `${1920 / game.w * 100}% ${1080 / game.h * 100}%`,
                    backgroundPosition: `${game.x / (1920 - game.w) * 100}% ${game.y / (1080 - game.h) * 100}%`,
                  }} />
                  <span className="ob-case-spine" aria-hidden="true">{game.title}</span>
                  <span className="ob-case-shine" aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="ob-shelf-bottom">
          <div className="ob-shelf-hint"><span aria-hidden="true">↔</span> Go on. Browse the shelf.<small>Interactive preview · Sample collection</small></div>
          <div className="ob-now-selected" aria-live="polite"><small>{active.platform} <span>/</span> {active.studio}</small><strong key={active.title}>{active.title}</strong></div>
          <div className="ob-shelf-controls">
            <button type="button" aria-label="Previous game" onClick={() => choose(selected - 1)}>←</button>
            <span>{String(selected + 1).padStart(2, "0")} <i>/ 07</i></span>
            <button type="button" aria-label="Next game" onClick={() => choose(selected + 1)}>→</button>
          </div>
        </div>
        <div className="ob-hero-footnote"><span>Steam · GOG · Heroic · Lutris · ROMs · Arcade</span><a href="#library">Meet your new library <span aria-hidden="true">↓</span></a></div>
      </div>
    </section>
  )
}
