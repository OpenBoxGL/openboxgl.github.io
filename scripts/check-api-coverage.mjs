/**
 * API coverage gate.
 *
 * The largest gap in the original audit was eight `/api/v2/launch/*` routes
 * that shipped in 1.16 with no documentation anywhere. That was found by hand.
 * Nothing prevented the next batch of routes from shipping the same way, or
 * prevented a documented route from quietly disappearing from the app.
 *
 * This closes both directions. `api-routes.baseline.json` is the app's route
 * table; every route in it must appear in content/docs, and every API path the
 * docs mention must exist in the baseline. A new route undocumented fails the
 * build; a documented route that no longer exists fails it too.
 *
 * Matching is deliberately prefix-based on path segments rather than exact.
 * The docs document a family (`/api/v2/launch/audit`) without enumerating
 * every member, which is how a human writes reference docs; requiring an exact
 * literal per route would push the site toward generated-looking tables.
 *
 * Run `npm run routes:sync` with OPENBOX_APP_DIR pointing at the OpenBoxGL
 * checkout to refresh the baseline after a release adds or removes routes.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DOCS_DIR = 'content/docs';
const BASELINE = 'scripts/api-routes.baseline.json';
const APP_DIR = process.env.OPENBOX_APP_DIR;

// ---------------------------------------------------------------- sync mode
if (process.argv.includes('--sync')) {
  if (!APP_DIR) throw new Error('routes:sync needs OPENBOX_APP_DIR pointing at the OpenBoxGL checkout');
  const found = new Set();

  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === '.venv' || entry.name === 'node_modules' || entry.name === '__pycache__') continue;
        await walk(path);
      } else if (entry.name.endsWith('.py') && !path.includes('/tests/')) {
        const text = await readFile(path, 'utf8');
        const re = /@route\(\s*"([A-Z]+)"\s*,\s*(\[[^\]]*\]|"[^"]*")/gs;
        for (const m of text.matchAll(re)) {
          // m[1] is the method, m[2] the path specifier (a quoted string or a
          // one-element list of quoted paths).
          for (const q of m[2].matchAll(/"([^"]+)"/g)) {
            if (q[1].startsWith('/api')) found.add(`${m[1]} ${q[1]}`);
          }
        }
      }
    }
  }
  await walk(APP_DIR);

  const keys = [...found].sort();
  const payload = {
    _comment:
      'Authoritative OpenBoxGL HTTP route table, derived from @route decorators. Regenerate with: npm run routes:sync (requires OPENBOX_APP_DIR).',
    count: keys.length,
    routes: keys.map((k) => ({ method: k.split(' ')[0], path: k.slice(k.indexOf(' ') + 1) })),
  };
  await writeFile(BASELINE, `${JSON.stringify(payload, null, 1)}\n`);
  console.log(`synced ${keys.length} routes into ${BASELINE}`);
  process.exit(0);
}

// -------------------------------------------------------------- check mode
const baseline = JSON.parse(await readFile(BASELINE, 'utf8'));
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) files.push(path);
  }
}
await walk(DOCS_DIR);

const docs = (await Promise.all(files.map(async (f) => [f, await readFile(f, 'utf8')])));

// Normalize `{param}` placeholders: docs and source must agree on shape.
// Also fold the legacy alias. `routes.py` serves every `/api/<path>` under
// `/api/v1/<path>` as well (`_apply_v1_aliases`, plus a dispatch-time
// fallback), so the docs may legitimately name either form.
const shape = (p) =>
  p
    .replace(/\{[^}]+\}/g, '{}')
    .replace(/\/+$/, '')
    .replace(/^\/api\/v1(?=\/)/, '/api');

/** API paths in one document. Anchored so `/reference/api/x/` is not read as `/api/x`. */
function apiPaths(text) {
  const out = [];
  for (const m of text.matchAll(/(?:^|[^A-Za-z0-9_\-/])(\/api\/[A-Za-z0-9_\-/{}.]+)/g)) {
    const raw = m[1].replace(/[.,;:`)\]*]+$/, '').replace(/\/+$/, '');
    // A bare `/api`, `/api/v1`, or a `/api/v1/*` glob is a namespace mention
    // ("the frozen /api/v1 contract"), not a route. Test the raw text: after
    // normalization `/api/v1` is indistinguishable from `/api/diagnostic`.
    if (/^\/api(?:\/v1)?$/.test(raw)) continue;
    out.push(shape(raw));
  }
  return out;
}

/**
 * Does the docs corpus name this route?
 *
 * The forward direction deliberately requires an *exact* mention. An earlier
 * draft treated any parent path as covering its members, which meant a single
 * stray reference to `/api/v2/launch` marked the whole family documented -- and
 * the gate then passed against the real pre-fix tree, where eight launch routes
 * shipped undocumented. A route a reader cannot find by name is not documented.
 *
 * The reverse direction keeps the parent-covers-child rule, because listing a
 * family (`/api/v2/launch/audit`) genuinely does describe its members.
 */
function isDocumented(path) {
  const target = shape(path);
  for (const found of allDocPaths) if (found === target) return true;
  return false;
}

const allDocPaths = new Set(docs.flatMap(([, text]) => apiPaths(text)));

const undocumented = baseline.routes.filter((r) => !isDocumented(r.path)).map((r) => `${r.method} ${r.path}`);

// Reverse direction: an API path the docs promise that no longer exists.
const known = baseline.routes.map((r) => shape(r.path));
const phantom = new Set();
for (const [file, text] of docs) {
  for (const p of apiPaths(text)) {
    // A documented family covers its members.
    if (known.some((k) => p === k || p.startsWith(`${k}/`) || k.startsWith(`${p}/`))) continue;
    phantom.add(`${p}  (${file})`);
  }
}

if (undocumented.length || phantom.size) {
  if (undocumented.length) {
    console.error(`API coverage: ${undocumented.length} route(s) shipped without documentation:\n`);
    for (const r of undocumented) console.error(`  ${r}`);
  }
  if (phantom.size) {
    console.error(`\nAPI coverage: ${phantom.size} documented path(s) match no route in the baseline:\n`);
    for (const p of [...phantom].sort()) console.error(`  ${p}`);
  }
  console.error('\nRefresh the baseline with: OPENBOX_APP_DIR=<path> npm run routes:sync');
  process.exit(1);
}

console.log(`api coverage passed (${baseline.routes.length} routes, ${files.length} docs pages)`);