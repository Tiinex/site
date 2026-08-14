import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./TiinexApp.jsx', import.meta.url), 'utf8');
const surface = readFileSync(new URL('../schemas/workspace/workspace.views.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8');

assert.match(app, /pagerVisible=\{pagerVisible\}/, 'global dock receives workspace overflow reachability state');
assert.match(app, /previousWorkspaceEnabled=\{workspaceWindow\.previousEnabled\}/, 'previous pager boundary comes from workspaceWindow owner');
assert.match(app, /nextWorkspaceEnabled=\{workspaceWindow\.nextEnabled\}/, 'next pager boundary comes from workspaceWindow owner');
assert.match(app, /onPreviousWorkspace=\{\(\) => pageWorkspaceWindow\('previous'\)\}/, 'previous pager executes the workspace-window command rather than focus cycling');
assert.match(app, /onNextWorkspace=\{\(\) => pageWorkspaceWindow\('next'\)\}/, 'next pager executes the workspace-window command rather than focus cycling');
assert.doesNotMatch(app, /function cycleWorkspace\(/, 'obsolete focus-cycler is not retained as pager ownership');
assert.match(app, /onClose=\{\(\) => openWorkspaceDialog\('close-workspace', workspace\.id\)\}/, 'visible sibling close targets the clicked workspace explicitly');
assert.match(app, /onRenameWorkspace=\{\(\) => openWorkspaceDialog\('rename-workspace', workspace\.id\)\}/, 'visible sibling rename targets the clicked workspace explicitly');
assert.match(app, /onVerse=\{\(verse\) => setVerse\(verse, workspace\.id\)\}/, 'visible sibling view action targets the clicked workspace explicitly');
assert.match(app, /onOpenAddDialog=\{\(sourceId = ''\) => openAddToWorkspace\(sourceId, workspace\.id\)\}/, 'visible sibling Add targets the clicked workspace explicitly');
assert.doesNotMatch(app, /onClose=\{itemActive\s*\?/, 'workspace actions are not permission-gated by active focus');
assert.doesNotMatch(app, /onVerse=\{itemActive\s*\?/, 'workspace view controls are not permission-gated by active focus');
assert.match(app, /onMouseDownCapture=\{\(\) => \{ if \(!itemActive\) activateWorkspace\(workspace\.id\); \}\}/, 'direct interaction focuses the visible sibling without requiring a second click');

assert.match(surface, /data-workspace-layout="compact"/, 'compact workspace is an explicit presentation surface');
assert.match(surface, /onClick=\{\(\) => onLayoutMode\?\.\('expanded'\)\}/, 'compact workspace can expand in-place');
assert.match(surface, /onClick=\{\(\) => onLayoutMode\?\.\('compact'\)\}/, 'expanded workspace can collapse in-place');
assert.match(surface, /onScroll=\{\(event\) => onViewScroll\?\.\(verse, event\.currentTarget\.scrollTop\)\}/, 'each workspace column reports its own vertical scroll position');
assert.match(surface, /stage\.scrollTop =/, 'workspace column restores its own vertical scroll position');

assert.match(css, /\.tx-workspace-frame-inactive[\s\S]*?opacity:\s*1;[\s\S]*?filter:\s*none;/, 'inactive visible workspace stays fully readable instead of dimmed');
assert.equal((css.match(/\.tx-workspace-frame-inactive\s*\{/g) || []).length, 1, 'inactive workspace focus styling has one authoritative rule');
assert.doesNotMatch(css, /\.tx-workspace-multicolumn-stage\s*\{[^}]*overflow-x:\s*auto/s, 'canonical workspace multicolumn layout no longer uses a horizontal workspace browser');
assert.doesNotMatch(css, /\.tx-workspace-multicolumn-stage\s*\{[^}]*scroll-snap-type:/s, 'canonical workspace multicolumn layout no longer depends on horizontal scroll snapping');
assert.doesNotMatch(css, /v302: PoC-like workspace columns|v303: deterministic desktop workspace columns|v370 M2 workspace spine foundation/, 'stale contradictory workspace-layout ownership blocks are removed');
assert.match(css, /\.tx-workspace-multicolumn-stage \.tx-primary-stage,[\s\S]*?overflow-y:\s*auto;/, 'each visible workspace primary stage owns vertical reachability');
assert.match(css, /\.tx-workspace-frame-compact[\s\S]*?max-inline-size:\s*5\.75rem;/, 'compact workspace becomes a bounded narrow presentation column');

console.log('✓ workspaceSpinePresentation tests passed');
