"use client"

import { useState } from "react"
import { Check, Copy, Gamepad2, Play } from "lucide-react"
import Image from "next/image"

const hudItems = [
  "100% LOCAL",
  "A PLAY",
  "B BACK",
  "M MENU",
  "0 TELEMETRY",
]

export function Hero() {
  const [copied, setCopied] = useState(false)
  const cmd = "curl -fsSL https://raw.githubusercontent.com/vindeckyy/OpenBoxGL/master/scripts/install.sh | bash"

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section id="top" className="relative overflow-hidden px-4 pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mx-auto mb-8 flex w-fit flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          <a
            href="/changelog/"
            className="rounded border border-border bg-secondary px-1.5 py-0.5 text-cyan transition-colors hover:text-primary"
            aria-label="Open the changelog for v1.5.1"
          >
            v1.5.1
          </a>
          {hudItems.map((h, i) => (
            <span key={h} className="flex items-center gap-3">
              {i === 0 ? <span className="text-cyan">{h}</span> : h}
              {i < hudItems.length - 1 && <span className="text-border">·</span>}
            </span>
          ))}
        </div>

        <h1 className="text-balance text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
          One library for
          <br />
          <span className="text-primary">every game you own.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          OpenBox unifies Steam, GOG, Heroic, Lutris, ROMs and arcade sets into a single art-rich, searchable,
          controller-ready catalog. No account. No cloud. No telemetry. It all lives on your machine.
        </p>

        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <a href="https://github.com/vindeckyy/OpenBoxGL" className="rounded border border-border bg-card px-2 py-1 font-mono hover:text-foreground">
            23 stars
          </a>
          <a href="https://github.com/vindeckyy/OpenBoxGL/blob/master/LICENSE" className="rounded border border-border bg-card px-2 py-1 font-mono">
            AGPL-3.0
          </a>
          <span className="rounded border border-border bg-card px-2 py-1 font-mono">v1.5.1</span>
          <span className="rounded border border-border bg-card px-2 py-1 font-mono">Python 3.10+</span>
          <a href="/enterprise/" className="rounded border border-border bg-card px-2 py-1 font-mono hover:text-foreground">
            Signed releases
          </a>
          <a href="/compare/" className="rounded border border-border bg-card px-2 py-1 font-mono hover:text-foreground">
            Compare
          </a>
        </div>

        <div id="install" className="mx-auto mt-9 flex max-w-3xl items-center gap-2 rounded-lg border border-border bg-card p-1.5 pl-4 font-mono text-xs sm:text-sm">
          <span className="text-primary">$</span>
          <span className="flex-1 overflow-hidden text-left text-foreground/90">{cmd}</span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted"
            aria-label="Copy install command"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="mx-auto mt-3 max-w-3xl text-center font-mono text-xs text-muted-foreground">
          Verifies Ed25519 and SHA-256 against a pinned key. See <a href="/downloads/" className="underline hover:text-foreground">Downloads</a> and{" "}
          <a href="/enterprise/" className="underline hover:text-foreground">Enterprise</a> for the full verify steps.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#library"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            <Play className="h-4 w-4 fill-current" />
            See it in action
          </a>
          <a
            href="#bigbox"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Gamepad2 className="h-4 w-4" />
            Big Box mode
          </a>
        </div>

        <div className="mx-auto mt-14 max-w-4xl rounded-lg border border-border bg-card p-2 shadow-lg">
          <div className="relative overflow-hidden rounded-md border border-border">
            <div className="flex items-center gap-2 border-b border-border bg-background/80 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-destructive/80" />
              <span className="h-3 w-3 rounded-full bg-primary/80" />
              <span className="h-3 w-3 rounded-full bg-lime/70" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">openbox - game detail</span>
            </div>
            <Image
              src="/openbox-game-detail.png"
              alt="OpenBox game detail view showing box art, metadata, and launch controls"
              width={1920}
              height={1080}
              className="w-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
