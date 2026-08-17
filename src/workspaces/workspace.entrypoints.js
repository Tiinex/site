import { normalizeExplicitFileRefs } from '../sources/source.explicitTargets.js';

export function workspaceSourceInputsFromMarkdown(markdown = '', parseWorkspaceConfig = null) {
  return workspaceDeclaredSourceInputsFromMarkdown(markdown, parseWorkspaceConfig).filter((sourceInput) => workspaceEntrypointApplies(sourceInput.workspaceEntrypoint));
}

export function workspaceDeclaredSourceInputsFromMarkdown(markdown = '', parseWorkspaceConfig = null) {
  if (typeof parseWorkspaceConfig !== 'function') return [];
  let config = null;
  try { config = parseWorkspaceConfig(markdown); } catch (_) { return []; }
  const entrypoints = Array.isArray(config?.workspaceEntrypoints) ? config.workspaceEntrypoints : [];
  return entrypoints.map((entrypoint) => workspaceSourceInputFromDeclaredEntrypoint(entrypoint)).filter(Boolean);
}

export function workspaceEntrypointApplies(entrypoint = {}) {
  const value = entrypoint?.openOnApply;
  if (typeof value === 'boolean') return value;
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return true;
  if (['no', 'false', 'disabled', 'disable', 'off', '0'].includes(text)) return false;
  if (['yes', 'true', 'enabled', 'enable', 'on', '1'].includes(text)) return true;
  return true;
}

export function workspaceSourceInputFromEntrypoint(entrypoint = {}) {
  if (!workspaceEntrypointApplies(entrypoint)) return null;
  return workspaceSourceInputFromDeclaredEntrypoint(entrypoint);
}

export function workspaceSourceInputFromDeclaredEntrypoint(entrypoint = {}) {
  const repository = String(entrypoint?.repository || entrypoint?.repo || '').trim();
  if (!repository) return null;
  const issueUrls = entrypoint.issueUrl || entrypoint.issueUrls || '';
  return {
    repository,
    ref: entrypoint.ref || '',
    rootPath: entrypoint.rootPath || '.topics',
    label: entrypoint.workspaceLabel || entrypoint.name || entrypoint.label || repository,
    sourceKind: entrypoint.sourceKind || entrypoint.kind || 'github-tree',
    repoDiscovery: truthyWorkspaceConfigValue(entrypoint.repoFilesDiscovery ?? entrypoint.repoDiscovery ?? true),
    issueDiscovery: truthyWorkspaceConfigValue(entrypoint.issueDiscovery ?? entrypoint.issueSnapshots ?? false),
    issueUrls,
    explicitFileRefs: entrypoint.explicitFileRefs || entrypoint.fileRefs || '',
    fileRefs: entrypoint.explicitFileRefs || entrypoint.fileRefs || '',
    preserveView: true,
    allowSourceCache: true,
    workspaceEntrypoint: Object.assign({}, entrypoint)
  };
}

export function addConfiguredSourceToWorkspace(lifecycle, state, workspaceId, sourceInput, overrides = {}) {
  return lifecycle?.addWorkspaceSource?.(state, workspaceId, Object.assign({
    repository: sourceInput.repository,
    repo: sourceInput.repository,
    ref: sourceInput.ref || '',
    rootPath: sourceInput.rootPath || '.topics',
    label: sourceInput.label || sourceInput.repository,
    sourceKind: sourceInput.sourceKind || 'github-tree',
    repoDiscovery: Boolean(sourceInput.repoDiscovery),
    issueDiscovery: Boolean(sourceInput.issueDiscovery),
    issueUrls: sourceInput.issueUrls || '',
    explicitFileRefs: sourceInput.explicitFileRefs || sourceInput.fileRefs || [],
    workspaceMatch: sourceInput.workspaceMatch || '',
    appConfigPlan: sourceInput.appConfigPlan || '',
    openBehavior: sourceInput.openBehavior || '',
    preferredDisplay: sourceInput.preferredDisplay || '',
    discoveryState: 'deferred'
  }, overrides));
}

