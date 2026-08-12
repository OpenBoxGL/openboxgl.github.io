// Generates static redirect stub pages in out/ for URLs that Next.js
// static export cannot redirect (redirects are server-only).
// Writes <meta http-equiv="refresh"> pages matching the old Astro site's
// root→guide redirects, preserving link continuity.
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");

const REDIRECTS = [
  ["library", "/guides/library/"],
  ["importing", "/guides/library/importing/"],
  ["organizing", "/guides/library/organizing/"],
  ["queue-tags-notifications", "/guides/library/queue-tags-notifications/"],
  ["metadata-and-media", "/guides/metadata-and-media/"],
  ["emulators-and-launching", "/guides/emulators-and-launching/"],
  ["big-box-and-handhelds", "/guides/big-box-and-handhelds/"],
  ["handheld-performance", "/guides/big-box-and-handhelds/performance/"],
  ["sessions-saves-and-backups", "/guides/sessions-saves-and-backups/"],
  ["troubleshooting", "/guides/troubleshooting/"],
  ["retroachievements", "/guides/retroachievements/"],
  ["plugins", "/guides/plugins/"],
  ["discovery", "/guides/discovery/"],
  ["storefront-manager", "/guides/storefront-manager/"],
  ["media-providers", "/guides/media-providers/"],
  ["search-syntax", "/reference/search-syntax/"],
];

for (const [slug, destination] of REDIRECTS) {
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  const title = slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${destination}">
<title>${title} — OpenBox Docs</title>
<link rel="canonical" href="https://openboxgl.github.io${destination}">
</head>
<body>
<p>Redirecting to <a href="${destination}">${title}</a>…</p>
</body>
</html>
`,
  );
}

console.log(`Wrote ${REDIRECTS.length} redirect stubs to ${OUT}`);
