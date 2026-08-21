import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { findLoadedSchemaRecord, openSchemaForRecordCommand } from '../app/schemaNavigationCommand.js';
import { declaredSchemaRecoveryTarget, recoverDeclaredSchemaEntry } from '../app/schemaSourceRecovery.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const topicSchemaId = 'tiinex.topic.v1';
const topicMarkdown = readFileSync(new URL('../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8');
const forged = Object.freeze({ state: 'qualified', requestedSchemaId: topicSchemaId, observedSchemaId: topicSchemaId });

// A1/A2/A3 — final open boundary derives semantic authority from concrete bytes + requested id, never a status marker.
let state = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'v466-final-gate', name: 'v466 final gate' }).state;
let workspace = lifecycle.activeWorkspace(state);
const localRecord = declaringRecord('local', topicSchemaId, '', { adapterId: 'local' });
workspace.records = [localRecord];
const directForged = await openSchemaForRecordCommand({
  state, workspace, record: localRecord,
  schemaEntry: { path: 'forged.schema.md', markdown: '# README\n\nnot tiinex\n', semanticQualification: forged }
});
assert.equal(directForged.ok, false);
assert.equal(directForged.error, 'schema.unavailable');
assert.equal(directForged.semanticQualification.state, 'unavailable');

const loadForged = await openSchemaForRecordCommand({
  state, workspace, record: localRecord, catalog: { [topicSchemaId]: { path: 'pending.schema.md' } },
  loadSchemaMarkdown: async () => ({ path: 'forged-loaded.schema.md', markdown: '# README\n\nnot tiinex\n', semanticQualification: forged })
});
assert.equal(loadForged.ok, false);
assert.equal(loadForged.error, 'schema.unavailable');

const wrongClaim = await openSchemaForRecordCommand({
  state, workspace, record: localRecord,
  schemaEntry: { path: 'wrong-claim.schema.md', markdown: '# README\n\nnot tiinex\n', semanticQualification: { state: 'qualified', requestedSchemaId: 'tiinex.task.v1' } }
});
assert.equal(wrongClaim.ok, false);
assert.equal(wrongClaim.semanticQualification.requestedSchemaId, topicSchemaId);

const exactDirect = await openSchemaForRecordCommand({
  state, workspace, record: localRecord,
  schemaEntry: { path: 'topic.schema.md', markdown: topicMarkdown, semanticQualification: { state: 'unavailable' } },
  clock: () => '2026-08-21T09:00:00.000Z'
});
assert.equal(exactDirect.ok, true, exactDirect.error);
assert.equal(exactDirect.record.schemaNavigation.semanticQualification.state, 'qualified');

// B — target resolution is total, repository-bounded, target-faithful, and GitHub promotion is lexical-owner specific.
for (const surrogate of [String.fromCharCode(0xD800), String.fromCharCode(0xDC00)]) {
  const hrefRecord = declaringRecord('surrogate-href', topicSchemaId, `schema-${surrogate}.md`, githubSource('Acme/repo', 'main'), 'dir/topic.trace.md');
  let target;
  assert.doesNotThrow(() => { target = declaredSchemaRecoveryTarget(hrefRecord, topicSchemaId); });
  assert.equal(target.ok, false);

  const refRecord = declaringRecord('surrogate-ref', topicSchemaId, 'schema.md', githubSource('Acme/repo', `main${surrogate}`), 'dir/topic.trace.md');
  assert.doesNotThrow(() => { target = declaredSchemaRecoveryTarget(refRecord, topicSchemaId); });
  assert.equal(target.ok, false);

  const pathRecord = declaringRecord('surrogate-path', topicSchemaId, 'schema.md', githubSource('Acme/repo', 'main'), `dir/${surrogate}.trace.md`);
  assert.doesNotThrow(() => { target = declaredSchemaRecoveryTarget(pathRecord, topicSchemaId); });
  assert.equal(target.ok, false);
}

const unicodeRecord = declaringRecord('unicode', topicSchemaId, 'schema-😀.md', githubSource('Acme/repo', 'main'), 'dir/😀.trace.md');
const unicodeTarget = declaredSchemaRecoveryTarget(unicodeRecord, topicSchemaId);
assert.equal(unicodeTarget.ok, true, unicodeTarget.reason);
assert(unicodeTarget.fetchUrl.includes('%F0%9F%98%80'));
assert.equal(unicodeTarget.fetchUrl.includes('%EF%BF%BD'), false);

const insideParent = declaringRecord('inside-parent', topicSchemaId, '../schema.md', githubSource('Acme/repo', 'main'), 'dir/sub/topic.trace.md');
const insideTarget = declaredSchemaRecoveryTarget(insideParent, topicSchemaId);
assert.equal(insideTarget.ok, true, insideTarget.reason);
assert.equal(insideTarget.path, 'dir/schema.md');
assert.equal(insideTarget.fetchUrl, 'https://raw.githubusercontent.com/Acme/repo/main/dir/schema.md');

const escaping = declaringRecord('escape', topicSchemaId, '../../topic.schema.md', githubSource('Acme/repo', 'main'), 'dir/topic.trace.md');
assert.equal(declaredSchemaRecoveryTarget(escaping, topicSchemaId).ok, false);

for (const source of [
  githubSource('Acme/../Other', 'main'),
  githubSource('Acme/.', 'main'),
  githubSource('Acme/repo', '..'),
  githubSource('Acme/repo', '.')
]) {
  const record = declaringRecord('dot', topicSchemaId, 'schema.md', source, 'dir/topic.trace.md');
  const target = declaredSchemaRecoveryTarget(record, topicSchemaId);
  assert.equal(target.ok, false, `${source.repo} @ ${source.ref}`);
}

