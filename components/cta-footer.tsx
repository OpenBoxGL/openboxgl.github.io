import Image from "next/image"
import { Star, Terminal } from "lucide-react"

const hints = [
  "← → Browse",
  "Enter Play",
  "Ctrl , Settings",
  "M Menu",
  "Esc Back",
]

export function CtaFooter() {
  return (
    <footer className="relative px-4 pt-24 pb-8">
      <div className="relative mx-auto max-w-4xl text-center">
        <Image
          src="/openbox-logo.png"
          alt="OpenBox logo"
          width={64}
          height={64}
          className="mx-auto h-16 w-16 object-contain"
        />
        <h2 className="mt-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
          Bring your whole backlog home.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
          Free, open source, and yours forever. Install OpenBox and unify every game you own in minutes.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/install/"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            <Terminal className="h-4 w-4" />
            Install OpenBox
          </a>
          <a
            href="https://github.com/vindeckyy/OpenBoxGL"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium transition-colors hover:bg-secondary"
          >
            <Star className="h-4 w-4" />
            Star on GitHub
          </a>
        </div>

        <div className="mx-auto mt-14 flex w-fit flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-lg border border-border bg-card px-6 py-3 font-mono text-[11px] tracking-wider text-muted-foreground">
          {hints.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-2 font-bold tracking-[0.16em] text-foreground">OPENBOX</span>
          <span className="font-mono text-xs">AGPL-3.0 · Local-first · No telemetry</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <a href="/compare/" className="transition-colors hover:text-foreground">Compare</a>
          <a href="/downloads/" className="transition-colors hover:text-foreground">Downloads</a>
          <a href="/showcase/" className="transition-colors hover:text-foreground">Showcase</a>
          <a href="/enterprise/" className="transition-colors hover:text-foreground">Enterprise</a>
          <a href="/docs/" className="transition-colors hover:text-foreground">Docs home</a>
          <a href="/faq/" className="transition-colors hover:text-foreground">FAQ</a>
          <a href="/changelog/" className="transition-colors hover:text-foreground">Changelog</a>
          <a href="/roadmap/" className="transition-colors hover:text-foreground">Roadmap</a>
          <a href="/policies/privacy/" className="transition-colors hover:text-foreground">Privacy</a>
          <a href="/policies/security/" className="transition-colors hover:text-foreground">Security</a>
          <a
            href="https://github.com/vindeckyy/OpenBoxGL"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://www.buymeacoffee.com/haydenopenbox"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Buy me a coffee
          </a>
        </div>
      </div>
    </footer>
  )
}
