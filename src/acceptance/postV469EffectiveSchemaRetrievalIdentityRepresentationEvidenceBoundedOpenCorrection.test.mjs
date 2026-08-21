import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { openSchemaForRecordCommand } from '../app/schemaNavigationCommand.js';
import {
  declaredSchemaRecoveryTarget,
  qualifySchemaRecordRecoveryRepresentation,
  recoverDeclaredSchemaEntry,
  schemaRecoveryRepresentationIdentity
} from '../app/schemaSourceRecovery.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const schemaId = 'tiinex.topic.v1';
const taskId = 'tiinex.task.v1';
const topicMarkdown = readFileSync(new URL('../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8');
const B = 'https://schemas.example.invalid/b/topic.schema.md';
const C = 'https://schemas.example.invalid/c/topic.schema.md';

// 1. Redirect/final-target evidence cannot label C bytes as B provenance.
{
  const result = await recoverDeclaredSchemaEntry({
    record: declaring('redirect', B), schemaId,
    fetchImpl: async (url, options) => {
      assert.equal(String(url), B);
      assert.equal(options?.redirect, 'error');
      return response(topicMarkdown, { url: C, redirected: true });
    }
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'redirected-retrieval-disallowed');
  assert.equal(result.effectiveRequestTarget, B);
  assert.equal(result.finalRetrievedTarget, C);
}

// 2. No redirect + exact B transport evidence succeeds and exposes exact retrieval truth.
{
  const result = await recoverDeclaredSchemaEntry({ record: declaring('exact-b', B), schemaId, fetchImpl: async () => response(topicMarkdown, { url: B }) });
  assert.equal(result.ok, true, result.reason);
  assert.equal(result.declaredLocator, B);
  assert.equal(result.effectiveRequestTarget, B);
  assert.equal(result.finalRetrievedTarget, B);
  assert.equal(result.source.permalink, B);
}

// 3. HTTP dot-segment declaration lexeme is preserved while effective request/representation is canonical.
{
  const href = 'https://schemas.example.invalid/a/../b/topic.schema.md';
  const target = declaredSchemaRecoveryTarget(declaring('dot', href), schemaId);
  assert.equal(target.ok, true);
  assert.equal(target.declaredHref, href);
  assert.equal(target.declaredLocator, href);
  assert.equal(target.effectiveRequestTarget, B);
  assert.equal(target.fetchUrl, B);
  assert.equal(schemaRecoveryRepresentationIdentity(target), JSON.stringify(['url', B]));
  const { state, workspace, record } = workspaceWith(declaring('dot-open', href));
  const opened = await openSchemaForRecordCommand({ state, workspace, record, catalog: {}, fetchImpl: async (url) => response(String(url) === B ? topicMarkdown : '', { ok: String(url) === B, url: B }) });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.record.sourceTarget.declaredLocator, href);
  assert.equal(opened.record.sourceTarget.effectiveRequestTarget, B);
  assert.equal(opened.record.sourceTarget.finalRetrievedTarget, B);
  assert.equal(opened.record.schemaNavigation.representationIdentity, JSON.stringify(['url', B]));
}

// 4. Host/default-port normalization follows the same declaration/effective split.
{
  const href = 'https://SCHEMAS.EXAMPLE.INVALID:443/b/topic.schema.md';
  const target = declaredSchemaRecoveryTarget(declaring('host-port', href), schemaId);
  assert.equal(target.ok, true);
  assert.equal(target.declaredHref, href);
  assert.equal(target.effectiveRequestTarget, B);
  assert.equal(schemaRecoveryRepresentationIdentity(target), JSON.stringify(['url', B]));
}

// 5. Strong GitHub tuple B cannot erase contradictory concrete sourceTarget C.
{
  const tuple = githubTuple();
  const record = loadedGithub('github-conflict', tuple, { inputTarget: C, browseUrl: C, rawUrl: C });
  const qualification = qualifySchemaRecordRecoveryRepresentation(record);
  assert.equal(qualification.state, 'ambiguous');
  assert.equal(qualification.reason, 'github-record-source-target-conflict');
  const declaration = declaring('github-conflict-open', tuple.blob);
  const { state, workspace } = workspaceWith(declaration, record);
  let fetches = 0;
  const opened = await openSchemaForRecordCommand({
    state, workspace, record: declaration, catalog: {},
    fetchImpl: async (url) => { fetches += 1; return response(String(url) === tuple.raw ? topicMarkdown : '', { ok: String(url) === tuple.raw, url: tuple.raw }); }
  });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.existing, false);
  assert.equal(fetches, 1);
  assert.equal(opened.record.schemaNavigation.representationIdentity, JSON.stringify(['github', tuple.repo, tuple.ref, tuple.path]));
}

