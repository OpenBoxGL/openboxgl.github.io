"use client"

import { useEffect, useState } from "react"

const gameCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]

export function ExperienceLayer() {
  const [codeActive, setCodeActive] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    root.classList.add("ob-js")
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))
    let sequence = 0
    let timer = 0
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target) }
      })
    }, { threshold: 0.06 })
    targets.forEach(target => observer.observe(target))
    const trigger = () => {
      clearTimeout(timer)
      setCodeActive(true)
      timer = window.setTimeout(() => setCodeActive(false), 2400)
    }
    const keydown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']")) return
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (key === gameCode[sequence]) {
        sequence += 1
        if (sequence === gameCode.length) { sequence = 0; trigger() }
      } else sequence = key === gameCode[0] ? 1 : 0
    }
    window.addEventListener("keydown", keydown)
    window.addEventListener("openbox:game-code", trigger)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
      window.removeEventListener("keydown", keydown)
      window.removeEventListener("openbox:game-code", trigger)
      root.classList.remove("ob-js")
    }
  }, [])
  return <>
    <a href="#library" className="ob-skip-link">Skip to the library</a>
    <div className={codeActive ? "ob-code-flash is-active" : "ob-code-flash"} aria-live="polite"><span>{codeActive ? "Player two joined. Make room on the couch." : ""}</span></div>
  </>
}

export function GameCodeButton() {
  return <button type="button" className="ob-game-code" onClick={() => window.dispatchEvent(new Event("openbox:game-code"))} aria-label="Activate the classic game code"><span aria-hidden="true">↑ ↑ ↓ ↓ ← → ← → B A</span></button>
}
