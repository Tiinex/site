#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const failures = [];
function read(file) { return readFileSync(join(root, file), 'utf8'); }
function combo(...files) { return files.map(read).join('\n'); }
const workspaceViewModules = [
  'src/schemas/workspace/workspace.views.jsx',
  'src/schemas/workspace/workspace.chrome.views.jsx',
  'src/schemas/workspace/workspace.discovery.views.jsx',
  'src/schemas/workspace/workspace.tree.views.jsx',
  'src/schemas/workspace/workspace.audit.views.jsx',
  'src/schemas/workspace/workspace.lineage.views.jsx',
  'src/schemas/workspace/workspace.cards.views.jsx',
  'src/schemas/workspace/workspace.read.views.jsx',
  'src/schemas/workspace/workspace.recordDialogs.views.jsx',
  'src/schemas/workspace/workspace.auditBadge.views.jsx',
  'src/schemas/workspace/workspace.displayOptions.views.jsx',
  'src/schemas/workspace/workspace.viewFormatting.js'
];
const appModules = [
  'src/app/TiinexApp.jsx',
  'src/app/appShell.views.jsx',
  'src/app/viewport.js',
  'src/app/runtimeState.js',
  'src/app/viewState.js',
  'src/app/githubMaterializationSummary.js',
  'src/app/workspaceDisplayCounts.js',
  'src/app/recordUi.js'
];
const appAndWorkspace = combo(...appModules, 'src/schemas/workspace/workspace.add.views.jsx', 'src/workspaces/workspace.displayOptions.js', ...workspaceViewModules);
function has(file, needle, label) { if (!read(file).includes(needle)) failures.push(label || `${file} missing ${needle}`); }
function lacks(file, needle, label) { if (read(file).includes(needle)) failures.push(label || `${file} must not include ${needle}`); }

if (!appAndWorkspace.includes('tx-poc-brand-first-dock')) failures.push('global dock must preserve PoC brand-first action order');
if (!appAndWorkspace.includes('tx-dock-actions')) failures.push('Create/Share/Help must share one action group after the brand');
if (!appAndWorkspace.includes('shouldPageWorkspaces')) failures.push('pager arrows must be size-gated, not count-only');
if (!appAndWorkspace.includes("data-overflow-pager={showPager ? 'visible' : 'hidden'}")) failures.push('dock must expose overflow pager state for regression checks');
if (!appAndWorkspace.includes('tx-empty-stage tx-old-empty-stage')) failures.push('empty start must keep old empty-stage semantics');
if (!appAndWorkspace.includes('tx-logo-command tx-logo-home tx-dock-logo-large')) failures.push('global dock logo must keep styled home-logo command classes after extraction');
if (!appAndWorkspace.includes('emptyStageSubtitle')) failures.push('empty stage must render configured subtitle/MOTD rather than fallback/undefined copy');
if (!appAndWorkspace.includes('tx-column-window')) failures.push('created workspace must render as Column window');
if (!appAndWorkspace.includes('tx-source-strip workspace-source-strip')) failures.push('source row must stay visible when sources exist');
if (!appAndWorkspace.includes('tx-workspace-drop-hint')) failures.push('empty workspace drop hint must stay available');
if (!appAndWorkspace.includes('tx-mode-strip tx-column-toolbar')) failures.push('mode/search toolbar must remain a primary landmark');
if (appAndWorkspace.includes('tx-lineage-trust-strip')) failures.push('lineage/audit trust must not be a persistent always-visible row');
if (!appAndWorkspace.includes('tx-audit-badge')) failures.push('cards and tree rows must expose old-like per-artifact audit/status badges');
if (!appAndWorkspace.includes('AuditBadgeDialog') || !appAndWorkspace.includes('tx-audit-badge-button')) failures.push('per-artifact audit/status badges must open compact explainers instead of inert labels');
if (!appAndWorkspace.includes('body missing')) failures.push('body-unavailable card state must not be exposed as generic unavailable');
if (!appAndWorkspace.includes('lineageControlsReadyForTraversal')) failures.push('Lineage toolbar must hide Load full lineage when loaded-workspace traversal is already terminal');
if (!appAndWorkspace.includes('selectedRecordId')) failures.push('artifact lineage focus must keep selectedRecordId state');
if (!appAndWorkspace.includes('function focusRecordLineage')) failures.push('Lineage focus must be separate from Open/detail reading');
if (!appAndWorkspace.includes('tx-clickable-record-card')) failures.push('record card itself must be the Lineage focus target, not a crowded Lineage button');
if (!appAndWorkspace.includes('function DiscoveryRecordList') || !appAndWorkspace.includes('tx-discovery-record-list')) failures.push('Discovery feed must render records through an owned list wrapper so card surfaces cannot collapse into stage background');
if (!appAndWorkspace.includes('DISCOVERY_INITIAL_RECORD_WINDOW') || !appAndWorkspace.includes('tx-discovery-window-sentinel')) failures.push('large Discovery feeds must use a bounded render window instead of mounting every record card at once');
if (appAndWorkspace.includes("label: 'Lineage'")) failures.push('cards must not reintroduce a visible Lineage action label');
if (!appAndWorkspace.includes('Show markdown')) failures.push('cards must expose old-like Show markdown dialog action');
if (appAndWorkspace.includes('byte ok')) failures.push('UI must not claim byte ok without byte/digest verification');
if (!appAndWorkspace.includes('schema ok')) failures.push('audit status badge should use schema/readability wording instead of byte integrity wording');
if (!appAndWorkspace.includes('Preserve evidence')) failures.push('current evidence operation must not be presented as old Reference parity');

