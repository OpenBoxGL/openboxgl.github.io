import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { Children, isValidElement } from "react"
import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

const methodColors: Record<string, string> = {
  GET: "bg-cyan/10 text-cyan border-cyan/30",
  POST: "bg-primary/10 text-primary border-primary/30",
  PUT: "bg-primary/10 text-primary border-primary/30",
  DELETE: "bg-destructive/10 text-destructive border-destructive/30",
  PATCH: "bg-primary/10 text-primary border-primary/30",
}

export function ApiEndpoint({
  method = "GET",
  path,
  auth,
  summary,
  children,
}: {
  method?: string
  path: string
  auth?: string
  summary?: string
  children?: ReactNode
}) {
  return (
    <section className="relative my-4 overflow-hidden rounded-xl border border-border bg-card">
      {/* subtle method-tinted left accent */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-background/60 px-4 py-2.5">
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider",
            methodColors[method.toUpperCase()] ?? methodColors.GET,
          )}
        >
          {method.toUpperCase()}
        </span>
        <code className="font-mono text-sm text-foreground/90">{path}</code>
        {auth && (
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <span className="uppercase tracking-widest">Auth</span>
            <code className="rounded bg-secondary px-1.5 py-0.5 text-cyan">{auth}</code>
          </span>
        )}
      </div>
      {summary && (
        <p className="border-b border-border px-4 py-2.5 text-sm leading-relaxed text-muted-foreground">{summary}</p>
      )}
      {children && (
        <div className="px-4 py-3 text-sm [&_p]:my-2 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-foreground/90 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2">
          {children}
        </div>
      )}
    </section>
  )
}

const calloutStyles = {
  note: { border: "border-cyan/40", iconBg: "bg-cyan/10", icon: Info, iconColor: "text-cyan" },
  tip: { border: "border-lime/40", iconBg: "bg-lime/10", icon: Lightbulb, iconColor: "text-lime" },
  caution: { border: "border-primary/50", iconBg: "bg-primary/10", icon: AlertTriangle, iconColor: "text-primary" },
  danger: { border: "border-destructive/50", iconBg: "bg-destructive/10", icon: AlertTriangle, iconColor: "text-destructive" },
  callout: { border: "border-border", iconBg: "bg-secondary", icon: Info, iconColor: "text-muted-foreground" },
} as const

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof calloutStyles
  title?: string
  children?: ReactNode
}) {
  const style = calloutStyles[type] ?? calloutStyles.note
  const Icon = style.icon
  return (
    <aside className={cn("my-4 rounded-xl border-l-4 bg-card/60 p-4", style.border)}>
      <p className="flex items-center gap-2.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", style.iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", style.iconColor)} />
        </span>
        {title ?? type}
      </p>
      <div className="mt-2.5 pl-8.5 text-sm leading-relaxed text-foreground/85 [&_p]:my-2 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_a]:text-primary [&_a]:underline [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </aside>
  )
}

