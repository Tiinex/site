import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { recordMaterialBadge } from '../schemas/workspace/workspace.viewFormatting.js';
import { buildWorkspaceDiscoveryView } from './workspace.discoveryView.js';

await import('../sources/source.identity.js');
await import('./workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;

function markdown(title, checksum, body = '', parent = '') {
  const bodyText = body || `# ${title}`;
  const parentLines = parent ? `- Parent Trace\n  - Path: ${parent}\n` : '';
  return `# Continuity Context\n\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Summary: ${title}\n${parentLines}\n---\n\n${bodyText}\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](validator.md)\n  - Towards: self\n  - Value: ${checksum}\n`;
}

function sourceFixture(name = 'Recon') {
  const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name });
  assert.equal(created.ok, true);
  const sourceAdded = lifecycle.addWorkspaceSource(created.state, created.workspace.id, { label: 'Repo', repository: 'owner/repo', ref: 'main', rootPath: '.topics' });
  assert.equal(sourceAdded.ok, true);
  return { state: sourceAdded.state, workspaceId: created.workspace.id, sourceId: sourceAdded.source.id };
}

function discoveryTitles(workspace) {
  return buildWorkspaceDiscoveryView(workspace, { records: workspace.records }).records.map((record) => record.title);
}

{
  const { state, workspaceId, sourceId } = sourceFixture('Checksum cluster');
  const parent = createRecordFromMarkdown(markdown('Parent Leaf', 'parent-hash'), { path: '.topics/parent.trace.md', sourceMode: 'archive-local' });
  const local = createRecordFromMarkdown(markdown('Same Leaf', 'same-hash', '', '.topics/parent.trace.md'), { path: '.topics/same.trace.md', sourceMode: 'archive-local' });
  const localAdded = lifecycle.addWorkspaceRecords(state, workspaceId, [parent, local]);
  assert.equal(localAdded.ok, true);
  const source = createRecordFromMarkdown(markdown('Same Leaf', 'same-hash', '', '.topics/parent.trace.md'), { path: 'same.trace.md', sourceMode: 'source' });
  const sourceAdded = lifecycle.addWorkspaceSourceRecords(localAdded.state, workspaceId, sourceId, [source]);
  assert.equal(sourceAdded.ok, true);
  const workspace = lifecycle.activeWorkspace(sourceAdded.state);
  assert.equal(workspace.records.length, 2, 'verified source takeover keeps parent + one canonical source artifact');
  assert.equal(workspace.records.filter((record) => record.title === 'Same Leaf').length, 1, 'identical local duplicate is pruned when verified source becomes canonical');
  const canonical = workspace.records.find((record) => record.source?.id === sourceId && record.title === 'Same Leaf');
  assert(canonical, 'source canonical variant should exist');
  assert.equal(canonical.materialReconciliation.status, 'source-canonical-pruned-local-duplicate');
  assert.equal(recordMaterialBadge(canonical), 'source-backed');
  assert.deepEqual(discoveryTitles(workspace).filter((title) => title === 'Same Leaf'), ['Same Leaf'], 'feed/tree readmodel should show one visible artifact identity');
  assert.equal(workspace.sources.find((item) => item.id === 'local').count, 1, 'Local count should retain only independent local material after exact duplicate pruning');
  assert.equal(workspace.sources.find((item) => item.id === sourceId).count, 1, 'Configured source count should include canonical source material');

  const closed = lifecycle.closeWorkspaceSource(sourceAdded.state, workspaceId, sourceId);
  assert.equal(closed.ok, true);
  const restoredWorkspace = lifecycle.activeWorkspace(closed.state);
  assert.equal(restoredWorkspace.records.filter((record) => record.title === 'Same Leaf').length, 0, 'closing source must not resurrect a local copy that was already deduplicated as source-owned');
}

