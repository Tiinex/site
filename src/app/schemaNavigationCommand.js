import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { schemaCatalogEntryForId, schemaFilenameForId, schemaMarkdownCatalog } from '../schemas/schemaMarkdownCatalog.js';
import { declaredSchemaRecoveryTarget, qualifySchemaRecordRecoveryRepresentation, recoverDeclaredSchemaEntry, schemaRecoveryRepresentationIdentity } from './schemaSourceRecovery.js';
import { qualifySchemaReadingContractMarkdown } from './schemaReadingContractQualification.js';
import { normalizeExplicitFileRefs } from '../sources/source.explicitTargets.js';
import { isSchemaDefinitionPath } from '../workspaces/workspace.entrypointCapability.js';
import { qualifyRecordCurrentSchemaDeclaration } from './schemaCurrentDeclaration.js';
import { focusSchemaRecordState, stateWithWorkspaceStructuralCopy } from './schemaNavigationState.js';
import { coalesceRecoveredGithubSchemaSource, qualifySchemaMaterializationReuse } from './schemaNavigationMaterialization.js';

const SCHEMA_SOURCE_ID = 'viewer-schema-registry';
const SCHEMA_SOURCE_LABEL = 'Viewer schema registry';
const SCHEMA_SOURCE_BOUNDARY = 'bundled viewer schema reading contract; not user-local material and not guessed GitHub provenance';

