import fs from "node:fs"
import path from "node:path"

export type DocNode = {
  slug: string
  title: string
  description?: string
  children: DocNode[]
  order?: number
}

const DOCS_DIR = path.join(process.cwd(), "content/docs")

/** Parse frontmatter (title, description, order, sidebar) from a doc file. */
export function parseFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return { title: "", description: "", order: undefined, sidebar: undefined }
  const body = match[1]
  const get = (key: string) => {
    const m = body.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : undefined
  }
  return {
    title: get("title") ?? "",
    description: get("description"),
    order: get("order") ? Number(get("order")) : undefined,
    sidebar: get("sidebar") === "false" ? false : true,
  }
}

/** Read a doc file's raw source + frontmatter. */
export function readDoc(slug: string) {
  const candidates = [
    path.join(DOCS_DIR, `${slug}.mdx`),
    path.join(DOCS_DIR, `${slug}.md`),
    path.join(DOCS_DIR, slug, "index.mdx"),
    path.join(DOCS_DIR, slug, "index.md"),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const source = fs.readFileSync(candidate, "utf8")
      return { source, frontmatter: parseFrontmatter(source) }
    }
  }
  return null
}

/** Recursively walk the docs dir building a slug->file map. */
function walkDir(dir: string, prefix: string, acc: Record<string, string>) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDir(full, `${prefix}${entry.name}/`, acc)
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      const base = entry.name.replace(/\.mdx?$/, "")
      const slug = base === "index" ? prefix.slice(0, -1) : `${prefix}${base}`
      acc[slug] = full
    }
  }
  return acc
}

/** All doc slugs (e.g. "guides/library", "reference/api"). */
export function getAllSlugs(): string[] {
  const map: Record<string, string> = {}
  walkDir(DOCS_DIR, "", map)
  return Object.keys(map).sort()
}

/** Build the sidebar tree. Uses explicit section ordering, then alphabetical. */
export function buildSidebar(): DocNode[] {
  const slugs = getAllSlugs()
  const sections: DocNode[] = []
  const bySlug = new Map(slugs.map((s) => [s, readDoc(s)]))

  const section = (label: string, items: string[]) => {
    const nodes: DocNode[] = []
    for (const item of items) {
      if (!bySlug.has(item)) continue
      const doc = bySlug.get(item)!
      const children = slugs
        .filter((s) => s.startsWith(`${item}/`))
        .sort()
        .map((childSlug) => {
          const child = bySlug.get(childSlug)!
          return {
            slug: childSlug,
            title: child.frontmatter.title || childSlug.split("/").pop()!,
            description: child.frontmatter.description,
            children: [],
          }
        })
      nodes.push({
        slug: item,
        title: doc?.frontmatter.title || item,
        description: doc?.frontmatter.description,
        children,
      })
    }
    return { slug: "", title: label, children: nodes }
  }

  sections.push(
    section("Start here", ["index", "install", "getting-started", "interfaces-and-data", "updating"]),
    section("Use OpenBox", [
      "guides/library",
      "guides/library/importing",
      "guides/library/organizing",
      "guides/library/queue-tags-notifications",
      "guides/metadata-and-media",
      "guides/media-providers",
      "guides/storefront-manager",
      "guides/discovery",
      "guides/emulators-and-launching",
      "guides/big-box-and-handhelds",
      "guides/big-box-and-handhelds/performance",
      "guides/retroachievements",
      "themes",
    ]),
    section("Saves and recovery", [
      "guides/sessions-saves-and-backups",
      "guides/sessions-saves-and-backups/saves",
      "guides/sessions-saves-and-backups/library-backups",
      "guides/sessions-saves-and-backups/statistics-sync",
    ]),
    section("Extend and automate", [
      "guides/plugins",
      "guides/troubleshooting",
      "guides/troubleshooting/startup-and-browser",
      "guides/troubleshooting/imports",
      "guides/troubleshooting/metadata-and-media",
      "guides/troubleshooting/launching",
      "guides/troubleshooting/state-recovery",
      "guides/troubleshooting/backups-and-restores",
      "guides/troubleshooting/integration-credentials",
      "guides/troubleshooting/plugins",
      "guides/troubleshooting/diagnostic-logs",
    ]),
    section("Integrations", [
      "integrations/import-sources",
      "integrations/accounts-and-media",
      "integrations/local-services",
      "integrations/webhooks",
    ]),
    section("Reference", [
      "reference/how-it-works",
      "reference/configuration",
      "reference/command-tokens",
      "reference/search-syntax",
      "reference/data-and-recovery",
      "reference/save-archives",
      "reference/library-backups",
      "reference/background-jobs",
      "reference/api",
      "reference/api/overview",
      "reference/api/library-and-settings",
      "reference/api/automation",
      "reference/api/content-and-imports",
      "reference/api/saves-and-operations",
      "reference/api/local-admin",
      "reference/plugins",
      "reference/plugins/overview",
      "reference/plugins/manifest",
      "reference/plugins/hooks",
      "reference/plugins/process-and-errors",
      "reference/plugins/catalog",
      "reference/parity",
    ]),
    section("Project and policies", [
      "project/contributing",
      "project/design-system",
      "policies/security",
      "policies/legal-and-trademarks",
    ]),
  )

  // Any slugs not in a section (404 page) are appended to Start here.
  const covered = new Set(sections.flatMap((s) => s.children.map((c) => c.slug)))
  const orphan = slugs.filter((s) => !covered.has(s))
  if (orphan.length) {
    sections[0].children.push(
      ...orphan.map((slug) => {
        const doc = bySlug.get(slug)!
        return { slug, title: doc?.frontmatter.title || slug, description: doc?.frontmatter.description, children: [] }
      }),
    )
  }

  return sections
}

/** Flatten all slugs into a plain list for route generation. */
export function allDocSlugs(): string[] {
  return getAllSlugs().filter((s) => s !== "404")
}
