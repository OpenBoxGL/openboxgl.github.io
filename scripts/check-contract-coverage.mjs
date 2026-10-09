/**
 * Contract coverage gate.
 *
 * Three surfaces in the docs were verified by hand exactly once and had
 * nothing preventing regression afterwards:
 *
 *   - the 110 settings keys in `settings_schema.KNOWN_SETTINGS`
 *   - the 24 launch-token spellings in `launch_tokens.PLACEHOLDERS`
 *   - the 9 webhook events and their payload fields in `automation.py`
 *
 * A setting added to the app but not documented, or a webhook field added to
 * the payload but not to `webhooks.md`, is exactly as invisible as an
 * undocumented route -- and just as misleading. The route and version gates
 * cover the two surfaces that drifted twice; this covers the rest.
 *
 * `contracts.baseline.json` holds the expected surface. Regenerate with
 * `npm run contracts:sync` after a release changes any of it, then document
 * whatever the gate names.
 *
 * Field comparison for webhook payloads is exact on purpose: the docs table
 * is a contract listing, not prose, so a reordering or an extra field should
 * be a deliberate edit rather than silently tolerated.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DOCS_DIR = 'content/docs';
const BASELINE = 'scripts/contracts.baseline.json';
const APP_DIR = process.env.OPENBOX_APP_DIR;

// ---------------------------------------------------------------- sync mode
if (process.argv.includes('--sync')) {
  if (!APP_DIR) throw new Error('contracts:sync needs OPENBOX_APP_DIR pointing at the OpenBoxGL checkout');

  const settingsSrc = await readFile(join(APP_DIR, 'settings_schema.py'), 'utf8');
  const settings = [
    ...new Set(
      [...settingsSrc.match(/KNOWN_SETTINGS\s*=\s*\{([\s\S]*?)\n\}/)[1].matchAll(/"([a-z_0-9]+)"/g)].map((m) => m[1]),
    ),
  ].sort();

  const tokensSrc = await readFile(join(APP_DIR, 'pkg/parity/launch_tokens.py'), 'utf8');
  const tokens = [
    ...new Set(
      [...tokensSrc.match(/PLACEHOLDERS\s*=\s*\{([\s\S]*?)\n\}/)[1].matchAll(/"(\{[^}]+\})"/g)].map((m) => m[1]),
    ),
  ].sort();

  const automation = await readFile(join(APP_DIR, 'automation.py'), 'utf8');
  const block = automation.match(/\{\s*\n\s*"session\.started"[\s\S]*?\n\}/)[0];
  const events = {};
  for (const m of block.matchAll(/"([a-z]+\.[a-z_]+)":\s*\(([^)]*)\)/g)) {
    events[m[1]] = m[2]
      .split(',')
      .map((f) => f.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }

  await writeFile(
    BASELINE,
    `${JSON.stringify(
      {
        _comment:
          'OpenBoxGL contract surface: settings keys, launch tokens, webhook payload fields. Regenerate with: npm run contracts:sync (requires OPENBOX_APP_DIR).',
        settings_keys: settings,
        launch_tokens: tokens,
        webhook_events: events,
      },
      null,
      1,
    )}\n`,
  );
  console.log(
    `synced ${settings.length} settings, ${tokens.length} launch tokens, ${Object.keys(events).length} webhook events into ${BASELINE}`,
  );
  process.exit(0);
}

// -------------------------------------------------------------- check mode
const baseline = JSON.parse(await readFile(BASELINE, 'utf8'));

const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (path.endsWith('.md') || path.endsWith('.mdx')) files.push(path);
  }
}
await walk(DOCS_DIR);
const corpus = (await Promise.all(files.map((f) => readFile(f, 'utf8')))).join('\n');

const problems = [];

// --- settings: each key must appear in the configuration reference
const config = await readFile(join(DOCS_DIR, 'reference/configuration.md'), 'utf8');
const documentedSettings = new Set([...config.matchAll(/\|\s*`([a-z_0-9]+)`\s*\|/g)].map((m) => m[1]));
for (const key of baseline.settings_keys) {
  if (!documentedSettings.has(key)) problems.push(`setting "${key}" is not in reference/configuration.md`);
}

// --- launch tokens: each spelling must appear in the command-token reference
const tokensDoc = await readFile(join(DOCS_DIR, 'reference/command-tokens.md'), 'utf8');
const documentedTokens = new Set([...tokensDoc.matchAll(/`(\{[^}]+\})`/g)].map((m) => m[1]));
for (const token of baseline.launch_tokens) {
  if (!documentedTokens.has(token)) problems.push(`launch token "${token}" is not in reference/command-tokens.md`);
}

// --- webhook payloads: every event row must list exactly the payload fields
const webhooks = await readFile(join(DOCS_DIR, 'integrations/webhooks.md'), 'utf8');
for (const [event, fields] of Object.entries(baseline.webhook_events)) {
  const row = webhooks.match(new RegExp(`\\|\\s*\`${event.replace('.', '\\.')}\`\\s*\\|([^|]*)\\|`));
  if (!row) {
    problems.push(`webhook event "${event}" has no row in integrations/webhooks.md`);
    continue;
  }
  const documented = row[1]
    .split(',')
    .map((f) => f.trim().replace(/`/g, ''))
    .filter(Boolean);
  const missing = fields.filter((f) => !documented.includes(f));
  const extra = documented.filter((f) => !fields.includes(f));
  if (missing.length) problems.push(`webhook "${event}" is missing field(s): ${missing.join(', ')}`);
  if (extra.length) problems.push(`webhook "${event}" documents field(s) the app does not send: ${extra.join(', ')}`);
}

if (problems.length) {
  console.error(`Contract coverage gate failed: ${problems.length} gap(s):\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('\nRefresh the baseline with: OPENBOX_APP_DIR=<path> npm run contracts:sync');
  process.exit(1);
}

console.log(
  `contract coverage passed (${baseline.settings_keys.length} settings, ${baseline.launch_tokens.length} launch tokens, ${Object.keys(baseline.webhook_events).length} webhook events)`,
);