export function sourceMaterializationCompleteEnough(source = {}, sourceInput = {}) {
  const state = String(source.discoveryState || '').toLowerCase();
  if (!['loaded', 'partial'].includes(state)) return false;
  const explicitFileRefs = normalizeExplicitFileRefs(sourceInput.explicitFileRefs ?? sourceInput.fileRefs ?? sourceInput.config?.explicitFileRefs ?? []);
  const wantsRepo = Boolean(sourceInput.repoDiscovery);
  const wantsIssues = Boolean(sourceInput.issueDiscovery || sourceInput.issueUrls);
  if (!wantsRepo && !wantsIssues && !explicitFileRefs.length) return true;

  if (explicitFileRefs.length && !explicitFilesComplete(source, explicitFileRefs.length)) return false;
  const mixedPlan = Number(Boolean(wantsRepo)) + Number(Boolean(wantsIssues)) + Number(Boolean(explicitFileRefs.length)) > 1;
  if (wantsRepo && !surfaceHandled(source, 'repoFiles', { allowCountFallback: !mixedPlan })) return false;
  if (wantsIssues && !surfaceHandled(source, 'issueSnapshots', { allowCountFallback: !mixedPlan })) return false;
  return true;
}

function explicitFilesComplete(source = {}, requestedCount = 0) {
  const explicitSurface = source.surfaces?.explicitFiles ?? source.requestedSurfaces?.explicitFiles;
  if (explicitSurface && typeof explicitSurface === 'object') return Number(explicitSurface.loaded || 0) >= requestedCount;
  return Number(source.count || 0) >= requestedCount;
}

function surfaceHandled(source = {}, surfaceName = '', { allowCountFallback = false } = {}) {
  const surface = source.surfaces?.[surfaceName] ?? source.requestedSurfaces?.[surfaceName];
  if (surface && typeof surface === 'object') {
    return Boolean(
      surface.attempted === true
      || Number(surface.loaded || 0) > 0
      || Number(surface.discovered || 0) > 0
      || Number(surface.failed || 0) > 0
      || surface.skipped === true
      || surface.unavailable === true
    );
  }
  return allowCountFallback && Number(source.count || 0) > 0;
}

export function findWorkspaceForIncomingSource(state = {}, sourceInput = {}) {
  const label = String(sourceInput.label || '').trim().toLowerCase();
  const workspaces = Array.isArray(state?.workspaces) ? state.workspaces : [];
  if (label) {
    const byLabel = workspaces.find((workspace) => String(workspace?.title || workspace?.name || '').trim().toLowerCase() === label);
    if (byLabel) return byLabel;
    return null;
  }
  const signature = sourceSignature(sourceInput);
  if (!signature) return null;
  return workspaces.find((workspace) => (Array.isArray(workspace?.sources) ? workspace.sources : []).some((source) => sourceSignature(source) === signature)) || null;
}

export function findConfiguredSource(workspace = {}, sourceInput = {}) {
  const signature = sourceSignature(sourceInput);
  return (Array.isArray(workspace?.sources) ? workspace.sources : []).find((source) => sourceSignature(source) === signature) || null;
}

export function sourceSignature(source = {}) {
  const repo = String(source.repository || source.repo || source.config?.repo || '').trim().toLowerCase();
  if (!repo) return '';
  const ref = String(source.ref || source.requestedRef || source.config?.ref || '').trim();
  const root = canonicalizeLocalPath(source.rootPath || source.config?.rootPath || '.topics');
  const repoDiscovery = Boolean(source.repoDiscovery);
  const issueDiscovery = Boolean(source.issueDiscovery);
  const issueUrls = normalizeIssueUrls(source.issueUrls || source.config?.issueUrls || '');
  const explicitFileRefs = normalizeExplicitFileRefs(source.explicitFileRefs ?? source.fileRefs ?? source.config?.explicitFileRefs ?? source.config?.fileRefs ?? []).slice().sort().join('\n');
  return [repo, ref, root, repoDiscovery ? 'repo:on' : 'repo:off', issueDiscovery ? 'issues:on' : 'issues:off', issueUrls, explicitFileRefs].join('|');
}

export function canonicalizeLocalPath(inputPath = '') {
  let p = String(inputPath || '').trim().replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  const out = [];
  for (const part of p.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

function normalizeIssueUrls(value = '') {
  return Array.from(new Set(String(value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean))).sort().join('\n');
}

function truthyWorkspaceConfigValue(value) {
  if (typeof value === 'boolean') return value;
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return false;
  return !['off', 'false', 'no', '0', 'disabled'].includes(text);
}
