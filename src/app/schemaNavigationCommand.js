import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { schemaCatalogEntryForId, schemaFilenameForId, schemaMarkdownCatalog } from '../schemas/schemaMarkdownCatalog.js';
import { recoverDeclaredSchemaEntry } from './schemaSourceRecovery.js';

const SCHEMA_SOURCE_ID = 'viewer-schema-registry';
const SCHEMA_SOURCE_LABEL = 'Viewer schema registry';
const SCHEMA_SOURCE_BOUNDARY = 'bundled viewer schema reading contract; not user-local material and not guessed GitHub provenance';

export async function openSchemaForRecordCommand(input = {}) {
  const state = input.state;
  const workspace = input.workspace || workspaceById(state, input.workspaceId || state?.activeWorkspaceId);
  if (!workspace) return { ok: false, error: 'workspace.missing', state, notice: 'No active workspace is available.' };
  const record = input.record || recordById(workspace, input.recordId || state?.view?.selectedRecordId || '');
  const schemaId = normalizeSchemaId(input.schemaId || recordSchemaId(record));
  if (!schemaId || schemaId === 'plain' || schemaId === 'markdown' || schemaId === 'unknown') return { ok: false, error: 'schema.missing', state, notice: 'This artifact does not declare an openable reading contract schema.' };

  const existing = findLoadedSchemaRecord(workspace, schemaId);
  if (existing) return focusSchemaRecord({ state, workspaceId: workspace.id, record: existing, schemaId, notice: `Opened reading contract: ${schemaShortLabel(schemaId)}.`, existing: true });

  let recovered = null;
  if (!input.schemaEntry) recovered = await recoverDeclaredSchemaEntry({ record, schemaId, fetchImpl: input.fetchImpl });
  const catalog = input.catalog || schemaMarkdownCatalog;
  let entry = input.schemaEntry || (recovered?.ok ? recovered : null) || (catalog?.[schemaId] || schemaCatalogEntryForId(schemaId));
  if (entry && !entry.markdown && typeof input.loadSchemaMarkdown === 'function') {
    try { entry = await input.loadSchemaMarkdown(schemaId); }
    catch (error) { return { ok: false, error: 'schema.fetch.failed', state, schemaId, exception: error, notice: `Could not open reading contract schema ${schemaId}.` }; }
  }
  if (!entry?.markdown) return { ok: false, error: 'schema.unavailable', state, schemaId, notice: `Reading contract schema ${schemaId} is not loaded or bundled for this workspace.` };

  const next = cloneState(state);
  const target = workspaceById(next, workspace.id);
  if (!target) return { ok: false, error: 'workspace.missing-after-clone', state, notice: 'No active workspace is available.' };
  const createdAt = input.clock ? input.clock() : new Date().toISOString();
  const schemaRecord = makeSchemaRecord({ workspace: target, entry, schemaId, createdAt });
  const records = Array.isArray(target.records) ? target.records.slice() : [];
  const existingIndex = records.findIndex((item) => sameRecordIdentity(item, schemaRecord));
  if (existingIndex >= 0) records[existingIndex] = mergeSchemaNavigationMetadata(records[existingIndex], schemaRecord);
  else records.unshift(schemaRecord);
  target.records = records;
  target.sources = schemaRecord.source?.sourceBacked ? upsertRecoveredSchemaSource(target.sources, schemaRecord.source) : upsertSchemaSource(target.sources, target.records);
  target.sourceOrder = Array.isArray(target.sources) ? target.sources.map((source) => source.id).filter(Boolean) : [];
  next.activeWorkspaceId = target.id;
  const selected = existingIndex >= 0 ? records[existingIndex] : schemaRecord;
  return focusSchemaRecord({ state: next, workspaceId: target.id, record: selected, schemaId, notice: `Opened reading contract: ${schemaShortLabel(schemaId)}.`, loaded: existingIndex < 0 });
}

