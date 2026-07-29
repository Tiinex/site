// Hosted Tiinex app and PoC bootstrap conventions shared by the app-config source reader.
export function workspaceUrlFromPointerMarkdown(markdown = '', baseUrl = '') {
  const text = normalizeNewlines(markdown || '');
  const fieldNames = '(?:Workspace URL|Workspace Url|Viewer Workspace URL|Viewer Workspace Url|Tiinex Workspace URL|Tiinex Workspace Url|Workspace|Viewer Workspace|Tiinex Workspace|Workspace Artifact|Workspace Entrypoint)';
  const fieldPattern = new RegExp(`^\\s*(?:[-*]\\s*)?${fieldNames}\\s*:\\s*(.+?)\\s*$`, 'imu');
  const field = text.match(fieldPattern);
  if (field?.[1]) return markdownConfigValue(field[1], baseUrl);
  const headingPattern = /^(?:#{2,3})\s+Tiinex Workspace Pointer\s*$([\s\S]*?)(?=^#{1,3}\s+|$)/imu;
  const section = text.match(headingPattern)?.[1] || '';
  if (section) {
    const inSection = section.match(fieldPattern);
    if (inSection?.[1]) return markdownConfigValue(inSection[1], baseUrl);
    const link = section.match(/\[[^\]]*workspace[^\]]*\]\(([^)]+)\)/iu) || section.match(/(https?:\/\/\S+?\.workspace\.md(?:[?#]\S*)?)/iu);
    if (link?.[1]) return markdownConfigValue(link[1], baseUrl);
  }
  const directWorkspaceUrl = text.match(/https?:\/\/\S+?\.workspace\.md(?:[?#][^\s)<>]+)?/iu);
  if (directWorkspaceUrl?.[0]) return markdownConfigValue(directWorkspaceUrl[0], baseUrl);
  return '';
}

function markdownConfigValue(value = '', baseUrl = '') {
  const raw = parseMarkdownLink(value).href || parseMarkdownLink(value).text || value || '';
  if (!raw) return '';
  try { return toFetchableWorkspaceUrl(new URL(raw, baseUrl || globalThis.location?.href || undefined).href); } catch (_) {}
  return toFetchableWorkspaceUrl(raw);
}

function parseMarkdownLink(value = '') {
  const text = String(value || '').trim();
  const link = text.match(/^\[([^\]]*)\]\(([^)]+)\)$/u) || text.match(/\[([^\]]*)\]\(([^)]+)\)/u);
  if (link) return { text: link[1] || '', href: link[2] || '' };
  return { text, href: '' };
}

export function normalizeWorkspaceBootstrapCandidate(input, defaults = {}) {
  if (!input) return null;
  let candidate = typeof input === 'string' ? { url: input } : Object.assign({}, input);
  const path = candidate.path || candidate.localPath || '';
  const url = candidate.url || candidate.href || candidate.workspaceUrl || candidate.workspace || candidate.viewerWorkspace || candidate.defaultWorkspace || candidate.pointer || candidate.issue || '';
  const role = candidate.role || defaults.role || 'candidate';
  let kind = candidate.kind || candidate.type || defaults.kind || '';
  if (!kind) {
    if (path) kind = 'local-path';
    else if (parseGithubIssueSpec(url)) kind = 'github-issue-pointer';
    else kind = 'workspace-url';
  }
  kind = String(kind || '').trim().toLowerCase().replace(/_/g, '-');
  if (kind === 'issue' || kind === 'github-issue' || kind === 'issue-pointer') kind = 'github-issue-pointer';
  if (kind === 'workspace' || kind === 'viewer-workspace' || kind === 'direct-workspace') kind = 'workspace-url';
  if (kind === 'local') kind = 'local-path';
  const normalized = { kind, role, label: candidate.label || defaults.label || role, source: candidate.source || defaults.source || '' };
  if (path) normalized.path = String(path).trim();
  if (url) normalized.url = String(url).trim();
  if (!normalized.url && !normalized.path) return null;
  return normalized;
}

export function extractRuntimeWorkspaceDeclarations(text = '', baseUrl = '') {
  const out = [];
  for (const list of extractWorkspaceCandidateArrays(text)) {
    for (const item of list) out.push(item);
  }
  for (const host of extractWorkspaceHostObjects(text)) {
    if (Array.isArray(host.candidates)) out.push(...host.candidates);
    if (host.pointer) out.push({ kind: 'github-issue-pointer', url: host.pointer, role: 'runtime-pointer' });
    if (Array.isArray(host.pointers)) host.pointers.forEach((url, index) => out.push({ kind: 'github-issue-pointer', url, role: `runtime-pointer-${index + 1}` }));
    for (const key of ['defaultWorkspace', 'workspace', 'viewerWorkspace', 'fallbackWorkspace']) {
      if (host[key]) out.push({ kind: 'workspace-url', url: host[key], role: `runtime-${key}` });
    }
    if (Array.isArray(host.fallbacks)) host.fallbacks.forEach((url, index) => out.push({ kind: 'workspace-url', url, role: `runtime-fallback-${index + 1}` }));
  }
  for (const value of extractWorkspaceHostStrings(text)) out.push({ kind: 'workspace-url', url: value, role: 'runtime-string' });
  return out.map((item) => resolveCandidateRelativeUrls(item, baseUrl));
}

function resolveCandidateRelativeUrls(candidate = {}, baseUrl = '') {
  const copy = Object.assign({}, candidate);
  for (const key of ['url', 'href', 'workspaceUrl', 'workspace', 'viewerWorkspace', 'defaultWorkspace', 'pointer', 'issue']) {
    if (!copy[key]) continue;
    try { copy[key] = new URL(copy[key], baseUrl || globalThis.location?.href || undefined).href; } catch (_) {}
  }
  if (copy.path) {
    try { copy.path = new URL(copy.path, baseUrl || globalThis.location?.href || undefined).href; } catch (_) {}
  }
  return copy;
}

function extractWorkspaceCandidateArrays(text = '') {
  const lists = [];
  const re = /(?:const|let|var)\s+workspaceCandidates\s*=\s*/g;
  for (const match of String(text || '').matchAll(re)) {
    const start = match.index + match[0].length;
    const literal = balancedLiteralAt(text, start, '[', ']');
    if (!literal) continue;
    try {
      const parsed = JSON.parse(literal);
      if (Array.isArray(parsed)) lists.push(parsed);
    } catch (_) {}
  }
  return lists;
}

function extractWorkspaceHostObjects(text = '') {
  const out = [];
  const re = /window\.(?:TiinexWorkspace|tiinexWorkspace|TIINEX_WORKSPACE)\s*=\s*/g;
  for (const match of String(text || '').matchAll(re)) {
    const start = match.index + match[0].length;
    const literal = balancedLiteralAt(text, start, '{', '}');
    if (!literal) continue;
    try {
      const parsed = JSON.parse(literal);
      if (parsed && typeof parsed === 'object') out.push(parsed);
    } catch (_) {}
  }
  return out;
}

function extractWorkspaceHostStrings(text = '') {
  const out = [];
  const re = /window\.(?:TiinexWorkspace|tiinexWorkspace|TIINEX_WORKSPACE)\s*=\s*/g;
  for (const match of String(text || '').matchAll(re)) {
    const start = match.index + match[0].length;
    const parsed = quotedStringAt(text, start);
    if (parsed) out.push(parsed.value);
  }
  return out;
}

export function extractEmbeddedWorkspaceMarkdowns(text = '', sourceUrl = '') {
  const out = [];
  const re = /(?:const|let|var)\s+EMBEDDED_DEFAULT_WORKSPACE_MD\s*=\s*/g;
  for (const match of String(text || '').matchAll(re)) {
    const parsed = quotedStringAt(text, match.index + match[0].length);
    if (parsed?.value && looksLikeWorkspaceConfig(parsed.value)) out.push({ markdown: parsed.value, sourceUrl });
  }
  for (const block of extractTiinexSourcePayloadBlocks(text)) {
    if (looksLikeWorkspaceConfig(block)) out.push({ markdown: block, sourceUrl });
  }
  return out;
}

function extractTiinexSourcePayloadBlocks(text = '') {
  const out = [];
  const re = /```(?:tiinex-source|markdown|md)?\s*\n([\s\S]*?tiinex\.workspace\.v1[\s\S]*?)```/giu;
  for (const match of String(text || '').matchAll(re)) out.push(String(match[1] || '').trim());
  return out;
}

function balancedLiteralAt(text = '', start = 0, open = '[', close = ']') {
  const source = String(text || '');
  let i = start;
  while (/\s/.test(source[i] || '')) i += 1;
  if (source[i] !== open) return '';
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1).trim();
    }
  }
  return '';
}

