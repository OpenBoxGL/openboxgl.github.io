"use client"

import { Children, isValidElement, useEffect, useId, useRef } from "react"
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react"
import mermaid from "mermaid"

let initialized = false

function ensureInit() {
  if (initialized) return
  mermaid.initialize({
    startOnLoad: false,
    // The docs site is dark-only (see app/layout.tsx), so pin the dark theme.
    theme: "dark",
    securityLevel: "strict",
    flowchart: { htmlLabels: true },
  })
  initialized = true
}

export function Mermaid({ chart }: { chart: string }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let cancelled = false
    ensureInit()
    mermaid
      .render(`mermaid-${rawId}`, chart)
      .then(({ svg }) => {
        if (!cancelled) el.innerHTML = svg
      })
      .catch(() => {
        if (!cancelled) {
          const pre = document.createElement("pre")
          pre.textContent = chart
          el.replaceChildren(pre)
        }
      })
    return () => {
      cancelled = true
    }
  }, [chart, rawId])

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Diagram"
      className="my-6 flex justify-center overflow-x-auto rounded-xl border border-border bg-card p-4"
    />
  )
}

type CodeProps = { className?: string; children?: ReactNode }

/** MDX `pre` passthrough that renders ```mermaid fences as diagrams. */
export function MdxPre({ children, ...rest }: ComponentPropsWithoutRef<"pre">) {
  const code = Children.toArray(children).find(
    (child): child is ReactElement<CodeProps> =>
      isValidElement(child) &&
      typeof (child.props as CodeProps).className === "string" &&
      ((child.props as CodeProps).className as string).includes("language-mermaid"),
  )
  if (code) {
    const chart = Children.toArray((code.props as CodeProps).children)
      .filter((node): node is string => typeof node === "string")
      .join("")
      .replace(/\n$/, "")
    return <Mermaid chart={chart} />
  }
  return <pre {...rest}>{children}</pre>
}
