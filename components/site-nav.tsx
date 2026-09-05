"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

const links = [
  { label: "The library", href: "/#library" },
  { label: "Showcase", href: "/showcase/" },
  { label: "Docs", href: "/docs/" },
  { label: "GitHub ↗", href: "https://github.com/vindeckyy/OpenBoxGL" },
]

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus() }
    }
    const desktop = window.matchMedia("(min-width: 900px)")
    const resize = () => { if (desktop.matches) setOpen(false) }
    window.addEventListener("keydown", escape)
    desktop.addEventListener("change", resize)
    return () => { window.removeEventListener("keydown", escape); desktop.removeEventListener("change", resize) }
  }, [open])

  return (
    <header className="ob-nav">
      <nav className="ob-shell ob-nav-inner" aria-label="Primary navigation">
        <a href={pathname === "/" ? "#top" : "/"} className="ob-brand" onClick={() => setOpen(false)} aria-label="OpenBox home">
          <Image src="/openbox-icon.png" alt="OpenBox cube" width={40} height={40} priority />
          <span>OpenBox<span className="ob-brand-dot">.</span></span>
        </a>
        <div className="ob-nav-links">
          {links.map(link => <a key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</a>)}
        </div>
        <a href="/downloads/" className="ob-nav-download">Get OpenBox <span aria-hidden="true">↗</span></a>
        <button ref={toggle} type="button" className="ob-menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close main menu" : "Open main menu"} onClick={() => setOpen(!open)}>{open ? "Close −" : "Menu +"}</button>
      </nav>
      {open && <nav id="mobile-navigation" className="ob-mobile-nav" aria-label="Mobile navigation">
        {links.map(link => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
        <a href="/downloads/">Download OpenBox</a>
      </nav>}
    </header>
  )
}
