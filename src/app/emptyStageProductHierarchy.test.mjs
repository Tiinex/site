import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appShell = readFileSync(new URL('./appShell.views.jsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('./TiinexApp.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8');
const bootstrapOperation = readFileSync(new URL('./initialWorkspaceBootstrapOperation.js', import.meta.url), 'utf8');

const start = appShell.indexOf('export function EmptyStage');
assert(start >= 0, 'EmptyStage view must remain explicit and inspectable');
const end = appShell.indexOf('\n}\n\nexport function HelpDialog', start);
assert(end > start, 'EmptyStage view block must end before HelpDialog');
const emptyStage = appShell.slice(start, end + 3);

for (const forbidden of [
  'Start from explicit material',
  'Create local workspace',
  'Clean start stays empty',
  'No GitHub provenance is inferred',
  'tx-empty-bootstrap-path',
  'tx-empty-bootstrap-actions'
]) {
  assert(!emptyStage.includes(forbidden), `empty-stage/MOTD surface must not render bootstrap/debug copy: ${forbidden}`);
}

assert(emptyStage.includes('tx-m1-product-empty-stage'), 'empty stage should carry the product hierarchy guard class');
assert(emptyStage.includes('<p>{subtitle}</p>'), 'MOTD/subtitle surface should remain calm and content-light');
assert(!appShell.includes('tx-dock-start-docs-button'), 'bootstrap ownership must stay below the UI; no default-start toolbar workaround');
assert(!appShell.includes('Start from Tiinex docs'), 'automatic embedded/default bootstrap must not leak as a product bootstrap button');
assert(!app.includes('onStartDefaultWorkspace={startDefaultWorkspaceConfig}'), 'GlobalDock must not own startup/bootstrap semantics');
assert(app.includes('runWorkspaceStartupTransition'), 'TiinexApp must reuse one startup/home transition beneath the UI');
assert(bootstrapOperation.includes('resolveTiinexAppStartupGithubInput'), 'startup operation must resolve explicit query/runtime/host config before fallback');
assert(bootstrapOperation.includes('augmentStartupStateWithLocalRecovery'), 'startup operation must augment canonical config/default startup with durable local deltas');
assert(bootstrapOperation.includes('prepareDefaultWorkspaceStartCommand'), 'embedded/default config remains the final startup fallback');
assert(!css.includes('tx-empty-bootstrap-path'), 'obsolete empty-stage bootstrap panel styles must be removed');
assert(app.includes("import { initialStartupRenderPhase, shouldRenderProductStage } from './startupRenderPhase.js';"), 'startup render phase must be an explicit product-state contract');
assert(app.includes("if (!shouldRenderProductStage(startupPhase)) return null;"), 'genuine product/EmptyStage render must remain gated while startup ownership is unresolved');

assert(appShell.includes('>Share</Button>'), 'PoC parity chrome must expose Share');
assert(!appShell.includes('Share session'), 'PoC parity chrome must not rename Share to Share session');
assert(!appShell.includes('Change multiverse'), 'unapproved Multiverse control must stay out of parity chrome');
assert(!appShell.includes('schema modules'), 'schema-building diagnostics must stay out of parity Help UI');
assert(!app.includes("commit(defaultState(), 'push')"), 'Home must not commit a blank state');
const brandIndex=appShell.indexOf('data-home href={homeHref'); const createIndex=appShell.indexOf('>Create</Button>'); const shareIndex=appShell.indexOf('>Share</Button>'); const helpIndex=appShell.indexOf('aria-label=\"Help\"'); assert(brandIndex>=0&&brandIndex<createIndex&&createIndex<shareIndex&&shareIndex<helpIndex,'PoC parity chrome order must be Tiinex brand → Create → Share → Help');
assert(appShell.includes('emptyStageVisitCursor++'),'empty-stage subtitle must cycle across later visits rather than hardcode cursor 0');
assert(!appShell.includes('onHome'),'brand Home should be a configured href contract, not a second internal action model');
assert(app.includes('workspaceHomeHref(activeWorkspaceConfig'),'brand Home must resolve configured Workspace Home/public/clean fallback');
assert(app.includes('tiinex:local-persistence-failure'), 'local persistence risk must be surfaced through product UI');
assert(app.includes('Your previous local recovery is still preserved'), 'product persistence warning must distinguish preserved last-known-good recovery from newest unsaved changes');


console.log('✓ empty-stage product hierarchy guards passed');
