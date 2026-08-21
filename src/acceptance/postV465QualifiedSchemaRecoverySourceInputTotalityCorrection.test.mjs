import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { findLoadedSchemaRecord, openSchemaForRecordCommand } from '../app/schemaNavigationCommand.js';
import { recoverDeclaredSchemaEntry } from '../app/schemaSourceRecovery.js';
import { qualifySchemaReadingContractMarkdown } from '../app/schemaReadingContractQualification.js';
import { canonicalGithubSchemaSourceTargets, qualifyExactGithubSchemaSourceTarget, qualifyGithubSchemaSourceProvider } from '../schemas/schema.githubSourceTarget.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const topicMarkdown = readFileSync(new URL('../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8');
const taskMarkdown = readFileSync(new URL('../schemas/core/task/tiinex.task.v1.schema.md', import.meta.url), 'utf8');

// A1. Retrieval authority is not semantic schema authority.
const arbitraryTarget = 'https://example.invalid/README.md';
const arbitraryRecord = declaringRecord('arbitrary', 'example.custom.v1', arbitraryTarget);
const arbitraryRecovery = await recoverDeclaredSchemaEntry({
  record: arbitraryRecord,
  schemaId: 'example.custom.v1',
  fetchImpl: async (url) => response(String(url) === arbitraryTarget ? '# Totally unrelated README\n\nhello\n' : '', String(url) === arbitraryTarget)
});
assert.equal(arbitraryRecovery.ok, false);
assert.equal(arbitraryRecovery.retrievalState, 'retrieved');
assert.equal(arbitraryRecovery.reason, 'schema-reading-contract-unqualified');
assert.equal(arbitraryRecovery.semanticQualification.state, 'unavailable');
assert.equal(arbitraryRecovery.semanticQualification.moduleAuthorityState, 'unavailable');

// A2. A Tiinex artifact for a different exact schema cannot satisfy the requested schema reading contract.
const wrongIdentityTarget = 'https://example.invalid/topic-request/task.schema.md';
const wrongIdentityRecord = declaringRecord('wrong-identity', 'tiinex.topic.v1', wrongIdentityTarget);
const wrongIdentityRecovery = await recoverDeclaredSchemaEntry({
  record: wrongIdentityRecord,
  schemaId: 'tiinex.topic.v1',
  fetchImpl: async () => response(taskMarkdown)
});
assert.equal(wrongIdentityRecovery.ok, false);
assert.equal(wrongIdentityRecovery.semanticQualification.identityState, 'unavailable');
assert.equal(wrongIdentityRecovery.semanticQualification.observedSchemaId, 'tiinex.task.v1');

// A3. Provider is independent from semantic qualification: an exact supported schema mirror may qualify over non-GitHub HTTP(S).
const mirrorTarget = 'https://schemas.example.invalid/tiinex.topic.v1.schema.md';
const mirrorRecord = declaringRecord('mirror', 'tiinex.topic.v1', mirrorTarget);
const mirrorQualification = qualifySchemaReadingContractMarkdown(topicMarkdown, 'tiinex.topic.v1');
assert.equal(mirrorQualification.state, 'qualified');
let state = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'v465-mirror', name: 'v465 mirror' }).state;
let workspace = lifecycle.activeWorkspace(state);
workspace.records = [mirrorRecord];
const mirrorOpened = await openSchemaForRecordCommand({
  state,
  workspace,
  record: mirrorRecord,
  catalog: {},
  fetchImpl: async (url) => response(String(url) === mirrorTarget ? topicMarkdown : '', String(url) === mirrorTarget),
  clock: () => '2026-08-21T08:00:00.000Z'
});
assert.equal(mirrorOpened.ok, true, mirrorOpened.error);
assert.equal(mirrorOpened.record.source.adapterId, 'http');
assert.equal(mirrorOpened.record.schemaNavigation.semanticQualification.state, 'qualified');
assert.equal(mirrorOpened.record.schemaNavigation.schemaId, 'tiinex.topic.v1');

// B1. Filename-only discovery evidence cannot self-certify schema identity.
const fakeFilenameRecord = Object.assign(createRecordFromMarkdown('# README\n\nnot a schema contract\n', {
  path: 'random/example.custom.v1.schema.md',
  sourceMode: 'archive-local'
}), { id: 'fake-filename' });
const fakeWorkspace = { id: 'fake-workspace', records: [fakeFilenameRecord] };
assert.equal(findLoadedSchemaRecord(fakeWorkspace, 'example.custom.v1'), null);