if (!read('src/schemas/workspace/workspace.continuationDialog.views.jsx').includes('tx-continuation-dialog-compact')) failures.push('transition draft dialog must stay form-first and not regress to metadata-first boilerplate');
if (!read('src/schemas/workspace/workspace.continuationDialog.views.jsx').includes('Generated details')) failures.push('transition-generated metadata/Markdown preview must be disclosed behind generated details, not shown before form inputs');
if (!read('src/schemas/workspace/workspace.continuationDialog.views.jsx').includes('if (validation.ok && severe.length === 0) return null;')) failures.push('transition conformance success must not crowd the first working form slice');
if (read('src/app/TiinexApp.jsx').includes('setActiveRecordId(result.record.id)')) failures.push('creating a transition draft must not auto-open the post-create read/share preview modal');
if (!read('src/actions/record.actions.js').includes('actionAvailabilityForRecord')) failures.push('record actions must be gated by schema/transition capability availability, not generic card affordances');
if (!read('src/actions/record.actions.js').includes('enabled: implemented')) failures.push('create-like record actions must only render from implemented schema capabilities');
if (read('src/schemas/tiinex.root.v1.schema.js').includes('record.continue') || read('src/schemas/tiinex.root.v1.schema.js').includes('record.reference')) failures.push('Root schema view actions must not declare generic Continue/Reference actions');
if (!appAndWorkspace.includes('LineageSelectedSummary')) failures.push('Lineage mode must show selected artifact trust/audit status after artifact selection');
if (appAndWorkspace.includes('tx-selected-lineage-chip')) failures.push('Lineage mode toolbar must not render a selected-artifact status chip');
if (appAndWorkspace.includes('tx-audit-details-trigger')) failures.push('Lineage mode toolbar must not render Audit details as a textual badge/pill');
if (!appAndWorkspace.includes('tx-mode-audit-button')) failures.push('Lineage mode must keep audit reachable as a normal compact toolbar action');

