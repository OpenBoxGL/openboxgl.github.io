"use client"

import { useState } from "react"
import { Check, Copy, Terminal, Wrench, Sparkles, FolderOpen } from "lucide-react"

interface EmulatorPreset {
  id: string
  name: string
  platform: string
  template: string
  samplePath: string
  sampleEmulatorDir: string
}

const PRESETS: EmulatorPreset[] = [
  {
    id: "eden",
    name: "Eden (Switch)",
    platform: "Nintendo Switch",
    template: 'eden "{ImagePath}"',
    samplePath: "/home/deck/Emulation/roms/switch/Super Mario Odyssey.nsp",
    sampleEmulatorDir: "/usr/bin",
  },
  {
    id: "dolphin",
    name: "Dolphin (GameCube/Wii)",
    platform: "GameCube",
    template: 'dolphin-emu -b -e "{ImagePath}"',
    samplePath: "/home/deck/Emulation/roms/gc/Super Smash Bros Melee.iso",
    sampleEmulatorDir: "/usr/bin",
  },
  {
    id: "duckstation",
    name: "DuckStation (PS1)",
    platform: "PlayStation",
    template: 'duckstation-qt -batch "{ImagePath}"',
    samplePath: "/home/deck/Emulation/roms/psx/Metal Gear Solid.m3u",
    sampleEmulatorDir: "/usr/bin",
  },
  {
    id: "pcsx2",
    name: "PCSX2 (PS2)",
    platform: "PlayStation 2",
    template: 'pcsx2-qt -batch "{ImagePath}"',
    samplePath: "/home/deck/Emulation/roms/ps2/Shadow of the Colossus.chd",
    sampleEmulatorDir: "/usr/bin",
  },
  {
    id: "rpcs3",
    name: "RPCS3 (PS3)",
    platform: "PlayStation 3",
    template: 'rpcs3 --no-gui "{ImagePath}"',
    samplePath: "/home/deck/Emulation/roms/ps3/Demon'\''s Souls/USRDIR/EBOOT.BIN",
    sampleEmulatorDir: "/usr/bin",
  },
  {
    id: "retroarch",
    name: "RetroArch (NES/SNES/GBA)",
    platform: "Game Boy Advance",
    template: 'retroarch -L /usr/lib/libretro/mgba_libretro.so "{ImagePath}"',
    samplePath: "/home/deck/Emulation/roms/gba/Pokemon Emerald.gba",
    sampleEmulatorDir: "/usr/bin",
  },
  {
    id: "wine",
    name: "Proton / Wine (Windows)",
    platform: "Windows",
    template: 'WINEPREFIX="{dir}/prefix" wine "{ImagePath}"',
    samplePath: "/home/deck/Games/TrackMania/Trackmania.exe",
    sampleEmulatorDir: "/usr/bin",
  },
  {
    id: "umu",
    name: "UMU / Faugus Runner",
    platform: "Windows",
    template: 'GAMEID=openbox-game umu-run "{ImagePath}"',
    samplePath: "/home/deck/Games/Cyberpunk2077/bin/x64/Cyberpunk2077.exe",
    sampleEmulatorDir: "/usr/bin",
  },
]

