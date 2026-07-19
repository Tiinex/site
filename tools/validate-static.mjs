#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');
const failures = [];
function walk(dir) {
  if (!existsSync(dir)) return [];
  let out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.name === 'node_modules' || e.name === '.site-publish') continue;
    if (e.isDirectory()) out = out.concat(walk(p));
    else out.push(p);
  }
  return out;
}
if (!existsSync(join(root, '.old', 'app.js'))) failures.push('.old/app.js legacy reference missing');
const index = readFileSync(join(root, 'index.html'), 'utf8');
if (index.includes('./app.js') || index.includes('src/app/core-runtime.js')) failures.push('index.html must not load legacy runtime');
if (!index.includes('./src/main.js')) failures.push('index.html must load new src/main.js');
if (index.includes('type="module"') || index.includes("type='module'")) failures.push('index.html must be file-local safe and not use ES module startup');
if (!readFileSync(join(root, '.gitignore'), 'utf8').includes('.old/')) failures.push('.old/ must be ignored');
for (const file of walk(root)) {
  if (/desktop\.ini$/i.test(file)) failures.push(`desktop.ini forbidden: ${file}`);
  if (file.includes(`${root}/src/`) && /from ['"]\.\.\/\.old/.test(readFileSync(file, 'utf8'))) failures.push(`src must not import .old: ${file}`);
}
const main = readFileSync(join(root, 'src/main.js'), 'utf8');
if (/^\s*import\s/m.test(main) || /^\s*export\s/m.test(main)) failures.push('src/main.js must remain file-local safe with no import/export startup');
if (!existsSync(join(root, 'src/audit/audit.run.js'))) failures.push('src/audit must own audit operation');
if (!existsSync(join(root, 'src/artifacts/artifact.parse.js'))) failures.push('artifact parser module missing');
if (!existsSync(join(root, 'src/workspaces/workspace.model.js'))) failures.push('workspace model module missing');
if (!existsSync(join(root, 'src/sources/source.boundaries.js'))) failures.push('source boundary module missing');
if (!readFileSync(join(root, 'src/artifacts/artifact.parse.js'), 'utf8').includes('parseArtifactMarkdown')) failures.push('artifact parser must expose parseArtifactMarkdown');
if (!existsSync(join(root, 'src/artifacts/fixtures/topic.trace.md'))) failures.push('topic demo artifact fixture missing');
if (!existsSync(join(root, 'src/artifacts/fixtures/unknown-schema.trace.md'))) failures.push('unknown schema fixture missing');
if (!main.includes('parseArtifactMarkdown')) failures.push('src/main.js must render file-local artifact parser demo');
if (!main.includes('root-fallback')) failures.push('src/main.js must visibly disclose root fallback');
if (!main.includes('renderArtifactCard')) failures.push('src/main.js must render artifact cards from parsed artifacts');
if (!main.includes('data-reader')) failures.push('src/main.js must expose reader density controls');
if (!main.includes('tx-artifact-card')) failures.push('src/main.js must visibly render artifact card surface');
if (!main.includes('workspace-state')) failures.push('src/main.js must render workspace state');
if (!main.includes('no local→github guess')) failures.push('src/main.js must disclose no local to GitHub source guessing');
if (!main.includes('sourceForLocalFile')) failures.push('src/main.js must distinguish local file source boundaries');

if (existsSync(join(root, 'src/schemas/root.audit.presenter.js'))) failures.push('root.audit.presenter.js must not exist; audit is domain-owned');
if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ static source guards passed');
