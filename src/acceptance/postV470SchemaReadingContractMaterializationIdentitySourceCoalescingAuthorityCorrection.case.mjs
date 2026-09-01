import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { openSchemaForRecordCommand } from '../app/schemaNavigationCommand.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const schemaId = 'tiinex.topic.v1';
const taskId = 'tiinex.task.v1';
const B = 'https://schemas.example.invalid/b/topic.schema.md';
const topicMarkdown = readFileSync(new URL('../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8');
const topicPath = 'src/schemas/core/topic/tiinex.topic.v1.schema.md';

// 1. Invalid same-representation record never receives recovered semantic authority.
{
  const declaration = declaring('rep-invalid', B);
  const invalid = httpRepresentationRecord('invalid-b', B, '# README\n\nBAD\n');
  const { state, workspace } = workspaceWith('rep-invalid', declaration, invalid);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, B) });
  assert.equal(opened.ok, true, opened.error);
  assert.notEqual(opened.record.id, invalid.id);
  assert.equal(opened.record.markdown, topicMarkdown);
  assert.equal(opened.workspace.records.find((record) => record.id === invalid.id)?.schemaNavigation, undefined);
}

// 2. Invalid first + exact valid second on one representation reuses only the concrete valid record.
{
  const declaration = declaring('rep-mixed', B);
  const invalid = httpRepresentationRecord('first-invalid', B, '# README\nBAD\n');
  const valid = httpRepresentationRecord('second-valid', B, topicMarkdown);
  const { state, workspace } = workspaceWith('rep-mixed', declaration, invalid, valid);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, B) });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.record.id, valid.id);
  assert.equal(opened.workspace.records.find((record) => record.id === invalid.id)?.schemaNavigation, undefined);
  assert.equal(opened.workspace.records.find((record) => record.id === valid.id)?.schemaNavigation?.reason, 'reading-contract-badge');
}

// 3. One exact semantically-qualified representation collision may be reused truthfully.
{
  const declaration = declaring('rep-valid', B);
  const valid = httpRepresentationRecord('only-valid', B, topicMarkdown);
  const { state, workspace } = workspaceWith('rep-valid', declaration, valid);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, B) });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.record.id, valid.id);
  assert.equal(opened.record.markdown, topicMarkdown);
}

// 4. Two reusable exact collisions do not become first-hit authority.
{
  const declaration = declaring('rep-two-valid', B);
  const first = httpRepresentationRecord('valid-1', B, topicMarkdown);
  const second = httpRepresentationRecord('valid-2', B, topicMarkdown);
  const { state, workspace } = workspaceWith('rep-two-valid', declaration, first, second);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, B) });
  assert.equal(opened.ok, false);
  assert.equal(opened.error, 'schema.materialization.ambiguous');
  assert.equal(workspace.records[1].schemaNavigation, undefined);
  assert.equal(workspace.records[2].schemaNavigation, undefined);
}

// 5. Bundled schema + invalid generated-id collision fails closed; invalid bytes are untouched.
{
  const declaration = declaring('bundled-id', '');
  const workspaceId = 'ws-v470-bundled-id';
  const invalid = { id: `schema:${workspaceId}:${schemaId}`, schemaId, currentSchemaId: schemaId, path: 'ordinary/not-schema.md', markdown: '# README\nBAD\n' };
  const { state, workspace } = workspaceWithId(workspaceId, declaration, invalid);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, schemaEntry: { markdown: topicMarkdown, path: topicPath } });
  assert.equal(opened.ok, false);
  assert.equal(opened.error, 'schema.materialization.identity-conflict');
  assert.equal(invalid.schemaNavigation, undefined);
}

// 6. Bundled schema + invalid exact-path collision fails closed; path is not semantic authority.
{
  const declaration = declaring('bundled-path', '');
  const invalid = { id: 'invalid-path', schemaId, currentSchemaId: schemaId, path: topicPath, markdown: '# README\nBAD\n' };
  const { state, workspace } = workspaceWith('bundled-path', declaration, invalid);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, schemaEntry: { markdown: topicMarkdown, path: topicPath } });
  assert.equal(opened.ok, false);
  assert.equal(opened.error, 'schema.materialization.identity-conflict');
  assert.equal(invalid.schemaNavigation, undefined);
}

