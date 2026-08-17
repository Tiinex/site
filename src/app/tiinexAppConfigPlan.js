import { workspaceEntrypointApplies } from '../workspaces/workspace.entrypoints.js';

export function tiinexAppConfigSourceToStartupPlan(result = {}) {
  const config = result.config || {};
  const entrypoints = (Array.isArray(config.workspaceEntrypoints) ? config.workspaceEntrypoints : [])
    .filter(workspaceEntrypointApplies)
    .map((entrypoint, index) => workspaceSourceToGithubInput(entrypoint, {
      result,
      config,
      plan: 'workspace-entrypoints',
      preserveView: false,
      preferredDisplay: '',
      fallbackLabel: entrypoint.workspaceLabel || entrypoint.label || entrypoint.name || `Workspace ${index + 1}`
    }))
    .filter(Boolean);
  if (entrypoints.length) return { ok: true, selectedPlan: 'workspace-entrypoints', input: entrypoints[0], inputs: entrypoints };
  const discovery = firstWorkspaceDiscovery(config);
  const mappedDiscovery = workspaceSourceToGithubInput(discovery, {
    result,
    config,
    plan: 'workspace-discovery',
    preserveView: true,
    preferredDisplay: 'workspace-artifacts',
    fallbackLabel: discovery?.label || discovery?.title || config.viewerIdentity?.browserTitle || ''
  });
  if (mappedDiscovery) return { ok: true, selectedPlan: 'workspace-discovery', input: mappedDiscovery, inputs: [mappedDiscovery] };
  return { ok: false, message: 'The Tiinex app config did not declare an openable workspace entrypoint or GitHub workspace discovery target.' };
}

export function tiinexAppConfigSourceToGithubInput(result = {}) {
  const config = result.config || {};
  const explicitEntrypoint = result.entrypoint && workspaceEntrypointApplies(result.entrypoint) ? result.entrypoint : null;
  const entrypoint = explicitEntrypoint || firstWorkspaceEntrypoint(config);
  const preferEntrypoint = shouldPreferWorkspaceEntrypoint(result);
  const discovery = preferEntrypoint ? null : firstWorkspaceDiscovery(config);
  const source = discovery || entrypoint;
  const input = workspaceSourceToGithubInput(source, {
    result,
    config,
    plan: discovery ? 'workspace-discovery' : 'workspace-entrypoint',
    preserveView: Boolean(discovery),
    preferredDisplay: discovery ? 'workspace-artifacts' : '',
    fallbackLabel: source?.label || source?.name || source?.title || config.viewerIdentity?.browserTitle || ''
  });
  if (!input) return { ok: false, message: 'The Tiinex app config did not declare a GitHub repository or workspace discovery target.' };
  return { ok: true, selectedPlan: discovery ? 'workspace-discovery' : 'workspace-entrypoint', input };
}

function workspaceSourceToGithubInput(source = null, { result = {}, config = {}, plan = 'workspace-entrypoint', preserveView = false, preferredDisplay = '', fallbackLabel = '' } = {}) {
  if (!source) return null;
  const sourceKind = String(source?.sourceKind || source?.kind || '').trim() || 'github-tree';
  const repository = String(source?.repository || source?.repo || githubRepositoryFromUrl(source?.href || source?.url || '') || '').trim();
  if (!repository) return null;
  const discoveryMode = plan === 'workspace-discovery';
  return {
    repository,
    ref: source.ref || '',
    rootPath: source.rootPath || '.topics',
    operation: 'materialize',
    repoDiscovery: discoveryMode ? true : truthyConfigValue(source.repoFilesDiscovery ?? source.repoDiscovery ?? true),
    issueDiscovery: discoveryMode ? false : truthyConfigValue(source.issueDiscovery ?? source.issueSnapshots ?? false),
    issueUrls: discoveryMode ? '' : (source.issueUrl || source.issueUrls || ''),
    label: source.workspaceLabel || source.label || source.name || source.title || fallbackLabel || config.viewerIdentity?.browserTitle || repository,
    workspaceLabel: source.workspaceLabel || source.label || source.name || source.title || fallbackLabel || config.viewerIdentity?.browserTitle || repository,
    fileRefs: source.fileRefs || source.explicitMarkdownPaths || '',
    sourceKind,
    appConfigSourceUrl: result.configUrl || result.targetUrl || '',
    appConfigPlan: plan,
    workspaceMatch: source.match || source.pattern || '',
    openBehavior: source.openBehavior || '',
    preserveView,
    preferredDisplay,
    hostedRepoMirrorBaseUrls: source.hostedRepoMirrorBaseUrls || source.repositoryMirrorBaseUrls || [],
    hostedIssueSnapshotBaseUrls: source.hostedIssueSnapshotBaseUrls || source.mirrorIssueSnapshotBaseUrls || []
  };
}

function shouldPreferWorkspaceEntrypoint(result = {}) {
  const convention = String(result?.diagnostics?.selectedConvention || '').toLowerCase();
  return /github-issue|public-build-issue-sync|workspace-state/.test(convention);
}

function firstWorkspaceEntrypoint(config = {}) {
  return Array.isArray(config.workspaceEntrypoints) ? config.workspaceEntrypoints.find(workspaceEntrypointApplies) || null : null;
}

function firstWorkspaceDiscovery(config = {}) {
  const items = Array.isArray(config.workspaceDiscovery) ? config.workspaceDiscovery : [];
  return items.find((item) => String(item?.kind || item?.sourceKind || '').trim().toLowerCase().includes('github') || githubRepositoryFromUrl(item?.href || item?.url || '') || item?.repository || item?.repo) || items[0] || null;
}

function githubRepositoryFromUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const parts = url.pathname.split('/').filter(Boolean);
    if ((url.hostname === 'github.com' || url.hostname.endsWith('.github.com')) && parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    if (url.hostname === 'raw.githubusercontent.com' && parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  } catch (_) {}
  const match = String(value || '').trim().match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\.git)?$/u);
  return match ? `${match[1]}/${match[2]}` : '';
}

function truthyConfigValue(value) {
  if (typeof value === 'boolean') return value;
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return false;
  return !['off', 'false', 'no', '0', 'disabled'].includes(text);
}
