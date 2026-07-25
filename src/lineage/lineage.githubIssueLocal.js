export function issueLocalPathKeysForNode(node = {}) {
  const issue = githubIssueContextForNode(node);
  if (!issue) return [];
  const record = node.record || {};
  const paths = [node.path, record.path, ...(sourcePathsForNode(node))].map(canonicalPath).filter(Boolean);
  const keys = [];
  const add = (item = '') => { const clean = String(item || '').trim().toLowerCase(); if (clean && !keys.includes(clean)) keys.push(clean); };
  for (const path of paths) {
    add(issueLocalKey(issue, path));
    const base = basename(path);
    if (base && base !== path) add(issueLocalKey(issue, base));
  }
  for (const alias of issueLocalAliasesForNode(node)) add(issueLocalKey(issue, alias));
  return keys;
}

export function issueLocalPathMatches(target = '', index = {}, declaringNode = null) {
  const issue = githubIssueContextForNode(declaringNode);
  if (!issue) return [];
  const targetPath = canonicalPath(target);
  if (!targetPath) return [];
  const keys = [issueLocalKey(issue, targetPath), issueLocalKey(issue, basename(targetPath))].filter(Boolean);
  const out = [];
  for (const key of keys) out.push(...(index.byIssueLocalPath?.get(key) || []));
  return uniqueNodes(out);
}

function sourcePathsForNode(node = {}) {
  const record = node.record || {};
  const values = [record.source?.path, record.sourcePath, record.sourceTarget?.sourceArtifactPath, record.snapshot?.sourceArtifactPath].map(canonicalPath).filter(Boolean);
  return Array.from(new Set(values));
}

function issueLocalAliasesForNode(node = {}) {
  const record = node.record || {};
  const title = String(node.title || record.title || '').trim();
  const sourceTarget = record.sourceTarget || {};
  const targetKind = String(sourceTarget.targetKind || record.snapshot?.sourceKind || '').toLowerCase();
  const recovered = String(record.recoveredFromUrl || sourceTarget.inputTarget || record.snapshot?.sourceUrl || '').trim();
  const aliases = [];
  const add = (item = '') => { const clean = canonicalPath(item); if (clean && !aliases.includes(clean)) aliases.push(clean); };
  const isIssueRoot = githubIssueContextFromValue(recovered) && !/issuecomment-/i.test(recovered) && !targetKind.includes('comment');
  if (isIssueRoot && title) {
    const slug = slugPart(title).slice(0, 52) || 'artifact';
    add(`issue-root-recovered-${slug}.trace.md`);
    add(`issue-root-recovered-${slug}.workspace.md`);
  }
  return aliases;
}

function githubIssueContextForNode(node = {}) {
  const record = node?.record || {};
  const snapshot = record.snapshot || {};
  const target = snapshot.target || {};
  const sourceTarget = record.sourceTarget || {};
  const candidates = [node.path, record.path, record.recoveredFromUrl, sourceTarget.inputTarget, sourceTarget.rawUrl, sourceTarget.browseUrl, snapshot.sourceUrl, target.canonicalUrl, target.html_url, target.url];
  for (const candidate of candidates) {
    const parsed = githubIssueContextFromValue(candidate);
    if (parsed) return parsed;
  }
  if (target.repository && target.number) return { repo: target.repository, number: target.number };
  return null;
}

function githubIssueContextFromValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const parts = url.pathname.split('/').filter(Boolean);
    const host = url.hostname.toLowerCase();
    if ((host === 'github.com' || host.endsWith('.github.com')) && parts.length >= 4 && parts[2] === 'issues') {
      const repo = normalizeRepoKey(`${parts[0]}/${parts[1]}`);
      const number = String(parts[3] || '').trim();
      if (repo && number) return { repo, number };
    }
    if (host === 'api.github.com' && parts.length >= 5 && parts[0] === 'repos' && parts[3] === 'issues') {
      const repo = normalizeRepoKey(`${parts[1]}/${parts[2]}`);
      const number = String(parts[4] || '').trim();
      if (repo && number) return { repo, number };
    }
  } catch (error) {}
  const pathParts = canonicalPath(raw).split('/').filter(Boolean);
  const issueIndex = pathParts.findIndex((part) => part.toLowerCase() === 'issues');
  if (issueIndex >= 2 && pathParts.length > issueIndex + 1) {
    const repo = normalizeRepoKey(`${pathParts[issueIndex - 2]}/${pathParts[issueIndex - 1]}`);
    const number = String(pathParts[issueIndex + 1] || '').trim();
    if (repo && /^\d+$/.test(number)) return { repo, number };
  }
  return null;
}

function issueLocalKey(issue = {}, path = '') {
  const repo = normalizeRepoKey(issue.repo || '');
  const number = String(issue.number || '').trim();
  const clean = canonicalPath(path).toLowerCase();
  return repo && number && clean ? `github-issue-local:${repo}#${number}:${clean}` : '';
}
function basename(path = '') { return canonicalPath(path).split('/').filter(Boolean).pop() || ''; }
function uniqueNodes(nodes = []) { const seen = new Set(); const out = []; for (const node of Array.isArray(nodes) ? nodes : []) { const key = node?.id || node?.path || JSON.stringify(node || {}); if (!key || seen.has(key)) continue; seen.add(key); out.push(node); } return out; }
function normalizeRepoKey(value = '') { const parts = String(value || '').trim().toLowerCase().split('/').filter(Boolean); return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : ''; }
function canonicalPath(value = '') {
  let raw = String(value || '').trim();
  if (!raw) return '';
  raw = raw.replace(/^record:/i, '');
  try { const url = new URL(raw); raw = url.pathname.replace(/^\/+/, ''); } catch (e) {}
  const out = [];
  for (const part of raw.replace(/\\/g, '/').split('/')) { if (!part || part === '.') continue; if (part === '..') out.pop(); else out.push(part); }
  return out.join('/');
}
function slugPart(value = '') { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'; }