// 7. Unrelated throwing-markdown record with no collision remains unread.
{
  let reads = 0;
  const declaration = declaring('bounded-unrelated', '');
  const unrelated = throwingRecord('unrelated', taskId, 'ordinary/unrelated.trace.md', () => { reads += 1; });
  const { state, workspace } = workspaceWith('bounded-unrelated', declaration, unrelated);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, schemaEntry: { markdown: topicMarkdown, path: topicPath } });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(reads, 0);
  assert.equal(opened.workspace.records.find((record) => record.id === unrelated.id), unrelated);
}

// 8. Throwing same-representation collision is bounded/read once and never upgraded; exact recovery may materialize separately.
{
  let reads = 0;
  const declaration = declaring('bounded-collision', B);
  const collision = httpRepresentationRecord('throwing-b', B, '');
  Object.defineProperty(collision, 'markdown', { configurable: true, enumerable: true, get() { reads += 1; throw new Error('collision markdown unreadable'); } });
  const { state, workspace } = workspaceWith('bounded-collision', declaration, collision);
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, B) });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(reads, 1);
  assert.notEqual(opened.record.id, collision.id);
  assert.equal(opened.workspace.records.find((record) => record.id === collision.id)?.schemaNavigation, undefined);
}

// 9. One coherent exact GitHub source boundary may coalesce as before.
{
  const tuple = githubTuple();
  const declaration = declaring('source-exact', tuple.blob);
  const existing = coherentGithubSource('source-exact-existing', tuple);
  const { state, workspace } = workspaceWith('source-exact', declaration);
  workspace.sources = [existing]; workspace.sourceOrder = [existing.id];
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, tuple.raw) });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.workspace.sources.length, 1);
  assert.equal(opened.record.source.id, existing.id);
}

// 10. Contradictory repo aliases are not exact coalescing authority and are never repaired.
{
  const tuple = githubTuple();
  const declaration = declaring('source-repo-conflict', tuple.blob);
  const ambiguous = coherentGithubSource('source-repo-conflict-existing', tuple);
  ambiguous.repository = 'Evil/other';
  ambiguous.config = { ...ambiguous.config, repo: 'Evil/other' };
  const before = JSON.stringify(ambiguous);
  const { state, workspace } = workspaceWith('source-repo-conflict', declaration);
  workspace.sources = [ambiguous]; workspace.sourceOrder = [ambiguous.id];
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, tuple.raw) });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.workspace.sources.length, 2);
  assert.equal(JSON.stringify(opened.workspace.sources.find((source) => source.id === ambiguous.id)), before);
  assert.notEqual(opened.record.source.id, ambiguous.id);
}

// 11. Contradictory ref aliases are independently non-coalescing and remain untouched.
{
  const tuple = githubTuple();
  const declaration = declaring('source-ref-conflict', tuple.blob);
  const ambiguous = coherentGithubSource('source-ref-conflict-existing', tuple);
  ambiguous.config = { ...ambiguous.config, ref: 'other' };
  const before = JSON.stringify(ambiguous);
  const { state, workspace } = workspaceWith('source-ref-conflict', declaration);
  workspace.sources = [ambiguous]; workspace.sourceOrder = [ambiguous.id];
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, tuple.raw) });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.workspace.sources.length, 2);
  assert.equal(JSON.stringify(opened.workspace.sources.find((source) => source.id === ambiguous.id)), before);
  assert.notEqual(opened.record.source.id, ambiguous.id);
}

// 12. Root/boundary aliases follow the same exact 0/1/>1 rule.
{
  const tuple = githubTuple();
  const declaration = declaring('source-root-conflict', tuple.blob);
  const ambiguous = coherentGithubSource('source-root-conflict-existing', tuple);
  ambiguous.config = { ...ambiguous.config, rootPath: 'other-root' };
  const before = JSON.stringify(ambiguous);
  const { state, workspace } = workspaceWith('source-root-conflict', declaration);
  workspace.sources = [ambiguous]; workspace.sourceOrder = [ambiguous.id];
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, tuple.raw) });
  assert.equal(opened.ok, true, opened.error);
  assert.equal(opened.workspace.sources.length, 2);
  assert.equal(JSON.stringify(opened.workspace.sources.find((source) => source.id === ambiguous.id)), before);
}

