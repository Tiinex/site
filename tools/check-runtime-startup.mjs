#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const tmp = mkdtempSync(join(tmpdir(), 'tiinex-runtime-'));
const out = join(tmp, 'site');
const failures = [];
function read(file) { return readFileSync(file, 'utf8'); }
function findJs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = join(dir, entry.name);
    return entry.isDirectory() ? findJs(p) : (p.endsWith('.js') ? [p] : []);
  });
}
try {
  const build = spawnSync(process.execPath, ['tools/build-public.mjs', '--out', out], { cwd: root, encoding: 'utf8' });
  if (build.status !== 0) failures.push(build.stderr || build.stdout || 'Vite React build failed');
  const html = existsSync(join(out, 'index.html')) ? read(join(out, 'index.html')) : '';
  const js = findJs(join(out, 'assets')).map(read).join('\n');
  if (!html.includes('type="module"')) failures.push('React startup did not produce module entry');
  for (const needle of [
    'Every handoff starts somewhere',
    'react-v174-lineage-presentation-parity',
    'tx-centered-dock-core',
    'tx-empty-stage',
    'UC-001-empty-create-local-workspace',
    'create-workspace-form'
  ]) if (!js.includes(needle)) failures.push(`React startup bundle missing ${needle}`);
  if (js.includes('Create your first workspace')) failures.push('React startup bundle contains onboarding-card copy');
  if (failures.length) {
    console.error(failures.map((f) => `- ${f}`).join('\n'));
    process.exit(1);
  }
  console.log('✓ React runtime startup bundle smoke passed');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
