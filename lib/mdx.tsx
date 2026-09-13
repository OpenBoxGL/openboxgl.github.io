import { MDXRemote } from "next-mdx-remote-client/rsc"
import remarkGfm from "remark-gfm"
import {
  ApiEndpoint,
  Callout,
  FeatureGrid,
  InstallOptionCard,
  InstallOptions,
  Procedure,
  ProductShot,
  StatusBadge,
  Steps,
  CommandBuilder,
  SearchPlayground,
  ThemePreviewer,
  ControllerDiagram,
  ApiExplorer,
  DocTable,
} from "@/components/docs"

const components = {
  table: DocTable,
  ApiEndpoint,
  Callout,
  FeatureGrid,
  InstallOptionCard,
  InstallOptions,
  Procedure,
  ProductShot,
  StatusBadge,
  Steps,
  CommandBuilder,
  SearchPlayground,
  ThemePreviewer,
  ControllerDiagram,
  ApiExplorer,
}

type HastNode = {
  type?: string
  tagName?: string
  value?: string
  children?: HastNode[]
  properties?: Record<string, unknown>
}

/**
 * Match the slug shape used by the fragment links in the authored docs.
 * Punctuation is removed while whitespace is retained as hyphens, so a
 * heading such as "Source / system" keeps its existing `source--system`
 * fragment.
 */
function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-")
}

function headingText(node: HastNode): string {
  if (node.type === "text") return node.value ?? ""
  return (node.children ?? []).map(headingText).join("")
}

/** Add deterministic, unique fragment IDs to Markdown/MDX headings. */
function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const counts = new Map<string, number>()

    const visit = (node: HastNode) => {
      if (node.type === "element" && /^h[1-6]$/.test(node.tagName ?? "")) {
        const existingId = typeof node.properties?.id === "string" ? node.properties.id : ""
        const base = existingId || slugifyHeading(headingText(node)) || "section"
        const count = counts.get(base) ?? 0
        counts.set(base, count + 1)
        node.properties = { ...node.properties, id: count === 0 ? base : `${base}-${count}` }
      }
      for (const child of node.children ?? []) visit(child)
    }

    visit(tree)
  }
}

/** Strip Astro frontmatter and import lines, keep the body. */
function stripAstro(source: string): string {
  let s = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
  s = s.replace(/^import .*$/gm, "")
  return s
}

/** Convert :::note/tip/caution/callout blocks into <Callout> JSX. */
function convertAdmonitions(source: string): string {
  // Handles `:::(type)[Title]` with body on following lines, and `:::type[Title]`.
  const regex = /^:::(\w+)(?:\[([^\]]*)\])?\r?\n([\s\S]*?)\r?\n:::$/gm
  return source.replace(regex, (_m, type, title, body) => {
    const t = type === "callout" ? "note" : type
    const titleAttr = title ? ` title="${title.replace(/"/g, "&quot;")}"` : ""
    return `<Callout type="${t}"${titleAttr}>\n\n${body.trim()}\n\n</Callout>`
  })
}

/** Convert Astro component usage into our React component JSX. */
function convertAstroComponents(source: string): string {
  let s = source
  // ApiEndpoint: method (quoted or brace) + path + optional auth/summary
  s = s.replace(/<ApiEndpoint\s+method=\{?"?([A-Z]+)"?\}?\s+path="([^"]*)"([^>]*)>/g, '<ApiEndpoint method="$1" path="$2"$3>')
  s = s.replace(/<ApiEndpoint\s+path="([^"]*)"([^>]*)>/g, '<ApiEndpoint path="$1"$2>')
  // StatusBadge
  s = s.replace(/<StatusBadge\s+status=\{?"?([^"}>]+)"?\}?\s*\/>/g, '<StatusBadge status="$1" />')
  // ProductShot src references (Astro asset imports)
  s = s.replace(/src=\{screenshot\}/g, 'src="/openbox-screenshot.png"')
  s = s.replace(/src=\{detailScreenshot\}/g, 'src="/openbox-game-detail.png"')
  // Steps: replace <Steps><ol>…</ol></Steps> with <Steps>…</Steps>
  s = s.replace(/<Steps>[\s\S]*?<ol>/g, "<Steps>")
  s = s.replace(/<\/ol>[\s\S]*?<\/Steps>/g, "</Steps>")
  // InstallOptions slot conversion: <div slot="appimage"> → <InstallOptionCard slot="appimage">
  s = s.replace(/<div slot="(appimage|flatpak|source)"\s*>/g, "<InstallOptionCard slot=\"$1\">")
  s = s.replace(/<\/div>\s*(?=\n?\s*<InstallOptionCard slot=)/g, "</InstallOptionCard>\n")
  s = s.replace(/<\/div>\s*(?=\n?\s*<\/InstallOptions>)/g, "</InstallOptionCard>\n")
  return s
}

/** Preprocess Astro/MDX source into portable MDX for next-mdx-remote-client. */
export function preprocess(source: string): string {
  return convertAstroComponents(convertAdmonitions(stripAstro(source)))
}

export function renderMdx(source: string) {
  return (
    <MDXRemote
      source={preprocess(source)}
      components={components}
      options={{
        mdxOptions: {
          format: "mdx",
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeHeadingIds],
        },
      }}
    />
  )
}
