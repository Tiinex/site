import { projectPlaythingsMultiverse } from './playthings.model.js';
import { planPlaythingsHistory } from './playthings.timeline.js';
import { generatePlaythingsWorld } from './playthings.world.js';

export const PLAYTHINGS_PREPARED_SCHEMA = 'tiinex.playthings.prepared-projection.experimental.v1';

export function compactPlaythingsWorkspaces(workspacesInput = []) {
  return (Array.isArray(workspacesInput) ? workspacesInput : []).map((workspace) => ({
    id: workspace?.id || '',
    title: workspace?.title || '',
    name: workspace?.name || '',
    sources: (workspace?.sources || []).map(compactSource),
    records: (workspace?.records || []).map(compactRecord)
  }));
}

export async function compactPlaythingsWorkspacesCooperatively(workspacesInput = [], onProgress = null, yieldControl = defaultYieldControl) {
  const workspaces = Array.isArray(workspacesInput) ? workspacesInput : [];
  const totalRecords = Math.max(1, workspaces.reduce((sum, workspace) => sum + (workspace?.records || []).length, 0));
  let completed = 0;
  const compacted = [];
  progress(onProgress, 3, 'Opening Playthings Verse');
  for (const workspace of workspaces) {
    const records = [];
    for (const record of (workspace?.records || [])) {
      records.push(compactRecord(record));
      completed += 1;
      if (completed % 24 === 0) {
        progress(onProgress, Math.min(10, 3 + Math.round((completed / totalRecords) * 7)), 'Packing loaded Tiinex material');
        await yieldControl();
      }
    }
    compacted.push({
      id: workspace?.id || '',
      title: workspace?.title || '',
      name: workspace?.name || '',
      sources: (workspace?.sources || []).map(compactSource),
      records
    });
  }
  progress(onProgress, 10, 'Handing projection work to the world worker');
  await yieldControl();
  return compacted;
}

export function preparePlaythingsSnapshot(workspaces = [], onProgress = null) {
  progress(onProgress, 12, 'Resolving Tiinex Parent lineage');
  const model = projectPlaythingsMultiverse(workspaces);
  progress(onProgress, 48, 'Classifying living leaves and blueprints');
  const history = planPlaythingsHistory(model);
  progress(onProgress, 62, 'Growing the shared earth');
  const world = generatePlaythingsWorld(model);
  progress(onProgress, 94, 'Preparing roads, places and sleeping residents');
  return Object.freeze({ schema: PLAYTHINGS_PREPARED_SCHEMA, model, history, world, semanticAuthority: 'none' });
}

function compactSource(source = {}) {
  return {
    id: source?.id || '', kind: source?.kind || '', adapterId: source?.adapterId || '', label: source?.label || '',
    repo: source?.repo || '', repository: source?.repository || '', ref: source?.ref || '', rootPath: source?.rootPath || '',
    primary: source?.primary === true, role: source?.role || '', sourceRole: source?.sourceRole || '', count: source?.count || 0,
    recordCount: source?.recordCount || 0, referenceCount: source?.referenceCount || 0,
    config: compactSourceConfig(source?.config || {})
  };
}

function compactSourceConfig(config = {}) {
  return {
    repo: config?.repo || '', repository: config?.repository || '', ref: config?.ref || '', rootPath: config?.rootPath || '',
    explicitFileRefs: Array.isArray(config?.explicitFileRefs) ? config.explicitFileRefs.slice() : undefined
  };
}

