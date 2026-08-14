#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const failures = [];
function read(file) { return readFileSync(join(root, file), 'utf8'); }
function lineCount(file) { return read(file).split(/\r?\n/).length; }
function fail(message) { failures.push(message); }
function includes(file, needle, message) { if (!read(file).includes(needle)) fail(message || `${file} missing ${needle}`); }
function excludes(file, needle, message) { if (read(file).includes(needle)) fail(message || `${file} must not include ${needle}`); }

function walk(dir) {
  if (!existsSync(join(root, dir))) return [];
  const stack = [join(root, dir)];
  const out = [];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else out.push(full);
    }
  }
  return out;
}
function rel(path) { return path.replace(root + '/', '').replaceAll('\\', '/'); }

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
includes('src/app/appShell.views.jsx', 'tx-logo-command tx-logo-home tx-dock-logo-large', 'extracted GlobalDock must preserve the styled home logo command classes');
includes('src/styles/app.css', '/* v229: canonical global-dock/header contract.', 'global dock/header polish must have a single final contract owner');
includes('src/styles/app.css', 'grid-template-columns: minmax(max-content, 1fr) auto minmax(max-content, 1fr) !important;', 'dock logo must be centered through symmetric side tracks');
includes('src/app/appShell.views.jsx', 'emptyStageSubtitle', 'extracted EmptyStage must preserve configured subtitle/MOTD rendering');
includes('src/app/appShell.views.jsx', 'tx-top-dock tx-dock-shell-row', 'extracted GlobalDock must preserve top-dock wrapper classes so dock CSS applies');
includes('src/app/appShell.views.jsx', 'tx-dock-action-button tx-dock-create-button', 'global dock buttons must expose header-specific classes instead of relying on broad button cascade');
includes('src/app/appShell.views.jsx', 'tx-dock-icon-button', 'global dock icon buttons must expose header-specific classes for compact symmetry');
includes('src/schemas/workspace/workspace.chrome.views.jsx', 'data-discovery-state={source.discoveryState || undefined}', 'source discovery state must remain inspectable as internal state on source rail');
excludes('src/schemas/workspace/workspace.chrome.views.jsx', 'tx-source-motion-state', 'source rail must not render idle/deferred boilerplate labels');
excludes('src/schemas/workspace/workspace.chrome.views.jsx', 'tx-source-state-', 'source rail must not render raw discoveryState labels');
includes('src/app/appShell.views.jsx', 'export function HelpDialog', 'HelpDialog must stay outside TiinexApp');
includes('src/app/runtimeState.js', 'export function runtime', 'runtime/default state must stay outside TiinexApp');
includes('src/app/githubMaterializationSummary.js', 'export function summarizeGithubMaterialization', 'GitHub materialization summary helpers must stay outside TiinexApp');
includes('src/app/githubProgress.js', 'export function shouldCommitGithubProgress', 'GitHub progress throttling must be owned outside TiinexApp');
includes('src/app/githubSourceOperation.js', "from './githubProgress.js'", 'GitHub source operation must use extracted progress throttling helpers instead of owning them inline');
includes('src/workspaces/workspace.route.js', 'requestedSurfaces: compactSurfaceMap', 'route shell must preserve requested source surfaces across F5/hash restore');
includes('src/workspaces/workspace.route.js', 'issueDiscovery: Boolean(source.issueDiscovery)', 'route shell must preserve broad issue-discovery choice without inferring it from requested material surfaces');
includes('src/workspaces/workspace.route.js', "issueUrls: source.issueUrls || config.issueUrls || ''", 'route shell must preserve explicit issue targets independently of broad discovery');
includes('src/adapters/github/github.issueSnapshot.js', 'await yieldToBrowserIfAvailable();', 'issue snapshot materialization must yield between targets to avoid browser freeze-lag');
includes('src/adapters/github/github.issueSnapshot.js', 'window.requestIdleCallback(() => resolve(), { timeout: 80 });', 'issue snapshot browser yield must pass IdleRequestOptions to requestIdleCallback, not a numeric timeout');
includes('src/adapters/github/github.issueSnapshot.js', 'DEFAULT_ISSUE_SNAPSHOT_MAX_COMMENTS = 24', 'bounded issue comments default must stay explicit and finite for browser interaction');
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
includes('src/app/githubSourceOperation.js', "from './githubMaterializationSummary.js'", 'GitHub source operation must use extracted source-summary helpers');
includes('src/app/TiinexApp.jsx', "from './githubSourceOperation.js'", 'TiinexApp must dispatch GitHub source loading through operation boundary');
includes('src/app/githubSourceOperation.js', 'export async function runGithubSourceOperation', 'GitHub source loading must have a testable operation boundary outside TiinexApp');
includes('src/app/sourceTransportRefresh.js', 'sourceTransportRefreshInputForSource', 'transport badge refresh input must stay outside TiinexApp controller');
includes('src/sources/github/github.transport.js', 'transportOrderExact', 'explicit transport badge refresh must not silently fall through the full ladder');
includes('src/adapters/github/github.issueTransport.js', 'Native Response fields are brand-checked accessors', 'issue transport wrappers must document native Response brand-safety');
excludes('src/adapters/github/github.issueTransport.js', 'Object.create(Object.getPrototypeOf(res)', 'issue transport wrappers must not shell native Response prototypes; use plain delegating transport responses');
includes('src/app/TiinexApp.jsx', "workspace.displayOptions.views.jsx", 'TiinexApp must import DisplayOptionsDialog from its own module');
includes('src/app/TiinexApp.jsx', "import { schemaRegistry } from '../schemas/registry.js';", 'TiinexApp must import schemaRegistry when passing it into RecordActionDialog');
includes('src/app/TiinexApp.jsx', "onExportWorkspace={() => openWorkspaceExportDialog(workspace.id)}", 'visible sibling workspace export must target the clicked workspace through the export adapter boundary');
excludes('src/app/TiinexApp.jsx', 'itemActive ? openWorkspaceExportDialog : undefined', 'visible sibling workspaces must not be inert previews');
includes('src/app/TiinexApp.jsx', 'WorkspaceExportDialog', 'TiinexApp must render the export adapter dialog instead of direct-exporting from chrome');
includes('src/app/TiinexApp.jsx', 'RenameWorkspaceDialog,', 'Rename workspace dialog must be imported when rendered by TiinexApp');
includes('src/app/TiinexApp.jsx', "import { TIINEX_RUNTIME_ID } from '../build.identity.js';", 'TiinexApp runtime badge must use build identity, not stale hard-coded runtime');
includes('src/app/TiinexApp.jsx', 'data-runtime={TIINEX_RUNTIME_ID}', 'TiinexApp DOM runtime identity must stay tied to src/build.identity.js');

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

