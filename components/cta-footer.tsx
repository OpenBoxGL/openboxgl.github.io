import Image from "next/image"
import { Star, Terminal } from "lucide-react"

const hints = [
  "← → Browse",
  "Enter Play",
  "Ctrl K Search",
  "M Menu",
  "Esc Back",
]

export function CtaFooter() {
  return (
    <footer className="relative overflow-hidden px-4 pt-24 pb-8">
      <div
        className="pointer-events-none absolute left-1/2 top-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(closest-side, oklch(0.7 0.19 46 / 35%), transparent)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <Image
          src="/openbox-logo.png"
          alt="OpenBox logo"
          width={64}
          height={64}
          className="mx-auto h-16 w-16 object-contain drop-shadow-[0_0_24px_oklch(0.7_0.19_46_/_55%)]"
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
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Terminal className="h-4 w-4" />
            Install OpenBox
          </a>
          <a
            href="https://github.com/vindeckyy/OpenBoxGL"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-6 py-3 font-medium transition-colors hover:bg-secondary"
          >
            <Star className="h-4 w-4" />
            Star on GitHub
          </a>
        </div>

        {/* HUD hint strip echoing Big Box mode */}
        <div className="mx-auto mt-14 flex w-fit flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-xl border border-border bg-card/60 px-6 py-3 font-mono text-[11px] tracking-wider text-muted-foreground backdrop-blur">
          {hints.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-2 font-bold tracking-[0.16em] text-foreground">OPENBOX</span>
          <span className="font-mono text-xs">AGPL-3.0 · Local-first · No telemetry</span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
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
