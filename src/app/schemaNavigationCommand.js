import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { schemaCatalogEntryForId, schemaFilenameForId, schemaMarkdownCatalog } from '../schemas/schemaMarkdownCatalog.js';
import { recoverDeclaredSchemaEntry } from './schemaSourceRecovery.js';
import { normalizeExplicitFileRefs } from '../sources/source.explicitTargets.js';
import { stateWithActiveWorkspace, stateWithWorkspaceViewPatch } from './workspaceMulticolumn.js';

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
  if (entry?.source?.sourceBacked && String(entry.source.adapterId || '').toLowerCase() === 'github') {
    const coalesced = coalesceRecoveredGithubSchemaSource(target.sources, entry.source, entry.path || recovered?.path || '');
    target.sources = coalesced.sources;
    entry = Object.assign({}, entry, { source: coalesced.source });
  }
  const schemaRecord = makeSchemaRecord({ workspace: target, entry, schemaId, createdAt });
  const records = Array.isArray(target.records) ? target.records.slice() : [];
  const existingIndex = records.findIndex((item) => sameRecordIdentity(item, schemaRecord));
  if (existingIndex >= 0) records[existingIndex] = mergeSchemaNavigationMetadata(records[existingIndex], schemaRecord);
  else records.unshift(schemaRecord);
  target.records = records;
  target.sources = schemaRecord.source?.sourceBacked ? updateRecoveredSchemaSourceCounts(target.sources, schemaRecord.source, target.records) : upsertSchemaSource(target.sources, target.records);
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
    sourceTarget: entry.source?.sourceBacked ? {
      sourceArtifactPath: path,
      inputTarget: entry.declaredHref || entry.browseUrl || entry.fetchUrl || path,
      browseUrl: entry.browseUrl || entry.source?.permalink || '',
      rawUrl: entry.fetchUrl || ''
    } : base.sourceTarget,
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
  const id = String(workspaceId || state?.activeWorkspaceId || '').trim();
  let next = stateWithActiveWorkspace(cloneState(state), id);
  const currentView = next.workspaceViews?.[id] || next.view || {};
  next = stateWithWorkspaceViewPatch(next, id, {
    workspaceVerse: 'lineage',
    selectedRecordId: record.id,
    lineageQuery: '',
    lineageAuditReport: null,
    lineageLoadReport: null,
    expandedLineageRecordIds: unique([record.id].concat(currentView.expandedLineageRecordIds || []))
  });
  return { ok: true, state: next, workspace: workspaceById(next, id), record, schemaId, existing, loaded, commitMode: 'push', notice };
}

function mergeSchemaNavigationMetadata(existing = {}, schemaRecord = {}) {
  return Object.assign({}, existing, {
    schemaNavigation: Object.assign({}, existing.schemaNavigation || {}, schemaRecord.schemaNavigation || {}),
    source: existing.source || schemaRecord.source,
    sourceMode: existing.sourceMode || schemaRecord.sourceMode
  });
}


