#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');
const failures = [];
const tmp = mkdtempSync(join(tmpdir(), 'tiinex-public-'));
const out = join(tmp, 'site');
function fail(msg) { failures.push(msg); }
function read(p) { return readFileSync(p, 'utf8'); }
try {
  const build = spawnSync(process.execPath, ['tools/build-public.mjs', '--out', out], { cwd: root, encoding: 'utf8' });
  if (build.status !== 0) fail(build.stderr || build.stdout);
  for (const required of ['index.html', 'src/main.js', 'src/artifacts/fixtures/topic.trace.md', 'src/artifacts/fixtures/unknown-schema.trace.md', 'src/schemas/root.schema.json', 'src/audit/audit.run.js', 'src/workspaces/workspace.model.js', 'src/sources/source.boundaries.js', 'docs/architecture/audit-ownership.md', 'docs/architecture/verse.md', 'src/verses/contracts.js', 'src/verses/registry.js', 'README.md', 'llms.txt', 'tiinex.build.json', '.nojekyll']) {
    if (!existsSync(join(out, required))) fail(`Missing public output: ${required}`);
  }
  for (const forbidden of ['.old', '.git', 'node_modules', '.site-publish', 'desktop.ini', 'src/leaflets']) {
    if (existsSync(join(out, forbidden))) fail(`Public output must not contain ${forbidden}`);
  }
  const html = existsSync(join(out, 'index.html')) ? read(join(out, 'index.html')) : '';
  if (html.includes('app.js')) fail('Fresh public index must not reference legacy app.js');
  if (!html.includes('./src/main.js')) fail('Fresh public index must load src/main.js');
  const main = existsSync(join(out, 'src/main.js')) ? read(join(out, 'src/main.js')) : '';
  if (!main.includes('parseArtifactMarkdown')) fail('Fresh public runtime must include artifact parser demo');
  if (!main.includes('root-fallback')) fail('Fresh public runtime must disclose root fallback');
  if (!main.includes('renderArtifactCard')) fail('Fresh public runtime must render artifact cards');
  if (!main.includes('data-reader')) fail('Fresh public runtime must expose reader density controls');
  if (!main.includes('workspace-state')) fail('Fresh public runtime must render workspace state');
  if (!main.includes('no local→github guess')) fail('Fresh public runtime must preserve source boundary disclosure');
  if (!main.includes('data-verse')) fail('Fresh public runtime must expose Feed/Tree Verse controls');
  if (!main.includes('renderFeedVerse') || !main.includes('renderTreeVerse')) fail('Fresh public runtime must render Feed and Tree Verse parity');
if (!main.includes('tx-workspace-window')) fail('Fresh public runtime must render Tiinex workspace window frame');
if (!main.includes('tx-source-strip')) fail('Fresh public runtime must render source row/strip');
if (!main.includes('tx-mode-strip')) fail('Fresh public runtime must render mode row/strip');
if (!main.includes('tx-primary-stage')) fail('Fresh public runtime must make Feed/Tree the primary workspace stage');
  if (html.includes('type="module"') || html.includes("type='module'")) fail('Fresh public index must be file-local safe and not use ES module startup');
  const identityPath = join(out, 'tiinex.build.json');
  if (existsSync(identityPath)) {
    const identity = JSON.parse(read(identityPath));
    if (identity.type !== 'tiinex.public.build.identity.v1') fail('Missing public build identity type');
  }
  if (failures.length) {
    console.error(failures.map((f) => `- ${f}`).join('\n'));
    process.exit(1);
  }
  console.log('✓ public build is fresh-shell clean');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
