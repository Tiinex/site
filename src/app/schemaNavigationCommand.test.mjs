import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { schemaCatalogEntryForId } from '../schemas/schemaMarkdownCatalog.js';
import { findLoadedSchemaRecord, openSchemaForRecordCommand, schemaPathCandidatesForRecord } from './schemaNavigationCommand.js';
import { loadViewerSchemaMarkdown } from './schemaNavigationRuntimeCatalog.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const clock = () => '2026-08-09T01:00:00.000Z';

let created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Schema Nav' }, { clock });
let state = created.state;
let workspace = lifecycle.activeWorkspace(state);
const localTopic = Object.assign(createRecordFromMarkdown(topicMarkdown('Local Topic', 'tiinex.topic.v1'), { path: 'local/topic.trace.md', sourceMode: 'archive-local' }), {
  id: 'local-topic',
  source: { id: 'local', kind: 'local', adapterId: 'local', sourceKind: 'local.session', sourceBacked: false }
});
workspace.records = [localTopic];
workspace.sources = [{ id: 'local', label: 'Local', kind: 'local', adapterId: 'local', sourceKind: 'local.session', sourceBacked: false }];
state.activeWorkspaceId = workspace.id;

const candidates = schemaPathCandidatesForRecord(localTopic, 'tiinex.topic.v1');
assert(candidates.includes('tiinex.topic.v1.schema.md'), 'schema candidates include direct schema filename');
assert(candidates.includes('src/schemas/core/topic/tiinex.topic.v1.schema.md'), 'schema candidates include bundled viewer schema path');

const topicSchemaEntry = schemaEntryWithMarkdown('tiinex.topic.v1');
const runtimeLoaded = await loadViewerSchemaMarkdown('tiinex.topic.v1', async (url) => {
  assert(String(url).includes('tiinex.topic.v1.schema.md'), 'runtime schema loader resolves a schema Markdown asset URL');
  return { ok: true, text: async () => topicSchemaEntry.markdown };
});
assert.equal(runtimeLoaded.markdown, topicSchemaEntry.markdown, 'runtime schema loader returns catalog metadata plus fetched markdown');
const opened = await openSchemaForRecordCommand({ state, workspace, record: localTopic, schemaEntry: topicSchemaEntry, clock });
assert.equal(opened.ok, true, opened.error);
assert.equal(opened.loaded, true, 'first badge click loads the bundled schema reading contract');
assert.equal(opened.state.view.workspaceVerse, 'lineage', 'schema badge opens lineage view instead of display filter');
assert.equal(opened.state.view.selectedRecordId, opened.record.id, 'schema record is selected');
assert.equal(opened.state.view.displayOptions?.schemaFilter || 'all', 'all', 'schema badge must not hide the workspace through schemaFilter');
assert.equal(opened.record.schemaNavigation.schemaId, 'tiinex.topic.v1');
assert.equal(opened.record.path, topicSchemaEntry.path);
assert.equal(opened.record.source.id, 'viewer-schema-registry');
assert.equal(opened.record.source.sourceBacked, false, 'bundled schema navigation is not claimed as GitHub source-backed');
assert(opened.record.source.boundary.includes('not guessed GitHub'), 'schema source boundary is explicit');
const afterOpenWorkspace = lifecycle.activeWorkspace(opened.state);
assert.equal(afterOpenWorkspace.records.find((record) => record.id === 'local-topic').source.id, 'local', 'declaring local artifact remains local after schema navigation');
assert(afterOpenWorkspace.sources.some((source) => source.id === 'viewer-schema-registry' && source.discoveryState === 'loaded'), 'schema registry source row is finite and loaded');
assert.equal(afterOpenWorkspace.records.filter((record) => record.schemaNavigation?.schemaId === 'tiinex.topic.v1').length, 1, 'one schema record loaded');

const second = await openSchemaForRecordCommand({ state: opened.state, workspace: afterOpenWorkspace, record: localTopic, schemaEntry: topicSchemaEntry, clock });
assert.equal(second.ok, true, second.error);
assert.equal(second.existing, true, 'second badge click focuses existing schema record');
assert.equal(lifecycle.activeWorkspace(second.state).records.filter((record) => record.schemaNavigation?.schemaId === 'tiinex.topic.v1').length, 1, 'second click does not duplicate schema record');

const sourceSchemaRecord = Object.assign(createRecordFromMarkdown(topicSchemaEntry.markdown, { path: '.topics/.schemas/tiinex.topic.v1.schema.md', sourceMode: 'github-file' }), {
  id: 'source-schema-topic',
  source: { id: 'github:tiinex:docs', kind: 'github', adapterId: 'github', sourceKind: 'github.repo', sourceBacked: true },
  sourceTarget: { sourceArtifactPath: '.topics/.schemas/tiinex.topic.v1.schema.md' }
});
const workspaceWithSourceSchema = Object.assign({}, workspace, { records: [localTopic, sourceSchemaRecord] });
assert.equal(findLoadedSchemaRecord(workspaceWithSourceSchema, 'tiinex.topic.v1').id, 'source-schema-topic', 'loaded source schema record takes precedence over bundled loading');
const existing = await openSchemaForRecordCommand({ state: Object.assign({}, state, { workspaces: [workspaceWithSourceSchema] }), workspace: workspaceWithSourceSchema, record: localTopic, schemaEntry: topicSchemaEntry, clock });
assert.equal(existing.existing, true);
assert.equal(existing.state.view.selectedRecordId, 'source-schema-topic', 'schema badge focuses existing source schema record when available');

const missing = await openSchemaForRecordCommand({ state, workspace, record: Object.assign({}, localTopic, { schemaId: 'tiinex.custom.v1', kind: 'tiinex.custom.v1' }), catalog: {}, clock });
assert.equal(missing.ok, false, 'unknown unbundled schema is explicit unavailable');
assert.equal(missing.error, 'schema.unavailable');
assert(missing.notice.includes('not loaded or bundled'));


const recoveredSource = (opened.state.workspaces[0].sources || []).find((source) => source.sourceKind === 'github.file');
if (recoveredSource) {
  assert.equal(recoveredSource.loadable, false, 'targeted schema provenance must not advertise broad Discover capability');
  assert.equal(recoveredSource.count, 1, 'targeted schema provenance source count must reflect the recovered schema');
}
console.log('✓ schema navigation command tests passed');

function schemaEntryWithMarkdown(schemaId) {
  const entry = schemaCatalogEntryForId(schemaId);
  return Object.assign({}, entry, { markdown: readFileSync(new URL(`../../${entry.path}`, import.meta.url), 'utf8') });
}

function topicMarkdown(title, schemaId) {
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [${schemaId}](${schemaId}.schema.md)\n  - Created At: 2026-08-09\n  - Summary: ${title}\n\n---\n\n# ${title}\n\nLocal topic body.\n`;
}