function quotedStringAt(text = '', start = 0) {
  const source = String(text || '');
  let i = start;
  while (/\s/.test(source[i] || '')) i += 1;
  const quote = source[i];
  if (quote !== '"' && quote !== "'") return null;
  let value = '';
  let escaped = false;
  for (i += 1; i < source.length; i += 1) {
    const ch = source[i];
    if (escaped) {
      value += jsEscapeValue(ch);
      escaped = false;
      continue;
    }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === quote) return { value, end: i + 1 };
    value += ch;
  }
  return null;
}

function jsEscapeValue(ch = '') {
  if (ch === 'n') return '\n';
  if (ch === 'r') return '\r';
  if (ch === 't') return '\t';
  if (ch === 'b') return '\b';
  if (ch === 'f') return '\f';
  if (ch === 'v') return '\v';
  return ch;
}

export function extractScriptUrls(html = '', baseUrl = '') {
  const out = [];
  const re = /<script\b[^>]*>/gi;
  for (const match of String(html || '').matchAll(re)) {
    const src = attr(match[0], 'src');
    if (!src) continue;
    try { out.push(new URL(resolveHtmlEntity(src), baseUrl).href); } catch (_) {}
  }
  return [...new Set(out)];
}

export function sameOriginOrExplicit(url = '', baseUrl = '') {
  try {
    const target = new URL(url, baseUrl);
    const base = new URL(baseUrl);
    return target.origin === base.origin || isLikelyConfigUrl(target);
  } catch (_) { return false; }
}