{
  const { state, workspaceId, sourceId } = sourceFixture('Stable source path readmodel');
  const local = createRecordFromMarkdown(markdown('Moved Leaf', 'stable-hash'), { path: '.topics/imported/old-comment-123.trace.md', sourceMode: 'archive-local' });
  const localAdded = lifecycle.addWorkspaceRecords(state, workspaceId, [local]);
  const source = createRecordFromMarkdown(markdown('Moved Leaf', 'stable-hash'), { path: '.topics/.github/owner/repo/.issues/1/001-moved-leaf.trace.md', sourceMode: 'source' });
  const sourceAdded = lifecycle.addWorkspaceSourceRecords(localAdded.state, workspaceId, sourceId, [source]);
  const workspace = lifecycle.activeWorkspace(sourceAdded.state);
  assert.equal(workspace.records.length, 1, 'verified equivalent material should collapse to the stable source path');
  const visible = buildWorkspaceDiscoveryView(workspace, { records: workspace.records }).records;
  assert.equal(visible.length, 1, 'stable source path wins in the readmodel instead of by deleting the local record');
  assert.equal(visible[0].path, '.topics/.github/owner/repo/.issues/1/001-moved-leaf.trace.md');
  assert.equal(visible[0].materialReconciliation.matchedBy, 'checksum:self');
}

{
  const { state, workspaceId, sourceId } = sourceFixture('Semantic same body is not enough');
  const local = createRecordFromMarkdown(markdown('Semantic Leaf', 'old-envelope-hash', '# Semantic Leaf\n\nSame authored body.'), { path: '.topics/local-semantic.trace.md', sourceMode: 'archive-local' });
  const localAdded = lifecycle.addWorkspaceRecords(state, workspaceId, [local]);
  const source = createRecordFromMarkdown(markdown('Semantic Leaf', 'new-envelope-hash', '# Semantic Leaf\n\nSame authored body.'), { path: '.topics/source-semantic.trace.md', sourceMode: 'source' });
  const sourceAdded = lifecycle.addWorkspaceSourceRecords(localAdded.state, workspaceId, sourceId, [source]);
  const workspace = lifecycle.activeWorkspace(sourceAdded.state);
  assert.equal(workspace.records.length, 2, 'same title/body without matching checksum or identity must not auto-collapse records');
  assert.equal(workspace.records.some((record) => record.materialReconciliation?.status === 'semantic-match'), false, 'semantic-match auto merge must remain disabled');
}

{
  const { state, workspaceId, sourceId } = sourceFixture('Checksum mismatch');
  const local = createRecordFromMarkdown(markdown('Diverged Leaf', 'old-hash', '# Diverged Leaf\n\nOld local body.'), { path: '.topics/diverged.trace.md', sourceMode: 'archive-local' });
  const localAdded = lifecycle.addWorkspaceRecords(state, workspaceId, [local]);
  assert.equal(localAdded.ok, true);
  const source = createRecordFromMarkdown(markdown('Diverged Leaf', 'new-hash', '# Diverged Leaf\n\nNew source body.'), { path: 'diverged.trace.md', sourceMode: 'source' });
  const sourceAdded = lifecycle.addWorkspaceSourceRecords(localAdded.state, workspaceId, sourceId, [source]);
  assert.equal(sourceAdded.ok, true);
  const workspace = lifecycle.activeWorkspace(sourceAdded.state);
  assert.equal(workspace.records.length, 2, 'checksum mismatch should not collapse local/source material');
  assert.equal(workspace.records.filter((record) => record.materialReconciliation?.status === 'checksum-mismatch').length, 2, 'both sides of mismatch should be marked explicitly');
  assert(workspace.records.some((record) => record.source.id === sourceId), 'source side should remain visible');
  assert(workspace.records.some((record) => record.source.kind === lifecycle.SESSION_SOURCE_KIND), 'local side should remain visible');
}

{
  const { state, workspaceId, sourceId } = sourceFixture('Local clear strips retained copy');
  const local = createRecordFromMarkdown(markdown('Clearable Leaf', 'clear-hash'), { path: '.topics/clear.trace.md', sourceMode: 'archive-local' });
  const localAdded = lifecycle.addWorkspaceRecords(state, workspaceId, [local]);
  const source = createRecordFromMarkdown(markdown('Clearable Leaf', 'clear-hash'), { path: 'clear.trace.md', sourceMode: 'source' });
  const sourceAdded = lifecycle.addWorkspaceSourceRecords(localAdded.state, workspaceId, sourceId, [source]);
  const cleared = lifecycle.closeWorkspaceSource(sourceAdded.state, workspaceId, 'local');
  assert.equal(cleared.ok, true);
  const workspace = lifecycle.activeWorkspace(cleared.state);
  assert.equal(workspace.records.length, 1, 'clearing Local leaves canonical source-backed material');
  assert.equal(workspace.records[0].materialReconciliation.status, 'source-canonical-pruned-local-duplicate');
  assert.equal(workspace.sources.find((item) => item.id === 'local').count, 0, 'Local count should drop after retained local copy is cleared');
}