// 13. Multiple coherent exact source candidates are not first-hit authority.
{
  const tuple = githubTuple();
  const declaration = declaring('source-two-exact', tuple.blob);
  const first = coherentGithubSource('source-exact-1', tuple);
  const second = coherentGithubSource('source-exact-2', tuple);
  const { state, workspace } = workspaceWith('source-two-exact', declaration);
  workspace.sources = [first, second]; workspace.sourceOrder = [first.id, second.id];
  const opened = await openSchemaForRecordCommand({ state, workspace, record: declaration, catalog: {}, fetchImpl: async () => response(topicMarkdown, tuple.raw) });
  assert.equal(opened.ok, false);
  assert.equal(opened.error, 'schema.source.ambiguous');
  assert.equal(workspace.sources[0], first);
  assert.equal(workspace.sources[1], second);
}

// 14. Generic owner/security boundaries remain intact.
{
  const commandSource = readFileSync(new URL('../app/schemaNavigationCommand.js', import.meta.url), 'utf8');
  const materializationSource = readFileSync(new URL('../app/schemaNavigationMaterialization.js', import.meta.url), 'utf8');
  for (const source of [commandSource, materializationSource]) {
    assert.equal(/tiinex\.topic\.v1|tiinex\.task\.v1|Tiinex\/docs/u.test(source), false);
    assert.equal(/\beval\s*\(|\bnew\s+Function\s*\(|import\s*\(\s*['"`]https?:/u.test(source), false);
  }
  assert.equal(/\.findIndex\(\(item\) => sameRecordIdentity/u.test(commandSource + materializationSource), false, 'first-hit materialization authority must stay removed');
  assert.equal(/source\.repo \|\| source\.repository \|\| source\.config\?\.repo/u.test(materializationSource), false, 'first-value source repo authority must stay removed');
  assert.equal(/source\.ref \|\| source\.config\?\.ref/u.test(materializationSource), false, 'first-value source ref authority must stay removed');
}

console.log('post-v470 schema reading-contract materialization identity + source coalescing authority correction: PASS');

function declaring(id, target) {
  const current = target ? `[${schemaId}](${target})` : schemaId;
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${current}\n  - Created At: 2026-08-21 10:00:00\n  - Summary: ${id}\n\n---\n\n# ${id}\n`;
  return Object.assign(createRecordFromMarkdown(markdown, { path: `work/${id}.trace.md`, sourceMode: 'archive-local' }), { id, schemaId, currentSchemaId: schemaId });
}

function httpRepresentationRecord(id, target, markdown) {
  return { id, schemaId, currentSchemaId: schemaId, path: `ordinary/${id}.txt`, sourceMode: 'source-backed', lifecycleStatus: '', markdown,
    source: { id: `src-${id}`, adapterId: 'http', sourceKind: 'http.file', sourceBacked: true, permalink: target },
    sourceTarget: { sourceArtifactPath: target, inputTarget: target, browseUrl: target, rawUrl: target } };
}

function throwingRecord(id, governedSchemaId, path, onRead) {
  return { id, schemaId: governedSchemaId, currentSchemaId: governedSchemaId, path, get markdown() { onRead(); throw new Error('unrelated markdown read'); } };
}

function githubTuple() {
  const repo = 'Acme/repo'; const ref = 'main'; const path = 'schemas/topic.schema.md';
  return { repo, ref, path, rootPath: 'schemas', blob: `https://github.com/${repo}/blob/${ref}/${path}`, raw: `https://raw.githubusercontent.com/${repo}/${ref}/${path}` };
}

function coherentGithubSource(id, tuple) {
  return { id, label: tuple.repo, kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', repo: tuple.repo, repository: tuple.repo, ref: tuple.ref, rootPath: tuple.rootPath,
    sourceBacked: true, originReferenceSource: false, recoveryOnly: false, loadable: true, explicitFileRefs: [], config: { repo: tuple.repo, ref: tuple.ref, rootPath: tuple.rootPath, explicitFileRefs: [] } };
}

function workspaceWith(label, ...records) { return workspaceWithId(`ws-v470-${label}`, ...records); }
function workspaceWithId(id, ...records) {
  const state = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id, name: 'v470' }).state;
  const workspace = lifecycle.activeWorkspace(state);
  workspace.records = records;
  return { state, workspace };
}
function response(body, url) { return { ok: true, status: 200, url, redirected: false, text: async () => body }; }
