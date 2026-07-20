import assert from 'assert';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';

// Load the lifecycle to attach to globalThis
await import('./workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;

function fail(msg) { throw new Error(msg); }

try {
  // 1) createRecordFromMarkdown preserves current shape and does not add createdAt/source
  const md = '# Title\n\nSome body text';
  const rec = createRecordFromMarkdown(md, { path: 'a.md', name: 'a.md', sourceMode: 'manual-file' });
  assert(rec && rec.id && rec.title, 'record shape missing id/title');
  if ('createdAt' in rec) fail('createRecordFromMarkdown must not add createdAt');
  if ('source' in rec) fail('createRecordFromMarkdown must not add source');

  // 2) Normal addWorkspaceRecords keeps local/session provenance
  const base = lifecycle.makeEmptyAppState();
  const create = lifecycle.createWorkspace(base, { name: 'Test' });
  if (!create?.ok) fail('createWorkspace failed');
  const ws = create.workspace;
  const addLocal = lifecycle.addWorkspaceRecords(create.state, ws.id, [rec]);
  if (!addLocal?.ok) fail('addWorkspaceRecords failed');
  const added = addLocal.records[0];
  if (!added?.source || added.source.kind !== lifecycle.SESSION_SOURCE_KIND) fail('local record must have session source');

  // ensure adding records using 'local' as sourceId is rejected
  const badLocal = lifecycle.addWorkspaceSourceRecords(addLocal.state, ws.id, 'local', [rec]);
  if (badLocal?.ok || badLocal?.error !== 'source.not.configured') fail('addWorkspaceSourceRecords must reject local sourceId');

  // 3) Add configured source and verify addWorkspaceSourceRecords behavior
  const addSource = lifecycle.addWorkspaceSource(addLocal.state, ws.id, { label: 'Repo', repository: 'owner/repo', ref: 'master', rootPath: '.topics', count: 0, transportLabel: 'Source Pages mirror' });
  if (!addSource?.ok) fail('addWorkspaceSource failed');
  const sourceId = addSource.source.id;

  const srcRec = createRecordFromMarkdown('# S\n\nbody', { path: '.topics/1.md', name: '1.md', sourceMode: 'source' });
  const addSrcRes = lifecycle.addWorkspaceSourceRecords(addSource.state, ws.id, sourceId, [srcRec]);
  if (!addSrcRes?.ok) fail('addWorkspaceSourceRecords failed');
  const inserted = addSrcRes.records[0];
  if (!inserted?.source || inserted.source.id !== sourceId) fail('inserted record must have explicit source provenance');
  const foundSource = addSrcRes.workspace.sources.find((s) => s.id === sourceId);
  if (!foundSource) fail('configured source not present after insert');
  if (!(Number(foundSource.count) > 0)) fail('configured source count not updated');
  if (addSrcRes.workspace.discoveryProgress) fail('discoveryProgress must remain untouched/null by insertion');

  // 4) Unknown sourceId should fail
  const bad = lifecycle.addWorkspaceSourceRecords(addSrcRes.state, ws.id, 'nope', [srcRec]);
  if (bad?.ok) fail('addWorkspaceSourceRecords must fail for unknown source');

  console.log('✓ workspace.lifecycle tests passed');
  process.exit(0);
} catch (err) {
  console.error('workspace.lifecycle tests failed:', err && err.stack ? err.stack : err);
  process.exit(1);
}

