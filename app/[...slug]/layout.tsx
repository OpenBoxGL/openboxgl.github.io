import type { ReactNode } from "react"
import { SiteNav } from "@/components/site-nav"
import { DocsSidebar } from "@/components/docs-sidebar"
import { buildSidebar } from "@/lib/docs"

export default function DocLayout({ children }: { children: ReactNode }) {
  const tree = buildSidebar()
  return (
    <>
      <SiteNav />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pt-20 pb-16">
        <DocsSidebar tree={tree} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  )
}
