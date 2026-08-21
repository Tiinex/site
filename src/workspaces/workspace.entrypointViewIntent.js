import { normalizeWorkspaceDisplayOptions } from './workspace.displayOptions.js';

const SUPPORTED_VIEWS = new Set(['feed', 'tree', 'lineage', 'audit']);

export function workspaceEntrypointViewIntent(entrypoint = {}) {
  const rawView = token(entrypoint.defaultView).toLowerCase();
  const rawFilter = token(entrypoint.defaultFilter || entrypoint.filter);
  const rawSearch = token(entrypoint.defaultSearch || entrypoint.search);
  const selectedPath = canonicalPath(entrypoint.selectedPath);
  const findings = [];
  const view = rawView && SUPPORTED_VIEWS.has(rawView) ? rawView : '';
  if (rawView && !view) findings.push(`unsupported-default-view:${rawView}`);
  return Object.freeze({
    schema: 'tiinex.workspace.entrypoint-view-intent.v1',
    state: findings.length ? 'degraded' : 'qualified',
    workspaceVerse: view,
    defaultFilter: rawFilter,
    query: rawSearch,
    selectedPath,
    findings: Object.freeze(findings)
  });
}

export function stateWithWorkspaceEntrypointViewIntent(state = {}, workspaceId = '', entrypoint = {}) {
  const id = token(workspaceId || state.activeWorkspaceId);
  if (!id) return state;
  const workspace = (Array.isArray(state.workspaces) ? state.workspaces : []).find((item) => token(item?.id) === id);
  if (!workspace) return state;
  const intent = workspaceEntrypointViewIntent(entrypoint);
  if (!intent.workspaceVerse && !intent.defaultFilter && !intent.query && !intent.selectedPath && !intent.findings.length) return state;
  const views = Object.assign({}, state.workspaceViews || {});
  const current = Object.assign({}, views[id] || (id === state.activeWorkspaceId ? state.view : {}) || {});
  const patch = {};
  if (intent.workspaceVerse) patch.workspaceVerse = intent.workspaceVerse;
  if (Object.prototype.hasOwnProperty.call(entrypoint, 'defaultSearch') || Object.prototype.hasOwnProperty.call(entrypoint, 'search')) patch.query = intent.query;
  if (intent.defaultFilter) {
    const displayOptions = Object.assign({}, normalizeWorkspaceDisplayOptions(current.displayOptions || {}));
    if (intent.defaultFilter.toLowerCase() === 'all') {
      Object.assign(displayOptions, { leavesOnly: false, showSupportingMarkdown: true, showWorkspaceArtifacts: true, showAssets: true, schemaFilter: 'all', artifactFilter: 'all', sourceFilter: 'all', mismatchesOnly: false });
      patch.entrypointSchemaFilter = '';
    } else {
      Object.assign(displayOptions, { leavesOnly: false, showSupportingMarkdown: true, showWorkspaceArtifacts: true, schemaFilter: intent.defaultFilter });
      patch.entrypointSchemaFilter = intent.defaultFilter;
    }
    patch.displayOptions = displayOptions;
  }
  if (intent.selectedPath) patch.entrypointSelectedPath = intent.selectedPath;
  const nextView = Object.assign({}, current, patch);
  views[id] = nextView;
  const workspaces = (state.workspaces || []).map((item) => item.id === id ? Object.assign({}, item, { workspaceEntrypointViewIntent: intent }) : item);
  return Object.assign({}, state, { workspaces, workspaceViews: views, view: id === state.activeWorkspaceId ? nextView : state.view });
}

export function resolveWorkspaceEntrypointViewIntent(view = {}, workspace = null) {
  const next = Object.assign({}, view || {});
  const records = Array.isArray(workspace?.records) ? workspace.records : [];
  const selectedPath = canonicalPath(next.entrypointSelectedPath);
  if (selectedPath) {
    const matches = records.filter((record) => canonicalPath(record.path || record.sourcePath || record.sourceTarget?.sourceArtifactPath || '') === selectedPath);
    if (matches.length === 1) {
      next.workspaceVerse = 'lineage';
      next.selectedRecordId = matches[0].id || '';
      delete next.entrypointSelectedPath;
    }
  }
  const requestedSchema = token(next.entrypointSchemaFilter);
  if (requestedSchema && records.length) {
    const matched = records.some((record) => token(record.schemaId || record.currentSchemaId || record.envelopeSchemaId) === requestedSchema);
    next.displayOptions = Object.assign({}, next.displayOptions || {}, { schemaFilter: matched ? requestedSchema : 'all' });
    delete next.entrypointSchemaFilter;
  }
  return next;
}

function canonicalPath(value = '') {
  const out = [];
  for (const part of String(value || '').trim().replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop(); else out.push(part);
  }
  return out.join('/');
}
function token(value = '') { return String(value ?? '').trim(); }
