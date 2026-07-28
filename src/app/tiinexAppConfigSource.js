const DEFAULT_CONFIG_PATHS = Object.freeze([
  '/.well-known/tiinex/workspace.md',
  '/tiinex.workspace.md',
  '/viewer.workspace.md',
  '/workspace.md',
  '/.topics/.workspaces/viewer.workspace.md'
]);

export function tiinexAppConfigUrlCandidates(targetUrl = '', options = {}) {
  const url = normalizeConfigTargetUrl(targetUrl, options.baseUrl);
  if (!url) return [];
  const candidates = [];
  const add = (value) => {
    try {
      const href = new URL(value, url).href;
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
  const candidates = [];
  const addCandidate = (value) => {
    try {
      const href = new URL(value, target).href;
      if (!candidates.includes(href)) candidates.push(href);
    } catch (_) {}
  };
  if (isLikelyConfigUrl(target)) addCandidate(target.href);
  const html = await tryFetchText(fetchImpl, target.href, 'text/html,application/xhtml+xml,text/plain,*/*');
  if (html.ok) extractConfigLinks(html.text, target.href).forEach(addCandidate);
  tiinexAppConfigUrlCandidates(target.href).forEach(addCandidate);
  for (const href of candidates) {
    const fetched = await tryFetchText(fetchImpl, href, 'text/markdown,text/plain,application/json,*/*');
    if (!fetched.ok || !looksLikeWorkspaceConfig(fetched.text)) continue;
    const config = parseWorkspaceConfig(fetched.text);
    const entrypoint = firstWorkspaceEntrypoint(config);
    return { ok: true, targetUrl: target.href, configUrl: href, markdown: fetched.text, config, entrypoint, diagnostics: { html: html.ok ? 'read' : html.reason || 'unavailable', candidates } };
  }
  return failure(`No Tiinex workspace config was found at ${target.origin}.`, { targetUrl: target.href, diagnostics: { html: html.ok ? 'read' : html.reason || 'unavailable', candidates } });
}

export function tiinexAppConfigSourceToGithubInput(result = {}) {
  const entrypoint = result.entrypoint || firstWorkspaceEntrypoint(result.config);
  const repository = String(entrypoint?.repository || entrypoint?.repo || '').trim();
  if (!repository) return { ok: false, message: 'The Tiinex app config did not declare a GitHub repository entrypoint.' };
  return {
    ok: true,
    input: {
      repository,
      ref: entrypoint.ref || '',
      rootPath: entrypoint.rootPath || '.topics',
      operation: 'materialize',
      repoDiscovery: truthyConfigValue(entrypoint.repoFilesDiscovery ?? entrypoint.repoDiscovery ?? true),
      issueDiscovery: truthyConfigValue(entrypoint.issueDiscovery ?? entrypoint.issueSnapshots ?? false),
      issueUrls: entrypoint.issueUrl || entrypoint.issueUrls || '',
      label: entrypoint.name || result.config?.viewerIdentity?.browserTitle || repository,
      fileRefs: entrypoint.fileRefs || entrypoint.explicitMarkdownPaths || '',
      sourceKind: entrypoint.sourceKind || entrypoint.kind || 'github-tree',
      appConfigSourceUrl: result.configUrl || result.targetUrl || ''
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

function normalizeConfigTargetUrl(value = '', baseUrl = '') {
  const text = String(value || '').trim();
  if (!text) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(text) && /^[^/\s]+\.[^/\s]+(?:[/:?#].*)?$/i.test(text)) {
    try { return new URL(`https://${text}`); } catch (_) {}
  }
  try { return new URL(text, baseUrl || globalThis.location?.href || undefined); } catch (_) {}
  try { return new URL(`https://${text}`); } catch (_) { return null; }
}

function isLikelyConfigUrl(url) {
  return /(?:^|\/)(?:tiinex\.workspace|viewer\.workspace|workspace)\.(?:md|markdown|json)$/i.test(url.pathname || '');
}

async function tryFetchText(fetchImpl, url, accept) {
  try {
    const response = await fetchImpl(url, { headers: { accept } });
    if (!response?.ok) return { ok: false, reason: `http-${response?.status || 0}` };
    return { ok: true, text: await response.text() };
  } catch (error) {
    return { ok: false, reason: error?.name || error?.message || 'fetch-error' };
  }
}

function extractConfigLinks(html = '', baseUrl = '') {
  const links = [];
  const add = (href) => { if (href) links.push(resolveHtmlEntity(href)); };
  const linkRe = /<link\b[^>]*>/gi;
  for (const match of String(html || '').matchAll(linkRe)) {
    const tag = match[0];
    const rel = attr(tag, 'rel');
    const type = attr(tag, 'type');
    if (!/tiinex|workspace/i.test(`${rel} ${type}`)) continue;
    add(attr(tag, 'href'));
  }
  const metaRe = /<meta\b[^>]*>/gi;
  for (const match of String(html || '').matchAll(metaRe)) {
    const tag = match[0];
    const name = attr(tag, 'name') || attr(tag, 'property');
    if (!/^tiinex(?::|-)workspace(?:-config)?$/i.test(name || '')) continue;
    add(attr(tag, 'content'));
  }
  return links.map((href) => {
    try { return new URL(href, baseUrl).href; } catch (_) { return ''; }
  }).filter(Boolean);
}

function attr(tag = '', name = '') {
  const re = new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  return tag.match(re)?.[2] || '';
}

function resolveHtmlEntity(value = '') {
  return String(value || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function looksLikeWorkspaceConfig(text = '') {
  const value = String(text || '');
  return /(^|\n)##\s+Workspace Entrypoints\b/i.test(value) || /(^|\n)##\s+Viewer Identity\b/i.test(value) || /tiinex\.workspace\.v1/i.test(value);
}

function firstWorkspaceEntrypoint(config = {}) {
  return Array.isArray(config.workspaceEntrypoints) ? config.workspaceEntrypoints[0] || null : null;
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
