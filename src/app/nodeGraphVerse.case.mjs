import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { applyArtifactGraphLod, ArtifactGraphScope, buildArtifactGraph, graphNodeId, projectArtifactGraphScope } from '../graph/artifactGraph.model.js';
import { deterministicArtifactGraphLayout, prepareArtifactGraphProjection, scheduleArtifactGraphProjection } from '../graph/artifactGraph.project.js';
import { activeWorkspaceViewFor } from './workspaceMulticolumn.js';
import { stateWithWorkspaceViewPatchAndFocus, workspaceVerseNavigationPatch } from './workspaceScopedInteraction.js';

const root = record('root', 'Root', '.topics/root.trace.md');
const child = record('child', 'Child', '.topics/branch/child.trace.md', '.topics/root.trace.md');
const sibling = record('sibling', 'Sibling', '.topics/branch/sibling.trace.md');
const alpha = { id: 'alpha', title: 'Alpha', records: [root], assets: [] };
const beta = { id: 'beta', title: 'Beta', records: [child, sibling], assets: [] };

// The model reuses declared lineage truth and namespaces workspace identity without merging workspace authority.
const model = buildArtifactGraph([alpha, beta]);
assert.equal(model.schema, 'tiinex.artifact-graph.model.v1');
assert.equal(model.nodes.length, 3);
assert(model.nodes.some((node) => node.id === graphNodeId('alpha', root.id)));
const crossParent = model.edges.find((edge) => edge.kind === 'parent' && edge.to === graphNodeId('beta', child.id));
assert(crossParent, 'declared Parent edge should remain present');
assert.equal(crossParent.from, graphNodeId('alpha', root.id), 'unique exact Parent path may project across workspace boundaries');
assert.equal(crossParent.crossWorkspace, true);
assert.match(crossParent.method, /^exact-cross-workspace-/);

const workspaceProjection = projectArtifactGraphScope(model, { workspaceId: 'beta', scope: ArtifactGraphScope.workspace });
assert.deepEqual(workspaceProjection.nodes.map((node) => node.workspaceId), ['beta', 'beta']);
assert.equal(workspaceProjection.edges.some((edge) => edge.crossWorkspace), false, 'single-workspace scope does not silently import another boundary');
const focusProjection = projectArtifactGraphScope(model, { workspaceId: 'beta', scope: ArtifactGraphScope.focus, selectedRecordId: child.id });
assert(focusProjection.nodes.some((node) => node.id === graphNodeId('alpha', root.id)), 'focus neighborhood can intentionally traverse an exact cross-workspace relation');
const multiverse = projectArtifactGraphScope(model, { workspaceId: 'beta', scope: ArtifactGraphScope.multi });
assert.equal(multiverse.workspaces.length, 2);
assert.equal(multiverse.edges.filter((edge) => edge.crossWorkspace).length, 1);

// Ambiguous exact cross-workspace targets remain unresolved rather than fabricating a relation.
const alphaDuplicate = { id: 'alpha-duplicate', title: 'Alpha duplicate', records: [record('root-duplicate', 'Root duplicate', '.topics/root.trace.md')], assets: [] };
const ambiguous = buildArtifactGraph([alpha, alphaDuplicate, beta]);
const ambiguousParent = ambiguous.edges.find((edge) => edge.kind === 'parent' && edge.to === graphNodeId('beta', child.id));
assert.equal(ambiguousParent.from, '');
assert(ambiguous.findings.some((finding) => finding.code === 'artifactGraph.crossWorkspaceParent.ambiguous'));

// LOD is explicit, deterministic, boundary-aware and reports omitted material.
const many = {
  id: 'many', title: 'Many', records: Array.from({ length: 80 }, (_, index) => {
    const suffix = String(index).padStart(3, '0');
    const parentSuffix = String(index - 1).padStart(3, '0');
    return record(`n-${suffix}`, `Node ${index}`, `.topics/n-${suffix}.trace.md`, index ? `.topics/n-${parentSuffix}.trace.md` : '');
  })
};
const manyGraph = projectArtifactGraphScope(buildArtifactGraph([many]), { workspaceId: 'many', scope: ArtifactGraphScope.workspace });
const lod = applyArtifactGraphLod(manyGraph, { maxNodes: 20 });
assert.equal(lod.nodes.length, 20);
assert.equal(lod.lod.truncated, true);
assert.equal(lod.lod.omittedNodes, 60);
assert.equal(lod.edges.length, 19, 'LOD should preserve a connected local topology for a linear lineage instead of returning disconnected ranked ties');