function coalesceRecoveredGithubSchemaSource(sources = [], recovered = {}, targetPath = '') {
  const list = Array.isArray(sources) ? sources.slice() : [];
  const repo = String(recovered.repo || recovered.repository || recovered.config?.repo || '').trim();
  const ref = String(recovered.ref || recovered.config?.ref || '').trim();
  const path = normalizePath(targetPath || recovered.path || '');
  const rootPath = schemaSourceRootPath(path, recovered.rootPath || recovered.config?.rootPath || '');
  const compatibleIndex = list.findIndex((source) => compatibleGithubSchemaBoundary(source, { repo, ref, rootPath }));
  const existing = compatibleIndex >= 0 ? list[compatibleIndex] : null;
  const explicitFileRefs = normalizeExplicitFileRefs([...(existing?.explicitFileRefs || existing?.config?.explicitFileRefs || []), path]);
  const id = existing?.id || `github-exact:${repo.toLowerCase()}:${ref || 'default'}:${rootPath}`;
  const source = Object.assign({}, existing || {}, recovered, {
    id,
    label: existing?.label || recovered.label || repo,
    kind: existing?.kind || 'github-tree',
    adapterId: 'github',
    sourceKind: 'github.repo',
    repo,
    repository: repo,
    ref,
    rootPath,
    sourceBacked: true,
    originReferenceSource: false,
    recoveryOnly: false,
    loadable: true,
    closeable: existing?.closeable !== false,
    repoDiscovery: Boolean(existing?.repoDiscovery),
    issueDiscovery: Boolean(existing?.issueDiscovery),
    issueUrls: existing?.issueUrls || existing?.config?.issueUrls || '',
    explicitFileRefs,
    config: Object.assign({}, existing?.config || {}, recovered.config || {}, { repo, ref, rootPath, issueUrls: existing?.issueUrls || existing?.config?.issueUrls || '', explicitFileRefs: explicitFileRefs.slice() }),
    requestedSurfaces: Object.assign({}, existing?.requestedSurfaces || {}, {
      explicitFiles: Object.assign({}, existing?.requestedSurfaces?.explicitFiles || {}, { requested: true, requestedCount: explicitFileRefs.length })
    }),
    boundary: existing?.boundary || 'configured exact-target GitHub source; broad discovery remains explicit'
  });
  delete source.path;
  delete source.permalink;
  if (compatibleIndex >= 0) list[compatibleIndex] = source;
  else list.push(source);
  return { source, sources: list };
}

function updateRecoveredSchemaSourceCounts(sources = [], source = {}, records = []) {
  const list = Array.isArray(sources) ? sources.slice() : [];
  const index = list.findIndex((item) => String(item?.id || '') === String(source.id || ''));
  if (index < 0) return list.concat(source);
  const current = list[index];
  const sourceRecords = (Array.isArray(records) ? records : []).filter((record) => String(record?.source?.id || '') === String(source.id || ''));
  const recoveredSchemaRecords = sourceRecords.filter((record) => record?.schemaNavigation?.reason === 'reading-contract-badge');
  const explicitFileRefs = normalizeExplicitFileRefs(current.explicitFileRefs || current.config?.explicitFileRefs || []);
  const explicitFiles = Object.assign({}, current.surfaces?.explicitFiles || {}, { requested: true, loaded: recoveredSchemaRecords.length, requestedCount: explicitFileRefs.length });
  list[index] = Object.assign({}, current, {
    count: Math.max(Number(current.count || 0), sourceRecords.length),
    recordCount: Math.max(Number(current.recordCount || 0), sourceRecords.length),
    explicitFileRefs,
    config: Object.assign({}, current.config || {}, { explicitFileRefs: explicitFileRefs.slice() }),
    surfaces: Object.assign({}, current.surfaces || {}, { explicitFiles })
  });
  return list;
}

function compatibleGithubSchemaBoundary(source = {}, target = {}) {
  if (String(source.adapterId || '').toLowerCase() !== 'github') return false;
  if (source.originReferenceSource === true || source.recoveryOnly === true) return false;
  const repo = String(source.repo || source.repository || source.config?.repo || '').trim().toLowerCase();
  const ref = String(source.ref || source.config?.ref || '').trim();
  const rootPath = schemaSourceRootPath('', source.rootPath || source.config?.rootPath || '');
  return Boolean(repo && repo === String(target.repo || '').trim().toLowerCase() && ref === String(target.ref || '').trim() && rootPath === target.rootPath);
}

function schemaSourceRootPath(path = '', configuredRoot = '') {
  const root = normalizePath(configuredRoot);
  if (root && root !== '.') return root;
  const clean = normalizePath(path);
  if (clean === '.topics' || clean.startsWith('.topics/')) return '.topics';
  const parts = clean.split('/').filter(Boolean);
  return parts.length > 1 ? parts[0] : '.';
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
