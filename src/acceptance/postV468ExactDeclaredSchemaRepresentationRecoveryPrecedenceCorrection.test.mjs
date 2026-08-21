import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { openSchemaForRecordCommand } from '../app/schemaNavigationCommand.js';
import { qualifySchemaRecordRecoveryRepresentation } from '../app/schemaSourceRecovery.js';
import { schemaCatalogEntryForId } from '../schemas/schemaMarkdownCatalog.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const topicId = 'tiinex.topic.v1';
const topicMarkdown = readFileSync(new URL('../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8');
const topicEntry = Object.assign({}, schemaCatalogEntryForId(topicId), { markdown: topicMarkdown });
const A = 'https://schemas.example.invalid/a/topic.schema.md';
const B = 'https://schemas.example.invalid/b/topic.schema.md';

// 1. Linked B + loaded exact A: A is not reused; B is retrieved and materialized.
{
  const record = declaring('case1', B);
  const { state, workspace } = workspaceWith([record, loaded('loaded-A', A)]);
  const fetches = [];
  const result = await openSchemaForRecordCommand({ state, workspace, record, catalog: {}, fetchImpl: async (url) => { fetches.push(String(url)); return response(topicMarkdown); } });
  assert.equal(result.ok, true, result.error);
  assert.equal(result.existing, false);
  assert.deepEqual(fetches, [B]);
  assert.equal(result.record.sourceTarget.inputTarget, B);
  assert.equal(qualifySchemaRecordRecoveryRepresentation(result.record).state, 'qualified');
}

// 2. Linked B + exact loaded A and B: B disambiguates before semantic deep selection.
{
  const record = declaring('case2', B);
  const { state, workspace } = workspaceWith([record, loaded('loaded-A', A), loaded('loaded-B', B)]);
  let fetches = 0;
  const result = await openSchemaForRecordCommand({ state, workspace, record, catalog: {}, fetchImpl: async () => { fetches += 1; return response(topicMarkdown); } });
  assert.equal(result.ok, true, result.error);
  assert.equal(result.existing, true);
  assert.equal(result.record.id, 'loaded-B');
  assert.equal(fetches, 0);
}

// 3. Linked B + two exact loaded B representations: ambiguity remains inside target-qualified dimension.
{
  const record = declaring('case3', B);
  const { state, workspace } = workspaceWith([record, loaded('loaded-B1', B), loaded('loaded-B2', B)]);
  const result = await openSchemaForRecordCommand({ state, workspace, record, catalog: {} });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'schema.ambiguous');
}