// B2. Previously loaded material with exact qualified schema bytes is reused without duplicate materialization.
const loadedTopic = Object.assign(createRecordFromMarkdown(topicMarkdown, {
  path: 'mirrors/topic-contract.md',
  sourceMode: 'source-backed'
}), {
  id: 'qualified-loaded-topic',
  schemaNavigation: { schema: 'tiinex.workspace.schemaNavigation.v1', schemaId: 'tiinex.topic.v1', reason: 'reading-contract-badge' },
  source: { id: 'mirror-source', adapterId: 'http', sourceKind: 'http.file', sourceBacked: true }
});
const plainReuseRecord = declaringPlainRecord('plain-reuse', 'tiinex.topic.v1');
state = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'v465-loaded', name: 'v465 loaded' }).state;
workspace = lifecycle.activeWorkspace(state);
workspace.records = [plainReuseRecord, loadedTopic];
const foundLoaded = findLoadedSchemaRecord(workspace, 'tiinex.topic.v1');
assert.equal(foundLoaded?.id, 'qualified-loaded-topic');
const reused = await openSchemaForRecordCommand({ state, workspace, record: plainReuseRecord, schemaId: 'tiinex.topic.v1', catalog: {}, clock: () => '2026-08-21T08:01:00.000Z' });
assert.equal(reused.ok, true, reused.error);
assert.equal(reused.existing, true);
assert.equal(reused.record.id, 'qualified-loaded-topic');
assert.equal(reused.state.workspaces[0].records.length, 2, 'qualified loaded schema is focused, not duplicated');

// B3. Multiple qualified loaded candidates fail closed rather than first-match.
const duplicateLoaded = Object.assign({}, loadedTopic, { id: 'qualified-loaded-topic-2', path: 'other/topic-contract.md' });
const ambiguousWorkspace = Object.assign({}, workspace, { records: [plainReuseRecord, loadedTopic, duplicateLoaded] });
assert.equal(findLoadedSchemaRecord(ambiguousWorkspace, 'tiinex.topic.v1'), null);
const ambiguousState = Object.assign({}, state, { workspaces: [ambiguousWorkspace] });
const ambiguous = await openSchemaForRecordCommand({ state: ambiguousState, workspace: ambiguousWorkspace, record: plainReuseRecord, schemaId: 'tiinex.topic.v1', catalog: {} });
assert.equal(ambiguous.ok, false);
assert.equal(ambiguous.error, 'schema.ambiguous');

// C. Authority qualification is total over hostile declarative Unicode strings.
const baseSource = { provider: 'github', repository: 'Acme/schemas', commit: 'a'.repeat(40) };
for (const [label, path] of [
  ['unpaired-high', `schemas/${String.fromCharCode(0xD800)}.md`],
  ['unpaired-low', `schemas/${String.fromCharCode(0xDC00)}.md`]
]) {
  const authority = { ...baseSource, path };
  let canonical;
  assert.doesNotThrow(() => { canonical = canonicalGithubSchemaSourceTargets(authority); }, label);
  assert.equal(canonical.state, 'unavailable', label);
  assert(canonical.findings.some((finding) => /unpaired UTF-16 surrogate/.test(finding)), label);
  let provider;
  assert.doesNotThrow(() => { provider = qualifyGithubSchemaSourceProvider({ permalink: 'https://example.invalid/schema.md' }, authority); }, `${label}-provider`);
  assert.equal(provider.state, 'unavailable', `${label}-provider`);
}
const emojiAuthority = { ...baseSource, path: 'schemas/😀.md' };
const emojiCanonical = canonicalGithubSchemaSourceTargets(emojiAuthority);
assert.equal(emojiCanonical.state, 'qualified');
assert(emojiCanonical.blobUrl.includes('%F0%9F%98%80.md'));
assert.equal(qualifyExactGithubSchemaSourceTarget(emojiCanonical.blobUrl, emojiAuthority).state, 'qualified');
assert.equal(qualifyExactGithubSchemaSourceTarget(emojiCanonical.rawUrl, emojiAuthority).state, 'qualified');

console.log('post-v465 qualified schema recovery + source input totality correction: PASS');

function declaringRecord(id, schemaId, href) {
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: [${schemaId}](${href})\n  - Created At: 2026-08-21 08:00:00\n  - Summary: v465 declaring artifact\n\n---\n\n# Declaring Artifact\n\nSchema navigation fixture.\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path: `${id}.trace.md`, sourceMode: 'archive-local' }), {
    id,
    source: { id: 'local', adapterId: 'local', sourceKind: 'local.session', sourceBacked: false }
  });
}

function declaringPlainRecord(id, schemaId) {
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-21 08:00:00\n  - Summary: v465 plain declaring artifact\n\n---\n\n# Declaring Artifact\n\nSchema navigation fixture.\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path: `${id}.trace.md`, sourceMode: 'archive-local' }), {
    id,
    source: { id: 'local', adapterId: 'local', sourceKind: 'local.session', sourceBacked: false }
  });
}

function response(body, ok = true) {
  return { ok, status: ok ? 200 : 404, text: async () => body };
}
