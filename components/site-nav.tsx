"use client"

import Image from "next/image"
import { Star, Terminal } from "lucide-react"

const links = [
  { label: "Library", href: "#library" },
  { label: "Sources", href: "#sources" },
  { label: "Big Box", href: "#bigbox" },
  { label: "Local-first", href: "#local" },
]

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 px-3 py-2.5 pl-4 backdrop-blur-xl">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative block h-8 w-8 overflow-hidden rounded-md drop-shadow-[0_0_12px_oklch(0.7_0.19_46_/_50%)]">
            <Image
              src="/openbox-logo.png"
              alt="OpenBox logo"
              width={650}
              height={650}
              className="h-full w-full scale-[1.35] object-cover"
            />
          </span>
          <span className="text-sm font-bold tracking-[0.16em]">OPENBOX</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className="hidden items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <Star className="h-4 w-4" />
            <span className="font-mono text-xs">14.2k</span>
          </a>
          <a
            href="#install"
            className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Terminal className="h-4 w-4" />
            Install
          </a>
        </div>
      </nav>
    </header>
  )
}
