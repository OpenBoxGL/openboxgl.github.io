// OpenBox docs site backend server.
//
// Serves the static export in out/ and a small API:
//   GET  /api/health            liveness + version
//   GET  /api/search?q=...      ranked docs search over public/docs-index.json
//   GET  /api/release           cached GitHub latest release (version, notes, AppImage, checksum)
//   GET  /api/stats             cached GitHub repo stats (stars, downloads)
//   GET  /api/changelog.rss     RSS feed generated from content/docs/changelog.md
//   POST /api/feedback          feedback form -> data/feedback.jsonl (rate limited)
//
// Runtime: Node 18+ or Bun. No dependencies beyond the standard library.
// Static files come from out/ (the `bun run build` artifact); API routes are
// prefix-matched before the static file lookup so nothing collides.

import { createServer } from "node:http"
import { readFile, stat, writeFile, mkdir, appendFile } from "node:fs/promises"
import { createReadStream } from "node:fs"
import { extname, join, normalize, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { setTimeout as delay } from "node:timers/promises"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const ROOT = join(__dirname, "..")
const OUT_DIR = join(ROOT, "out")
const DATA_DIR = process.env.OPENBOX_SITE_DATA || join(ROOT, "data")

const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || "127.0.0.1"
const VERSION = process.env.SITE_VERSION || "1.0.0"
const STARTED = Date.now()

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
}

// ---------------------------------------------------------------------------
// JSON helpers

function sendJson(res, status, body, extraHeaders = {}) {
  const data = JSON.stringify(body)
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
    "Cache-Control": "no-store",
    ...extraHeaders,
  })
  res.end(data)
}

async function readJsonBody(req, maxBytes = 32 * 1024) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > maxBytes) throw new Error("body too large")
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"))
  } catch {
    throw new Error("invalid JSON")
  }
}

// ---------------------------------------------------------------------------
// Search

let searchIndex = null
async function loadSearchIndex() {
  if (searchIndex) return searchIndex
  const raw = await readFile(join(ROOT, "public", "docs-index.json"), "utf8")
  searchIndex = JSON.parse(raw)
  return searchIndex
}

function searchDocs(entries, query) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean)
  const results = entries
    .map((e) => {
      const title = (e.title || "").toLowerCase()
      const description = (e.description || "").toLowerCase()
      const body = (e.body || "").toLowerCase()
      let score = 0
      for (const token of tokens) {
        if (title.includes(token)) score += 3
        if (description.includes(token)) score += 2
        if (body.includes(token)) score += 1
      }
      if (score === 0) return null
      // Prefer exact phrase matches and title hits.
      if (title.includes(q)) score += 4
      if (title.startsWith(q)) score += 2
      return { slug: e.slug, title: e.title, description: e.description, score, body: e.body || "" }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(({ score, body, ...rest }) => {
      // Trim the body to a small snippet around the first query token.
      const lower = body.toLowerCase()
      let start = 0
      for (const token of tokens) {
        const idx = lower.indexOf(token)
        if (idx >= 0) { start = Math.max(0, idx - 80); break }
      }
      const snippet = (body.slice(start, start + 260) + (body.length > start + 260 ? "..." : "")).trim()
      return { ...rest, snippet }
    })
  return results
}

// ---------------------------------------------------------------------------
// GitHub release + stats, cached

const cache = new Map()
async function cached(key, ttlMs, loader) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.value
  const value = await loader()
  cache.set(key, { at: Date.now(), value })
  return value
}