function compactRecord(record = {}) {
  const schemaId = record.schemaId || record.currentSchemaId || schemaIdFromMarkdown(record.markdown || '');
  const authors = record.currentAuthors || record.authors || authorsFromMarkdown(record.markdown || '');
  const integrity = record.integrity || null;
  const integrityMarkdown = !integrity?.entries?.length && record.hasIntegrity ? continuityIntegritySlice(record.markdown || '') : '';
  return {
    id: record.id || '', path: record.path || '', title: record.title || '', summary: record.summary || '', why: record.why || '',
    schemaId, currentSchemaId: schemaId, kind: record.kind || '', currentCreatedAt: record.currentCreatedAt || '',
    createdAt: record.createdAt || '', date: record.date || '', trace: record.trace || '', origin: record.origin || '',
    parentOrigin: record.parentOrigin || '', parentSchemaId: record.parentSchemaId || '', hasContinuityContext: Boolean(record.hasContinuityContext),
    hasIntegrity: Boolean(record.hasIntegrity), integrity, markdown: integrityMarkdown, sourceMode: record.sourceMode || '', recoveryKind: record.recoveryKind || '',
    boundary: record.boundary || '', currentAuthors: authors, authors,
    source: compactRecordSource(record.source || {}), sourcePath: record.sourcePath || '',
    sourceTarget: compactSourceTarget(record.sourceTarget || {}), snapshot: compactSnapshot(record.snapshot || {}),
    recoveredFromUrl: record.recoveredFromUrl || '', sourceOrigin: record.sourceOrigin || '', rawUrl: record.rawUrl || '', browseUrl: record.browseUrl || '',
    workspaceEntries: compactArray(record.workspaceEntries), workspaceEntrypoints: compactArray(record.workspaceEntrypoints), workspaces: compactArray(record.workspaces)
  };
}

function compactRecordSource(source = {}) {
  return {
    id: source?.id || '', kind: source?.kind || '', adapterId: source?.adapterId || '', repo: source?.repo || '', repository: source?.repository || '',
    path: source?.path || '', boundary: source?.boundary || '', ref: source?.ref || '', config: compactSourceConfig(source?.config || {})
  };
}
function compactSourceTarget(target = {}) {
  return {
    repository: target?.repository || '', inputTarget: target?.inputTarget || '', url: target?.url || '', rawUrl: target?.rawUrl || '', browseUrl: target?.browseUrl || '',
    sourceArtifactPath: target?.sourceArtifactPath || '', parentRawUrl: target?.parentRawUrl || '', parentSourceUrl: target?.parentSourceUrl || '',
    parentArtifactPath: target?.parentArtifactPath || '', targetKind: target?.targetKind || ''
  };
}
function compactSnapshot(snapshot = {}) {
  return {
    sourceUrl: snapshot?.sourceUrl || '', sourceArtifactPath: snapshot?.sourceArtifactPath || '', parentRawUrl: snapshot?.parentRawUrl || '',
    parentSourceUrl: snapshot?.parentSourceUrl || '', parentArtifactPath: snapshot?.parentArtifactPath || '', sourceKind: snapshot?.sourceKind || '',
    target: snapshot?.target ? { canonicalUrl: snapshot.target.canonicalUrl || '', html_url: snapshot.target.html_url || '', url: snapshot.target.url || '' } : undefined
  };
}
function compactArray(value) { return Array.isArray(value) ? value.slice(0, 12).map((entry) => typeof entry === 'string' ? entry : { path: entry?.path || '', id: entry?.id || '' }) : undefined; }
function schemaIdFromMarkdown(markdown = '') {
  const raw = String(markdown || '').match(/^\s*-\s*Current Schema:\s*(.+?)\s*$/mi)?.[1]?.trim() || '';
  const linked = raw.match(/^\[([^\]]+)\]\([^)]+\)$/);
  return (linked?.[1] || raw).replace(/[*_`]/g, '').trim();
}
function authorsFromMarkdown(markdown = '') { const raw = String(markdown || '').match(/^\s*-\s*Authors:\s*(.+?)\s*$/mi)?.[1]?.trim() || ''; return raw.match(/^\[([^\]]+)\]\([^)]+\)$/)?.[1] || raw.replace(/[*_`]/g, ''); }
function continuityIntegritySlice(markdown = '') { const text = String(markdown || ''); const index = text.search(/^#\s+Continuity Integrity\s*$/im); return index >= 0 ? text.slice(index) : ''; }
function progress(callback, value, label) { if (typeof callback === 'function') callback({ value, label }); }
async function defaultYieldControl() {
  if (typeof globalThis !== 'undefined' && typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