export async function openSchemaForRecordCommand(input = {}) {
  const state = input.state;
  const workspace = input.workspace || workspaceById(state, input.workspaceId || state?.activeWorkspaceId);
  if (!workspace) return { ok: false, error: 'workspace.missing', state, notice: 'No active workspace is available.' };
  const record = input.record || recordById(workspace, input.recordId || state?.view?.selectedRecordId || '');
  const explicitSchemaId = normalizeSchemaId(input.schemaId || '');
  const declaration = qualifyRecordCurrentSchemaDeclaration(record, explicitSchemaId);
  if (declaration.materialState === 'concrete' && declaration.state !== 'qualified') {
    const error = declaration.state === 'ambiguous' ? 'schema.declaration.ambiguous' : (declaration.state === 'mismatch' ? 'schema.declaration.mismatch' : 'schema.declaration.unavailable');
    return { ok: false, error, state, schemaId: explicitSchemaId || normalizeSchemaId(recordSchemaId(record)), declaration, notice: 'This artifact does not provide one exact Current Schema declaration that can authorize Open Schema.' };
  }
  if (declaration.materialState === 'read-failed') return { ok: false, error: 'schema.declaration.unavailable', state, declaration, notice: 'This artifact\'s concrete Current Schema declaration could not be read.' };
  const schemaId = declaration.state === 'qualified' ? declaration.schemaId : (explicitSchemaId || normalizeSchemaId(recordSchemaId(record)));
  if (!schemaId || schemaId === 'plain' || schemaId === 'markdown' || schemaId === 'unknown') return { ok: false, error: 'schema.missing', state, declaration, notice: 'This artifact does not declare an openable reading contract schema.' };

  const linkedDeclaration = declaration.state === 'qualified' && Boolean(declaration.target);
  const declaredTarget = linkedDeclaration ? declaredSchemaRecoveryTarget(record, schemaId) : null;
  const representationIdentity = linkedDeclaration && declaredTarget?.ok ? schemaRecoveryRepresentationIdentity(declaredTarget) : '';
  if (linkedDeclaration && (!declaredTarget?.ok || !representationIdentity)) {
    return { ok: false, error: 'schema.unavailable', state, schemaId, declaration, recovery: declaredTarget, notice: `Reading contract schema ${schemaId} is unavailable because its declared representation target cannot be qualified.` };
  }

  const loadedQualification = qualifyLoadedSchemaRecords(workspace, schemaId, representationIdentity);
  if (loadedQualification.state === 'ambiguous') return { ok: false, error: 'schema.ambiguous', state, schemaId, notice: `Multiple qualified reading contracts are loaded for ${schemaId}; exact selection authority is unavailable.` };
  const existing = loadedQualification.record || null;
  if (existing) return focusSchemaRecordState({ state, workspaceId: workspace.id, record: existing, schemaId, notice: `Opened reading contract: ${schemaShortLabel(schemaId)}.`, existing: true });

  let recovered = null;
  if (linkedDeclaration) {
    recovered = await recoverDeclaredSchemaEntry({ record, schemaId, fetchImpl: input.fetchImpl });
    if (!recovered?.ok) return { ok: false, error: 'schema.unavailable', state, schemaId, declaration, recovery: recovered, notice: `Reading contract schema ${schemaId} is unavailable because its declared representation could not be recovered and qualified.` };
  } else if (!input.schemaEntry) recovered = await recoverDeclaredSchemaEntry({ record, schemaId, fetchImpl: input.fetchImpl });
  const catalog = input.catalog || schemaMarkdownCatalog;
  let entry = linkedDeclaration ? recovered : (input.schemaEntry || (recovered?.ok ? recovered : null) || (catalog?.[schemaId] || schemaCatalogEntryForId(schemaId)));
  if (entry && !entry.markdown && typeof input.loadSchemaMarkdown === 'function') {
    try { entry = await input.loadSchemaMarkdown(schemaId); }
    catch (error) { return { ok: false, error: 'schema.fetch.failed', state, schemaId, exception: error, notice: `Could not open reading contract schema ${schemaId}.` }; }
  }
  if (!entry?.markdown) return { ok: false, error: 'schema.unavailable', state, schemaId, recovery: recovered, notice: `Reading contract schema ${schemaId} is not loaded or bundled for this workspace.` };
  const semanticQualificationEvidence = entry?.semanticQualification || null;
  const semanticQualification = qualifySchemaReadingContractMarkdown(entry.markdown, schemaId);
  if (semanticQualification.state !== 'qualified') return { ok: false, error: 'schema.unavailable', state, schemaId, recovery: recovered, semanticQualification, notice: `Reading contract schema ${schemaId} is unavailable because its material is not qualified as the exact supported Tiinex schema artifact.` };
  entry = Object.assign({}, entry, { semanticQualification, semanticQualificationEvidence });

  const copied = stateWithWorkspaceStructuralCopy(state, workspace.id);
  const next = copied.state;
  const target = copied.workspace;
  if (!target) return { ok: false, error: 'workspace.missing-after-copy', state, notice: 'No active workspace is available.' };
  const createdAt = input.clock ? input.clock() : new Date().toISOString();
  if (entry?.source?.sourceBacked && String(entry.source.adapterId || '').toLowerCase() === 'github') {
    const coalesced = coalesceRecoveredGithubSchemaSource(target.sources, entry.source, entry.path || recovered?.path || '');
    if (!coalesced.ok) {
      return { ok: false, error: coalesced.reason === 'github-source-boundary-ambiguous' ? 'schema.source.ambiguous' : 'schema.source.unavailable', state, schemaId, sourceQualification: coalesced, notice: `Reading contract schema ${schemaId} could not be attached to one truthful exact GitHub source boundary.` };
    }
    target.sources = coalesced.sources;
    entry = Object.assign({}, entry, { source: coalesced.source });
  }
  const schemaRecord = makeSchemaRecord({ workspace: target, entry, schemaId, createdAt });
  const records = Array.isArray(target.records) ? target.records.slice() : [];
  const materialization = qualifySchemaMaterializationReuse(records, schemaRecord, schemaId);
  if (materialization.state === 'ambiguous') {
    return { ok: false, error: 'schema.materialization.ambiguous', state, schemaId, materialization, notice: `Multiple concrete records qualify as the exact reading contract for ${schemaId}; materialization authority is ambiguous.` };
  }
  if (materialization.state === 'conflict') {
    return { ok: false, error: 'schema.materialization.identity-conflict', state, schemaId, materialization, notice: `An unrelated record occupies the reading-contract storage identity for ${schemaId}; it was not overwritten or upgraded.` };
  }
  const existingIndex = materialization.index;
  if (existingIndex >= 0) records[existingIndex] = mergeSchemaNavigationMetadata(records[existingIndex], schemaRecord);
  else records.unshift(schemaRecord);
  target.records = records;
  const selected = existingIndex >= 0 ? records[existingIndex] : schemaRecord;
  const selectedSource = selected?.source || schemaRecord.source;
  target.sources = selectedSource?.sourceBacked ? updateRecoveredSchemaSourceCounts(target.sources, selectedSource, target.records) : upsertSchemaSource(target.sources, target.records);
  target.sourceOrder = Array.isArray(target.sources) ? target.sources.map((source) => source.id).filter(Boolean) : [];
  next.activeWorkspaceId = target.id;
  return focusSchemaRecordState({ state: next, workspaceId: target.id, record: selected, schemaId, notice: `Opened reading contract: ${schemaShortLabel(schemaId)}.`, loaded: existingIndex < 0 });
}

