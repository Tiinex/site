import assert from 'node:assert/strict';
import { resolveWorkspaceEntrypointViewIntent, stateWithWorkspaceEntrypointViewIntent, workspaceEntrypointViewIntent } from './workspace.entrypointViewIntent.js';

const base = { activeWorkspaceId: 'w', workspaces: [{ id: 'w', records: [] }], view: { workspaceVerse: 'feed', query: 'old', displayOptions: { leavesOnly: true, showSupportingMarkdown: false, showWorkspaceArtifacts: true, showAssets: false, schemaFilter: 'all', artifactFilter: 'all', sourceFilter: 'all' } }, workspaceViews: {} };
const broad = stateWithWorkspaceEntrypointViewIntent(base, 'w', { defaultView: 'tree', defaultFilter: 'all', defaultSearch: 'needle', selectedPath: '.topics/selected.trace.md' });
assert.equal(broad.view.workspaceVerse, 'tree');
assert.equal(broad.view.query, 'needle');
assert.equal(broad.view.displayOptions.leavesOnly, false, 'Default Filter all exposes the broad workspace material lens');
assert.equal(broad.view.displayOptions.showSupportingMarkdown, true);
assert.equal(broad.view.displayOptions.showAssets, true);
assert.equal(broad.view.entrypointSelectedPath, '.topics/selected.trace.md', 'selected path remains explicit pending exact materialization');
const resolved = resolveWorkspaceEntrypointViewIntent(broad.view, { id: 'w', records: [{ id: 'selected', path: '.topics/selected.trace.md', schemaId: 'tiinex.topic.v1' }] });
assert.equal(resolved.workspaceVerse, 'lineage', 'an exact selected path resolves to current Lineage selection semantics');
assert.equal(resolved.selectedRecordId, 'selected');
assert.equal(resolved.entrypointSelectedPath, undefined);

const schemaState = stateWithWorkspaceEntrypointViewIntent(base, 'w', { defaultFilter: 'tiinex.topic.v1' });
assert.equal(schemaState.view.displayOptions.schemaFilter, 'tiinex.topic.v1');
assert.equal(schemaState.view.entrypointSchemaFilter, 'tiinex.topic.v1');
const schemaResolved = resolveWorkspaceEntrypointViewIntent(schemaState.view, { id: 'w', records: [{ id: 'topic', schemaId: 'tiinex.topic.v1' }] });
assert.equal(schemaResolved.displayOptions.schemaFilter, 'tiinex.topic.v1');
assert.equal(schemaResolved.entrypointSchemaFilter, undefined);
const unsupported = workspaceEntrypointViewIntent({ defaultView: 'galaxy' });
assert.equal(unsupported.state, 'degraded');
assert.match(unsupported.findings[0], /unsupported-default-view/);
assert.equal(stateWithWorkspaceEntrypointViewIntent(base, 'w', {}).view, base.view, 'absent view intent preserves stable existing fallback');
console.log('✓ workspace entrypoint view intent tests passed');
