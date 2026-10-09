/**
 * Version-currency gate.
 *
 * The docs claimed 1.15.0 while the app shipped 1.16.1 for two releases. The
 * stale references were not all the same shape: they appeared as installer
 * variable assignments, release-tag URLs, published asset filenames, an
 * OPENBOX_RELEASE_TAG, a comparison-table header, and plain prose. Sweeping
 * for one shape at a time is how they survived, so this checks every shape.
 *
 * Rather than flagging old versions and trying to exempt the history -- which
 * drowns in false positives, because almost every version in a changelog is
 * legitimately old -- this inverts: a version literal is checked only where it
 * *claims to be current*. Prose like "added in v1.14.0" or "as of 1.13.0" is
 * history and is never examined, so the gate stays quiet on correct content.
 *
 * "Current" is derived from the newest `## X.Y.Z` heading in the changelog, so
 * adding the next release's changelog entry is what arms the gate: it then
 * names every place still asserting an older release, and the build fails
 * until they agree.
 *
 * With OPENBOX_RELEASE_REPO set, documented release assets are additionally
 * checked against the real release, because a stale asset name is a dead link
 * rather than merely a wrong number.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DOCS_DIR = 'content/docs';
const CHANGELOG = 'content/docs/changelog.md';
const CURRENT_REPO = process.env.OPENBOX_RELEASE_REPO;

const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) files.push(path);
  }
}
await walk(DOCS_DIR);

const V = String.raw`\d+\.\d+\.\d+`;
const parse = (v) => v.split('.').map(Number);
const isOlder = (v, current) => {
  const [a, b] = [parse(v), parse(current)];
  for (let i = 0; i < 3; i += 1) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
};

const changelog = await readFile(CHANGELOG, 'utf8');
const current = changelog.match(/^## (\d+\.\d+\.\d+)/m)?.[1];
if (!current) {
  throw new Error(`no "## X.Y.Z" release heading in ${CHANGELOG}; the gate cannot derive the current version`);
}

// Contexts where a version literal asserts the *current* release. Each entry is
// [name, RegExp] with one capture group around the version.
const CONTEXTS = [
  // A release URL. The changelog's per-section tag links are excluded by caller.
  ['release URL', new RegExp(String.raw`(?:releases/(?:tag|download)/v?|releases/latest,\s*currently v?|/tag/v?)(${V})`, 'g')],
  // A published release asset filename, e.g. OpenBox-1.15.0-sbom.json.
  // The capture group must be the version alone. Wrapping the whole filename
  // put it through parse() as NaN, so this context could never fire.
  [
    'asset filename',
    new RegExp(String.raw`(?:OpenBox-)(${V})(?:-[a-z0-9.]+\.(?:json|zip|AppImage|flatpak|exe))`, 'g'),
  ],
  // Assigned to something the reader runs or sets.
  ['assigned value', new RegExp(String.raw`(?:VERSION\s*=|Version\s*=\s*['"]|RELEASE_TAG\s*=\s*["']v?|-Tag\s+v?|VERSION:\s*)(${V})`, 'g')],
  // Explicit current-release assertions.
  ['claims current', new RegExp(String.raw`(?:currently|current release|current version|is shipping|currently ships|still shipped in the current)\s+(?:is\s+)?v?(${V})`, 'gi')],
  // A comparison table header naming an OpenBox column.
  ['table header', new RegExp(String.raw`^\|\s*(?:Topic|Feature)\s*\|\s*OpenBox\s+(${V})\s*\|`, 'gm')],
];

const problems = [];
const seen = new Set();
for (const file of files) {
  const text = await readFile(file, 'utf8');
  const isChangelog = file.endsWith('changelog.md');
  for (const [name, re] of CONTEXTS) {
    for (const m of text.matchAll(re)) {
      // Each changelog section links to its own release; that is correct.
      if (isChangelog && name === 'release URL') continue;
      const version = m[1];
      if (!isOlder(version, current)) continue;
      const key = `${file}|${name}|${version}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const lineNo = text.slice(0, m.index).split('\n').length;
      problems.push({ file, line: lineNo, name, version, text: text.split('\n')[lineNo - 1].trim().slice(0, 110) });
    }
  }
}

// Optional: prove documented release assets actually exist.
let assetNote = 'skipped (set OPENBOX_RELEASE_REPO to enable)';
if (CURRENT_REPO) {
  const missing = [];
  let assets = [];
  try {
    const res = await fetch(`https://api.github.com/repos/${CURRENT_REPO}/releases/tags/v${current}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'openbox-docs-gate' },
    });
    if (!res.ok) throw new Error(`release lookup returned ${res.status}`);
    assets = (await res.json()).assets.map((a) => a.name);
  } catch (error) {
    assetNote = `release lookup failed (${error.message}); asset names not checked`;
  }
  if (assets.length) {
    const downloads = join(DOCS_DIR, 'downloads.md');
    const text = await readFile(downloads, 'utf8');
    const documented = [...text.matchAll(/^\|\s*`([^`]+)`\s*\|/gm)]
      .map((m) => m[1])
      .filter((n) => /^(OpenBox|install|openbox)/.test(n));
    for (const name of documented) if (!assets.includes(name)) missing.push(name);
    assetNote = missing.length
      ? `${missing.length} documented asset(s) not published in v${current}`
      : `all ${documented.length} documented assets exist in v${current}`;
    // A documented asset the release does not publish is a dead download link,
    // which no other context catches: a *newer* bogus version passes the
    // "is it older than current?" test below, and only this check knows the
    // name is unpublished. Fold these into the failure list.
    for (const name of missing) {
      problems.push({
        file: downloads,
        line: text.split('\n').findIndex((l) => l.includes(`\`${name}\``)) + 1,
        name: 'unpublished asset',
        version: name,
        text: 'documented in the asset table but not published in this release',
      });
    }
  }
}

if (problems.length) {
  console.error(`Version-currency gate failed: current release is ${current}, ${problems.length} stale claim(s):\n`);
  for (const p of problems) console.error(`  ${p.file}:${p.line}  [${p.name}] ${p.version}  ${p.text}`);
  console.error(`\nAssets: ${assetNote}`);
  process.exit(1);
}

console.log(`version currency passed (current ${current}; ${files.length} pages scanned; assets: ${assetNote})`);