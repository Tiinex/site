import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { findLoadedSchemaRecord, openSchemaForRecordCommand } from '../app/schemaNavigationCommand.js';
import { declaredSchemaRecoveryTarget } from '../app/schemaSourceRecovery.js';
import { qualifyRecordCurrentSchemaDeclaration } from '../app/schemaCurrentDeclaration.js';
import { schemaCatalogEntryForId } from '../schemas/schemaMarkdownCatalog.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const topicId = 'tiinex.topic.v1';
const taskId = 'tiinex.task.v1';
const topicMarkdown = readFileSync(new URL('../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8');
const taskMarkdown = readFileSync(new URL('../schemas/core/task/tiinex.task.v1.schema.md', import.meta.url), 'utf8');
const topicEntry = Object.assign({}, schemaCatalogEntryForId(topicId), { markdown: topicMarkdown });

// A1/A2 — 10k ordinary same-schema work artifacts are not reading-contract candidates and are never deep-read.
let ordinaryReads = 0;
const ordinary = Array.from({ length: 10000 }, (_, index) => ({
  id: `ordinary-${index}`,
  schemaId: topicId,
  currentSchemaId: topicId,
  path: `work/${index}.trace.md`,
  get markdown() { ordinaryReads += 1; throw new Error('ordinary same-schema work artifact must not be deep-read'); }
}));
const exactNavigation = exactLoadedTopic('exact-navigation', 'loaded/topic-contract.md');
assert.equal(findLoadedSchemaRecord({ id: 'bounded-10k', records: [...ordinary, exactNavigation] }, topicId)?.id, 'exact-navigation');
assert.equal(ordinaryReads, 0, 'ordinary same-schema work artifacts must not be deep-qualified');

const deterministicThrowingOrdinary = {
  id: 'ordinary-throw', schemaId: topicId, currentSchemaId: topicId, path: 'work/deterministic.trace.md',
  get markdown() { throw new Error('ordinary Topic deep-read'); }
};
assert.equal(findLoadedSchemaRecord({ id: 'ordinary-throw-ws', records: [deterministicThrowingOrdinary, exactNavigation] }, topicId)?.id, 'exact-navigation');

// A3/A4/A5 — reading-contract marker and exact schema-definition path/role can narrow; exact bytes still decide semantic authority.
assert.equal(findLoadedSchemaRecord({ id: 'nav-ws', records: [exactNavigation] }, topicId)?.id, 'exact-navigation');
const pathCandidate = Object.assign(createRecordFromMarkdown(topicMarkdown, { path: `schemas/${topicId}.schema.md`, sourceMode: 'source-backed' }), { id: 'path-candidate', schemaNavigation: undefined });
assert.equal(findLoadedSchemaRecord({ id: 'path-ws', records: [pathCandidate] }, topicId)?.id, 'path-candidate');
const roleCandidate = { id: 'role-candidate', materialRole: 'schema-definition', schemaId: topicId, path: 'mirrors/topic-contract.md', markdown: topicMarkdown };
assert.equal(findLoadedSchemaRecord({ id: 'role-ws', records: [roleCandidate] }, topicId)?.id, 'role-candidate');
const wrongPathCandidate = { id: 'wrong-path', path: `schemas/${topicId}.schema.md`, markdown: '# README\n\nnot a schema reading contract\n' };
assert.equal(findLoadedSchemaRecord({ id: 'wrong-path-ws', records: [wrongPathCandidate] }, topicId), null);

// A6 — malformed candidate fails locally; it cannot abort a separate exact candidate.
const badCandidate = {
  id: 'bad-candidate', path: `other/${topicId}.schema.md`,
  get markdown() { throw new Error('candidate read failure'); }
};
assert.doesNotThrow(() => findLoadedSchemaRecord({ id: 'local-failure-ws', records: [badCandidate, exactNavigation] }, topicId));
assert.equal(findLoadedSchemaRecord({ id: 'local-failure-ws', records: [badCandidate, exactNavigation] }, topicId)?.id, 'exact-navigation');

// A7 — two exact qualified reading contracts remain ambiguous.
const secondExact = exactLoadedTopic('exact-navigation-2', 'loaded/topic-contract-2.md');
assert.equal(findLoadedSchemaRecord({ id: 'ambiguous-loaded', records: [exactNavigation, secondExact] }, topicId), null);
{
  const { state, workspace, record } = workspaceWithRecord(declaringWorkRecord('ambiguous-source', topicId, topicId));
  workspace.records.push(exactNavigation, secondExact);
  const opened = await openSchemaForRecordCommand({ state, workspace, record, schemaEntry: topicEntry });
  assert.equal(opened.ok, false);
  assert.equal(opened.error, 'schema.ambiguous');
}

// B8 — concrete Task declaration contradicting explicit Topic request fails before recovery and before Topic bundled fallback.
{
  const remote = 'https://schemas.example.invalid/topic.schema.md';
  const record = declaringWorkRecord('mismatch-explicit', taskId, topicId, { href: remote });
  const { state, workspace } = workspaceWithRecord(record);
  let fetches = 0;
  const opened = await openSchemaForRecordCommand({
    state, workspace, record, schemaId: topicId, catalog: { [topicId]: topicEntry },
    fetchImpl: async () => { fetches += 1; return response(topicMarkdown); }
  });
  assert.equal(opened.ok, false);
  assert.equal(opened.error, 'schema.declaration.mismatch');
  assert.equal(fetches, 0, 'identity mismatch must stop before retrieval');
}

// B9 — without an explicit request, concrete declaration is the command identity authority over stale cached metadata.
{
  const record = declaringWorkRecord('concrete-wins', topicId, taskId, { href: '' });
  record.schemaId = taskId;
  record.currentSchemaId = taskId;
  const { state, workspace } = workspaceWithRecord(record);
  const opened = await openSchemaForRecordCommand({ state, workspace, record, schemaEntry: topicEntry, clock: () => '2026-08-21T10:00:00.000Z' });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.schemaId, topicId);
  assert.equal(opened.record.schemaNavigation.schemaId, topicId);
}