if (!appAndWorkspace.includes('tx-mode-load-lineage-button')) failures.push('Lineage mode must expose Load full lineage before search/filter/audit controls are shown');
if (!appAndWorkspace.includes('lineageLoadReport')) failures.push('Lineage search/filter/audit controls must be gated by an explicit lineage load report');
if (!appAndWorkspace.includes('terminalState')) failures.push('Lineage load/audit reports must expose terminalState for complete-vs-partial claims');
if (!appAndWorkspace.includes('noParentDeclared')) failures.push('Lineage status must distinguish no-parent terminal roots from generic loaded roots');
if (!appAndWorkspace.includes('target unavailable')) failures.push('Lineage status must call unresolved loaded parent targets unavailable, not just missing parent');
if (!appAndWorkspace.includes('scopeTransitions')) failures.push('Lineage status must expose source scope transitions when loaded traversal crosses explicit source scope');
if (!appAndWorkspace.includes('function toggleLineageCard') || !appAndWorkspace.includes('commitViewUpdate') || !appAndWorkspace.includes("}, 'replace');")) failures.push('Lineage card expand/collapse must use replace-state through view-only updates, not push-history or full-state clone');
if (read('src/app/TiinexApp.jsx').includes('structuredClone(state)')) failures.push('view-only interactions must not structuredClone the full workspace/records state');
if (!appAndWorkspace.includes('scrollPersistTimerRef') || !appAndWorkspace.includes("persistCapturedViewScroll('replace')")) failures.push('scroll state must persist by replace-state without growing browser history');
if (!appAndWorkspace.includes('tx-display-options-icon-trigger')) failures.push('Display options should be icon-forward, not a long text pill in the mode toolbar');
if (!appAndWorkspace.includes('lineageDisplayOptions')) failures.push('Lineage display filtering must ignore Discovery-only membership controls such as Leaves only');
if (!appAndWorkspace.includes('body-missing source shells')) failures.push('Leaves-only copy must disclose that body-missing source shells are hidden from Discovery leaves');
const lineageStateSignature = appAndWorkspace.match(/function WorkspaceLineageState\(\{([^}]*)\}\)/s)?.[1] || '';
if (!lineageStateSignature.includes('expandedRecordIds = []') || !lineageStateSignature.includes('onToggleLineageCard')) failures.push('Lineage card expansion props must be owned by WorkspaceLineageState; missing props can blank the app at runtime');
if (!appAndWorkspace.includes('aria-label="Discovery view"')) failures.push('Feed/Tree should be Discovery view tabs, not a generic Lineage tab strip');
if (appAndWorkspace.includes('aria-label="Workspace verse"')) failures.push('Lineage must not be presented as a workspace verse tab');
if (!appAndWorkspace.includes('Display options')) failures.push('workspace presentation needs display options for assets/supporting material');
if (!appAndWorkspace.includes('showAssets: false')) failures.push('assets must be hidden by default in Feed/Tree presentation');
if (!appAndWorkspace.includes('tx-progress-strip')) failures.push('source progress placement must exist for progress state');
if (appAndWorkspace.includes('tx-source-motion-state') || appAndWorkspace.includes('tx-source-state-')) failures.push('source rail must not render idle/deferred raw discovery labels');
if (!appAndWorkspace.includes('tx-empty-node-state')) failures.push('created empty workspace must not become onboarding card');
if (appAndWorkspace.includes('schemaRegistry.modules.length')) failures.push('PoC-parity Help must not surface schema-building/module-count diagnostics');
const appShellSource = read('src/app/appShell.views.jsx');
if (!appShellSource.includes('>Share</Button>')) failures.push('global dock must preserve PoC-visible Share label');
if (appShellSource.includes('Share session')) failures.push('global dock must not expose deferred Share session redesign during parity recovery');
if (appShellSource.includes('Change multiverse')) failures.push('global dock must not expose deferred Multiverse control during PoC parity recovery');
has('src/schemas/workspace/tiinex.workspace.v1.schema.js', "id: 'tiinex.workspace.v1'", 'workspace schema companion module must live under src/schemas/workspace');
has('src/schemas/workspace/workspace.add.views.jsx', 'data-flow="old-like-add-menu"', 'workspace Add dialog must be schema-owned and old-like');
lacks('src/schemas/workspace/workspace.add.views.jsx', 'Start from', 'GitHub source Add must not prefill from workspace entrypoints/presets');
has('src/schemas/workspace/workspace.add.views.jsx', 'tx-github-discovery-card', 'GitHub repo discovery must be a visible checkbox surface, not a hidden operation mode');
has('src/schemas/workspace/workspace.add.views.jsx', 'const issueRequested = Boolean(continuation?.issueDiscovery)', 'source continuation must restore broad issue-discovery checkbox only from explicit source issueDiscovery state');
has('src/schemas/workspace/workspace.add.views.jsx', 'const [issueDiscovery, setIssueDiscovery] = useState(continuation ? issueRequested : false)', 'new GitHub sources must not silently enable broad issue discovery');
has('src/schemas/workspace/workspace.add.views.jsx', "const [issueUrls, setIssueUrls] = useState(continuation?.issueUrls || continuation?.config?.issueUrls || '')", 'source continuation must preserve explicit issue targets independently of broad discovery');
lacks('src/schemas/workspace/workspace.add.views.jsx', 'Register only', 'GitHub source UI should use human-facing Save source instead of implementation registration terminology');
has('src/schemas/workspace/workspace.add.views.jsx', "const saveLabel = 'Save source'", 'GitHub source create/edit must expose one human-facing Save source action');
has('src/schemas/workspace/workspace.add.views.jsx', 'continuation?.explicitFileRefs', 'source continuation must restore durable explicit Markdown/file targets');
has('src/schemas/workspace/workspace.views.jsx', 'Rename workspace', 'workspace header must expose rename without changing source/material boundaries');
has('src/schemas/workspace/workspace.views.jsx', 'tx-workspace-title-rename-button', 'workspace title itself must expose reachable rename affordance');
has('src/styles/app.css', '.tx-workspace-title-rename-button', 'workspace title rename affordance needs CSS ownership');
has('src/schemas/workspace/workspace.add.views.jsx', 'Discover repo Markdown', 'GitHub source Add must expose a clear repo discovery submit action');
has('src/schemas/registry.js', 'workspaceSchemaModule', 'workspace schema module must be in registry');
has('src/styles/app.css', '.tx-button .tx-icon', 'button icon spacing must be centralized');
has('src/styles/app.css', 'clamp(', 'responsive sizing must use clamp patterns');
has('src/styles/app.css', '@media (max-width: 760px)', 'mobile responsive breakpoint missing');
has('src/styles/app.css', '.tx-dialog-backdrop', 'modal/sheet primitive CSS missing');
has('src/styles/app.css', '.tx-source-pill', 'source pills must have CSS ownership');
has('src/styles/app.css', '.tx-compact-column-window', 'created workspace must keep compact old-like column sizing');
has('src/styles/app.css', '.tx-discovery-record-list', 'Discovery feed cards need a dedicated list wrapper CSS owner');
has('src/styles/app.css', '.tx-compact-empty-node-state', 'empty node state must stay compact and low-boilerplate');
has('src/styles/app.css', '.tx-add-choice-card', 'Add flow choices must have shared compact card styling');
has('src/styles/app.css', '.tx-add-mode-modal .tx-github-dialog-actions', 'GitHub source edit footer must stay visible in tall desktop dialogs');
has('src/styles/app.css', '/* v284: dialog viewport contract.', 'dialog viewport action contract guard missing');
has('src/styles/app.css', 'display: flex;\n  flex-direction: column;', 'dialogs must use flex-column viewport ownership');
has('src/styles/app.css', 'max-height: none !important;', 'dialog body must override stale max-height caps');
has('src/styles/app.css', 'grid-template-columns: 1fr;\n    margin: 0.24rem -0.74rem 0;', 'mobile GitHub dialog actions must collapse into reachable rows');
has('src/styles/app.css', 'position: sticky;', 'GitHub source edit footer must be sticky rather than hidden below the modal viewport');
has('src/schemas/companion.js', 'readState,', 'schema read presentation must expose readState contract');
has('src/schemas/companion.js', 'schemaCoverage,', 'schema read presentation must expose schemaCoverage contract');
if (!combo(...workspaceViewModules).includes('tx-read-state-chips')) failures.push('Root fallback/read-state chips must be rendered through workspace views');
has('src/styles/app.css', '.tx-read-state-chips', 'read-state chips need CSS ownership');
has('src/workspaces/workspace.auditView.js', 'rootReadable', 'Audit view must distinguish root-readable from root fallback');
has('src/workspaces/workspace.auditView.js', 'unavailableBody', 'Audit view must count unavailable bodies separately');

