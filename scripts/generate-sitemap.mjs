// Writes out/sitemap.xml from the built HTML pages, excluding redirect stubs
// and not-found pages. Run after `next build && node scripts/generate-redirects.mjs`.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = 'out';
const BASE = 'https://openboxgl.github.io';
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.html')) files.push(path);
  }
}
await walk(ROOT);

const urls = [];
for (const file of files) {
  if (file.endsWith('404.html')) continue;
  if (file.includes('_not-found') || file.includes('/404/')) continue;
  const html = await readFile(file, 'utf8');
  if (html.includes('http-equiv="refresh"')) continue;
  const path = relative(ROOT, file).replace(/\\/g, '/');
  const route = path === 'index.html' ? '/' : `/${path.replace(/\/index\.html$/, '')}/`;
  urls.push(route);
}

urls.sort();
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${BASE}${u}</loc></url>`).join('\n')}
</urlset>
`;
await writeFile(join(ROOT, 'sitemap.xml'), xml);
console.log(`wrote sitemap.xml with ${urls.length} URLs`);
