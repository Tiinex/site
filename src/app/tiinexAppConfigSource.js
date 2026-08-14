import { extractConfigLinks, extractEmbeddedWorkspaceMarkdowns, extractHostedViewerSourceDeclarations, extractRuntimeWorkspaceDeclarations, extractScriptUrls, isLikelyConfigUrl, looksLikeWorkspaceConfig, normalizeConfigTargetUrl, normalizeNewlines, normalizeWorkspaceBootstrapCandidate, parseGithubIssueSpec, sameOriginOrExplicit, scriptFileName, sourceDeclarationFromPublicBuildIdentity, toFetchableWorkspaceUrl, tryFetchText, workspaceUrlFromPointerMarkdown } from './tiinexHostedWorkspaceConventions.js';
import { tiinexAppConfigSourceToGithubInput, tiinexAppConfigSourceToStartupPlan } from './tiinexAppConfigPlan.js';
export { tiinexAppConfigSourceToGithubInput, tiinexAppConfigSourceToStartupPlan } from './tiinexAppConfigPlan.js';

const DEFAULT_CONFIG_PATHS = Object.freeze([
  '/.well-known/tiinex/workspace.md',
  '/tiinex.workspace.md',
  '/viewer.workspace.md',
  '/workspace.md',
  '/.topics/.workspaces/viewer.workspace.md'
]);

const MAX_SCRIPT_CANDIDATES = 8;

export function tiinexAppConfigUrlCandidates(targetUrl = '', options = {}) {
  const url = normalizeConfigTargetUrl(targetUrl, options.baseUrl);
  if (!url) return [];
  const candidates = [];
  const add = (value) => {
    try {
      const href = toFetchableWorkspaceUrl(new URL(value, url).href);
      if (!candidates.includes(href)) candidates.push(href);
    } catch (_) {}
  };
  if (isLikelyConfigUrl(url)) add(url.href);
  for (const path of DEFAULT_CONFIG_PATHS) add(`${url.origin}${path}`);
  return candidates;
}

async function firstReadableWorkspaceConfig(candidates = [], context = {}) {
  const { fetchImpl, target, parseWorkspaceConfig, diagnostics, selectedConvention } = context;
  for (const href of candidates || []) {
    const fetched = await tryFetchText(fetchImpl, href, 'text/markdown,text/plain,application/json,*/*');
    if (!fetched.ok || !looksLikeWorkspaceConfig(fetched.text)) continue;
    return successFromMarkdown({ markdown: fetched.text, configUrl: href, target, parseWorkspaceConfig, diagnostics: Object.assign({}, diagnostics, { selectedConvention }) });
  }
  return null;
}

