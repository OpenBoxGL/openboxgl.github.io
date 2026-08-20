"use client"

import { useState } from "react"
import { Palette, Check, Copy, Download, Sparkles, Play, Heart, Trophy, Save } from "lucide-react"

interface ThemePreset {
  id: string
  name: string
  bg: string
  card: string
  brand: string
  accent: string
  text: string
  border: string
}

const STOCK_THEMES: ThemePreset[] = [
  {
    id: "default",
    name: "Default Dark (Orange/Cyan)",
    bg: "#0b0e16",
    card: "#141926",
    brand: "#ff7a00",
    accent: "#00f0ff",
    text: "#f0f4fc",
    border: "#232a3d",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    bg: "#070814",
    card: "#12142b",
    brand: "#00ffc8",
    accent: "#ff007f",
    text: "#e6f8ff",
    border: "#24274c",
  },
  {
    id: "synthwave",
    name: "Retro Synthwave",
    bg: "#160e26",
    card: "#24183d",
    brand: "#ff3b94",
    accent: "#ffc83b",
    text: "#fcedf4",
    border: "#3d2b63",
  },
  {
    id: "dracula",
    name: "Dracula Night",
    bg: "#1e1f29",
    card: "#282a36",
    brand: "#bd93f9",
    accent: "#50fa7b",
    text: "#f8f8f2",
    border: "#44475a",
  },
  {
    id: "nord",
    name: "Nord Frost",
    bg: "#242933",
    card: "#2e3440",
    brand: "#88c0d0",
    accent: "#81a1c1",
    text: "#eceff4",
    border: "#434c5e",
  },
]