async function githubJson(pathname, opts = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs || 8000)
  try {
    const res = await fetch(`https://api.github.com${pathname}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "openbox-docs-site",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`github ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function loadRelease() {
  const release = await githubJson("/repos/vindeckyy/OpenBoxGL/releases/latest")
  const appimage = release.assets?.find((a) => a.name === "OpenBox-x86_64.AppImage")
  const checksumAsset = release.assets?.find((a) => /\.sha256$/i.test(a.name))
  return {
    tag: release.tag_name || "",
    name: release.name || release.tag_name || "",
    published_at: release.published_at || "",
    body: (release.body || "").slice(0, 8000),
    html_url: release.html_url || "",
    appimage: appimage
      ? { url: appimage.browser_download_url, size: appimage.size, downloads: appimage.download_count }
      : null,
    checksum_url: checksumAsset?.browser_download_url || null,
  }
}

async function loadStats() {
  const [repo, release] = await Promise.all([
    githubJson("/repos/vindeckyy/OpenBoxGL"),
    githubJson("/repos/vindeckyy/OpenBoxGL/releases/latest"),
  ])
  const appimage = release.assets?.find((a) => a.name === "OpenBox-x86_64.AppImage")
  return {
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    open_issues: repo.open_issues_count ?? 0,
    license: repo.license?.spdx_id || null,
    latest_release: release.tag_name || null,
    appimage_downloads: appimage?.download_count ?? 0,
  }
}

// ---------------------------------------------------------------------------
// RSS from the changelog markdown

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

async function loadRss() {
  const md = await readFile(join(ROOT, "content", "docs", "changelog.md"), "utf8")
  const items = []
  for (const line of md.split("\n")) {
    const m = line.match(/^## (.+?)\s*\((\d{4}-\d{2}-\d{2})\)/)
    if (!m) continue
    items.push({
      title: `OpenBox ${m[1]}`,
      date: new Date(m[2]).toUTCString(),
      slug: m[1].replace(/\s+/g, "-").toLowerCase(),
    })
  }
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>OpenBox changelog</title>
  <link>https://openboxgl.github.io/changelog/</link>
  <description>Release notes for OpenBox, the local-first game library and launcher for Linux.</description>
  ${items
    .map(
      (i) => `  <item>
    <title>${escapeXml(i.title)}</title>
    <link>https://openboxgl.github.io/changelog/</link>
    <guid isPermaLink="false">openbox-${escapeXml(i.slug)}</guid>
    <pubDate>${i.date}</pubDate>
  </item>`,
    )
    .join("\n")}
</channel>
</rss>
`
  return rss
}

// ---------------------------------------------------------------------------
// Feedback (rate limited, JSONL storage)

const feedbackBuckets = new Map()
const FEEDBACK_LIMIT = 8 // posts per window
const FEEDBACK_WINDOW_MS = 10 * 60 * 1000
const FEEDBACK_MAX_LEN = 2000

async function recordFeedback(ip, payload) {
  const now = Date.now()
  const bucket = feedbackBuckets.get(ip) || { count: 0, resetAt: 0 }
  if (bucket.resetAt < now) {
    bucket.count = 0
    bucket.resetAt = now + FEEDBACK_WINDOW_MS
  }
  if (bucket.count >= FEEDBACK_LIMIT) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  bucket.count += 1
  feedbackBuckets.set(ip, bucket)

  const text = String(payload.message || "").slice(0, FEEDBACK_MAX_LEN).trim()
  if (!text) return { ok: false, error: "empty message" }
  const record = {
    at: new Date().toISOString(),
    ip,
    page: String(payload.page || "").slice(0, 500),
    contact: String(payload.contact || "").slice(0, 500),
    message: text,
  }
  await mkdir(DATA_DIR, { recursive: true })
  await appendFile(join(DATA_DIR, "feedback.jsonl"), JSON.stringify(record) + "\n", "utf8")
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Static file serving

async function serveStatic(res, pathname) {
  let rel = decodeURIComponent(pathname)
  if (rel === "/") rel = "/index.html"
  else if (rel.endsWith("/")) rel += "index.html"
  let file = normalize(join(OUT_DIR, rel))
  // Path containment: never serve above out/.
  if (!file.startsWith(OUT_DIR + sep) && file !== join(OUT_DIR, "index.html")) {
    res.writeHead(403).end("forbidden")
    return
  }
  let st
  try {
    st = await stat(file)
  } catch {
    // Clean 404 for unknown paths, or the custom 404 page if present.
    const notFound = join(OUT_DIR, "404.html")
    try {
      st = await stat(notFound)
      file = notFound
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("not found")
      return
    }
  }
  const type = MIME[extname(file)] || "application/octet-stream"
  const headers = {
    "Content-Type": type,
    "Content-Length": st.size,
  }
  if (/\.(png|jpg|jpeg|webp|gif|svg|woff|woff2|mp4|webm)$/.test(file)) {
    headers["Cache-Control"] = "public, max-age=86400"
  } else {
    headers["Cache-Control"] = "public, max-age=3600"
  }
  res.writeHead(200, headers)
  createReadStream(file).pipe(res)
}

// ---------------------------------------------------------------------------
// Router

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`)
  const pathname = url.pathname
  const ip = req.socket.remoteAddress || "unknown"

  try {
    // API
    if (pathname === "/api/health" && req.method === "GET") {
      sendJson(res, 200, { ok: true, version: VERSION, uptime: Math.round((Date.now() - STARTED) / 1000) })
      return
    }

    if (pathname === "/api/search" && req.method === "GET") {
      const q = url.searchParams.get("q") || ""
      if (!q.trim()) {
        sendJson(res, 200, { query: q, results: [], total: 0 })
        return
      }
      const entries = await loadSearchIndex()
      const results = searchDocs(entries, q)
      sendJson(res, 200, { query: q, results, total: results.length })
      return
    }

    if (pathname === "/api/release" && req.method === "GET") {
      try {
        const release = await cached("release", 15 * 60 * 1000, loadRelease)
        sendJson(res, 200, release)
      } catch (e) {
        sendJson(res, 502, { error: "release unavailable", detail: String(e.message || e) })
      }
      return
    }

    if (pathname === "/api/stats" && req.method === "GET") {
      try {
        const stats = await cached("stats", 60 * 60 * 1000, loadStats)
        sendJson(res, 200, stats)
      } catch (e) {
        sendJson(res, 502, { error: "stats unavailable", detail: String(e.message || e) })
      }
      return
    }

    if (pathname === "/api/changelog.rss" && req.method === "GET") {
      const rss = await loadRss()
      res.writeHead(200, {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      })
      res.end(rss)
      return
    }

    if (pathname === "/api/feedback" && req.method === "POST") {
      let payload
      try {
        payload = await readJsonBody(req)
      } catch (e) {
        sendJson(res, 400, { error: String(e.message || e) })
        return
      }
      // Honeypot: a real browser form never fills this field.
      if (payload && payload._token) {
        res.writeHead(204).end()
        return
      }
      const result = await recordFeedback(ip, payload)
      if (result.ok) {
        sendJson(res, 201, { ok: true })
      } else if (result.retryAfterSec) {
        sendJson(res, 429, { error: "rate limited", retry_after: result.retryAfterSec })
      } else {
        sendJson(res, 400, { error: result.error || "bad request" })
      }
      return
    }

    // Static files
    if (req.method === "GET" || req.method === "HEAD") {
      await serveStatic(res, pathname)
      return
    }

    sendJson(res, 405, { error: "method not allowed" })
  } catch (e) {
    sendJson(res, 500, { error: "internal error", detail: String(e.message || e) })
  }
})

server.listen(PORT, HOST, () => {
  console.log(`OpenBox docs site listening on http://${HOST}:${PORT}`)
})