export function findLoadedSchemaRecord(workspace = {}, schemaId = '') {
  const qualified = qualifyLoadedSchemaRecords(workspace, schemaId);
  return qualified.state === 'qualified' ? qualified.record : null;
}

function qualifyLoadedSchemaRecords(workspace = {}, schemaId = '', representationIdentity = '') {
  const clean = normalizeSchemaId(schemaId);
  if (!clean) return Object.freeze({ state: 'unavailable', record: null, matches: Object.freeze([]), candidateCount: 0, failures: Object.freeze([]) });
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const candidates = records.filter((record) => loadedSchemaCandidateEvidence(record, clean));
  const matches = [];
  const failures = [];
  for (const record of candidates) {
    try {
      if (representationIdentity) {
        const representation = qualifySchemaRecordRecoveryRepresentation(record);
        if (representation.state !== 'qualified' || representation.identity !== representationIdentity) {
          failures.push(Object.freeze({ id: String(record?.id || ''), state: representation.state, reason: representation.reason || 'representation-target-mismatch' }));
          continue;
        }
      }
      const qualification = qualifySchemaReadingContractMarkdown(record?.markdown || '', clean);
      if (qualification.state === 'qualified') matches.push(record);
      else failures.push(Object.freeze({ id: String(record?.id || ''), state: qualification.state }));
    } catch (exception) {
      failures.push(Object.freeze({ id: String(record?.id || ''), state: 'unavailable', reason: 'candidate-read-failed', exception }));
    }
  }
  if (matches.length === 1) return Object.freeze({ state: 'qualified', record: matches[0], matches: Object.freeze(matches), candidateCount: candidates.length, failures: Object.freeze(failures) });
  if (matches.length > 1) return Object.freeze({ state: 'ambiguous', record: null, matches: Object.freeze(matches), candidateCount: candidates.length, failures: Object.freeze(failures) });
  return Object.freeze({ state: 'unavailable', record: null, matches: Object.freeze([]), candidateCount: candidates.length, failures: Object.freeze(failures) });
}

