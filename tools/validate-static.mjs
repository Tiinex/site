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
if (!existsSync(join(root, 'src/verses/contracts.js'))) failures.push('src/verses must own Verse projection contracts');
if (existsSync(join(root, 'src/leaflets'))) failures.push('src/leaflets must not exist; use human-first src/verses');
if (!existsSync(join(root, 'docs/architecture/verse.md'))) failures.push('Verse concept doc missing');
if (!existsSync(join(root, 'docs/architecture/legacy-behavior-reference.md'))) failures.push('Legacy behavior reference discipline doc missing');

if (!existsSync(join(root, 'docs/architecture/ux-ergonomics.md'))) failures.push('UX ergonomics design rule doc missing');
if (!existsSync(join(root, 'docs/architecture/source-settings-and-discovery-controls.md'))) failures.push('source/settings discovery controls doc missing');
if (!existsSync(join(root, 'docs/architecture/multiverse.md'))) failures.push('Multiverse concept doc missing');
if (!existsSync(join(root, 'docs/architecture/interaction-spine.md'))) failures.push('interaction spine concept doc missing');
if (!existsSync(join(root, 'docs/architecture/universe.md'))) failures.push('Universe concept doc missing');
if (!existsSync(join(root, 'src/verses/universe.model.js'))) failures.push('Universe verse model missing');
if (!existsSync(join(root, 'src/verses/universe.project.js'))) failures.push('Universe verse projection missing');
if (!existsSync(join(root, 'src/verses/column/column.model.js'))) failures.push('Column Verse model missing');
if (!existsSync(join(root, 'src/verses/context.js'))) failures.push('Verse context availability model missing');
if (!existsSync(join(root, 'docs/architecture/verse-context-availability.md'))) failures.push('Verse context availability doc missing');
for (const staleVerse of ['node-graph', 'timeline', 'gantt']) {
  if (existsSync(join(root, 'src/verses', staleVerse))) failures.push(`Unimplemented verse directory must not exist: src/verses/${staleVerse}`);
}
if (!existsSync(join(root, 'src/discovery/discovery.controls.js'))) failures.push('discovery controls contract missing');
if (!existsSync(join(root, 'src/source-settings/sourceSettings.model.js'))) failures.push('source settings model missing');
if (!existsSync(join(root, 'src/multiverse/multiverse.model.js'))) failures.push('multiverse concept scaffold missing');
if (!existsSync(join(root, 'src/interaction/interaction.spine.js'))) failures.push('interaction spine scaffold missing');

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
if (!main.includes('data-verse')) failures.push('src/main.js must expose Feed/Tree Verse controls');
if (!main.includes('renderFeedVerse') || !main.includes('renderTreeVerse')) failures.push('src/main.js must render Feed and Tree Verse parity');
if (!main.includes('without changing source truth')) failures.push('src/main.js must disclose Verse source-truth boundary');
if (!main.includes('tx-workspace-window')) failures.push('src/main.js must render Tiinex workspace window frame');
if (!main.includes('tx-source-strip')) failures.push('src/main.js must render source row/strip');
if (!main.includes('tx-mode-strip')) failures.push('src/main.js must render mode row/strip');
if (!main.includes('tx-primary-stage')) failures.push('src/main.js must make Feed/Tree the primary workspace stage');
if (!main.includes('data-run-audit')) failures.push('src/main.js must expose explicit audit load-all command');
if (!main.includes('runWorkspaceAudit')) failures.push('src/main.js must implement loaded-workspace audit skeleton');
if (!main.includes('open-parent-boundary')) failures.push('src/main.js must mark missing lineage as open parent boundaries');
if (!main.includes('Legacy lesson')) failures.push('src/main.js must preserve legacy audit behavior lessons visibly');

if (!main.includes('workspace-search')) failures.push('src/main.js must expose in-memory workspace search');
if (!main.includes('data-source-filter')) failures.push('src/main.js must expose source filter controls');
if (!main.includes('UX should clarify through layout')) failures.push('src/main.js must carry v90 ergonomic control rule');
if (!main.includes('renderDiscoveryIconBar')) failures.push('src/main.js must render compact discovery icon controls');
if (!main.includes('tx-action-spine')) failures.push('src/main.js must render interaction spine');
if (!main.includes('data-task')) failures.push('src/main.js must expose task spine controls');
if (!main.includes('tx-scaffold-action')) failures.push('src/main.js must visually mark scaffold actions');
if (!main.includes('renderUniverse')) failures.push('src/main.js must render Universe entry verse');
if (!main.includes('Column Verse')) failures.push('src/main.js must default to Column Verse continuity');
if (!main.includes('first multiverse')) failures.push('src/main.js must disclose first Multiverse entry');
if (!main.includes('plannedVerseContexts')) failures.push('src/main.js must carry planned Verse contexts without exposing them as primary ready actions');
if (main.includes('Node Graph Verse') || main.includes('Zoomable Multiverse')) failures.push('src/main.js must not show stale future verses as primary UI');


if (existsSync(join(root, 'src/schemas/root.audit.presenter.js'))) failures.push('root.audit.presenter.js must not exist; audit is domain-owned');
if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ static source guards passed');
