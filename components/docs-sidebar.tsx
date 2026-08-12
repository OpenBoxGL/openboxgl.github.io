"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DocNode } from "@/lib/docs"

function Tree({
  nodes,
  pathname,
  depth = 0,
}: {
  nodes: DocNode[]
  pathname: string
  depth?: number
}) {
  return (
    <ul className={cn("space-y-0.5", depth > 0 && "ml-3 border-l border-border pl-2")}>
      {nodes.map((node) => {
        const active = node.slug && pathname === `/${node.slug}/`
        const hasChildren = node.children.length > 0
        if (!node.slug) {
          return (
            <li key={node.title} className="pt-3">
              <p className="flex items-center gap-2 px-2 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                <span className="text-primary/60">{node.title.slice(0, 2).toUpperCase()}</span>
                {node.title}
              </p>
              {hasChildren && <Tree nodes={node.children} pathname={pathname} depth={depth + 1} />}
            </li>
          )
        }
        return (
          <li key={node.slug}>
            <Link
              href={`/${node.slug}/`}
              className={cn(
                "block rounded-lg px-2 py-1.5 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {node.title}
            </Link>
            {hasChildren && <Tree nodes={node.children} pathname={pathname} depth={depth + 1} />}
          </li>
        )
      })}
    </ul>
  )
}

export function DocsSidebar({ tree }: { tree: DocNode[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close the mobile drawer when navigating to another page.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5 md:hidden"
        aria-label="Toggle docs navigation"
        aria-expanded={open}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        {open ? "Close" : "Menu"}
      </button>

      {/* Mobile backdrop */}
      {open && (
        <button
          aria-label="Close docs navigation"
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-border px-3 py-6 md:block",
          open && "fixed inset-y-0 left-0 z-50 block w-72 bg-background md:hidden",
        )}
      >
        <div className="mb-4 flex items-center justify-between px-2">
          <Link
            href="/search"
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            Search docs
            <span className="ml-auto hidden rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              /
            </span>
          </Link>
        </div>
        <Tree nodes={tree} pathname={pathname} />
      </aside>
    </>
  )
}

export function DocsBreadcrumbs({ slug }: { slug: string }) {
  const parts = slug.split("/")
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
      <Link href="/" className="transition-colors hover:text-primary">OpenBox</Link>
      <span className="text-border">/</span>
      <Link href="/" className="transition-colors hover:text-primary">Docs</Link>
      {parts.map((part, i) => {
        const href = `/${parts.slice(0, i + 1).join("/")}/`
        const label = part.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ")
        return (
          <span key={href} className="flex items-center gap-2">
            <span className="text-border">/</span>
            {i === parts.length - 1 ? (
              <span className="text-foreground">{label}</span>
            ) : (
              <Link href={href} className="transition-colors hover:text-primary">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