// 4. Linked B + 404 + bundled exact same schema: unavailable, no bundled fallback.
{
  const record = declaring('case4', B);
  const { state, workspace } = workspaceWith([record]);
  let bundledLoads = 0;
  const result = await openSchemaForRecordCommand({
    state, workspace, record,
    fetchImpl: async () => response('', false),
    loadSchemaMarkdown: async () => { bundledLoads += 1; return topicEntry; }
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'schema.unavailable');
  assert.equal(result.recovery?.reason, 'fetch-failed');
  assert.equal(bundledLoads, 0);
}

// 5. Linked B + wrong bytes + bundled exact same schema: unavailable, no bundled fallback.
{
  const record = declaring('case5', B);
  const { state, workspace } = workspaceWith([record]);
  let bundledLoads = 0;
  const result = await openSchemaForRecordCommand({
    state, workspace, record,
    fetchImpl: async () => response('# README\n\nnot a Tiinex reading contract\n'),
    loadSchemaMarkdown: async () => { bundledLoads += 1; return topicEntry; }
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'schema.unavailable');
  assert.equal(result.recovery?.reason, 'schema-reading-contract-unqualified');
  assert.equal(bundledLoads, 0);
}

// 6. Linked B + exact qualified bytes: normal recovery succeeds with exact B provenance metadata.
{
  const record = declaring('case6', B);
  const { state, workspace } = workspaceWith([record]);
  const result = await openSchemaForRecordCommand({ state, workspace, record, catalog: {}, fetchImpl: async (url) => response(String(url) === B ? topicMarkdown : '', String(url) === B) });
  assert.equal(result.ok, true, result.error);
  assert.equal(result.record.source.adapterId, 'http');
  assert.equal(result.record.sourceTarget.inputTarget, B);
  assert.equal(result.record.sourceTarget.browseUrl, B);
  assert.equal(result.record.sourceTarget.rawUrl, B);
  assert.equal(result.record.schemaNavigation.representationIdentity, qualifySchemaRecordRecoveryRepresentation(result.record).identity);
}

// 7. Plain exact schema id keeps logical-contract reuse/fallback behavior.
{
  const record = declaring('case7', '');
  const loadedAny = loaded('loaded-any', A);
  const { state, workspace } = workspaceWith([record, loadedAny]);
  const result = await openSchemaForRecordCommand({ state, workspace, record, catalog: {} });
  assert.equal(result.ok, true, result.error);
  assert.equal(result.existing, true);
  assert.equal(result.record.id, 'loaded-any');
}

// 8. Linked B after exact B is already loaded reuses B without redundant fetch.
{
  const record = declaring('case8', B);
  const exactB = loaded('loaded-B', B);
  const { state, workspace } = workspaceWith([record, exactB]);
  let fetches = 0;
  const result = await openSchemaForRecordCommand({ state, workspace, record, fetchImpl: async () => { fetches += 1; return response(topicMarkdown); } });
  assert.equal(result.ok, true, result.error);
  assert.equal(result.existing, true);
  assert.equal(result.record.id, exactB.id);
  assert.equal(fetches, 0);
}

// 9/10. Exact A and B for one logical schema coexist; provenance is not overwritten/merged.
{
  const declaringA = declaring('case9-A', A);
  const declaringB = declaring('case9-B', B);
  let { state, workspace } = workspaceWith([declaringA, declaringB]);
  const openedA = await openSchemaForRecordCommand({ state, workspace, record: declaringA, catalog: {}, fetchImpl: async (url) => response(String(url) === A ? topicMarkdown : '', String(url) === A) });
  assert.equal(openedA.ok, true, openedA.error);
  state = openedA.state;
  workspace = state.workspaces.find((item) => item.id === openedA.workspace.id);
  const currentB = workspace.records.find((item) => item.id === declaringB.id);
  const openedB = await openSchemaForRecordCommand({ state, workspace, record: currentB, catalog: {}, fetchImpl: async (url) => response(String(url) === B ? topicMarkdown : '', String(url) === B) });
  assert.equal(openedB.ok, true, openedB.error);
  const finalWorkspace = openedB.state.workspaces.find((item) => item.id === workspace.id);
  const schemaRecords = finalWorkspace.records.filter((item) => item.schemaNavigation?.schemaId === topicId && item.schemaNavigation?.reason === 'reading-contract-badge');
  assert.equal(schemaRecords.length, 2);
  const byTarget = new Map(schemaRecords.map((item) => [item.sourceTarget?.inputTarget, item]));
  assert(byTarget.has(A));
  assert(byTarget.has(B));
  assert.notEqual(byTarget.get(A).id, byTarget.get(B).id);
  assert.equal(byTarget.get(A).source.permalink, A);
  assert.equal(byTarget.get(B).source.permalink, B);
}

// 11/12. Predecessor authority remains declarative and no schema-id/provider switchboard is introduced.
for (const sourceFile of ['../app/schemaNavigationCommand.js', '../app/schemaSourceRecovery.js']) {
  const source = readFileSync(new URL(sourceFile, import.meta.url), 'utf8');
  assert.equal(/tiinex\.topic\.v1|tiinex\.task\.v1|Tiinex\/docs/u.test(source), false, sourceFile);
  assert.equal(/\beval\s*\(|\bnew\s+Function\s*\(|import\s*\(\s*['"`]https?:/u.test(source), false, sourceFile);
}

console.log('post-v468 exact declared schema representation + recovery precedence correction: PASS');

function declaring(id, target = '') {
  const current = target ? `[${topicId}](${target})` : topicId;
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${current}\n  - Created At: 2026-08-21 10:00:00\n  - Summary: ${id}\n\n---\n\n# ${id}\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path: `work/${id}.trace.md`, sourceMode: 'archive-local' }), { id, schemaId: topicId, currentSchemaId: topicId });
}

function loaded(id, target) {
  return Object.assign(createRecordFromMarkdown(topicMarkdown, { path: `mirrors/${id}.md`, sourceMode: 'source-backed' }), {
    id,
    schemaId: topicId,
    currentSchemaId: topicId,
    schemaNavigation: { schema: 'tiinex.workspace.schemaNavigation.v1', schemaId: topicId, reason: 'reading-contract-badge' },
    source: { id: `src-${id}`, adapterId: 'http', sourceKind: 'http.file', sourceBacked: true, permalink: target },
    sourceTarget: { inputTarget: target, browseUrl: target, rawUrl: target, sourceArtifactPath: target }
  });
}

function workspaceWith(records) {
  const state = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: `ws-${Math.random().toString(36).slice(2)}`, name: 'v468' }).state;
  const workspace = lifecycle.activeWorkspace(state);
  workspace.records = records;
  return { state, workspace };
}

function response(body, ok = true) { return { ok, status: ok ? 200 : 404, text: async () => body }; }