export function ThemePreviewer() {
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(STOCK_THEMES[0])
  const [customBg, setCustomBg] = useState(STOCK_THEMES[0].bg)
  const [customCard, setCustomCard] = useState(STOCK_THEMES[0].card)
  const [customBrand, setCustomBrand] = useState(STOCK_THEMES[0].brand)
  const [customAccent, setCustomAccent] = useState(STOCK_THEMES[0].accent)
  const [customText, setCustomText] = useState(STOCK_THEMES[0].text)
  const [customBorder, setCustomBorder] = useState(STOCK_THEMES[0].border)
  const [copied, setCopied] = useState(false)

  const handleSelectPreset = (t: ThemePreset) => {
    setSelectedTheme(t)
    setCustomBg(t.bg)
    setCustomCard(t.card)
    setCustomBrand(t.brand)
    setCustomAccent(t.accent)
    setCustomText(t.text)
    setCustomBorder(t.border)
  }

  const generatedCss = `/* OpenBox Custom Theme: ${selectedTheme.name} */
:root {
  --background: ${customBg};
  --surface-card: ${customCard};
  --brand: ${customBrand};
  --focus: ${customAccent};
  --accent: ${customAccent};
  --text-main: ${customText};
  --border: ${customBorder};
  --border-muted: ${customBorder};
  --brand-rgb: ${parseInt(customBrand.slice(1, 3), 16)}, ${parseInt(customBrand.slice(3, 5), 16)}, ${parseInt(customBrand.slice(5, 7), 16)};
}`

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(generatedCss)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* fallback */
    }
  }

  const downloadCss = () => {
    const blob = new Blob([generatedCss], { type: "text/css" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `theme-${selectedTheme.id}.css`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Interactive Theme Studio & CSS Generator</h3>
            <p className="text-xs text-muted-foreground">Preview stock themes and generate custom CSS token files</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCss}
            className="flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy CSS"}
          </button>
          <button
            type="button"
            onClick={downloadCss}
            className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      <div className="space-y-6 p-5">
        {/* Preset Selector */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            1. Select Base Preset
          </label>
          <div className="flex flex-wrap gap-2">
            {STOCK_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectPreset(t)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedTheme.id === t.id
                    ? "border-primary bg-primary/15 text-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span className="flex h-3 w-3 rounded-full border border-black/30" style={{ backgroundColor: t.brand }} />
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Color Pickers */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            2. Customize Design Tokens
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-1 rounded-lg border border-border/80 bg-background/60 p-2.5">
              <span className="text-[10px] font-mono text-muted-foreground">--background</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customBg}
                  onChange={(e) => setCustomBg(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-border bg-transparent"
                />
                <span className="font-mono text-xs text-foreground">{customBg}</span>
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-border/80 bg-background/60 p-2.5">
              <span className="text-[10px] font-mono text-muted-foreground">--surface-card</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customCard}
                  onChange={(e) => setCustomCard(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-border bg-transparent"
                />
                <span className="font-mono text-xs text-foreground">{customCard}</span>
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-border/80 bg-background/60 p-2.5">
              <span className="text-[10px] font-mono text-muted-foreground">--brand</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-border bg-transparent"
                />
                <span className="font-mono text-xs text-foreground">{customBrand}</span>
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-border/80 bg-background/60 p-2.5">
              <span className="text-[10px] font-mono text-muted-foreground">--focus / --accent</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-border bg-transparent"
                />
                <span className="font-mono text-xs text-foreground">{customAccent}</span>
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-border/80 bg-background/60 p-2.5">
              <span className="text-[10px] font-mono text-muted-foreground">--text-main</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-border bg-transparent"
                />
                <span className="font-mono text-xs text-foreground">{customText}</span>
              </div>
            </div>

            <div className="space-y-1 rounded-lg border border-border/80 bg-background/60 p-2.5">
              <span className="text-[10px] font-mono text-muted-foreground">--border</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customBorder}
                  onChange={(e) => setCustomBorder(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-border bg-transparent"
                />
                <span className="font-mono text-xs text-foreground">{customBorder}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live UI Mockup Preview */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            3. Live OpenBox UI Mockup Preview
          </label>
          <div
            className="rounded-xl border p-5 transition-colors shadow-inner"
            style={{
              backgroundColor: customBg,
              borderColor: customBorder,
              color: customText,
            }}
          >
            {/* Header / Nav mockup */}
            <div
              className="flex items-center justify-between rounded-lg border p-3"
              style={{
                backgroundColor: customCard,
                borderColor: customBorder,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wider" style={{ color: customBrand }}>
                  OPENBOX
                </span>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                  style={{
                    backgroundColor: customBg,
                    color: customAccent,
                    border: `1px solid ${customBorder}`,
                  }}
                >
                  v1.5.1
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: customBrand,
                    color: "#ffffff",
                  }}
                >
                  Launch Big Box
                </button>
              </div>
            </div>

            {/* Game Cards Row Mockup */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                className="group relative overflow-hidden rounded-lg border p-4 transition-all"
                style={{
                  backgroundColor: customCard,
                  borderColor: customBorder,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-sm" style={{ color: customText }}>
                      Chrono Trigger
                    </h5>
                    <p className="text-xs opacity-70">Super Nintendo · 1995</p>
                  </div>
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                    style={{
                      backgroundColor: customBg,
                      color: customAccent,
                      border: `1px solid ${customBorder}`,
                    }}
                  >
                    SNES
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Save className="h-3.5 w-3.5" style={{ color: customAccent }} />
                    <Trophy className="h-3.5 w-3.5" style={{ color: customBrand }} />
                    <Heart className="h-3.5 w-3.5" style={{ color: customBrand }} />
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded px-3 py-1 text-xs font-bold"
                    style={{
                      backgroundColor: customBrand,
                      color: "#ffffff",
                    }}
                  >
                    <Play className="h-3 w-3 fill-current" /> Play
                  </button>
                </div>
              </div>

              <div
                className="group relative overflow-hidden rounded-lg border p-4 transition-all"
                style={{
                  backgroundColor: customCard,
                  borderColor: customBorder,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-sm" style={{ color: customText }}>
                      Super Mario Odyssey
                    </h5>
                    <p className="text-xs opacity-70">Nintendo Switch · 2017</p>
                  </div>
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                    style={{
                      backgroundColor: customBg,
                      color: customAccent,
                      border: `1px solid ${customBorder}`,
                    }}
                  >
                    Switch
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Save className="h-3.5 w-3.5" style={{ color: customAccent }} />
                    <Trophy className="h-3.5 w-3.5" style={{ color: customBrand }} />
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded px-3 py-1 text-xs font-bold"
                    style={{
                      backgroundColor: customBrand,
                      color: "#ffffff",
                    }}
                  >
                    <Play className="h-3 w-3 fill-current" /> Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated CSS Snippet */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Generated Theme CSS (theme.css)
            </label>
            <span className="font-mono text-[11px] text-muted-foreground">
              Drop into <code className="text-foreground">~/.local/share/openbox-game-launcher/themes/</code>
            </span>
          </div>
          <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3.5 font-mono text-xs text-foreground/90">
            {generatedCss}
          </pre>
        </div>
      </div>
    </div>
  )
}