// B10 — one exact linked Topic declaration + exact remote Topic bytes remains qualified.
{
  const remote = 'https://schemas.example.invalid/topic.schema.md';
  const record = declaringWorkRecord('linked-topic', topicId, topicId, { href: remote });
  const { state, workspace } = workspaceWithRecord(record);
  let fetches = 0;
  const opened = await openSchemaForRecordCommand({ state, workspace, record, catalog: {}, fetchImpl: async (url) => { fetches += 1; return response(String(url) === remote ? topicMarkdown : '', String(url) === remote); } });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(fetches, 1);
  assert.equal(opened.record.schemaNavigation.semanticQualification.state, 'qualified');
}

// B11 — one exact plain schema id may use the installed/bundled reading contract; remote recovery has no invented target.
{
  const record = declaringWorkRecord('plain-topic', topicId, topicId, { href: '' });
  const declaration = qualifyRecordCurrentSchemaDeclaration(record, topicId);
  assert.equal(declaration.state, 'qualified');
  assert.equal(declaration.target, '');
  assert.equal(declaredSchemaRecoveryTarget(record, topicId).ok, false);
  const { state, workspace } = workspaceWithRecord(record);
  let bundledLoads = 0;
  const opened = await openSchemaForRecordCommand({
    state, workspace, record,
    loadSchemaMarkdown: async (schemaId) => { bundledLoads += 1; assert.equal(schemaId, topicId); return topicEntry; }
  });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(bundledLoads, 1);
}

// C12/C13 — duplicate identical or conflicting concrete declarations fail closed before retrieval/fallback.
for (const [name, declarations] of [
  ['duplicate-identical', [`[${topicId}](https://schemas.example.invalid/topic.schema.md)`, `[${topicId}](https://schemas.example.invalid/topic.schema.md)`]],
  ['duplicate-conflicting', [`[${topicId}](https://schemas.example.invalid/topic.schema.md)`, `[${taskId}](https://schemas.example.invalid/task.schema.md)`]]
]) {
  const record = recordWithCurrentSchemaLines(name, declarations, topicId);
  const declaration = qualifyRecordCurrentSchemaDeclaration(record, topicId);
  assert.equal(declaration.state, 'ambiguous', name);
  assert.equal(declaration.occurrences.length, 2, name);
  const { state, workspace } = workspaceWithRecord(record);
  let fetches = 0;
  const opened = await openSchemaForRecordCommand({ state, workspace, record, schemaId: topicId, catalog: { [topicId]: topicEntry }, fetchImpl: async () => { fetches += 1; return response(topicMarkdown); } });
  assert.equal(opened.ok, false, name);
  assert.equal(opened.error, 'schema.declaration.ambiguous', name);
  assert.equal(fetches, 0, name);
}