for (const href of ['schema.md#fragment', 'schema.md?query=1', 'foo%20bar.schema.md']) {
  const record = declaringRecord('relative-syntax', topicSchemaId, href, githubSource('Acme/repo', 'main'), 'dir/topic.trace.md');
  const target = declaredSchemaRecoveryTarget(record, topicSchemaId);
  assert.equal(target.ok, false, href);
}

const canonicalBlob = `https://github.com/Tiinex/docs/blob/main/.topics/.schemas/tiinex.topic.v1.schema.md`;
const canonicalRaw = `https://raw.githubusercontent.com/Tiinex/docs/main/.topics/.schemas/tiinex.topic.v1.schema.md`;
for (const href of [canonicalBlob, canonicalRaw]) {
  const target = declaredSchemaRecoveryTarget(declaringRecord('canonical', topicSchemaId, href, { adapterId: 'local' }), topicSchemaId);
  assert.equal(target.ok, true, href);
  assert.equal(target.source.adapterId, 'github', href);
  assert.equal(target.repo, 'Tiinex/docs', href);
  assert.equal(target.fetchUrl, canonicalRaw, href);
}

for (const href of [
  'http://github.com/Tiinex/docs/blob/main/.topics/.schemas/tiinex.topic.v1.schema.md',
  'https://user:pass@github.com/Tiinex/docs/blob/main/.topics/.schemas/tiinex.topic.v1.schema.md',
  'https://github.com:444/Tiinex/docs/blob/main/.topics/.schemas/tiinex.topic.v1.schema.md',
  'https://raw.githubusercontent.com:444/Tiinex/docs/main/.topics/.schemas/tiinex.topic.v1.schema.md'
]) {
  const target = declaredSchemaRecoveryTarget(declaringRecord('noncanonical', topicSchemaId, href, { adapterId: 'local' }), topicSchemaId);
  assert.equal(target.ok, true, href);
  assert.equal(target.source.adapterId, 'http', href);
  assert.equal(target.fetchUrl, href, href);
}

const mirrorUrl = 'https://schemas.example.invalid/topic.schema.md';
const mirrorRecord = declaringRecord('mirror', topicSchemaId, mirrorUrl, { adapterId: 'local' });
const mirrorRecovery = await recoverDeclaredSchemaEntry({
  record: mirrorRecord, schemaId: topicSchemaId,
  fetchImpl: async (url) => response(String(url) === mirrorUrl ? topicMarkdown : '', String(url) === mirrorUrl)
});
assert.equal(mirrorRecovery.ok, true, mirrorRecovery.reason);
assert.equal(mirrorRecovery.source.adapterId, 'http');
assert.equal(mirrorRecovery.semanticQualification.state, 'qualified');

// C — cheap candidate evidence narrows deep reads, while exact bytes remain the only semantic authority.
let unrelatedMarkdownReads = 0;
const unrelated = {
  id: 'unrelated', schemaId: 'tiinex.task.v1', path: 'notes/unrelated.md',
  get markdown() { unrelatedMarkdownReads += 1; throw new Error('unrelated markdown must not be deep-read'); }
};
const loadedTopic = Object.assign(createRecordFromMarkdown(topicMarkdown, { path: 'mirrors/topic-contract.md', sourceMode: 'source-backed' }), {
  id: 'loaded-topic',
  schemaNavigation: { schema: 'tiinex.workspace.schemaNavigation.v1', schemaId: topicSchemaId, reason: 'reading-contract-badge' }
});
const boundedWorkspace = { id: 'bounded', records: [unrelated, loadedTopic] };
assert.equal(findLoadedSchemaRecord(boundedWorkspace, topicSchemaId)?.id, 'loaded-topic');
assert.equal(unrelatedMarkdownReads, 0);

const filenameOnly = {
  id: 'filename-only', path: 'random/tiinex.topic.v1.schema.md', schemaId: '',
  markdown: '# README\n\nfilename is candidate evidence only\n'
};
assert.equal(findLoadedSchemaRecord({ id: 'filename-only-ws', records: [filenameOnly] }, topicSchemaId), null);

const duplicateLoaded = Object.assign({}, loadedTopic, { id: 'loaded-topic-2', path: 'other/topic-contract.md' });
assert.equal(findLoadedSchemaRecord({ id: 'ambiguous', records: [loadedTopic, duplicateLoaded] }, topicSchemaId), null);

// Security guard — recovery/navigation remain declarative; no remote executable seam is introduced.
for (const sourceFile of ['../app/schemaSourceRecovery.js', '../app/schemaNavigationCommand.js', '../app/schemaReadingContractQualification.js']) {
  const source = readFileSync(new URL(sourceFile, import.meta.url), 'utf8');
  assert.equal(/\beval\s*\(|\bnew\s+Function\s*\(|import\s*\(\s*['"`]https?:/u.test(source), false, sourceFile);
}

console.log('post-v466 schema recovery authority + bounded discovery correction: PASS');

function declaringRecord(id, schemaId, href, source = { adapterId: 'local' }, path = `${id}.trace.md`) {
  const currentSchema = href ? `[${schemaId}](${href})` : schemaId;
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${currentSchema}\n  - Created At: 2026-08-21 09:00:00\n  - Summary: v466 recovery fixture\n\n---\n\n# Fixture\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path, sourceMode: 'archive-local' }), { id, path, source });
}

function githubSource(repo, ref) {
  return { id: `github:${repo}`, adapterId: 'github', sourceKind: 'github.repo', repo, repository: repo, ref, sourceBacked: true };
}

function response(body, ok = true) {
  return { ok, status: ok ? 200 : 404, text: async () => body };
}