export function CommandBuilder() {
  const [selectedPreset, setSelectedPreset] = useState<EmulatorPreset>(PRESETS[0])
  const [gamePath, setGamePath] = useState(PRESETS[0].samplePath)
  const [commandTemplate, setCommandTemplate] = useState(PRESETS[0].template)
  const [copied, setCopied] = useState(false)

  const handleSelectPreset = (preset: EmulatorPreset) => {
    setSelectedPreset(preset)
    setGamePath(preset.samplePath)
    setCommandTemplate(preset.template)
  }

  // Helper function to extract path parts
  const getPathParts = (fullPath: string) => {
    const clean = fullPath.trim()
    const lastSlash = clean.lastIndexOf("/")
    const dir = lastSlash >= 0 ? clean.slice(0, lastSlash) : "/home/user"
    const file = lastSlash >= 0 ? clean.slice(lastSlash + 1) : clean
    const lastDot = file.lastIndexOf(".")
    const stem = lastDot > 0 ? file.slice(0, lastDot) : file
    return { dir, file, stem }
  }

  const { dir, file, stem } = getPathParts(gamePath)
  const dataDir = "~/.local/share/openbox-game-launcher"
  const emulatorDir = selectedPreset.sampleEmulatorDir

  // Expand template variables live
  const expandedCommand = commandTemplate
    .replace(/\{ImagePath\}|\{path\}/g, gamePath)
    .replace(/\{dir\}|\{Dir\}/g, dir)
    .replace(/\{file\}|\{File\}/g, file)
    .replace(/\{stem\}|\{FileNameWithoutExtension\}/g, stem)
    .replace(/\{Platform\}/g, selectedPreset.platform)
    .replace(/\{EmulatorDir\}/g, emulatorDir)
    .replace(/\{DataDir\}/g, dataDir)

  const insertVariable = (variableToken: string) => {
    setCommandTemplate((prev) => prev + " " + variableToken)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(expandedCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard fallback */
    }
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Interactive Launch Command Builder</h3>
            <p className="text-xs text-muted-foreground">Test dynamic variable expansion for emulator profiles & overrides</p>
          </div>
        </div>
        <span className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-cyan">
          OpenBox v1.5.1
        </span>
      </div>

      <div className="space-y-5 p-5">
        {/* Preset Selector */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            1. Select Emulator Preset
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedPreset.id === p.id
                    ? "border-primary bg-primary/15 text-primary shadow-sm"
                    : "border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Game Path Input */}
        <div>
          <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>2. Target ROM or Executable Path</span>
            <span className="font-mono text-[11px] text-muted-foreground">e.g. ISO, NSP, EXE, ROM, M3U</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={gamePath}
              onChange={(e) => setGamePath(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="/absolute/path/to/game.ext"
            />
          </div>
        </div>

        {/* Command Template Input */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              3. Launch Command Template
            </label>
            <span className="text-[11px] text-muted-foreground">Click variable token to append:</span>
          </div>

          <input
            type="text"
            value={commandTemplate}
            onChange={(e) => setCommandTemplate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2 font-mono text-xs text-cyan focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {/* Quick Variable Insert Tokens */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {[
              { token: '"{ImagePath}"', desc: "Full path" },
              { token: '"{dir}"', desc: "Folder" },
              { token: '"{file}"', desc: "File.ext" },
              { token: '"{stem}"', desc: "Filename stem" },
              { token: '"{Platform}"', desc: "Platform" },
              { token: '"{EmulatorDir}"', desc: "Emulator dir" },
              { token: '"{DataDir}"', desc: "Data dir" },
            ].map((v) => (
              <button
                key={v.token}
                type="button"
                onClick={() => insertVariable(v.token)}
                className="flex items-center gap-1 rounded border border-border bg-secondary/80 px-2 py-1 font-mono text-[11px] text-foreground/90 transition-colors hover:border-primary hover:bg-secondary hover:text-primary"
                title={`Inserts ${v.token} (${v.desc})`}
              >
                <Sparkles className="h-3 w-3 text-primary" />
                <code>{v.token}</code>
              </button>
            ))}
          </div>
        </div>

        {/* Resolved Path Breakdown */}
        <div className="grid grid-cols-1 gap-2 rounded-lg border border-border/70 bg-background/50 p-3 sm:grid-cols-3">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Directory ({"{dir}"})</span>
            <div className="truncate font-mono text-xs text-foreground/80" title={dir}>
              {dir}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">File Name ({"{file}"})</span>
            <div className="truncate font-mono text-xs text-foreground/80" title={file}>
              {file}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Stem ({"{stem}"})</span>
            <div className="truncate font-mono text-xs text-foreground/80" title={stem}>
              {stem}
            </div>
          </div>
        </div>

        {/* Output Box */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-primary">
              Live Expanded Command Line Executed
            </label>
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied to Clipboard" : "Copy Command"}
            </button>
          </div>
          <div className="relative rounded-lg border border-primary/30 bg-background p-3.5 font-mono text-xs leading-relaxed text-foreground break-all shadow-inner">
            <span className="select-none text-primary mr-2">$</span>
            {expandedCommand}
          </div>
        </div>
      </div>
    </div>
  )
}