includes('src/validation/validateArtifact.js', 'export function validateArtifact', 'shared validation pipeline must own Root + exact schema composition');
includes('src/integrity/integrity.validate.js', 'export function validateIntegrity', 'integrity validation engine must stay outside root.validate');
includes('src/validation/findings.js', 'export function normalizeFinding', 'finding-code normalization must be shared and reusable');
includes('src/validation/i18n.js', 'export function resolveFindingMessage', 'finding messages must resolve through i18n resources');
includes('src/schemas/tiinex.root.v1.schema.js', "./tiinex.root.v1.en.i18n.json", 'Root i18n must use flat versioned locale JSON companion files');
excludes('src/schemas/core/topic/tiinex.topic.v1.validate.js', 'rootValidate', 'child validators must not import/call Root validation manually');
excludes('src/schemas/core/evidence/tiinex.evidence.v1.validate.js', 'rootValidate', 'child validators must not import/call Root validation manually');
excludes('src/schemas/core/preservation/tiinex.preservation.v1.validate.js', 'rootValidate', 'child validators must not import/call Root validation manually');


const canonicalWorkspaceCandidateForbiddenFiles = [
  'src/app/TiinexApp.jsx',
  'src/workspaces/workspace.openSemantics.js',
  'src/workspaces/workspace.localSourceLifecycle.js',
  'src/workspaces/workspace.lifecycle.js',
  'src/workspaces/workspace.sourceRecords.js',
  'src/workspaces/workspace.sourceMaterial.js',
  'src/workspaces/workspace.importConflicts.js',
  'src/workspaces/workspace.discoveryView.js',
  'src/workspaces/workspace.pathTree.js',
  'src/workspaces/workspace.materialLedger.js',
  'src/workspaces/workspace.summary.js',
  'src/workspaces/workspace.displayOptions.js',
  'src/workspaces/workspace.displayFilters.js'
];
const canonicalWorkspaceCandidateForbiddenTerms = ['workspaceMergeCandidates', 'WorkspaceCandidate', 'workspaceCandidate', 'workspace-candidate', 'showWorkspaceCandidates', 'hidden-workspace-candidates'];
for (const file of canonicalWorkspaceCandidateForbiddenFiles) {
  const source = read(file);
  for (const term of canonicalWorkspaceCandidateForbiddenTerms) {
    if (source.includes(term)) fail(`${file} contains legacy candidate runtime/readmodel term ${term}; candidates are allowed only behind compatibility/I/O normalization`);
  }
}
for (const file of walk('src/schemas/workspace')) {
  const path = rel(file);
  if (/\.test\.mjs$/.test(path)) continue;
  const source = read(path);
  for (const term of canonicalWorkspaceCandidateForbiddenTerms) {
    if (source.includes(term)) fail(`${path} contains legacy candidate product/readmodel term ${term}; Workspace Artifact must use the ordinary artifact model`);
  }
}
excludes('src/workspaces/workspace.sourceRecords.js', "from './workspace.candidates.js'", 'canonical source-record insertion must not import the legacy candidate runtime adapter');
excludes('src/workspaces/workspace.lifecycle.js', 'restoreWorkspaceCandidateForRemovedSource', 'canonical lifecycle must not restore legacy candidate objects after product normalization');
excludes('src/workspaces/workspace.localSourceLifecycle.js', 'ReconciledLocalWorkspaceCandidate', 'canonical local clear/count must operate on records/assets only');
excludes('src/workspaces/workspace.sourceMaterial.js', 'WorkspaceCandidate', 'canonical source material clearing must operate on records/assets only');

for (const file of walk('src/schemas')) {
  const path = rel(file);
  if (/\.i18n\.js$/.test(path)) fail(`${path} must use flat <schema-id>.<locale>.i18n.json naming, not JS i18n scaffold`);
  if (/\.(feed|tree|lineage|detail|preview|share|graph)\.presenter\.js$/.test(path)) fail(`${path} is an inert surface presenter scaffold; use <schema-id>.presenter.js until a divergent surface owner is wired`);
  if (/\.(create|edit|quick|full)\.form\.js$/.test(path)) fail(`${path} is passive form scaffold; forms wait for the transition/artifact-creation milestone`);
  if (/\/(root|topic|evidence|preservation|module|surface)\.(schema|validate|findings|capabilities|presenter|transitions|feed\.presenter|tree\.presenter|lineage\.presenter|detail\.presenter|preview\.presenter|share\.presenter|graph\.presenter|create\.form|edit\.form|quick\.form|full\.form)\.(js|json)$/.test(path)) {
    fail(`${path} uses old unversioned companion naming; use <schema-id>.<role>.<format>`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}
console.log('✓ architecture shape guards passed');
