const ORIGIN_REFERENCE_SCHEMA = 'tiinex.origin.reference.v1';
const ORIGIN_SOURCE_KIND = 'github.origin-reference';

export function parseOriginReferenceValue(value = '') {
  return normalizeOriginReference(value, { source: 'explicit-parse' });
}

export function collectOriginReferencesFromMarkdown(markdown = '') {
  const refs = [];
  const blocks = originBlocks(markdown);
  for (const block of blocks) {
    for (const candidate of originCandidatesFromBlock(block)) addOriginReference(refs, candidate, { source: 'continuity-origin' });
  }
  return refs;
}

export function originReferenceSourcesForRecords(records = []) {
  const groups = new Map();
  for (const record of Array.isArray(records) ? records : []) {
    for (const ref of originReferencesForRecord(record)) {
      if (!ref || ref.provider !== 'github' || !ref.repository) continue;
      const key = ref.repository.toLowerCase();
      if (!groups.has(key)) groups.set(key, makeGithubOriginSource(ref));
      const source = groups.get(key);
      source.originReferenceCount = Number(source.originReferenceCount || 0) + 1;
      if (ref.kind === 'github-issue' && ref.url && !source.issueUrls.includes(ref.url)) source.issueUrls.push(ref.url);
      if (ref.kind === 'github-file' && ref.path && !source.fileRefs.includes(ref.path)) source.fileRefs.push(ref.path);
    }
  }
  return Array.from(groups.values()).map((source) => Object.freeze(Object.assign({}, source, {
    count: 0,
    config: Object.freeze(Object.assign({}, source.config, {
      issueUrls: source.issueUrls.join('\n'),
      fileRefs: source.fileRefs.join('\n')
    }))
  })));
}

export function upsertOriginReferenceSources(workspace = {}, records = []) {
  const sources = originReferenceSourcesForRecords(records);
  if (!sources.length) return [];
  const existing = Array.isArray(workspace.sources) ? workspace.sources.slice() : [];
  for (const source of sources) {
    const index = existing.findIndex((item) => String(item?.id || '') === source.id);
    if (index >= 0) {
      const prior = existing[index];
      const issueUrls = uniqueLines([prior.config?.issueUrls, source.config?.issueUrls].join('\n'));
      const fileRefs = uniqueLines([prior.config?.fileRefs, source.config?.fileRefs].join('\n'));
      existing[index] = Object.assign({}, prior, source, {
        issueUrls,
        fileRefs,
        originReferenceCount: Number(prior.originReferenceCount || 0) + Number(source.originReferenceCount || 0),
        config: Object.assign({}, prior.config || {}, source.config || {}, { issueUrls: issueUrls.join('\n'), fileRefs: fileRefs.join('\n') })
      });
    } else {
      existing.push(Object.assign({}, source));
    }
  }
  workspace.sources = existing;
  workspace.sourceOrder = existing.map((item) => item.id);
  return sources;
}

export function originReferencesForRecord(record = {}) {
  const refs = [];
  for (const ref of Array.isArray(record.originReferences) ? record.originReferences : []) addOriginReference(refs, ref.value || ref.url || ref.path || '', { source: ref.source || 'record.originReferences' });
  for (const value of [record.origin, record.parentOrigin, record.sourceTarget?.parentRawUrl, record.sourceTarget?.parentSourceUrl, record.snapshot?.parentRawUrl, record.snapshot?.parentSourceUrl]) addOriginReference(refs, value, { source: 'record.explicit-origin' });
  return refs;
}

export function recoverySourceForRecord(record = {}, workspace = {}) {
  const direct = record?.source || {};
  if (isGithubConfiguredSource(direct)) return Object.assign({}, direct, { ref: direct.ref || direct.config?.ref || '' });
  const refs = originReferencesForRecord(record).filter((ref) => ref.provider === 'github' && ref.repository);
  if (!refs.length) return null;
  const repo = refs[0].repository;
  const workspaceSource = (Array.isArray(workspace?.sources) ? workspace.sources : []).find((source) => {
    const sourceRepo = String(source.repo || source.repository || source.config?.repo || '').trim().toLowerCase();
    return sourceRepo && sourceRepo === repo.toLowerCase() && isGithubConfiguredSource(source);
  });
  if (workspaceSource) return Object.assign({}, workspaceSource, { ref: workspaceSource.ref || workspaceSource.config?.ref || '' });
  return makeGithubOriginSource(refs[0]);
}

export function githubIssueUrlsForRecord(record = {}) {
  return uniqueLines(originReferencesForRecord(record).filter((ref) => ref.kind === 'github-issue').map((ref) => ref.url));
}

export function githubFileRefsForRecord(record = {}) {
  return uniqueLines(originReferencesForRecord(record).filter((ref) => ref.kind === 'github-file').map((ref) => ref.path));
}

export function isOriginReferenceSource(source = {}) {
  return source.originReferenceSource === true || source.sourceKind === ORIGIN_SOURCE_KIND;
}

function makeGithubOriginSource(ref = {}) {
  const repo = ref.repository || `${ref.owner || 'owner'}/${ref.repo || 'repo'}`;
  const id = `origin:github:${repo.toLowerCase().replace(/[^a-z0-9/_-]+/g, '-').replace(/\//g, ':')}`;
  const sourceRef = String(ref.ref || '').trim();
  return {
    id,
    kind: 'github-tree',
    adapterId: 'github',
    sourceKind: ORIGIN_SOURCE_KIND,
    label: `GitHub origin · ${repo}`,
    roleLabel: 'recovery only',
    countLabel: 'origin refs',
    repo,
    repository: repo,
    ref: sourceRef,
    rootPath: '.topics',
    config: { repo, ref: sourceRef, rootPath: '.topics', issueUrls: '', fileRefs: '' },
    count: 0,
    sourceBacked: false,
    originReferenceSource: true,
    recoveryOnly: true,
    closeable: true,
    discoveryState: 'deferred',
    issueUrls: [],
    fileRefs: [],
    boundary: 'explicit GitHub origin reference recovered from imported artifacts; recovery only for lineage lookup, imported material remains browser-local/session',
    transportLabel: 'Origin recovery only',
    loadable: false,
    transportRefreshTier: 'direct'
  };
}

