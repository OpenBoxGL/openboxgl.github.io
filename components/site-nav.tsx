"use client"

import Image from "next/image"
import { Terminal } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { label: "Library", href: "/#library" },
  { label: "Saves", href: "/#saves" },
  { label: "Emulators", href: "/#emulators" },
  { label: "Big Box", href: "/#bigbox" },
  { label: "Automate", href: "/#automation" },
  { label: "Local-first", href: "/#local" },
  { label: "Docs", href: "/docs/" },
]

export function SiteNav() {
  const pathname = usePathname()
  const onDocs = pathname !== "/"

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 px-3 py-2.5 pl-4 backdrop-blur-xl">
        <a href={onDocs ? "/" : "#top"} className="flex items-center gap-2.5" aria-label="OpenBox home">
          <span className="relative block h-8 w-8 overflow-hidden rounded-md drop-shadow-[0_0_12px_oklch(0.665_0.195_44_/_50%)]">
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
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                l.href.startsWith("/") && !l.href.startsWith("/#") && onDocs && "text-primary",
              )}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/vindeckyy/OpenBoxGL"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="OpenBox on GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
          </a>
          <a
            href="/install/"
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
