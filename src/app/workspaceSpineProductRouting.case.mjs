import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('./TiinexApp.jsx', import.meta.url), 'utf8');
const surface = fs.readFileSync(new URL('../schemas/workspace/workspace.views.jsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8');

assert.ok(app.includes("onClose={() => openWorkspaceDialog('close-workspace', workspace.id)}"), 'close targets clicked visible workspace explicitly');
assert.ok(app.includes("onRenameWorkspace={() => openWorkspaceDialog('rename-workspace', workspace.id)}"), 'rename targets clicked visible workspace explicitly');
assert.ok(app.includes("onVerse={(verse) => setVerse(verse, workspace.id)}"), 'view actions target clicked visible workspace explicitly');
assert.ok(app.includes("onOpenAddDialog={(sourceId = '') => openAddToWorkspace(sourceId, workspace.id)}"), 'Add targets clicked visible workspace explicitly');
assert.ok(app.includes('onViewScroll={(verse, top) => noteViewScroll(workspace.id, verse, top)}'), 'scroll ownership is keyed by workspace');
assert.ok(!app.includes('itemActive ? setVerse : undefined'), 'inactive visible workspace must not be an inert preview');
assert.ok(!app.includes('itemActive ? openAddToWorkspace : undefined'), 'inactive visible workspace Add must remain interactive');
assert.ok(surface.includes('layoutMode = \'expanded\''), 'workspace surface consumes per-workspace layout mode');
assert.ok(surface.includes('Collapse workspace'), 'expanded workspace has compact/collapse affordance');
assert.ok(surface.includes('Expand workspace'), 'compact workspace has expand affordance');
assert.ok(css.includes('.tx-workspace-frame-inactive'), 'sibling focus styling remains explicit');
assert.ok(css.includes('opacity: 1;'), 'inactive visible workspace is not dimmed/disabled-looking');
assert.ok(css.includes('overscroll-behavior: contain'), 'workspace stage owns vertical scroll independently');

console.log('✓ workspace spine product routing guards passed');