export function findLoadedSchemaRecord(workspace = {}, schemaId = '') {
  const clean = normalizeSchemaId(schemaId);
  if (!clean) return null;
  const filename = schemaFilenameForId(clean).toLowerCase();
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  return records.find((record) => {
    const navId = normalizeSchemaId(record?.schemaNavigation?.schemaId || '');
    if (navId === clean && isSchemaMarkdownPath(record?.path)) return true;
    const path = String(record?.path || record?.sourceTarget?.sourceArtifactPath || '').toLowerCase();
    if (filename && path.endsWith(`/${filename}`)) return true;
    if (filename && path === filename) return true;
    return false;
  }) || null;
}

export function schemaPathCandidatesForRecord(record = {}, schemaId = '') {
  const clean = normalizeSchemaId(schemaId || recordSchemaId(record));
  const filename = schemaFilenameForId(clean);
  if (!clean || !filename) return [];
  const candidates = [];
  const add = (value) => { const path = normalizePath(value); if (path && !candidates.includes(path)) candidates.push(path); };
  const parsed = parseArtifactMarkdown(record.markdown || '');
  const rawCurrent = parsed.envelope?.current?.schema?.raw || '';
  const linked = markdownLinkHref(rawCurrent);
  if (linked) add(joinPath(dirname(record.path || ''), linked));
  add(filename);
  add(`.topics/.schemas/${filename}`);
  add(`.schemas/${filename}`);
  if (record.path) {
    add(joinPath(dirname(record.path), filename));
    add(joinPath(dirname(record.path), '../.schemas', filename));
    const topicsIndex = String(record.path || '').indexOf('.topics/');
    if (topicsIndex >= 0) add(`${String(record.path).slice(0, topicsIndex)}.topics/.schemas/${filename}`);
  }
  const catalogEntry = schemaCatalogEntryForId(clean);
  if (catalogEntry?.path) add(catalogEntry.path);
  return candidates;
}

function makeSchemaRecord({ workspace, entry, schemaId, createdAt }) {
  const path = normalizePath(entry.path || schemaFilenameForId(schemaId));
  const base = createRecordFromMarkdown(entry.markdown || '', { path, sourceMode: 'app-local-schema', lifecycleStatus: 'reading contract' });
  return Object.assign({}, base, {
    id: `schema:${workspace.id}:${schemaId}`,
    path,
    sourceMode: entry.source?.sourceBacked ? 'source-backed' : 'app-local-schema',
    lifecycleStatus: base.lifecycleStatus || 'reading contract',
    status: base.status || 'schema ok',
    source: entry.source?.sourceBacked ? Object.assign({}, entry.source) : schemaSourceBase(recordsForSource(workspace.records).length + 1),
    schemaNavigation: {
      schema: 'tiinex.workspace.schemaNavigation.v1',
      schemaId,
      loadedAt: createdAt,
      reason: 'reading-contract-badge',
      source: entry.source?.sourceBacked ? 'declared-reading-contract-target' : 'bundled-viewer-schema-registry',
      candidates: schemaPathCandidatesForRecord(base, schemaId)
    }
  });
}

function focusSchemaRecord({ state, workspaceId, record, schemaId, notice, existing = false, loaded = false }) {
  const next = cloneState(state);
  next.activeWorkspaceId = workspaceId || next.activeWorkspaceId;
  next.view = Object.assign({}, next.view || {}, {
    workspaceVerse: 'lineage',
    selectedRecordId: record.id,
    lineageQuery: '',
    lineageAuditReport: null,
    lineageLoadReport: null,
    expandedLineageRecordIds: unique([record.id].concat(next.view?.expandedLineageRecordIds || []))
  });
  return { ok: true, state: next, workspace: workspaceById(next, workspaceId), record, schemaId, existing, loaded, commitMode: 'push', notice };
}

