import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { requiredRoutes } from './required-routes.mjs';

const root = 'out';
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.html')) files.push(path);
  }
}
await walk(root);

const routeForFile = (file) => {
  const path = relative(root, file).replace(/\\/g, '/');
  return path === 'index.html' ? '/' : `/${path.replace(/\/index\.html$/, '')}/`;
};
const routeForPath = (pathname) => {
  const decoded = decodeURIComponent(pathname || '/');
  return decoded === '/' ? '/' : `/${decoded.replace(/^\/+|\/+$/g, '')}/`;
};
const routes = new Set(files.map(routeForFile));

for (const route of requiredRoutes) {
  if (!routes.has(route)) throw new Error(`missing required route ${route}`);
}

// Static export redirect stubs carry no real content; skip them and the
// Next.js not-found pages when validating titles and images.
const isStub = (html) => html.includes('http-equiv="refresh"');
const titles = new Set();
const pages = new Map();
for (const file of files) {
  if (file.endsWith('404.html')) continue;
  if (file.includes('_not-found') || file.includes('/404/')) continue;
  const html = await readFile(file, 'utf8');
  const route = routeForFile(file);
  const stub = isStub(html);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  pages.set(route, { file, html, ids, stub });
  if (stub) continue;
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  if (!title) throw new Error(`missing title in ${file}`);
  if (titles.has(title)) throw new Error(`duplicate title ${title}`);
  titles.add(title);
  for (const img of html.matchAll(/<img[^>]*>/g)) {
    const src = img[0].match(/src="([^"]*)"/)?.[1] ?? '';
    const alt = img[0].match(/alt="([^"]*)"/)?.[1] ?? '';
    if (!alt?.trim()) throw new Error(`image without alt in ${file}: ${src}`);
  }
}

// Validate same-site fragments against the IDs in the built target page. The
// route gate above cannot catch a typo after a valid page path, so keep this
// check next to it as part of every local and CI build.
for (const [route, page] of pages) {
  if (page.stub) continue;
  for (const match of page.html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const href = match[1];
    if (!href.includes('#')) continue;
    let target;
    try {
      target = new URL(href, `https://openbox.local${route}`);
    } catch {
      continue;
    }
    if (target.origin !== 'https://openbox.local' || !target.hash.slice(1)) continue;
    const targetRoute = routeForPath(target.pathname);
    const targetPage = pages.get(targetRoute);
    if (!targetPage || targetPage.stub) continue;
    const fragment = decodeURIComponent(target.hash.slice(1));
    if (!targetPage.ids.has(fragment)) {
      throw new Error(`missing fragment #${fragment} in ${targetRoute} (linked from ${route})`);
    }
  }
}
console.log(`verified ${files.length} HTML pages and ${routes.size} routes`);