export async function fetchTiinexAppConfigSource(targetUrl = '', options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const parseWorkspaceConfig = options.parseWorkspaceConfig || ((markdown) => ({ workspaceEntrypoints: [] }));
  const target = normalizeConfigTargetUrl(targetUrl, options.baseUrl);
  if (!target) return failure('Enter a Tiinex app URL.');
  if (typeof fetchImpl !== 'function') return failure('Fetch is unavailable in this browser.');

  const explicitCandidates = [];
  const fallbackCandidates = [];
  const runtimeCandidates = [];
  const embeddedWorkspaces = [];
  const hostedViewerSources = [];
  const scriptUrls = [];
  const diagnostics = { html: 'unavailable', candidates: [], explicitCandidates, fallbackCandidates, runtimeCandidates: [], hostedViewerSources: [], scripts: [], publicBuildIdentity: null };

  const addCandidate = (value, source = 'explicit') => {
    try {
      const href = toFetchableWorkspaceUrl(new URL(value, target).href);
      const bucket = source === 'convention-path' ? fallbackCandidates : explicitCandidates;
      if (!bucket.includes(href)) bucket.push(href);
      if (!diagnostics.candidates.includes(href)) diagnostics.candidates.push(href);
      return href;
    } catch (_) { return ''; }
  };
  const addRuntimeCandidate = (candidate, source = '') => {
    const normalized = normalizeWorkspaceBootstrapCandidate(candidate, { source, role: source || 'hosted-runtime' });
    if (!normalized) return;
    const key = `${normalized.kind}\n${normalized.url || ''}\n${normalized.path || ''}`;
    if (runtimeCandidates.some((item) => `${item.kind}\n${item.url || ''}\n${item.path || ''}` === key)) return;
    runtimeCandidates.push(normalized);
    diagnostics.runtimeCandidates.push({ kind: normalized.kind, role: normalized.role || '', source: normalized.source || source || '', url: normalized.url || '', path: normalized.path || '' });
  };
  const addEmbeddedWorkspace = (markdown, sourceUrl = '') => {
    if (!looksLikeWorkspaceConfig(markdown)) return;
    embeddedWorkspaces.push({ markdown, sourceUrl: sourceUrl || target.href });
  };
  const addHostedViewerSource = (source = {}, sourceUrl = '') => {
    if (!source?.repository) return;
    const key = `${source.repository}\n${source.ref || ''}\n${source.rootPath || ''}`;
    if (hostedViewerSources.some((item) => `${item.repository}\n${item.ref || ''}\n${item.rootPath || ''}` === key)) return;
    const item = Object.assign({ sourceUrl: sourceUrl || target.href }, source);
    hostedViewerSources.push(item);
    diagnostics.hostedViewerSources.push({ repository: item.repository, ref: item.ref || '', rootPath: item.rootPath || '', sourceUrl: item.sourceUrl || '', convention: item.hostedConvention || '' });
  };

  if (isLikelyConfigUrl(target)) addCandidate(target.href, 'target-url');

  const html = await tryFetchText(fetchImpl, target.href, 'text/html,application/xhtml+xml,text/plain,*/*');
  if (html.ok) {
    diagnostics.html = 'read';
    extractConfigLinks(html.text, target.href).forEach((href) => addCandidate(href, 'html-link'));
    extractScriptUrls(html.text, target.href).forEach((href) => {
      if (!scriptUrls.includes(href) && sameOriginOrExplicit(href, target.href)) scriptUrls.push(href);
    });
    extractRuntimeWorkspaceDeclarations(html.text, target.href).forEach((candidate) => addRuntimeCandidate(candidate, 'html-runtime'));
    extractHostedViewerSourceDeclarations(html.text, target.href).forEach((source) => addHostedViewerSource(source, target.href));
    extractEmbeddedWorkspaceMarkdowns(html.text, target.href).forEach((item) => addEmbeddedWorkspace(item.markdown, item.sourceUrl || target.href));
  } else {
    diagnostics.html = html.reason || 'unavailable';
  }

  for (const href of scriptUrls.slice(0, MAX_SCRIPT_CANDIDATES)) {
    const script = await tryFetchText(fetchImpl, href, 'application/javascript,text/javascript,text/plain,*/*');
    diagnostics.scripts.push({ url: href, ok: script.ok, reason: script.ok ? 'read' : script.reason || 'unavailable' });
    if (!script.ok) continue;
    extractConfigLinks(script.text, href).forEach((link) => addCandidate(link, 'script-link'));
    extractRuntimeWorkspaceDeclarations(script.text, href).forEach((candidate) => addRuntimeCandidate(candidate, `script:${scriptFileName(href)}`));
    extractHostedViewerSourceDeclarations(script.text, href).forEach((source) => addHostedViewerSource(source, href));
    extractEmbeddedWorkspaceMarkdowns(script.text, href).forEach((item) => addEmbeddedWorkspace(item.markdown, item.sourceUrl || href));
  }


  const buildIdentityUrl = publicBuildIdentityUrlFor(target);
  if (buildIdentityUrl) {
    const buildIdentity = await tryFetchText(fetchImpl, buildIdentityUrl, 'application/json,text/plain,*/*');
    diagnostics.publicBuildIdentity = { url: buildIdentityUrl, ok: buildIdentity.ok, reason: buildIdentity.ok ? 'read' : buildIdentity.reason || 'unavailable' };
    if (buildIdentity.ok) {
      const pointer = workspacePointerCandidateFromPublicBuildIdentity(buildIdentity.text, buildIdentityUrl);
      if (pointer) addRuntimeCandidate(pointer, 'public-build-identity');
      const source = sourceDeclarationFromPublicBuildIdentity(buildIdentity.text, buildIdentityUrl);
      if (source?.repository) addHostedViewerSource(source, buildIdentityUrl);
    }
  }

  const explicitTargetConfig = isLikelyConfigUrl(target);
  if (explicitTargetConfig) {
    const resolved = await firstReadableWorkspaceConfig(explicitCandidates, { fetchImpl, target, parseWorkspaceConfig, diagnostics, selectedConvention: 'explicit-config' });
    if (resolved?.ok) return resolved;
  }

  if (!explicitTargetConfig) {
    const resolved = await firstReadableWorkspaceConfig(strongHtmlConfigCandidates(explicitCandidates, target), { fetchImpl, target, parseWorkspaceConfig, diagnostics, selectedConvention: 'html-declared-config' });
    if (resolved?.ok) return resolved;
  }

  for (const runtimeCandidate of runtimeCandidates) {
    const resolved = await resolveWorkspaceBootstrapCandidate(runtimeCandidate, { fetchImpl, target, parseWorkspaceConfig, diagnostics });
    if (resolved?.ok) return resolved;
  }

  for (const hostedSource of hostedViewerSources) {
    return successFromHostedViewerSource({ source: hostedSource, configUrl: `${hostedSource.sourceUrl || target.href}#hosted-viewer-source`, target, diagnostics: Object.assign({}, diagnostics, { selectedConvention: hostedSource.hostedConvention || 'hosted-viewer-source' }) });
  }

  if (!explicitTargetConfig) {
    const resolved = await firstReadableWorkspaceConfig(weakHtmlConfigCandidates(explicitCandidates, target), { fetchImpl, target, parseWorkspaceConfig, diagnostics, selectedConvention: 'html-packaged-config' });
    if (resolved?.ok) return resolved;
  }

  for (const embedded of embeddedWorkspaces) {
    return successFromMarkdown({ markdown: embedded.markdown, configUrl: `${embedded.sourceUrl || target.href}#embedded-default-workspace`, target, parseWorkspaceConfig, diagnostics: Object.assign({}, diagnostics, { selectedConvention: 'embedded-default-workspace' }) });
  }

  tiinexAppConfigUrlCandidates(target.href).forEach((href) => addCandidate(href, 'convention-path'));

  for (const href of fallbackCandidates) {
    const fetched = await tryFetchText(fetchImpl, href, 'text/markdown,text/plain,application/json,*/*');
    if (!fetched.ok || !looksLikeWorkspaceConfig(fetched.text)) continue;
    return successFromMarkdown({ markdown: fetched.text, configUrl: href, target, parseWorkspaceConfig, diagnostics: Object.assign({}, diagnostics, { selectedConvention: 'convention-path' }) });
  }

  return failure(`No Tiinex workspace config was found at ${target.origin}.`, { targetUrl: target.href, diagnostics });
}


