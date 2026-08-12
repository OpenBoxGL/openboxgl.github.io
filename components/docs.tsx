import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

const methodColors: Record<string, string> = {
  GET: "bg-cyan/15 text-cyan border-cyan/30",
  POST: "bg-primary/15 text-primary border-primary/30",
  PUT: "bg-primary/15 text-primary border-primary/30",
  DELETE: "bg-destructive/15 text-destructive border-destructive/30",
  PATCH: "bg-primary/15 text-primary border-primary/30",
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
    <section className="my-4 overflow-hidden rounded-xl border border-border bg-card">
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
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            Auth: <code className="text-cyan">{auth}</code>
          </span>
        )}
      </div>
      {summary && <p className="border-b border-border px-4 py-2 text-sm text-muted-foreground">{summary}</p>}
      {children && <div className="px-4 py-3 text-sm [&_p]:my-2 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>}
    </section>
  )
}

const calloutStyles = {
  note: { border: "border-cyan/40", icon: Info, iconColor: "text-cyan" },
  tip: { border: "border-lime/40", icon: Lightbulb, iconColor: "text-lime" },
  caution: { border: "border-primary/50", icon: AlertTriangle, iconColor: "text-primary" },
  danger: { border: "border-destructive/50", icon: AlertTriangle, iconColor: "text-destructive" },
  callout: { border: "border-border", icon: Info, iconColor: "text-muted-foreground" },
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
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className={cn("h-4 w-4", style.iconColor)} />
        {title ?? type}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-foreground/85 [&_p]:my-2 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_a]:text-primary [&_a]:underline [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </aside>
  )
}

export function Steps({ children }: { children?: ReactNode }) {
  return (
    <ol className="my-4 space-y-3">
      {Array.isArray(children)
        ? children.map((child, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 [&_p]:my-1 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_a]:text-primary [&_a]:underline">
                {child}
              </div>
            </li>
          ))
        : children}
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
    <div className="my-4 rounded-xl border border-border bg-card/50">
      {prerequisites && (
        <div className="border-b border-border px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Prerequisites</p>
          <div className="mt-2 text-sm">{prerequisites}</div>
        </div>
      )}
      <ol className="space-y-2 px-4 py-3">
        {Array.isArray(children)
          ? children.map((child, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}.</span>
                <span>{child}</span>
              </li>
            ))
          : children}
      </ol>
      {result && (
        <div className="rounded-b-xl border-t border-border bg-background/50 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime">Expected result</p>
          <div className="mt-2 text-sm">{result}</div>
        </div>
      )}
    </div>
  )
}

export function StatusBadge({ status = "done" }: { status?: "done" | "partial" | "missing" }) {
  const styles = {
    done: "bg-lime/15 text-lime border-lime/30",
    partial: "bg-primary/15 text-primary border-primary/30",
    missing: "bg-destructive/15 text-destructive border-destructive/30",
  } as const
  const labels = { done: "Done", partial: "Partial", missing: "Missing" } as const
  return (
    <span className={cn("inline-block rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold", styles[status])}>
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
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
        >
          {item.eyebrow && (
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{item.eyebrow}</span>
          )}
          <strong className="mt-1 block text-sm">{item.title}</strong>
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
      <div className="min-w-0 flex-1 text-sm text-foreground/85 [&_p]:my-2 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_a]:text-primary [&_a]:underline [&_h3]:text-base [&_h3]:font-semibold [&_h4]:mt-4 [&_h4]:font-semibold [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-[#0d1117] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
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

/** Typography styles applied to raw markdown output (prose-like). */
export function proseClasses() {
  return [
    "text-[15px] leading-relaxed text-foreground/85",
    "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight",
    "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold",
    "[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:font-semibold",
    "[&_p]:my-3",
    "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
    "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
    "[&_li]:my-1",
    "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
    "[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px]",
    "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-[#0d1117] [&_pre]:p-4",
    "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[13px] [&_pre_code]:leading-relaxed",
    "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:text-sm",
    "[&_th]:border [&_th]:border-border [&_th]:bg-secondary/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold",
    "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top",
    "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
    "[&_hr]:my-8 [&_hr]:border-border",
    "[&_img]:my-4 [&_img]:rounded-xl [&_img]:border [&_img]:border-border",
    "[&_strong]:font-semibold [&_strong]:text-foreground",
  ].join(" ")
}

export type { ComponentPropsWithoutRef }