has('src/styles/app.css', '/* v165: closure repair chrome parity guard', 'v165 dock/scrollbar parity guard missing');
has('src/styles/app.css', '.tx-centered-dock-core.tx-content-fit-dock', 'content-fit dock must override route/config min-widths');
has('src/styles/app.css', 'scrollbar-color: rgba(189,115,255,0.56)', 'workspace scrollbars must be Tiinex-owned and old-like');
has('src/styles/app.css', '::-webkit-scrollbar-thumb', 'Chrome/WebKit scrollbar thumb styling must exist');

has('src/styles/app.css', '/* v119.2 footer + recognition guard:', 'footer recognition polish guard missing');
has('src/styles/app.css', 'position: fixed;', 'footer must behave as persistent old-like bottom origin marker');
has('src/styles/app.css', 'display: block;', 'empty mode footer must override legacy display:none regression');
has('src/app/TiinexApp.jsx', 'href="https://github.com/Tiinex"', 'footer Tiinex mark must be linkable like .old');
has('src/styles/app.css', 'height: 34px;', 'footer must keep old-like compact 34px height');
has('src/styles/app.css', 'background: rgba(0,0,0,0.78);', 'footer must use old-like translucent dark baseline');
has('src/styles/app.css', '/* v119.3 dock ergonomics:', 'dock recognition ergonomics guard missing');
has('src/styles/app.css', 'display: inline-flex !important;', 'desktop dock must wrap visible controls instead of stretching toward the column');
has('src/styles/app.css', 'data-overflow-pager="hidden"', 'pager arrows must remain hidden until overflow calculation requires them');
has('src/styles/app.css', 'tx-dock-logo-large', 'dock logo must stay slightly larger than neighboring buttons');
has('src/styles/app.css', '/* v229: canonical global-dock/header contract.', 'canonical global dock/header contract must be the final owner');
has('src/styles/app.css', 'grid-template-columns: auto auto !important;', 'PoC parity dock must render brand first followed by the action group');
has('src/styles/app.css', 'width: 136%;', 'logo image itself must remain larger without increasing the button size');
has('src/styles/app.css', 'transform: none;', 'logo glyph should be centered by layout contract, not accumulating optical transform patches');

has('src/styles/app.css', '.tx-react-runtime.tx-empty-stage-mode', 'React empty stage must have dedicated old parity shell CSS');
has('src/styles/app.css', '.tx-empty-stage-mode .tx-empty-stage {', 'empty start must override card-frame stage CSS');
has('src/styles/app.css', 'white-space: nowrap;', 'desktop empty-stage copy must not stack into narrow columns');
has('src/styles/app.css', 'width: fit-content;', 'top dock must fit content rather than full width by default');
has('src/ui/primitives/Button.jsx', 'tx-button', 'buttons must use shared primitive class');
has('src/ui/primitives/Icon.jsx', 'FontAwesomeIcon', 'icons must use shared Font Awesome primitive');
if (appAndWorkspace.includes('tx-reader-state')) failures.push('created empty workspace must not show reader-state noise');
if (appAndWorkspace.includes('data-verse="map"')) failures.push('Map must not be primary UC-001 verse');
if (appAndWorkspace.includes('Create your first workspace')) failures.push('empty start must not use onboarding-card copy');

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ React UI shape guards passed');
