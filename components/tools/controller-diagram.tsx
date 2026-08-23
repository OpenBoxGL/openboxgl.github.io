"use client"

import { useState } from "react"
import { Gamepad2, Layers, Monitor, Sliders, Play, Info } from "lucide-react"

interface ButtonBinding {
  btn: string
  label: string
  action: string
  detail: string
}

const CONTEXTS: { id: string; name: string; icon: any; bindings: ButtonBinding[] }[] = [
  {
    id: "bigbox-grid",
    name: "Big Box: Gamepad Navigation",
    icon: Monitor,
    bindings: [
      { btn: "A (Button 0)", label: "Launch / Select", action: "Launch Game", detail: "Spawns the selected title or enters submenu" },
      { btn: "B (Button 1)", label: "Back / Exit", action: "Back", detail: "Returns to previous view or exits Big Box" },
      { btn: "X (Button 2)", label: "Favorite", action: "Toggle Favorite", detail: "Pins or unpins game from Favorites collection" },
      { btn: "Y (Button 3)", label: "Shuffle", action: "Random Game", detail: "Jumps to a random title in the current list" },
      { btn: "D-Pad / Stick", label: "Directional Navigation", action: "Card Focus", detail: "Moves selection through cards and carousel" },
      { btn: "LB / RB (4/5)", label: "Page Scroll", action: "Page Left / Right", detail: "Rapidly pages backward and forward through library" },
      { btn: "Select / View (8)", label: "Session Overlay", action: "Pause / Session Menu", detail: "Opens running session pause, resume, and kill menu" },
      { btn: "Start / Menu (9)", label: "Filter Menu", action: "Open Big Box Menu", detail: "Opens quick platform, playlist, and sort filter menu" },
    ],
  },
  {
    id: "desktop-hotkeys",
    name: "Desktop Window & Keyboard Hotkeys",
    icon: Sliders,
    bindings: [
      { btn: "Ctrl + ,", label: "Settings", action: "Open Settings Dialog", detail: "Launches local configuration, providers, and audit" },
      { btn: "Ctrl + Alt + Q / R", label: "Random Pick", action: "Select Random Game", detail: "Picks, focuses, and scrolls to a random title" },
      { btn: "F11", label: "Fullscreen", action: "Toggle Window Fullscreen", detail: "Toggles native borderless fullscreen window mode" },
      { btn: "Escape", label: "Dismiss", action: "Close Active Dialog / Menu", detail: "Closes active dialog, tools menu, or context popup" },
      { btn: "Arrow Up / Down", label: "Tools Menu", action: "WAI-ARIA Menu Wrap", detail: "Navigates tools dropdown with circular focus wrapping" },
      { btn: "P / M / R / F", label: "Big Box Keys", action: "Big Box Navigation", detail: "Hotkeys for pause menu, filters, random shuffle, favorite" },
    ],
  },
]

export function ControllerDiagram() {
  const [activeContext, setActiveContext] = useState(CONTEXTS[0])
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Interactive Controller & Hotkey Reference</h3>
            <p className="text-xs text-muted-foreground">Gamepad navigation mappings for Steam Deck, handhelds, and desktop keyboard</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Context switcher tabs */}
        <div className="flex flex-wrap gap-2">
          {CONTEXTS.map((ctx) => {
            const Icon = ctx.icon
            return (
              <button
                key={ctx.id}
                type="button"
                onClick={() => setActiveContext(ctx)}
                className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
                  activeContext.id === ctx.id
                    ? "border-primary bg-primary/15 text-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {ctx.name}
              </button>
            )
          })}
        </div>

        {/* Bindings Matrix Cards */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {activeContext.bindings.map((b) => (
            <div
              key={b.btn}
              onMouseEnter={() => setHoveredBtn(b.btn)}
              onMouseLeave={() => setHoveredBtn(null)}
              className={`rounded-lg border p-3 transition-all ${
                hoveredBtn === b.btn
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-background/80 hover:bg-secondary/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-xs font-bold text-cyan">
                  {b.btn}
                </span>
                <span className="font-semibold text-xs text-foreground">{b.action}</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{b.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
