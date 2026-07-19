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
  for (const required of ['index.html', 'src/main.js', 'src/artifacts/fixtures/topic.trace.md', 'src/artifacts/fixtures/unknown-schema.trace.md', 'src/schemas/root.schema.json', 'src/audit/audit.run.js', 'src/workspaces/workspace.model.js', 'src/sources/source.boundaries.js', 'docs/architecture/audit-ownership.md', 'docs/architecture/verse.md', 'src/verses/contracts.js', 'src/verses/registry.js', 'src/discovery/discovery.controls.js', 'src/source-settings/sourceSettings.model.js', 'src/multiverse/multiverse.model.js', 'src/interaction/interaction.spine.js', 'docs/architecture/ux-ergonomics.md', 'docs/architecture/source-settings-and-discovery-controls.md', 'docs/architecture/multiverse.md', 'docs/architecture/interaction-spine.md', 'docs/architecture/universe.md', 'src/verses/universe.model.js', 'src/verses/universe.project.js', 'src/verses/column/column.model.js', 'src/verses/context.js', 'docs/architecture/verse-context-availability.md', 'docs/architecture/map-and-atlas.md', 'docs/architecture/desktop-verse-note.md', 'docs/architecture/visual-continuity.md', 'docs/architecture/mobile-transport-lessons.md', 'docs/architecture/adapters-and-renderers.md', 'docs/architecture/icon-polish-and-column-fit.md', 'README.md', 'llms.txt', 'tiinex.build.json', 'tiinex.bundle.css', 'tiinex.bundle.js', '.nojekyll']) {
    if (!existsSync(join(out, required))) fail(`Missing public output: ${required}`);
  }
  for (const forbidden of ['.old', '.git', 'node_modules', '.site-publish', 'desktop.ini', 'src/leaflets', 'src/verses/node-graph', 'src/verses/timeline', 'src/verses/gantt', 'src/adapters/leaflet', 'src/adapters/d3', 'src/adapters/canvas', 'src/adapters/webgl', 'src/adapters/renderer']) {
    if (existsSync(join(out, forbidden))) fail(`Public output must not contain ${forbidden}`);
  }
  const html = existsSync(join(out, 'index.html')) ? read(join(out, 'index.html')) : '';
  if (html.includes('app.js')) fail('Fresh public index must not reference legacy app.js');
  if (!html.includes('./tiinex.bundle.js')) fail('Fresh public index must load bundled tiinex.bundle.js');
  if (!html.includes('./tiinex.bundle.css')) fail('Fresh public index must load bundled tiinex.bundle.css');
  const main = existsSync(join(out, 'tiinex.bundle.js')) ? read(join(out, 'tiinex.bundle.js')) : '';
  if (existsSync(join(out, 'src/main.js'))) {
    const sourceMain = read(join(out, 'src/main.js'));
    if (!sourceMain.includes('parseArtifactMarkdown')) fail('Auditable source copy must still contain src/main.js parser');
  }
  if (!main.includes('parseArtifactMarkdown')) fail('Fresh public runtime must include artifact parser demo');
  if (!main.includes('root-fallback')) fail('Fresh public runtime must disclose root fallback');
  if (!main.includes('renderArtifactCard')) fail('Fresh public runtime must render artifact cards');
  if (!main.includes('data-reader')) fail('Fresh public runtime must expose reader density controls');
  if (!main.includes('workspace-state')) fail('Fresh public runtime must render workspace state');
  if (!main.includes('no local→github guess')) fail('Fresh public runtime must preserve source boundary disclosure');
  if (!main.includes('data-pane-verse')) fail('Fresh public runtime must expose workspace-scoped Feed/Tree controls');
  if (!main.includes('renderFeedVerse') || !main.includes('renderTreeVerse')) fail('Fresh public runtime must render Feed and Tree Verse parity');
