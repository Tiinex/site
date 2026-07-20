import assert from 'assert';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';

// Load the lifecycle to attach to globalThis
await import('./workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;

function fail(msg) { throw new Error(msg); }

try {
  // 1) createRecordFromMarkdown now returns a record-shaped input only
  //    (identity and provenance are assigned by the lifecycle layer)
  const md = '# Title\n\nSome body text';
  const rec = createRecordFromMarkdown(md, { path: 'a.md', name: 'a.md', sourceMode: 'manual-file' });
  assert(rec && rec.title, 'record shape missing title');
  if ('id' in rec) fail('createRecordFromMarkdown must not add id');
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
  if (added.path !== 'a.md') fail('local record must preserve path');
  if (!added.markdown || !added.markdown.includes('# Title')) fail('local record must preserve markdown for detail view');

  // 2b) Same local path is an idempotent upsert, and same-title/different-path files remain distinct
  const samePathAgain = createRecordFromMarkdown('# Title\n\nUpdated body', { path: 'a.md', name: 'a.md', sourceMode: 'manual-file' });
  const addLocalAgain = lifecycle.addWorkspaceRecords(addLocal.state, ws.id, [samePathAgain]);
  if (!addLocalAgain?.ok) fail('addWorkspaceRecords failed for repeated local path');
  const afterLocalAgain = lifecycle.activeWorkspace(addLocalAgain.state);
  const localARecords = afterLocalAgain.records.filter((item) => item.path === 'a.md');
  if (localARecords.length !== 1) fail('repeated local path must upsert to one record');
  if (!String(localARecords[0].markdown || '').includes('Updated body')) fail('repeated local path must update material');
  const secondPath = createRecordFromMarkdown('# Title\n\nOther body', { path: 'folder/a.md', name: 'a.md', sourceMode: 'manual-folder' });
  const addSecondPath = lifecycle.addWorkspaceRecords(addLocalAgain.state, ws.id, [secondPath]);
  if (!addSecondPath?.ok) fail('addWorkspaceRecords failed for same title different path');
  const afterSecondPath = lifecycle.activeWorkspace(addSecondPath.state);
  if (!afterSecondPath.records.some((item) => item.path === 'a.md') || !afterSecondPath.records.some((item) => item.path === 'folder/a.md')) fail('same title with distinct paths must remain distinct records');


  // ensure adding records using 'local' as sourceId is rejected
  const badLocal = lifecycle.addWorkspaceSourceRecords(addLocal.state, ws.id, 'local', [rec]);
  if (badLocal?.ok || badLocal?.error !== 'source.not.configured') fail('addWorkspaceSourceRecords must reject local sourceId');

  // 3) Add configured source and verify addWorkspaceSourceRecords behavior
  const addSource = lifecycle.addWorkspaceSource(addSecondPath.state, ws.id, { label: 'Repo', repository: 'owner/repo', ref: 'master', rootPath: '.topics', count: 0, transportLabel: 'Source Pages mirror' });
  if (!addSource?.ok) fail('addWorkspaceSource failed');
  const sourceId = addSource.source.id;

  const srcRec = createRecordFromMarkdown('# S\n\nbody', { path: '.topics/1.md', name: '1.md', sourceMode: 'source' });
  const addSrcRes = lifecycle.addWorkspaceSourceRecords(addSource.state, ws.id, sourceId, [srcRec]);
  if (!addSrcRes?.ok) fail('addWorkspaceSourceRecords failed');
  const inserted = addSrcRes.records[0];
  if (!inserted?.source || inserted.source.id !== sourceId) fail('inserted record must have explicit source provenance');
  if (!inserted?.id || !String(inserted.id).startsWith('source:')) fail('source-backed record must have deterministic source id');
  if (String(inserted.path || '') !== '.topics/1.md') fail('source-backed record path must be canonicalized to include rootPath');
  const foundSource = addSrcRes.workspace.sources.find((s) => s.id === sourceId);
  if (!foundSource) fail('configured source not present after insert');
  if (!(Number(foundSource.count) > 0)) fail('configured source count not updated');
  if (addSrcRes.workspace.discoveryProgress) fail('discoveryProgress must remain untouched/null by insertion');

  // 4) Unknown sourceId should fail
  const bad = lifecycle.addWorkspaceSourceRecords(addSrcRes.state, ws.id, 'nope', [srcRec]);
  if (bad?.ok) fail('addWorkspaceSourceRecords must fail for unknown source');

  // 5) Path variant case: different logical path forms should dedupe to one record
  const variants = [
    createRecordFromMarkdown('# V\n\nbody', { path: '.topics/README.md', name: 'README.md', sourceMode: 'source' }),
    createRecordFromMarkdown('# V\n\nbody', { path: 'README.md', name: 'README.md', sourceMode: 'source' }),
    createRecordFromMarkdown('# V\n\nbody', { path: './README.md', name: 'README.md', sourceMode: 'source' }),
    createRecordFromMarkdown('# V\n\nbody', { path: 'https://raw.githubusercontent.com/owner/repo/master/README.md', name: 'README.md', sourceMode: 'source' })
  ];

  // Capture prev configured-source count, then insert variants sequentially
  const prevCount = Number(addSrcRes.workspace.sources.find((s) => s.id === sourceId)?.count || 0);
  let currentState = addSrcRes.state;
  for (const v of variants) {
    const res = lifecycle.addWorkspaceSourceRecords(currentState, ws.id, sourceId, [v]);
    if (!res?.ok) fail('addWorkspaceSourceRecords failed for variant insert');
    currentState = res.state;
  }

  // Final assertions against the workspace state after sequential inserts
  const finalWorkspace = lifecycle.activeWorkspace(currentState);
  const cfg = finalWorkspace.sources.find((s) => s.id === sourceId);
  if (!cfg) fail('configured source missing after variants');
  if (Number(cfg.count) !== prevCount + 1) fail('expected source count to increase by exactly 1 for README variants');
  if (lifecycle.countLocalRecords(finalWorkspace) !== 2) fail('local source count must include only local records and not source-backed records');
  const found = finalWorkspace.records.filter((r) => r.source && r.source.id === sourceId && r.path === '.topics/README.md');
  if (found.length !== 1) fail('workspace must contain a single canonical source-backed record for the logical README');
  const single = found[0];
  if (!single.id || !single.id.startsWith('source:')) fail('canonical record must have source id');
  if (single.id !== `source:${sourceId}:.topics/README.md`) fail('canonical README id mismatch');
  if (finalWorkspace.discoveryProgress) fail('discoveryProgress must remain untouched/null by insertion');

  console.log('✓ workspace.lifecycle tests passed');
  process.exit(0);
} catch (err) {
  console.error('workspace.lifecycle tests failed:', err && err.stack ? err.stack : err);
  process.exit(1);
}

