#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const failures = [];
function read(file) { return readFileSync(join(root, file), 'utf8'); }
function lineCount(file) { return read(file).split(/\r?\n/).length; }
function fail(message) { failures.push(message); }
function includes(file, needle, message) { if (!read(file).includes(needle)) fail(message || `${file} missing ${needle}`); }
function excludes(file, needle, message) { if (read(file).includes(needle)) fail(message || `${file} must not include ${needle}`); }

const budgets = [
  ['src/schemas/workspace/workspace.views.jsx', 260, 'workspace surface orchestrator must stay thin and delegate sub-surfaces'],
  ['src/schemas/workspace/workspace.chrome.views.jsx', 330, 'workspace chrome surface must stay bounded'],
  ['src/schemas/workspace/workspace.lineage.views.jsx', 340, 'lineage view surface must stay bounded'],
  ['src/schemas/workspace/workspace.audit.views.jsx', 230, 'audit view surface must stay bounded'],
  ['src/schemas/workspace/workspace.cards.views.jsx', 180, 'record/card views must stay bounded'],
  ['src/schemas/workspace/workspace.recordDialogs.views.jsx', 260, 'record dialog views must stay bounded'],
  ['src/schemas/workspace/workspace.read.views.jsx', 130, 'read view projection must stay bounded'],
  ['src/schemas/workspace/workspace.tree.views.jsx', 150, 'tree view surface must stay bounded'],
  ['src/app/TiinexApp.jsx', 860, 'app controller must not grow while runtime/shell/view-state helpers are extracted'],
  ['src/app/appShell.views.jsx', 90, 'app shell presentation must stay bounded outside TiinexApp'],
  ['src/app/runtimeState.js', 55, 'runtime/default state contract must stay small and pure'],
  ['src/app/viewport.js', 35, 'viewport helper must stay small and pure'],
  ['src/app/githubMaterializationSummary.js', 105, 'GitHub materialization summaries must stay outside TiinexApp'],
  ['src/app/workspaceDisplayCounts.js', 35, 'workspace display count bridge must stay small'],
  ['src/app/recordUi.js', 25, 'record UI hydration bridge must stay small'],
  ['src/workspaces/workspace.discoveryView.js', 430, 'discovery read-model owner must stay bounded'],
  ['src/workspaces/workspace.displayOptions.js', 90, 'display option contract should stay pure and small'],
  ['src/workspaces/workspace.displayFilters.js', 90, 'display filter contract should stay pure and small'],
  ['src/app/viewState.js', 70, 'view-state helper should stay pure and small'],
  ['src/schemas/workspace/workspace.displayOptions.views.jsx', 130, 'Display options dialog should not move back into workspace.views']
];
for (const [file, max, reason] of budgets) {
  const lines = lineCount(file);
  if (lines > max) fail(`${file} has ${lines} lines; max ${max}: ${reason}`);
}

includes('src/workspaces/workspace.displayOptions.js', 'export function normalizeWorkspaceDisplayOptions', 'display options contract must be owned outside workspace.views');
includes('src/workspaces/workspace.displayFilters.js', 'export function displayRecordIncluded', 'display filters must be owned outside workspace.views/discoveryView');
includes('src/app/viewState.js', 'export function stateWithCapturedViewScroll', 'view-only state patching must be owned outside TiinexApp');
includes('src/app/appShell.views.jsx', 'export function GlobalDock', 'GlobalDock must stay outside TiinexApp');
includes('src/app/appShell.views.jsx', 'export function EmptyStage', 'EmptyStage must stay outside TiinexApp');
includes('src/app/appShell.views.jsx', 'export function HelpDialog', 'HelpDialog must stay outside TiinexApp');
includes('src/app/runtimeState.js', 'export function runtime', 'runtime/default state must stay outside TiinexApp');
includes('src/app/githubMaterializationSummary.js', 'export function summarizeGithubMaterialization', 'GitHub materialization summary helpers must stay outside TiinexApp');
includes('src/app/workspaceDisplayCounts.js', 'export function buildDisplayOptionCounts', 'display counts bridge must stay outside TiinexApp');
includes('src/schemas/workspace/workspace.displayOptions.views.jsx', 'export function DisplayOptionsDialog', 'DisplayOptionsDialog must stay outside workspace.views');
includes('src/schemas/workspace/workspace.lineage.views.jsx', 'export function WorkspaceLineageState', 'Lineage surface must stay outside workspace.views');
includes('src/schemas/workspace/workspace.tree.views.jsx', 'export function WorkspaceTreeState', 'Tree surface must stay outside workspace.views');
includes('src/schemas/workspace/workspace.audit.views.jsx', 'export function WorkspaceAuditState', 'Audit surface must stay outside workspace.views');
includes('src/schemas/workspace/workspace.cards.views.jsx', 'export function RecordCard', 'Record cards must stay outside workspace.views');
includes('src/schemas/workspace/workspace.recordDialogs.views.jsx', 'export function RecordActionDialog', 'Record action dialog must stay outside workspace.views');
includes('src/app/TiinexApp.jsx', "from './viewState.js'", 'TiinexApp must use pure view-state helpers');
includes('src/app/TiinexApp.jsx', "from './appShell.views.jsx'", 'TiinexApp must render app shell through extracted presentation module');
includes('src/app/TiinexApp.jsx', "from './runtimeState.js'", 'TiinexApp must import runtime/default state from extracted module');
includes('src/app/TiinexApp.jsx', "from './githubMaterializationSummary.js'", 'TiinexApp must import source-summary helpers from extracted module');
includes('src/app/TiinexApp.jsx', "workspace.displayOptions.views.jsx", 'TiinexApp must import DisplayOptionsDialog from its own module');

excludes('src/schemas/workspace/workspace.views.jsx', 'function normalizeDisplayFilterValue', 'workspace.views must not own display filter normalization');
excludes('src/schemas/workspace/workspace.views.jsx', 'function displayRecordIncluded', 'workspace.views must not own record display membership');
excludes('src/schemas/workspace/workspace.views.jsx', 'function recordMatchesQuery', 'workspace.views must not duplicate shared query matching');
excludes('src/schemas/workspace/workspace.views.jsx', 'function WorkspaceLineageState', 'workspace.views must not reabsorb lineage surface');
excludes('src/schemas/workspace/workspace.views.jsx', 'function WorkspaceTreeState', 'workspace.views must not reabsorb tree surface');
excludes('src/schemas/workspace/workspace.views.jsx', 'function RecordCard', 'workspace.views must not reabsorb card surface');
excludes('src/workspaces/workspace.discoveryView.js', 'function recordMatchesQuery', 'discoveryView must import shared query matching');
excludes('src/workspaces/workspace.discoveryView.js', 'function normalizeDiscoveryDisplayOptions', 'discoveryView must use shared display option normalization');
excludes('src/app/TiinexApp.jsx', 'structuredClone(state)', 'view-only interactions must not structuredClone full state');
excludes('src/app/TiinexApp.jsx', 'function stateWithViewPatch', 'TiinexApp must not re-own view-state helpers');
excludes('src/app/TiinexApp.jsx', 'function GlobalDock', 'TiinexApp must not re-own shell presentation');
excludes('src/app/TiinexApp.jsx', 'function EmptyStage', 'TiinexApp must not re-own empty-stage presentation');
excludes('src/app/TiinexApp.jsx', 'function summarizeGithubMaterialization', 'TiinexApp must not re-own GitHub materialization summaries');
excludes('src/app/TiinexApp.jsx', 'function normalizeRepository', 'TiinexApp must not re-own repository URL parsing');

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}
console.log('✓ architecture shape guards passed');