function loadedSchemaCandidateEvidence(record = {}, schemaId = '') {
  const clean = normalizeSchemaId(schemaId);
  if (!clean || !record || typeof record !== 'object') return '';
  const navigation = record.schemaNavigation || {};
  if (normalizeSchemaId(navigation.schemaId) === clean && (navigation.reason === 'reading-contract-badge' || navigation.schema === 'tiinex.workspace.schemaNavigation.v1')) return 'schema-navigation-reading-contract';

  const filename = schemaFilenameForId(clean);
  const paths = [record.path, record.sourcePath, record.sourceTarget?.sourceArtifactPath]
    .map((value) => String(value || '').replace(/\\/g, '/').trim())
    .filter(Boolean);
  if (filename && paths.some((path) => isSchemaDefinitionPath(path) && path.split('/').filter(Boolean).at(-1) === filename)) return 'schema-definition-path';

  const explicitRole = String(record.materialRole || record.materialKind || record.artifactRole || record.presentationRole || '').trim().toLowerCase();
  const schemaDefinitionRole = explicitRole === 'schema-definition' || explicitRole === 'schema';
  const governedId = normalizeSchemaId(record.schemaId || record.currentSchemaId || '');
  if (schemaDefinitionRole && governedId === clean) return 'schema-definition-role';
  if (String(record.lifecycleStatus || '').trim().toLowerCase() === 'reading contract' && governedId === clean) return 'reading-contract-lifecycle';
  return '';
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
  const representationIdentity = entry?.source?.sourceBacked ? schemaRecoveryRepresentationIdentity(entry) : '';
  const path = schemaEntryRecordPath(entry, schemaId);
  const base = createRecordFromMarkdown(entry.markdown || '', { path, sourceMode: 'app-local-schema', lifecycleStatus: 'reading contract' });
  return Object.assign({}, base, {
    id: representationIdentity ? `schema:${workspace.id}:${schemaId}:representation:${encodeURIComponent(representationIdentity)}` : `schema:${workspace.id}:${schemaId}`,
    path,
    sourceMode: entry.source?.sourceBacked ? 'source-backed' : 'app-local-schema',
    lifecycleStatus: base.lifecycleStatus || 'reading contract',
    status: base.status || 'schema ok',
    source: entry.source?.sourceBacked ? Object.assign({}, entry.source) : schemaSourceBase(recordsForSource(workspace.records).length + 1),
    sourceTarget: entry.source?.sourceBacked ? {
      sourceArtifactPath: path,
      declaredLocator: entry.declaredHref || entry.declaredLocator || '',
      effectiveRequestTarget: entry.effectiveRequestTarget || entry.fetchUrl || '',
      finalRetrievedTarget: entry.finalRetrievedTarget || entry.effectiveRequestTarget || entry.fetchUrl || '',
      inputTarget: entry.finalRetrievedTarget || entry.effectiveRequestTarget || entry.fetchUrl || entry.browseUrl || path,
      browseUrl: entry.browseUrl || entry.source?.permalink || entry.finalRetrievedTarget || entry.fetchUrl || '',
      rawUrl: entry.finalRetrievedTarget || entry.fetchUrl || ''
    } : base.sourceTarget,
    schemaNavigation: {
      schema: 'tiinex.workspace.schemaNavigation.v1',
      schemaId,
      loadedAt: createdAt,
      reason: 'reading-contract-badge',
      source: entry.source?.sourceBacked ? 'declared-reading-contract-target' : 'bundled-viewer-schema-registry',
      representationIdentity,
      declaredLocator: entry.declaredHref || entry.declaredLocator || '',
      effectiveRequestTarget: entry.effectiveRequestTarget || entry.fetchUrl || '',
      finalRetrievedTarget: entry.finalRetrievedTarget || entry.effectiveRequestTarget || entry.fetchUrl || '',
      semanticQualification: entry.semanticQualification || qualifySchemaReadingContractMarkdown(entry.markdown || '', schemaId),
      candidates: schemaPathCandidatesForRecord(base, schemaId)
    }
  });
}

function mergeSchemaNavigationMetadata(existing = {}, schemaRecord = {}) {
  return Object.assign({}, existing, {
    schemaNavigation: Object.assign({}, existing.schemaNavigation || {}, schemaRecord.schemaNavigation || {}),
    source: existing.source || schemaRecord.source,
    sourceMode: existing.sourceMode || schemaRecord.sourceMode
  });
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
function workspaceById(state = {}, workspaceId = '') { return (Array.isArray(state?.workspaces) ? state.workspaces : []).find((workspace) => String(workspace?.id || '') === String(workspaceId || '')) || null; }
function recordById(workspace = {}, recordId = '') { return (Array.isArray(workspace.records) ? workspace.records : []).find((record) => String(record?.id || '') === String(recordId || '')) || null; }
function recordSchemaId(record = {}) { return record?.schemaId || record?.currentSchemaId || ''; }
function normalizeSchemaId(value = '') { return String(value || '').replace(/^Current Schema:\s*/i, '').replace(/^\[([^\]]+)\]\([^)]*\)$/u, '$1').trim(); }
function isSchemaMarkdownPath(path = '') { return /\.schema\.md$/i.test(String(path || '').trim()); }
function schemaShortLabel(schemaId = '') { return normalizeSchemaId(schemaId).replace(/^tiinex\./, '').replace(/\.v\d+$/, '') || 'schema'; }
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
function schemaEntryRecordPath(entry = {}, schemaId = '') {
  const raw = String(entry.path || '').trim();
  if (/^https?:\/\//u.test(raw)) return raw;
  return normalizePath(raw || schemaFilenameForId(schemaId));
}
function dirname(path = '') { const parts = normalizePath(path).split('/').filter(Boolean); parts.pop(); return parts.join('/'); }
function joinPath(...parts) { return normalizePath(parts.filter(Boolean).join('/')); }
