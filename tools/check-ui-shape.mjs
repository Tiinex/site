#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const failures = [];
function read(file) { return readFileSync(join(root, file), 'utf8'); }
function combo(...files) { return files.map(read).join('\n'); }
const appAndWorkspace = combo('src/app/TiinexApp.jsx', 'src/schemas/workspace/workspace.views.jsx', 'src/schemas/workspace/workspace.add.views.jsx');
function has(file, needle, label) { if (!read(file).includes(needle)) failures.push(label || `${file} missing ${needle}`); }
function lacks(file, needle, label) { if (read(file).includes(needle)) failures.push(label || `${file} must not include ${needle}`); }

has('src/app/TiinexApp.jsx', 'tx-centered-dock-core', 'global dock must keep centered Tiinex logo pattern');
has('src/app/TiinexApp.jsx', 'tx-dock-left', 'Create/multiverse must live left of logo');
has('src/app/TiinexApp.jsx', 'tx-dock-right', 'Share/help must live right of logo');
has('src/app/TiinexApp.jsx', 'shouldPageWorkspaces', 'pager arrows must be size-gated, not count-only');
has('src/app/TiinexApp.jsx', "data-overflow-pager={showPager ? 'visible' : 'hidden'}", 'dock must expose overflow pager state for regression checks');
has('src/app/TiinexApp.jsx', 'tx-empty-stage tx-old-empty-stage', 'empty start must keep old empty-stage semantics');
if (!appAndWorkspace.includes('tx-column-window')) failures.push('created workspace must render as Column window');
if (!appAndWorkspace.includes('tx-source-strip workspace-source-strip')) failures.push('source row must stay visible when sources exist');
if (!appAndWorkspace.includes('tx-workspace-drop-hint')) failures.push('empty workspace drop hint must stay available');
if (!appAndWorkspace.includes('tx-mode-strip tx-column-toolbar')) failures.push('mode/search toolbar must remain a primary landmark');
if (!appAndWorkspace.includes('tx-progress-strip')) failures.push('source progress placement must exist for progress state');
if (!appAndWorkspace.includes('tx-empty-node-state')) failures.push('created empty workspace must not become onboarding card');
has('src/app/TiinexApp.jsx', 'schemaRegistry.modules.length', 'help surface should disclose schema companion state');
has('src/schemas/workspace/workspace.schema.js', "id: 'tiinex.workspace.v1'", 'workspace schema companion module must live under src/schemas/workspace');
has('src/schemas/workspace/workspace.add.views.jsx', 'data-flow="old-like-add-menu"', 'workspace Add dialog must be schema-owned and old-like');
lacks('src/schemas/workspace/workspace.add.views.jsx', 'Start from', 'GitHub source Add must not prefill from workspace entrypoints/presets');
has('src/schemas/workspace/workspace.add.views.jsx', 'const [repoDiscovery, setRepoDiscovery] = useState(false);', 'GitHub repo discovery must be explicit opt-in, not default network/API work');
has('src/schemas/registry.js', 'workspaceSchemaModule', 'workspace schema module must be in registry');
has('src/styles/app.css', '.tx-button .tx-icon', 'button icon spacing must be centralized');
has('src/styles/app.css', 'clamp(', 'responsive sizing must use clamp patterns');
has('src/styles/app.css', '@media (max-width: 760px)', 'mobile responsive breakpoint missing');
has('src/styles/app.css', '.tx-dialog-backdrop', 'modal/sheet primitive CSS missing');
has('src/styles/app.css', '.tx-source-pill', 'source pills must have CSS ownership');
has('src/styles/app.css', '.tx-compact-column-window', 'created workspace must keep compact old-like column sizing');
has('src/styles/app.css', '.tx-compact-empty-node-state', 'empty node state must stay compact and low-boilerplate');
has('src/styles/app.css', '.tx-add-choice-card', 'Add flow choices must have shared compact card styling');

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
