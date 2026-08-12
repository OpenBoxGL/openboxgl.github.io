import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react"
import { buildSidebar, allDocSlugs, readDoc } from "@/lib/docs"
import { renderMdx } from "@/lib/mdx"
import { DocsBreadcrumbs } from "@/components/docs-sidebar"
import { proseClasses } from "@/components/docs"
import { notFound } from "next/navigation"

export const dynamicParams = false

export function generateStaticParams() {
  return allDocSlugs()
    .filter((s) => s !== "index")
    .map((slug) => ({ slug: slug.split("/") }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = readDoc(slug.join("/"))
  return {
    title: doc ? `${doc.frontmatter.title} — OpenBox Docs` : "OpenBox Docs",
    description: doc?.frontmatter.description,
  }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const slugStr = slug.join("/")
  const doc = readDoc(slugStr)
  if (!doc) notFound()

  const tree = buildSidebar()
  const flat = tree.flatMap((s) => [s, ...s.children]).filter((n) => n.slug && n.slug !== "index")
  const idx = flat.findIndex((n) => n.slug === slugStr)
  const prev = idx > 0 ? flat[idx - 1] : null
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null

  return (
    <article>
      <DocsBreadcrumbs slug={slugStr} />
      <div className="mb-8 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">// OPENBOX DOCS</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
          {doc.frontmatter.title || "OpenBox Docs"}
        </h1>
        {doc.frontmatter.description && (
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {doc.frontmatter.description}
          </p>
        )}
      </div>

      <div className={proseClasses()}>{renderMdx(doc.source)}</div>

      <nav className="mt-12 flex items-center justify-between border-t border-border pt-6">
        {prev ? (
          <Link
            href={`/${prev.slug}/`}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/${next.slug}/`}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {next.title}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
