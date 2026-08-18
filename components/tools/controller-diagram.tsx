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
    name: "Big Box: Grid & Navigation",
    icon: Monitor,
    bindings: [
      { btn: "A", label: "Launch / Select", action: "Launch Game", detail: "Spawns the selected title or enters submenu" },
      { btn: "B", label: "Back / Exit", action: "Back", detail: "Returns to previous view or exits dialog" },
      { btn: "X", label: "Details", action: "Open Game Details", detail: "Opens extended metadata, manuals, achievements" },
      { btn: "Y", label: "Favorite", action: "Toggle Favorite", detail: "Pins or unpins game from Favorites collection" },
      { btn: "D-Pad", label: "Directional Navigation", action: "Card Focus", detail: "Moves selection through the active grid or list" },
      { btn: "LB / RB", label: "Category Shift", action: "Next / Prev Platform", detail: "Cycles through platforms and playlist tabs" },
      { btn: "LT / RT", label: "View Mode Cycle", action: "Cycle Layout", detail: "Switches between Grid, CoverFlow, and Stage views" },
      { btn: "Start / Menu", label: "Global Menu", action: "Open Big Box Menu", detail: "Opens quick settings, filter presets, and power actions" },
      { btn: "Select / View", label: "Search", action: "Focus Search Input", detail: "Opens virtual keyboard and starts searching titles" },
    ],
  },
  {
    id: "bigbox-coverflow",
    name: "Big Box: 3D CoverFlow",
    icon: Layers,
    bindings: [
      { btn: "A", label: "Confirm / Play", action: "Play Center Game", detail: "Launches the currently centered 3D box" },
      { btn: "Left / Right", label: "Carousel Scroll", action: "Rotate 3D Carousel", detail: "Spins cover cards with smooth hardware acceleration" },
      { btn: "Up / Down", label: "Quick Filter", action: "Platform Jump", detail: "Cycles parent platform collections" },
      { btn: "X", label: "Flip Box", action: "Inspect 3D Box Back", detail: "Flips box art to view back cover & spine details" },
      { btn: "B", label: "Return", action: "Exit Carousel", detail: "Returns to main menu or previous playlist" },
      { btn: "Start", label: "Quick Actions", action: "Context Menu", detail: "Reset stats, backup save, or edit launch override" },
    ],
  },
  {
    id: "desktop-hotkeys",
    name: "Desktop Window & Keyboard Hotkeys",
    icon: Sliders,
    bindings: [
      { btn: "Ctrl + ,", label: "Settings", action: "Open Settings Dialog", detail: "Launches local configuration, providers, and audit" },
      { btn: "Ctrl + F", label: "Search Focus", action: "Focus Search Bar", detail: "Starts filtering live library with instant query syntax" },
      { btn: "Ctrl + Alt + Q", label: "Random Pick", action: "Select Random Game", detail: "Picks, focuses, and scrolls to a random title" },
      { btn: "Ctrl + Shift + B", label: "Big Box Toggle", action: "Toggle Big Box Kiosk", detail: "Enters fullscreen controller-first Big Box interface" },
      { btn: "F11", label: "Fullscreen", action: "Toggle Window Fullscreen", detail: "Toggles native borderless fullscreen window mode" },
      { btn: "Space", label: "Quick Details", action: "Toggle Detail Drawer", detail: "Opens side drawer without leaving current view" },
      { btn: "Enter", label: "Primary Launch", action: "Launch Active Game", detail: "Executes launch pipeline for selected title" },
      { btn: "Delete", label: "Remove Game", action: "Delete / Unlink Dialog", detail: "Opens safe game removal dialog with optional media cleanup" },
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
