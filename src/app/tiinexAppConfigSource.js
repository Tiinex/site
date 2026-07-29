import { extractConfigLinks, extractEmbeddedWorkspaceMarkdowns, extractRuntimeWorkspaceDeclarations, extractScriptUrls, isLikelyConfigUrl, looksLikeWorkspaceConfig, normalizeConfigTargetUrl, normalizeNewlines, normalizeWorkspaceBootstrapCandidate, parseGithubIssueSpec, sameOriginOrExplicit, scriptFileName, toFetchableWorkspaceUrl, tryFetchText, workspaceUrlFromPointerMarkdown } from './tiinexHostedWorkspaceConventions.js';

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
  const scriptUrls = [];
  const diagnostics = { html: 'unavailable', candidates: [], explicitCandidates, fallbackCandidates, runtimeCandidates: [], scripts: [] };

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

  if (isLikelyConfigUrl(target)) addCandidate(target.href, 'target-url');

  const html = await tryFetchText(fetchImpl, target.href, 'text/html,application/xhtml+xml,text/plain,*/*');
  if (html.ok) {
    diagnostics.html = 'read';
    extractConfigLinks(html.text, target.href).forEach((href) => addCandidate(href, 'html-link'));
    extractScriptUrls(html.text, target.href).forEach((href) => {
      if (!scriptUrls.includes(href) && sameOriginOrExplicit(href, target.href)) scriptUrls.push(href);
    });
    extractRuntimeWorkspaceDeclarations(html.text, target.href).forEach((candidate) => addRuntimeCandidate(candidate, 'html-runtime'));
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
    extractEmbeddedWorkspaceMarkdowns(script.text, href).forEach((item) => addEmbeddedWorkspace(item.markdown, item.sourceUrl || href));
  }

  for (const href of explicitCandidates) {
    const fetched = await tryFetchText(fetchImpl, href, 'text/markdown,text/plain,application/json,*/*');
    if (!fetched.ok || !looksLikeWorkspaceConfig(fetched.text)) continue;
    return successFromMarkdown({ markdown: fetched.text, configUrl: href, target, parseWorkspaceConfig, diagnostics: Object.assign({}, diagnostics, { selectedConvention: 'explicit-config' }) });
  }

  for (const runtimeCandidate of runtimeCandidates) {
    const resolved = await resolveWorkspaceBootstrapCandidate(runtimeCandidate, { fetchImpl, target, parseWorkspaceConfig, diagnostics });
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

export function tiinexAppConfigSourceToGithubInput(result = {}) {
  const config = result.config || {};
  const discovery = firstWorkspaceDiscovery(config);
  const entrypoint = result.entrypoint || firstWorkspaceEntrypoint(config);
  const source = discovery || entrypoint;
  const sourceKind = String(source?.sourceKind || source?.kind || '').trim() || 'github-tree';
  const repository = String(source?.repository || source?.repo || githubRepositoryFromUrl(source?.href || source?.url || '') || '').trim();
  if (!repository) return { ok: false, message: 'The Tiinex app config did not declare a GitHub repository or workspace discovery target.' };
  const discoveryMode = Boolean(discovery);
  return {
    ok: true,
    selectedPlan: discoveryMode ? 'workspace-discovery' : 'workspace-entrypoint',
    input: {
      repository,
      ref: source.ref || '',
      rootPath: source.rootPath || '.topics',
      operation: 'materialize',
      repoDiscovery: discoveryMode ? true : truthyConfigValue(source.repoFilesDiscovery ?? source.repoDiscovery ?? true),
      issueDiscovery: discoveryMode ? false : truthyConfigValue(source.issueDiscovery ?? source.issueSnapshots ?? false),
      issueUrls: discoveryMode ? '' : (source.issueUrl || source.issueUrls || ''),
      label: source.label || source.name || source.title || config.viewerIdentity?.browserTitle || repository,
      fileRefs: source.fileRefs || source.explicitMarkdownPaths || '',
      sourceKind,
      appConfigSourceUrl: result.configUrl || result.targetUrl || '',
      appConfigPlan: discoveryMode ? 'workspace-discovery' : 'workspace-entrypoint',
      workspaceMatch: source.match || source.pattern || '',
      openBehavior: source.openBehavior || '',
      preserveView: discoveryMode,
      preferredDisplay: discoveryMode ? 'workspace-candidates' : ''
    }
  };
}

export async function resolveTiinexAppConfigGithubInput(targetUrl = '', options = {}) {
  const result = await fetchTiinexAppConfigSource(targetUrl, options);
  if (!result.ok) return result;
  const mapped = tiinexAppConfigSourceToGithubInput(result);
  if (!mapped.ok) return Object.assign({}, mapped, { diagnostics: result.diagnostics, configUrl: result.configUrl });
  return Object.assign({}, mapped, { configUrl: result.configUrl, targetUrl: result.targetUrl, diagnostics: result.diagnostics });
}

function successFromMarkdown({ markdown, configUrl, target, parseWorkspaceConfig, diagnostics }) {
  const config = parseWorkspaceConfig(markdown);
  const entrypoint = firstWorkspaceEntrypoint(config);
  return { ok: true, targetUrl: target.href, configUrl, markdown, config, entrypoint, diagnostics };
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

function failure(message, extra = {}) {
  return Object.assign({ ok: false, message }, extra);
}
