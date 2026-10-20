/**
 * MDX compile gate.
 *
 * `next build` compiles the docs pages one at a time and stops at the first
 * page that fails to parse. A single stray `<` in a paragraph therefore
 * disables every gate that runs after the build: the link check, the route
 * check, and the sitemap check. That is not theoretical — four pages with raw
 * angle brackets outside a code span broke the build while the version,
 * contract, and coverage gates all reported success.
 *
 * This gate compiles every page on its own, so it names every broken page at
 * once and fails before the build starts.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';

const DOCS_DIR = 'content/docs';

const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) files.push(path);
  }
}
await walk(DOCS_DIR);

const problems = [];
for (const file of files) {
  const source = await readFile(file, 'utf8');
  // The frontmatter is metadata, not MDX; the site strips it before compiling.
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  try {
    await compile(body, { remarkPlugins: [remarkGfm] });
  } catch (error) {
    problems.push({ file, message: error.message });
  }
}

if (problems.length) {
  for (const problem of problems) {
    console.error(`MDX error in ${problem.file}:\n  ${problem.message}\n`);
  }
  throw new Error(`${problems.length} docs page(s) failed to compile`);
}

console.log(`mdx compile passed (${files.length} pages)`);