// Layout is stable for the same semantic graph regardless of input order and never claims authority.
const layoutA = deterministicArtifactGraphLayout(multiverse);
const layoutB = deterministicArtifactGraphLayout({ ...multiverse, nodes: multiverse.nodes.slice().reverse(), edges: multiverse.edges.slice().reverse() });
assert.deepEqual(layoutA.positions, layoutB.positions);
assert.equal(layoutA.authority, 'derived-projection-only');
assert.equal(layoutA.deterministic, true);
assert.equal(layoutA.bands.length, 2);

const prepared = prepareArtifactGraphProjection({ workspaces: [alpha, beta], workspaceId: 'beta', scope: ArtifactGraphScope.multi, maxNodes: 200 });
assert.equal(prepared.layout.schema, 'tiinex.artifact-graph.layout.v1');
assert.equal(prepared.graph.lod.truncated, false);


let workerPosted = false;
let workerTerminated = false;
await new Promise((resolve, reject) => {
  const listeners = {};
  const fakeWorker = {
    addEventListener(type, handler) { listeners[type] = handler; },
    postMessage(message) { workerPosted = true; queueMicrotask(() => listeners.message?.({ data: { id: message.id, ok: true, projection: { workerPrepared: true } } })); },
    terminate() { workerTerminated = true; }
  };
  scheduleArtifactGraphProjection({ workspaces: [alpha], workspaceId: 'alpha' }, { workerFactory: () => fakeWorker, onReady: (value) => { try { assert.equal(value.workerPrepared, true); resolve(); } catch (error) { reject(error); } }, onError: reject });
});
assert.equal(workerPosted, true, 'browser scheduler should prefer off-thread preparation when a Worker is available');
assert.equal(workerTerminated, true, 'one-shot graph worker should terminate after returning its projection');

// Graph navigation preserves selected artifact focus while Feed/Tree return still clears lineage-only state.
const view = { universe: 'column', workspaceVerse: 'lineage', selectedRecordId: child.id, lineageReturnVerse: 'tree', query: 'child' };
const state = { activeWorkspaceId: beta.id, workspaces: [beta], view, workspaceViews: { [beta.id]: view } };
const graphState = stateWithWorkspaceViewPatchAndFocus(state, beta.id, workspaceVerseNavigationPatch('graph'), 1280);
assert.equal(graphState.view.workspaceVerse, 'graph');
assert.equal(graphState.view.selectedRecordId, child.id);
assert.equal(activeWorkspaceViewFor(graphState, beta.id).workspaceVerse, 'graph');
const feedState = stateWithWorkspaceViewPatchAndFocus(graphState, beta.id, workspaceVerseNavigationPatch('feed'), 1280);
assert.equal(feedState.view.selectedRecordId, '');

// Product wiring keeps graph code out of first paint and opens the canonical workspace artifact on selection.
const workspaceViewSource = fs.readFileSync(new URL('../schemas/workspace/workspace.views.jsx', import.meta.url), 'utf8');
const graphViewSource = fs.readFileSync(new URL('../schemas/workspace/workspace.graph.views.jsx', import.meta.url), 'utf8');
const toolbarSource = fs.readFileSync(new URL('../schemas/workspace/workspace.chrome.views.jsx', import.meta.url), 'utf8');
assert.ok(workspaceViewSource.includes("React.lazy(() => import('./workspace.graph.views.jsx')"));
assert.ok(graphViewSource.includes('scheduleArtifactGraphProjection'));
assert.ok(graphViewSource.includes('onOpenRecord?.(node.workspaceId, node.recordId)'));
assert.ok(graphViewSource.includes('Multi-Verse'));
assert.ok(toolbarSource.includes('GRAPH ORIENTATION'));
assert.ok(toolbarSource.includes('aria-label="Discovery view"'), 'existing Feed/Tree discovery UI shape remains intact');

console.log('✓ Node Graph Verse projection invariants passed');

function record(id, title, path, trace = '') {
  const parent = trace ? `- Parent\n  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Trace: [Parent](${trace})\n` : '';
  const markdown = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n${parent}- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-09-03 12:00:00\n  - Summary: ${title}\n\n---\n\n# ${title}\n\n${title} body.\n\n---\n\n# Continuity Integrity\n\n- local-test\n  - Towards: self\n  - Value: ${id}-self\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path, sourceMode: 'local-test' }), { id });
}