// C14 — concrete non-shell material with no Current Schema declaration cannot invent identity/target from metadata/path.
{
  const record = Object.assign(createRecordFromMarkdown(`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Created At: 2026-08-21 10:00:00\n  - Summary: missing declaration\n\n---\n\n# Missing declaration\n`, { path: `work/${topicId}.schema.md`, sourceMode: 'archive-local' }), { id: 'missing-declaration', schemaId: topicId, currentSchemaId: topicId });
  const { state, workspace } = workspaceWithRecord(record);
  const opened = await openSchemaForRecordCommand({ state, workspace, record, catalog: { [topicId]: topicEntry } });
  assert.equal(opened.ok, false);
  assert.equal(opened.error, 'schema.declaration.unavailable');
}

// C15 — v465/v466 exact qualification/recovery/provider/Unicode matrices are covered by predecessor suites; keep local direct identity guard too.
assert.equal(qualifyRecordCurrentSchemaDeclaration(declaringWorkRecord('exact-identity', topicId, topicId), topicId).state, 'qualified');
assert.equal(qualifyRecordCurrentSchemaDeclaration(declaringWorkRecord('wrong-identity', taskId, topicId), topicId).state, 'mismatch');

// C16 — declarative only: no remote executable seam introduced.
for (const sourceFile of ['../app/schemaCurrentDeclaration.js', '../app/schemaSourceRecovery.js', '../app/schemaNavigationCommand.js', '../app/schemaReadingContractQualification.js']) {
  const source = readFileSync(new URL(sourceFile, import.meta.url), 'utf8');
  assert.equal(/\beval\s*\(|\bnew\s+Function\s*\(|import\s*\(\s*['"`]https?:/u.test(source), false, sourceFile);
}

console.log('post-v467 schema reading-contract candidate role + declaration authority correction: PASS');

function exactLoadedTopic(id, path) {
  return Object.assign(createRecordFromMarkdown(topicMarkdown, { path, sourceMode: 'source-backed' }), {
    id,
    schemaNavigation: { schema: 'tiinex.workspace.schemaNavigation.v1', schemaId: topicId, reason: 'reading-contract-badge' }
  });
}

function declaringWorkRecord(id, declaredSchemaId, metadataSchemaId = declaredSchemaId, options = {}) {
  const value = options.href ? `[${declaredSchemaId}](${options.href})` : declaredSchemaId;
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${value}\n  - Created At: 2026-08-21 10:00:00\n  - Summary: v467 fixture\n\n---\n\n# ${id}\n\nBody.\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path: `work/${id}.trace.md`, sourceMode: 'archive-local' }), { id, schemaId: metadataSchemaId, currentSchemaId: metadataSchemaId });
}

function recordWithCurrentSchemaLines(id, declarations, metadataSchemaId) {
  const lines = declarations.map((value) => `  - Current Schema: ${value}`).join('\n');
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n${lines}\n  - Created At: 2026-08-21 10:00:00\n  - Summary: v467 multiplicity\n\n---\n\n# ${id}\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path: `work/${id}.trace.md`, sourceMode: 'archive-local' }), { id, schemaId: metadataSchemaId, currentSchemaId: metadataSchemaId });
}

function workspaceWithRecord(record) {
  const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: `ws-${record.id}`, name: record.id }).state;
  const workspace = lifecycle.activeWorkspace(created);
  workspace.records = [record];
  return { state: created, workspace, record };
}

function response(body, ok = true) { return { ok, status: ok ? 200 : 404, text: async () => body }; }