// 6. Canonical GitHub browse/raw variants for the same tuple remain one qualified representation.
{
  const tuple = githubTuple();
  const loaded = loadedGithub('github-exact', tuple, { inputTarget: tuple.blob, browseUrl: tuple.blob, rawUrl: tuple.raw });
  const qualification = qualifySchemaRecordRecoveryRepresentation(loaded);
  assert.equal(qualification.state, 'qualified');
  assert.equal(qualification.identity, JSON.stringify(['github', tuple.repo, tuple.ref, tuple.path]));
  const declaration = declaring('github-reuse', tuple.blob);
  const { state, workspace } = workspaceWith(declaration, loaded);
  let fetches = 0;
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, fetchImpl: async () => { fetches += 1; return response(topicMarkdown); } });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.existing, true);
  assert.equal(opened.record.id, loaded.id);
  assert.equal(fetches, 0);
}

// 7. Conflicting repository aliases fail closed instead of first-match selection.
{
  const record = relativeGithubDeclaring('repo-alias', {
    adapterId: 'github', repo: 'Acme/good', repository: 'Evil/other', ref: 'main', config: { repo: 'Evil/other', ref: 'main' }
  });
  const target = declaredSchemaRecoveryTarget(record, schemaId);
  assert.equal(target.ok, false);
  assert.equal(target.reason, 'github-source-repository-ambiguous');
}

// 8. Conflicting ref aliases fail closed independently of repository truth.
{
  const record = relativeGithubDeclaring('ref-alias', {
    adapterId: 'github', repo: 'Acme/good', repository: 'Acme/good', ref: 'main', config: { repo: 'Acme/good', ref: 'other' }
  });
  const target = declaredSchemaRecoveryTarget(record, schemaId);
  assert.equal(target.ok, false);
  assert.equal(target.reason, 'github-source-ref-ambiguous');
}

// 9. Stored representation cache is derived evidence: concrete B wins and returned state is coherent.
{
  const declaration = declaring('stale-cache', B);
  const loaded = loadedHttp('loaded-stale-cache', B);
  loaded.schemaNavigation.representationIdentity = JSON.stringify(['url', C]);
  const { state, workspace } = workspaceWith(declaration, loaded);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => { throw new Error('unexpected fetch'); } });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.existing, true);
  assert.equal(opened.record.schemaNavigation.representationIdentity, JSON.stringify(['url', B]));
  assert.equal(opened.workspace.records.find((item) => item.id === loaded.id)?.schemaNavigation?.representationIdentity, JSON.stringify(['url', B]));
}

// 10. Focusing an exact loaded B does not deep-clone/read unrelated artifact material.
{
  let reads = 0;
  const declaration = declaring('bounded-focus', B);
  const unrelated = throwingOrdinary('unrelated-focus', () => { reads += 1; });
  const loaded = loadedHttp('loaded-bounded-focus', B);
  const { state, workspace } = workspaceWith(declaration, unrelated, loaded);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {} });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(reads, 0);
  assert.equal(opened.workspace.records.find((item) => item.id === unrelated.id), unrelated);
}

// 11. Recovering/inserting B also preserves unrelated record identity/material without reads.
{
  let reads = 0;
  const declaration = declaring('bounded-insert', B);
  const unrelated = throwingOrdinary('unrelated-insert', () => { reads += 1; });
  const { state, workspace } = workspaceWith(declaration, unrelated);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, { url: B }) });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(reads, 0);
  assert.equal(opened.workspace.records.find((item) => item.id === unrelated.id), unrelated);
  assert.equal(opened.record.sourceTarget.finalRetrievedTarget, B);
}