export async function resolveTiinexRuntimeWorkspaceCandidate(candidate = {}, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const parseWorkspaceConfig = options.parseWorkspaceConfig || ((markdown) => ({ workspaceEntrypoints: [] }));
  const target = normalizeConfigTargetUrl(options.targetUrl || options.locationLike?.href || globalThis.location?.href || candidate?.url || candidate?.path || '', options.baseUrl);
  if (!target) return failure('Tiinex runtime workspace target is unavailable.');
  return resolveWorkspaceBootstrapCandidate(candidate, { fetchImpl, target, parseWorkspaceConfig, diagnostics: options.diagnostics || {} });
}

export async function resolveTiinexAppConfigGithubInput(targetUrl = '', options = {}) {
  const result = await fetchTiinexAppConfigSource(targetUrl, options);
  if (!result.ok) return result;
  const mapped = tiinexAppConfigSourceToGithubInput(result);
  if (!mapped.ok) return Object.assign({}, mapped, { diagnostics: result.diagnostics, configUrl: result.configUrl });
  return Object.assign({}, mapped, { configUrl: result.configUrl, targetUrl: result.targetUrl, diagnostics: result.diagnostics });
}


function shouldPreferWorkspaceEntrypoint(result = {}) {
  const convention = String(result?.diagnostics?.selectedConvention || '').toLowerCase();
  return /github-issue|public-build-issue-sync|workspace-state/.test(convention);
}

function strongHtmlConfigCandidates(candidates = [], target) {
  return (candidates || []).filter((href) => !isWeakPackagedWorkspaceConfigUrl(href, target));
}

function weakHtmlConfigCandidates(candidates = [], target) {
  return (candidates || []).filter((href) => isWeakPackagedWorkspaceConfigUrl(href, target));
}