function mergeSchemaNavigationMetadata(existing = {}, schemaRecord = {}) {
  return Object.assign({}, existing, {
    schemaNavigation: Object.assign({}, existing.schemaNavigation || {}, schemaRecord.schemaNavigation || {}),
    source: existing.source || schemaRecord.source,
    sourceMode: existing.sourceMode || schemaRecord.sourceMode
  });
}


function upsertRecoveredSchemaSource(sources = [], source = {}) {
  const list = Array.isArray(sources) ? sources.slice() : [];
  const id = String(source.id || '').trim();
  if (!id) return list;
  const index = list.findIndex((item) => String(item?.id || '') === id);
  if (index >= 0) list[index] = Object.assign({}, list[index], source);
  else list.push(Object.assign({}, source, { discoveryState: source.discoveryState || 'loaded', closeable: true, loadable: source.loadable !== false, count: Math.max(1, Number(source.count || 0)), recordCount: Math.max(1, Number(source.recordCount || source.count || 0)) }));
  return list;
}

function upsertSchemaSource(sources = [], records = []) {
  const list = Array.isArray(sources) ? sources.slice() : [];
  const count = recordsForSource(records).length;
  const source = schemaSourceBase(count);
  const index = list.findIndex((item) => item.id === SCHEMA_SOURCE_ID);
  if (index >= 0) list[index] = Object.assign({}, list[index], source);
  else list.push(source);
  return list;
}

function schemaSourceBase(count = 0) {
  return {
    id: SCHEMA_SOURCE_ID,
    label: SCHEMA_SOURCE_LABEL,
    kind: 'app-local',
    adapterId: 'schema-registry',
    sourceKind: 'app-local.schema',
    sourceBacked: false,
    discoveryState: 'loaded',
    count: Number(count || 0),
    recordCount: Number(count || 0),
    boundary: SCHEMA_SOURCE_BOUNDARY,
    surfaces: { schemas: { requested: true, state: 'loaded', loaded: Number(count || 0) } }
  };
}

function recordsForSource(records = []) { return (Array.isArray(records) ? records : []).filter((record) => record?.source?.id === SCHEMA_SOURCE_ID); }
function sameRecordIdentity(left = {}, right = {}) { return String(left.id || '') === String(right.id || '') || (normalizePath(left.path) && normalizePath(left.path) === normalizePath(right.path)); }
function workspaceById(state = {}, workspaceId = '') { return (Array.isArray(state?.workspaces) ? state.workspaces : []).find((workspace) => String(workspace?.id || '') === String(workspaceId || '')) || null; }
function recordById(workspace = {}, recordId = '') { return (Array.isArray(workspace.records) ? workspace.records : []).find((record) => String(record?.id || '') === String(recordId || '')) || null; }
function recordSchemaId(record = {}) { return record?.schemaId || record?.currentSchemaId || record?.kind || record?.schema || ''; }
function normalizeSchemaId(value = '') { return String(value || '').replace(/^Current Schema:\s*/i, '').replace(/^\[([^\]]+)\]\([^)]*\)$/u, '$1').trim(); }
function isSchemaMarkdownPath(path = '') { return /\.schema\.md$/i.test(String(path || '').trim()); }
function schemaShortLabel(schemaId = '') { return normalizeSchemaId(schemaId).replace(/^tiinex\./, '').replace(/\.v\d+$/, '') || 'schema'; }
function cloneState(value) { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value || {})); }
function unique(values = []) { return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean))); }
function markdownLinkHref(value = '') { return String(value || '').match(/^\[[^\]]+\]\(([^)]+)\)$/)?.[1] || ''; }
function normalizePath(value = '') {
  const raw = String(value || '').replace(/\\/g, '/').trim();
  if (!raw) return '';
  const out = [];
  for (const part of raw.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}
function dirname(path = '') { const parts = normalizePath(path).split('/').filter(Boolean); parts.pop(); return parts.join('/'); }
function joinPath(...parts) { return normalizePath(parts.filter(Boolean).join('/')); }