// 12/13/14. Preserve predecessor authority/security/frozen-owner boundaries locally.
for (const sourceFile of ['../app/schemaSourceRecovery.js', '../app/schemaNavigationCommand.js']) {
  const source = readFileSync(new URL(sourceFile, import.meta.url), 'utf8');
  assert.equal(/tiinex\.topic\.v1|tiinex\.task\.v1|Tiinex\/docs/u.test(source), false, sourceFile);
  assert.equal(/\beval\s*\(|\bnew\s+Function\s*\(|import\s*\(\s*['"`]https?:/u.test(source), false, sourceFile);
}
const navigationSource = readFileSync(new URL('../app/schemaNavigationCommand.js', import.meta.url), 'utf8');
assert.equal(/structuredClone\s*\(/u.test(navigationSource), false, 'Open Schema must not whole-state structuredClone');

console.log('post-v469 effective schema retrieval identity + representation evidence + bounded Open Schema correction: PASS');

function declaring(id, target) {
  const current = target ? `[${schemaId}](${target})` : schemaId;
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${current}\n  - Created At: 2026-08-21 10:00:00\n  - Summary: ${id}\n\n---\n\n# ${id}\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path: `work/${id}.trace.md`, sourceMode: 'archive-local' }), { id, schemaId, currentSchemaId: schemaId });
}

function relativeGithubDeclaring(id, source) {
  const record = declaring(id, '../topic.schema.md');
  record.source = source;
  record.path = 'work/deep/source.trace.md';
  record.sourceTarget = { sourceArtifactPath: 'work/deep/source.trace.md' };
  return record;
}

function githubTuple() {
  const repo = 'Acme/repo'; const ref = 'main'; const path = 'schemas/topic.schema.md';
  return { repo, ref, path, blob: `https://github.com/${repo}/blob/${ref}/${path}`, raw: `https://raw.githubusercontent.com/${repo}/${ref}/${path}` };
}

function loadedGithub(id, tuple, targetEvidence) {
  return Object.assign(createRecordFromMarkdown(topicMarkdown, { path: tuple.path, sourceMode: 'source-backed' }), {
    id, schemaId, currentSchemaId: schemaId,
    schemaNavigation: { schema: 'tiinex.workspace.schemaNavigation.v1', schemaId, reason: 'reading-contract-badge' },
    source: { id: `src-${id}`, adapterId: 'github', sourceKind: 'github.repo', sourceBacked: true, repo: tuple.repo, repository: tuple.repo, ref: tuple.ref, config: { repo: tuple.repo, ref: tuple.ref } },
    sourceTarget: Object.assign({ sourceArtifactPath: tuple.path }, targetEvidence)
  });
}

function loadedHttp(id, target) {
  return Object.assign(createRecordFromMarkdown(topicMarkdown, { path: `mirror/${id}.md`, sourceMode: 'source-backed' }), {
    id, schemaId, currentSchemaId: schemaId,
    schemaNavigation: { schema: 'tiinex.workspace.schemaNavigation.v1', schemaId, reason: 'reading-contract-badge', representationIdentity: JSON.stringify(['url', target]) },
    source: { id: `src-${id}`, adapterId: 'http', sourceKind: 'http.file', sourceBacked: true, permalink: target },
    sourceTarget: { sourceArtifactPath: target, inputTarget: target, browseUrl: target, rawUrl: target }
  });
}

function throwingOrdinary(id, onRead) {
  return { id, schemaId: taskId, currentSchemaId: taskId, path: `work/${id}.trace.md`, get markdown() { onRead(); throw new Error('unrelated markdown read'); } };
}

function workspaceWith(...records) {
  const state = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: `ws-${Math.random().toString(36).slice(2)}`, name: 'v469' }).state;
  const workspace = lifecycle.activeWorkspace(state);
  workspace.records = records;
  return { state, workspace, record: records[0] };
}

function response(body, options = {}) {
  return { ok: options.ok !== false, status: options.ok === false ? 404 : 200, url: options.url || '', redirected: options.redirected === true, text: async () => body };
}