export function scriptFileName(url = '') {
  try { return new URL(url).pathname.split('/').filter(Boolean).pop() || 'script'; } catch (_) { return 'script'; }
}

export function normalizeConfigTargetUrl(value = '', baseUrl = '') {
  const text = String(value || '').trim();
  if (!text) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(text) && /^[^/\s]+\.[^/\s]+(?:[/:?#].*)?$/i.test(text)) {
    try { return new URL(`https://${text}`); } catch (_) {}
  }
  try { return new URL(toFetchableWorkspaceUrl(text), baseUrl || globalThis.location?.href || undefined); } catch (_) {}
  try { return new URL(`https://${text}`); } catch (_) { return null; }
}

export function toFetchableWorkspaceUrl(value = '') {
  const raw = String(value || '').trim();
  const blob = raw.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+?)(?:[?#].*)?$/iu);
  if (blob) return `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}/${blob[4]}`;
  return raw;
}

export function isLikelyConfigUrl(url) {
  const path = String(url?.pathname || '').replace(/\/+$/u, '');
  return /(?:^|\/)(?:tiinex\.workspace|viewer\.workspace|workspace)\.(?:md|markdown|json)$/i.test(path) || /(?:^|\/)[^/]+\.workspace\.(?:md|markdown)$/i.test(path);
}

export async function tryFetchText(fetchImpl, url, accept) {
  try {
    const response = await fetchImpl(url, { headers: { accept } });
    if (!response?.ok) return { ok: false, reason: `http-${response?.status || 0}` };
    return { ok: true, text: await response.text() };
  } catch (error) {
    return { ok: false, reason: error?.name || error?.message || 'fetch-error' };
  }
}

export function extractConfigLinks(html = '', baseUrl = '') {
  const links = [];
  const add = (href) => { if (href) links.push(resolveHtmlEntity(href)); };
  const linkRe = /<link\b[^>]*>/gi;
  for (const match of String(html || '').matchAll(linkRe)) {
    const tag = match[0];
    const rel = attr(tag, 'rel');
    const type = attr(tag, 'type');
    const role = attr(tag, 'data-tiinex-role');
    if (!/tiinex|workspace/i.test(`${rel} ${type} ${role}`)) continue;
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

export function looksLikeWorkspaceConfig(text = '') {
  const value = String(text || '');
  return /(^|\n)##\s+Workspace Entrypoints\b/i.test(value) || /(^|\n)##\s+Viewer Identity\b/i.test(value) || /tiinex\.workspace\.v1/i.test(value);
}


export function parseGithubIssueSpec(value = '') {
  const match = String(value || '').trim().match(/^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/issues\/(\d+)/iu);
  if (!match) return null;
  return { owner: match[1], name: match[2], repo: `${match[1]}/${match[2]}`, number: Number(match[3]), issueUrl: `https://github.com/${match[1]}/${match[2]}/issues/${Number(match[3])}` };
}

export function normalizeNewlines(value = '') {
  return String(value || '').replace(/\r\n?/g, '\n');
}