function originBlocks(markdown = '') {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^(\s*)-\s*Origin:\s*(.*)$/i);
    if (!match) continue;
    const indent = match[1].length;
    const inline = match[2].trim();
    const collected = [];
    if (inline) collected.push(inline);
    for (let j = i + 1; j < lines.length; j += 1) {
      const line = lines[j];
      const top = line.match(/^(\s*)-\s+\S/);
      if (top && top[1].length <= indent) break;
      if (line.trim()) collected.push(line.trim());
    }
    if (collected.length) blocks.push(collected.join('\n'));
  }
  return blocks;
}

function originCandidatesFromBlock(block = '') {
  const out = [];
  for (const line of String(block || '').split('\n')) {
    const item = line.replace(/^[-*]\s+/, '').trim();
    if (!item) continue;
    const labelled = item.match(/^([A-Za-z][A-Za-z0-9 _+-]{0,40}):\s*(.+)$/);
    const value = labelled ? labelled[2].trim() : item;
    out.push(value);
    for (const link of markdownLinks(item)) out.push(link.href || link.label || '');
  }
  return out;
}

function addOriginReference(refs = [], value = '', meta = {}) {
  const normalized = normalizeOriginReference(value, meta);
  if (!normalized) return;
  const key = `${normalized.kind}:${normalized.url || normalized.path || normalized.value}`.toLowerCase();
  if (refs.some((item) => `${item.kind}:${item.url || item.path || item.value}`.toLowerCase() === key)) return;
  refs.push(normalized);
}

function normalizeOriginReference(value = '', meta = {}) {
  const raw = stripMarkdown(String(value || '').trim());
  if (!raw) return null;
  const github = githubReference(raw);
  if (github) return Object.freeze(Object.assign({ schema: ORIGIN_REFERENCE_SCHEMA, value: raw, explicit: true, source: meta.source || 'origin' }, github));
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) return Object.freeze({ schema: ORIGIN_REFERENCE_SCHEMA, kind: 'url', value: raw, url: raw, explicit: true, source: meta.source || 'origin' });
  return Object.freeze({ schema: ORIGIN_REFERENCE_SCHEMA, kind: 'relative', value: raw, path: normalizePath(raw), explicit: true, source: meta.source || 'origin' });
}

function githubReference(value = '') {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    if ((host === 'github.com' || host.endsWith('.github.com')) && parts.length >= 4 && ['issues', 'discussions', 'pull'].includes(parts[2])) {
      const commentId = url.hash.match(/(?:issuecomment-|discussioncomment-)(\d+)/i)?.[1] || '';
      return { kind: 'github-issue', provider: 'github', owner: parts[0], repo: parts[1], repository: `${parts[0]}/${parts[1]}`, surface: parts[2], number: parts[3], commentId, url: canonicalGithubIssueUrl(value) };
    }
    if (host === 'raw.githubusercontent.com' && parts.length >= 4) {
      return { kind: 'github-file', provider: 'github', owner: parts[0], repo: parts[1], repository: `${parts[0]}/${parts[1]}`, ref: parts[2], path: normalizePath(parts.slice(3).join('/')), url: value };
    }
    if ((host === 'github.com' || host.endsWith('.github.com')) && parts.length >= 5 && parts[2] === 'blob') {
      return { kind: 'github-file', provider: 'github', owner: parts[0], repo: parts[1], repository: `${parts[0]}/${parts[1]}`, ref: parts[3], path: normalizePath(parts.slice(4).join('/')), url: value };
    }
  } catch (_) {}
  return null;
}

function canonicalGithubIssueUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const parts = url.pathname.split('/').filter(Boolean);
    const hash = url.hash.match(/(?:issuecomment-|discussioncomment-)(\d+)/i)?.[0] || '';
    if ((url.hostname === 'github.com' || url.hostname.endsWith('.github.com')) && parts.length >= 4) return `https://github.com/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}${hash ? `#${hash}` : ''}`;
  } catch (_) {}
  return String(value || '').trim();
}

function markdownLinks(value = '') {
  const out = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = re.exec(String(value || '')))) out.push({ label: match[1].trim(), href: match[2].trim() });
  return out;
}

function stripMarkdown(value = '') {
  const link = String(value || '').trim().match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  return (link ? link[2] : String(value || '')).trim();
}

function normalizePath(value = '') {
  const out = [];
  for (const part of String(value || '').replace(/\\/g, '/').split('/')) {
    const clean = part.trim();
    if (!clean || clean === '.') continue;
    if (clean === '..') out.pop();
    else out.push(clean);
  }
  return out.join('/');
}

function uniqueLines(value = '') {
  const items = Array.isArray(value) ? value : String(value || '').split(/\r?\n|,/);
  const seen = new Set();
  const out = [];
  for (const item of items.map((entry) => String(entry || '').trim()).filter(Boolean)) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function isGithubConfiguredSource(source = {}) {
  const adapter = String(source.adapterId || source.sourceKind || source.kind || '').toLowerCase();
  return adapter.includes('github') || Boolean(source.repo || source.repository || source.config?.repo);
}