export function Steps({ children }: { children?: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement)
  let stepNumber = 0
  return (
    <ol className="my-4 space-y-3">
      {items.map((child, i) => {
        const el = child as React.ReactElement<{ children?: ReactNode }>
        const isLi = el.type === "li" || (typeof el.type === "string" && el.type === "li")
        if (!isLi) {
          // Non-li children (e.g. Callouts) render as-is inside the list.
          return (
            <li key={i} className="list-none [&>ol]:my-0">
              {el}
            </li>
          )
        }
        stepNumber += 1
        const content = el.props.children
        return (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">
              {stepNumber}
            </span>
            <div className="min-w-0 flex-1 [&_p]:my-1 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_a]:text-primary [&_a]:underline">
              {content}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function Procedure({
  children,
  prerequisites,
  result,
}: {
  children?: ReactNode
  prerequisites?: ReactNode
  result?: ReactNode
}) {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border bg-card/50">
      {prerequisites && (
        <div className="border-b border-border bg-background/50 px-4 py-3">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Prerequisites
          </p>
          <div className="mt-2 text-sm [&_p]:my-1.5 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono">{prerequisites}</div>
        </div>
      )}
      <ol className="space-y-2.5 px-4 py-4">
        {Array.isArray(children)
          ? children.map((child, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="select-none font-mono text-xs font-bold text-primary">{String(i + 1).padStart(2, "0")}.</span>
                <span className="min-w-0 flex-1 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono">
                  {child}
                </span>
              </li>
            ))
          : children}
      </ol>
      {result && (
        <div className="border-t border-border bg-background/50 px-4 py-3">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-lime">
            Expected result
          </p>
          <div className="mt-2 text-sm [&_p]:my-1.5 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono">{result}</div>
        </div>
      )}
    </div>
  )
}

export function StatusBadge({ status = "done" }: { status?: "done" | "partial" | "missing" }) {
  const styles = {
    done: "bg-lime/10 text-lime border-lime/30",
    partial: "bg-primary/10 text-primary border-primary/30",
    missing: "bg-destructive/10 text-destructive border-destructive/30",
  } as const
  const labels = { done: "Done", partial: "Partial", missing: "Missing" } as const
  return (
    <span className={cn("inline-block rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider", styles[status])}>
      {labels[status]}
    </span>
  )
}

export function FeatureGrid({
  label = "OpenBoxGL guides",
  items = [],
}: {
  label?: string
  items?: { href: string; title: string; description: string; eyebrow?: string }[]
}) {
  return (
    <nav aria-label={label} className="my-6 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-card/70"
        >
          {item.eyebrow && (
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{item.eyebrow}</span>
          )}
          <strong className="mt-1 block text-sm transition-colors group-hover:text-primary">{item.title}</strong>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.description}</span>
        </a>
      ))}
    </nav>
  )
}

export function InstallOptions({ children }: { children?: ReactNode }) {
  return (
    <div className="my-6 grid gap-3 md:grid-cols-3">
      {/* Child sections carry data-slot="appimage|flatpak|source"; render each as a column. */}
      {children}
    </div>
  )
}

export function InstallOptionCard({
  slot,
  children,
}: {
  slot: "appimage" | "flatpak" | "source"
  children?: ReactNode
}) {
  const hints: Record<string, string> = {
    appimage: "Recommended · built-in updater",
    flatpak: "Sandboxed",
    source: "git + Python 3.10+",
  }
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4">
      <div className="min-w-0 flex-1 text-sm text-foreground/85 [&_p]:my-2 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_a]:text-primary [&_a]:underline [&_h3]:text-base [&_h3]:font-bold [&_h3]:tracking-tight [&_h4]:mt-4 [&_h4]:font-semibold [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-[#0d1117] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5]">
        {children}
      </div>
    </div>
  )
}

export function ProductShot({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="my-6">
      <a href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full" loading="lazy" />
      </a>
      <figcaption className="mt-2 text-center font-mono text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  )
}

export function DocTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="max-w-full overflow-x-auto [overflow-wrap:normal]" role="region" aria-label="Scrollable reference table" tabIndex={0}>
      <table {...props} />
    </div>
  )
}

/** Typography styles applied to raw markdown output (prose-like). */
export function proseClasses() {
  return [
    "text-[15px] leading-relaxed text-foreground/85 [overflow-wrap:anywhere]",
    // Headings: Space Grotesk look with tight tracking, bold weight, and accent-tinted eyebrows
    "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-balance",
    "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight",
    "[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:font-semibold [&_h4]:tracking-tight",
    "[&_h2+h3]:mt-6",
    "[&_p]:my-3",
    "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
    "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
    "[&_li]:my-1 [&_li_>_p]:my-1",
    "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors [&_a:hover]:text-primary/80",
    "[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-foreground/90",
    // Code blocks: terminal-style panels like the landing install command
    "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-[#0d1117] [&_pre]:p-4 [&_pre]:shadow-lg",
    "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[13px] [&_pre_code]:leading-relaxed",
    // Tables: card and border tokens with a subtle header row
    "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-border [&_table]:text-sm",
    "[&_th]:border [&_th]:border-border [&_th]:bg-secondary/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:tracking-tight [&_th]:text-foreground/90",
    "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-foreground/80",
    "[&_tbody_tr]:bg-card [&_tbody_tr:nth-child(odd)]:bg-card/60",
    "[&_blockquote]:my-4 [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:bg-card/60 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:pr-3 [&_blockquote]:text-muted-foreground",
    "[&_hr]:my-8 [&_hr]:border-border",
    "[&_img]:my-4 [&_img]:rounded-xl [&_img]:border [&_img]:border-border",
    "[&_strong]:font-semibold [&_strong]:text-foreground",
    // kbd: the landing key-cap treatment
    "[&_kbd]:rounded [&_kbd]:border [&_kbd]:border-border [&_kbd]:bg-secondary [&_kbd]:px-1.5 [&_kbd]:py-0.5 [&_kbd]:font-mono [&_kbd]:text-xs",
  ].join(" ")
}

export { CommandBuilder } from "@/components/tools/command-builder"
export { SearchPlayground } from "@/components/tools/search-playground"
export { ThemePreviewer } from "@/components/tools/theme-previewer"
export { ControllerDiagram } from "@/components/tools/controller-diagram"
export { ApiExplorer } from "@/components/tools/api-explorer"

export type { ComponentPropsWithoutRef }