{
  const { state, workspaceId, sourceId } = sourceFixture('Issue comment hash identity');
  const localA = createRecordFromMarkdown(markdown('Comment A', 'hash-a'), { path: 'https://github.com/owner/repo/issues/1#issuecomment-111', sourceMode: 'archive-local' });
  const localB = createRecordFromMarkdown(markdown('Comment B', 'hash-b'), { path: 'https://github.com/owner/repo/issues/1#issuecomment-222', sourceMode: 'archive-local' });
  const localAdded = lifecycle.addWorkspaceRecords(state, workspaceId, [localA, localB]);
  const sourceA = createRecordFromMarkdown(markdown('Comment A', 'hash-a'), { path: 'https://github.com/owner/repo/issues/1#issuecomment-111', sourceMode: 'source' });
  const sourceAdded = lifecycle.addWorkspaceSourceRecords(localAdded.state, workspaceId, sourceId, [sourceA]);
  const workspace = lifecycle.activeWorkspace(sourceAdded.state);
  assert.equal(workspace.records.filter((record) => /Comment/.test(record.title)).length, 2, 'matching one issue comment prunes only its identical local duplicate while preserving sibling comments');
  assert(workspace.records.some((record) => record.title === 'Comment B' && !record.materialReconciliation), 'sibling issue comment stays independent');
}


{
  const { state, workspaceId, sourceId } = sourceFixture('Container URL is provenance, not artifact identity');
  const first = createRecordFromMarkdown(markdown('Same issue artifact one', 'container-one'), { path: '.topics/.github/owner/repo/.issues/1/001-one.trace.md', sourceMode: 'source' });
  const second = createRecordFromMarkdown(markdown('Same issue artifact two', 'container-two'), { path: '.topics/.github/owner/repo/.issues/1/002-two.trace.md', sourceMode: 'source' });
  const withContainer = [first, second].map((record, index) => Object.assign({}, record, {
    recoveredFromUrl: 'https://github.com/owner/repo/issues/1',
    snapshot: Object.assign({}, record.snapshot || {}, { sourceUrl: 'https://github.com/owner/repo/issues/1' }),
    sourceTarget: Object.assign({}, record.sourceTarget || {}, { surface: 'issueSnapshots', inputTarget: 'https://github.com/owner/repo/issues/1', sourceArtifactPath: record.path, sourceOrdinal: index })
  }));
  const sourceAdded = lifecycle.addWorkspaceSourceRecords(state, workspaceId, sourceId, withContainer);
  const workspace = lifecycle.activeWorkspace(sourceAdded.state);
  assert.equal(workspace.records.filter((record) => record.source?.id === sourceId).length, 2, 'different artifact paths from the same issue container must not source-upsert over each other');
}


{
  const { state, workspaceId, sourceId } = sourceFixture('Parent origin is not child identity');
  const childMarkdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Trace: [Parent](parent.trace.md)
  - Origin: [Parent](https://github.com/owner/repo/blob/main/.topics/parent.trace.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Summary: child

---

# Child`;
  const localChild = createRecordFromMarkdown(childMarkdown, { path: '.topics/child.trace.md', sourceMode: 'archive-local' });
  const localAdded = lifecycle.addWorkspaceRecords(state, workspaceId, [localChild]);
  const sourceParent = createRecordFromMarkdown(markdown('Parent', 'parent-hash'), { path: '.topics/parent.trace.md', sourceMode: 'source' });
  const sourceAdded = lifecycle.addWorkspaceSourceRecords(localAdded.state, workspaceId, sourceId, [sourceParent]);
  const workspace = lifecycle.activeWorkspace(sourceAdded.state);
  assert.equal(workspace.records.length, 2, 'loading a declared parent must not shadow the local child that declared that Parent Origin');
  const child = workspace.records.find((record) => record.title === 'Child');
  assert(child, 'declaring child should remain present');
  assert.equal(child.source.kind, lifecycle.SESSION_SOURCE_KIND, 'declaring child should remain local/imported authority');
  assert.equal(child.materialReconciliation?.sourceRecordId || '', '', 'Parent Origin must not be used as the declaring artifact identity');
}

console.log('✓ workspace material reconciliation tests passed');