if (!main.includes('tx-workspace-window')) fail('Fresh public runtime must render Tiinex workspace window frame');
if (!main.includes('tx-source-strip')) fail('Fresh public runtime must render source row/strip');
if (!main.includes('tx-mode-strip')) fail('Fresh public runtime must render mode row/strip');
if (!main.includes('tx-primary-stage')) fail('Fresh public runtime must make Feed/Tree the primary workspace stage');
if (!main.includes('workspace-search')) fail('Fresh public runtime must expose workspace search');
if (!main.includes('data-source-filter')) fail('Fresh public runtime must expose source filter controls');
if (!main.includes('UX should clarify through layout')) fail('Fresh public runtime must carry v90 ergonomic control rule');
if (!main.includes('tx-action-spine')) fail('Fresh public runtime must preserve interaction spine contract');
if (!main.includes('tx-shell-visual-continuity')) fail('Fresh public runtime must render focused window continuity shell');
if (!main.includes('tx-shell-pattern-parity')) fail('Fresh public runtime must render v103 pattern parity shell');
if (!main.includes('tx-shell-legibility-corrected')) fail('Fresh public runtime must render v103 legibility-corrected shell');
if (!main.includes('tx-shell-height-continuity')) fail('Fresh public runtime must render old Tiinex.dev scroll ownership shell');
if (!main.includes('tx-shell-scroll-owned')) fail('Fresh public runtime must prevent page-level multiverse scroll');
if (!main.includes('tx-shell-column-fit')) fail('Fresh public runtime must render v103 Column fit shell');
if (!main.includes('tx-shell-icon-polish')) fail('Fresh public runtime must render v103 icon polish shell');
if (!main.includes('tx-shell-audit-status-parity')) fail('Fresh public runtime must render v103 audit/status parity shell');
if (!main.includes('Lineage root reached.')) fail('Fresh public runtime must preserve compact lineage terminal row');
if (!main.includes('audit-banner')) fail('Fresh public runtime must expose compact audit banner host');
if (!main.includes("activePane: 'site'")) fail('Fresh public runtime must default to the Tiinex/site pane');
if (!main.includes('v103 audit parity')) fail('Fresh public runtime must disclose v103 audit/status parity scope');
if (!main.includes('data-task')) fail('Fresh public runtime must expose task spine controls');
if (!main.includes('tx-scaffold-action')) fail('Fresh public runtime must visually mark scaffold actions');
if (!main.includes('renderUniverse')) fail('Fresh public runtime must render Universe entry verse');
if (!main.includes('Column Verse')) fail('Fresh public runtime must default to Column Verse continuity');
if (!main.includes('first multiverse')) fail('Fresh public runtime must disclose first Multiverse entry');
if (!main.includes('plannedVerseContexts')) fail('Fresh public runtime must carry planned Verse contexts without exposing stale primary actions');
if (main.includes('renderMapVerse')) fail('Fresh public runtime must not render Map before Column happy path is stable');
if (main.includes('data-pane-verse="map"')) fail('Fresh public runtime must not expose Map as a primary workspace verse control');
if (!main.includes('data-pane-verse')) fail('Fresh public runtime must scope Verse selection to a workspace pane');
if (!main.includes('Map/Atlas/Desktop/Gallery stay planned')) fail('Fresh public runtime must keep Map/Atlas/Desktop/Gallery planned, not runtime-ready');
if (!main.includes('tx-shell-column-action-parity')) fail('Fresh public runtime must keep old action rhythm parity class');
if (!main.includes('Continue') || !main.includes('Reference') || !main.includes('Merge')) fail('Fresh public runtime must preserve old primary action rhythm labels');
if (main.includes('Node Graph Verse') || main.includes('Zoomable Multiverse')) fail('Fresh public runtime must not show stale future verses as primary UI');
  if (html.includes('type="module"') || html.includes("type='module'")) fail('Fresh public index must be file-local safe and not use ES module startup');
  const identityPath = join(out, 'tiinex.build.json');
  if (existsSync(identityPath)) {
    const identity = JSON.parse(read(identityPath));
    if (identity.type !== 'tiinex.public.build.identity.v1') fail('Missing public build identity type');
    if (identity.publicRuntime !== 'bundled-css-and-js') fail('Public build identity must disclose bundled runtime');
  }
  if (failures.length) {
    console.error(failures.map((f) => `- ${f}`).join('\n'));
    process.exit(1);
  }
  console.log('✓ public build is fresh-shell clean');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