function isWeakPackagedWorkspaceConfigUrl(href = '', target) {
  try {
    const url = new URL(href, target?.href || undefined);
    const path = url.pathname.replace(/\/+$/u, '');
    return /(?:^|\/)\.topics\/\.workspaces\/viewer\.workspace\.md$/iu.test(path)
      || /(?:^|\/)viewer\.workspace\.md$/iu.test(path);
  } catch (_) {
    return /(?:^|\/)\.topics\/\.workspaces\/viewer\.workspace\.md(?:[?#].*)?$/iu.test(String(href || ''))
      || /(?:^|\/)viewer\.workspace\.md(?:[?#].*)?$/iu.test(String(href || ''));
  }
}

function workspacePointerCandidateFromPublicBuildIdentity(text = '', baseUrl = '') {
  let parsed = null;
  try { parsed = JSON.parse(String(text || '').trim()); } catch (_) { return null; }
  const repository = githubRepositoryFromUrl(parsed.repository || parsed.sourceRepository || parsed.repo || parsed.buildSource || '');
  const reason = [parsed.reason, parsed.releaseCacheKey, parsed.previousReleaseCacheKey, parsed.type].map((value) => String(value || '').toLowerCase()).join(' ');
  if (!repository || !/(?:^|[^a-z0-9])issue[-_]?sync(?:[^a-z0-9]|$)/iu.test(reason)) return null;
  return { kind: 'github-issue-pointer', role: 'public-build-issue-sync-root', label: parsed.browserTitle || parsed.title || repository, url: `https://github.com/${repository}/issues/1`, source: baseUrl || 'tiinex.build.json' };
}

function publicBuildIdentityUrlFor(target) {
  try {
    if (!target || isLikelyConfigUrl(target)) return '';
    if (!/^https?:$/i.test(target.protocol || '')) return '';
    return new URL('/tiinex.build.json', target.href).href;
  } catch (_) { return ''; }
}

function successFromMarkdown({ markdown, configUrl, target, parseWorkspaceConfig, diagnostics }) {
  const config = parseWorkspaceConfig(markdown);
  const entrypoint = firstWorkspaceEntrypoint(config);
  return { ok: true, targetUrl: target.href, configUrl, markdown, config, entrypoint, diagnostics };
}

function successFromHostedViewerSource({ source = {}, configUrl, target, diagnostics }) {
  const entrypoint = {
    name: source.label || source.repository || 'Hosted Tiinex source',
    label: source.label || source.repository || 'Hosted Tiinex source',
    sourceKind: source.sourceKind || 'github-tree',
    repository: source.repository || source.repo || '',
    ref: source.ref || '',
    rootPath: source.rootPath || '.topics',
    repoFilesDiscovery: source.repoFilesDiscovery || 'on',
    issueDiscovery: source.issueDiscovery || 'off',
    hostedRepoMirrorBaseUrls: source.hostedRepoMirrorBaseUrls || [],
    hostedIssueSnapshotBaseUrls: source.hostedIssueSnapshotBaseUrls || []
  };
  return {
    ok: true,
    targetUrl: target.href,
    configUrl,
    markdown: '',
    config: {
      source: { kind: 'hosted-viewer-source', path: configUrl },
      viewerIdentity: { browserTitle: source.label || source.repository || 'Hosted Tiinex source' },
      workspaceDiscovery: [],
      workspaceEntrypoints: [entrypoint],
      repositoryMirrors: [],
      repositoryTransports: [],
      help: []
    },
    entrypoint,
    diagnostics
  };
}

async function resolveWorkspaceBootstrapCandidate(candidate = {}, options = {}) {
  const fetchImpl = options.fetchImpl;
  const target = options.target;
  const parseWorkspaceConfig = options.parseWorkspaceConfig;
  const diagnostics = options.diagnostics || {};
  const kind = String(candidate.kind || '').toLowerCase();
  if (kind === 'github-issue-pointer') {
    const pointer = await resolveGithubIssueWorkspacePointer(candidate.url, { fetchImpl, target, diagnostics });
    if (!pointer.ok) return pointer;
    if (pointer.markdown) return successFromMarkdown({ markdown: pointer.markdown, configUrl: pointer.configUrl, target, parseWorkspaceConfig, diagnostics: Object.assign({}, diagnostics, { selectedConvention: 'github-issue-embedded-workspace' }) });
    return await resolveWorkspaceBootstrapCandidate({ kind: 'workspace-url', url: pointer.workspaceUrl, role: candidate.role, source: pointer.source || candidate.source }, options);
  }
  const raw = candidate.path || candidate.url;
  if (!raw) return failure('Empty Tiinex runtime workspace candidate.', { diagnostics });
  const href = toFetchableWorkspaceUrl(new URL(raw, target.href).href);
  const fetched = await tryFetchText(fetchImpl, href, 'text/markdown,text/plain,application/json,*/*');
  if (!fetched.ok || !looksLikeWorkspaceConfig(fetched.text)) return failure(`Runtime workspace candidate was unavailable: ${href}`, { diagnostics, configUrl: href });
  return successFromMarkdown({ markdown: fetched.text, configUrl: href, target, parseWorkspaceConfig, diagnostics: Object.assign({}, diagnostics, { selectedConvention: kind || 'runtime-workspace' }) });
}

async function resolveGithubIssueWorkspacePointer(candidateUrl = '', options = {}) {
  const fetchImpl = options.fetchImpl;
  const target = options.target;
  const spec = parseGithubIssueSpec(candidateUrl);
  if (!spec) return failure(`Workspace pointer is not a GitHub issue URL: ${candidateUrl}`, { diagnostics: options.diagnostics });

  const hostedBody = await tryFetchHostedIssuePointerBody(spec, { fetchImpl, target });
  if (hostedBody.ok) {
    const resolved = workspacePointerMarkdownResult(hostedBody.text, hostedBody.url || spec.issueUrl);
    if (resolved.ok) return resolved;
  }

  const apiUrl = `https://api.github.com/repos/${spec.repo}/issues/${spec.number}`;
  const fetched = await tryFetchText(fetchImpl, apiUrl, 'application/vnd.github+json,application/json,*/*');
  if (!fetched.ok) return failure(`GitHub workspace pointer could not be read: ${spec.issueUrl}`, { diagnostics: options.diagnostics, configUrl: spec.issueUrl });
  try {
    const issue = JSON.parse(fetched.text || '{}');
    const body = String(issue.body || '');
    const resolved = workspacePointerMarkdownResult(body, issue.html_url || spec.issueUrl);
    if (resolved.ok) return resolved;
  } catch (_) {}
  return failure(`GitHub issue ${spec.repo}#${spec.number} did not declare a workspace URL or embed workspace markdown.`, { diagnostics: options.diagnostics, configUrl: spec.issueUrl });
}

async function tryFetchHostedIssuePointerBody(spec = {}, options = {}) {
  const fetchImpl = options.fetchImpl;
  const target = options.target;
  if (!target) return { ok: false };
  const candidates = [
    `/issues/github.com/${spec.repo}/issues/${spec.number}/issue.md`,
    `/issues/github.com/${spec.owner}/${spec.name}/issues/${spec.number}/issue.md`
  ].map((path) => new URL(path, target.origin).href);
  for (const href of [...new Set(candidates)]) {
    const fetched = await tryFetchText(fetchImpl, href, 'text/markdown,text/plain,*/*');
    if (fetched.ok && fetched.text) return { ok: true, text: fetched.text, url: href };
  }
  return { ok: false };
}

function workspacePointerMarkdownResult(markdown = '', baseUrl = '') {
  const embedded = extractEmbeddedWorkspaceMarkdowns(markdown, baseUrl).find((item) => looksLikeWorkspaceConfig(item.markdown || ''));
  if (embedded) return { ok: true, markdown: embedded.markdown, configUrl: `${baseUrl || 'github-issue'}#embedded-workspace`, source: baseUrl };
  if (looksLikeWorkspaceConfig(markdown)) return { ok: true, markdown: String(markdown || '').trim(), configUrl: `${baseUrl || 'github-issue'}#workspace-markdown`, source: baseUrl };
  const workspaceUrl = workspaceUrlFromPointerMarkdown(markdown, baseUrl);
  if (workspaceUrl) return { ok: true, workspaceUrl, source: baseUrl, configUrl: workspaceUrl };
  return failure('Workspace pointer did not declare a workspace URL.');
}


function firstWorkspaceEntrypoint(config = {}) {
  return Array.isArray(config.workspaceEntrypoints) ? config.workspaceEntrypoints[0] || null : null;
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

function failure(message, extra = {}) {
  return Object.assign({ ok: false, message }, extra);
}
