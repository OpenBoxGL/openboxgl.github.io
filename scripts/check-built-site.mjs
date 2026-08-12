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

const routes = new Set(
  files.map((file) => {
    const path = relative(root, file).replace(/\\/g, '/');
    return path === 'index.html' ? '/' : `/${path.replace(/\/index\.html$/, '')}/`;
  }),
);

for (const route of requiredRoutes) {
  if (!routes.has(route)) throw new Error(`missing required route ${route}`);
}

// Static export redirect stubs carry no real content; skip them and the
// Next.js not-found pages when validating titles and images.
const isStub = (html) => html.includes('http-equiv="refresh"');
const titles = new Set();
for (const file of files) {
  if (file.endsWith('404.html')) continue;
  if (file.includes('_not-found') || file.includes('/404/')) continue;
  const html = await readFile(file, 'utf8');
  if (isStub(html)) continue;
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
console.log(`verified ${files.length} HTML pages and ${routes.size} routes`);
