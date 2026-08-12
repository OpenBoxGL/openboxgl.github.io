// Builds public/docs-index.json for client-side search.
// Strips frontmatter, admonitions, and code fences to make searchable text.
import fs from "node:fs"
import path from "node:path"

const DOCS_DIR = path.join(process.cwd(), "content/docs")
const OUT = path.join(process.cwd(), "public", "docs-index.json")

function walk(dir, prefix, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, `${prefix}${entry.name}/`, acc)
    else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      const base = entry.name.replace(/\.mdx?$/, "")
      const slug = base === "index" ? prefix.slice(0, -1) : `${prefix}${base}`
      acc.push({ slug, file: full })
    }
  }
  return acc
}

function stripFrontmatter(src) {
  return src.replace(/^---[\s\S]*?---/, "").trim()
}

function stripFences(src) {
  return src.replace(/```[\s\S]*?```/g, " ")
}

function extractTitle(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return ""
  const t = m[1].match(/^title:\s*(.+)$/m)
  return t ? t[1].trim().replace(/^["']|["']$/g, "") : ""
}

function extractDescription(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return ""
  const t = m[1].match(/^description:\s*(.+)$/m)
  return t ? t[1].trim().replace(/^["']|["']$/g, "") : ""
}

const files = walk(DOCS_DIR, "", [])
const entries = files
  .filter((f) => f.slug !== "404")
  .map((f) => {
    const raw = fs.readFileSync(f.file, "utf8")
    const title = extractTitle(raw)
    const description = extractDescription(raw)
    const body = stripFences(stripFrontmatter(raw))
      .replace(/[<{][^>}]*[>}]/g, " ")
      .replace(/:::/g, " ")
      .replace(/[#*`>|]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    return { slug: f.slug, title, description, body: body.slice(0, 3000) }
  })
  .filter((e) => e.title)

fs.writeFileSync(OUT, JSON.stringify(entries))
console.log(`Wrote ${entries.length} entries to public/docs-index.json`)
