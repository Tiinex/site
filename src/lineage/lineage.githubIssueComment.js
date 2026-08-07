import { canonicalPath } from './lineage.targetKeys.js';

export function githubIssueCommentIdFromValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const direct = raw.match(/(?:issuecomment-|issues\/comments\/|comment-(?:\d+-)?)(\d{4,})/i)?.[1] || '';
  if (direct) return direct;
  try {
    const url = new URL(raw);
    return url.hash.match(/issuecomment-(\d+)/i)?.[1] || '';
  } catch (_) {}
  return '';
}

export function githubIssueCommentIdsForNode(node = {}) {
  const record = node.record || {};
  const snapshot = record.snapshot || {};
  const sourceTarget = record.sourceTarget || {};
  const target = snapshot.target || {};
  const values = [
    node.id,
    node.path,
    record.id,
    record.path,
    record.source?.path,
    record.sourcePath,
    record.recoveredFromUrl,
    record.sourceOrigin,
    record.rawUrl,
    record.browseUrl,
    sourceTarget.inputTarget,
    sourceTarget.rawUrl,
    sourceTarget.browseUrl,
    sourceTarget.sourceArtifactPath,
    snapshot.sourceUrl,
    snapshot.sourceArtifactPath,
    target.canonicalUrl,
    target.html_url,
    target.url
  ];
  return Array.from(new Set(values.map(githubIssueCommentIdFromValue).filter(Boolean)));
}

export function filterGitHubIssueCommentCandidatesForTarget(candidates = [], raw = '', declaringNode = null) {
  const targetIssue = githubIssueContextForValue(raw) || githubIssueContextForNode(declaringNode);
  const unique = uniqueNodes(candidates || []);
  if (!targetIssue) return unique;
  return unique.filter((candidate) => sameGithubIssueContext(githubIssueContextForNode(candidate), targetIssue));
}

function githubIssueContextForNode(node = {}) {
  const record = node.record || {};
  const snapshot = record.snapshot || {};
  const sourceTarget = record.sourceTarget || {};
  const target = snapshot.target || {};
  const values = [node.path, record.path, record.recoveredFromUrl, sourceTarget.inputTarget, sourceTarget.rawUrl, sourceTarget.browseUrl, snapshot.sourceUrl, target.canonicalUrl, target.html_url, target.url];
  for (const value of values) {
    const context = githubIssueContextForValue(value);
    if (context) return context;
  }
  if (target.repository && target.number) return { repo: normalizeRepoKey(target.repository), number: String(target.number) };
  return null;
}

function githubIssueContextForValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
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
  } catch (_) {}
  const pathParts = canonicalPath(raw).split('/').filter(Boolean);
  const dotIssuesIndex = pathParts.findIndex((part) => part.toLowerCase() === '.issues');
  if (dotIssuesIndex >= 0 && pathParts[dotIssuesIndex + 1]?.toLowerCase() === 'github') {
    const repo = normalizeSyntheticRepoToken(pathParts[dotIssuesIndex + 2] || '');
    const number = String(pathParts[dotIssuesIndex + 3] || '').trim();
    if (repo && /^\d+$/.test(number)) return { repo, number };
  }
  const legacyDotGithubIndex = pathParts.findIndex((part, index) => part.toLowerCase() === '.issues' && pathParts[index - 1]?.toLowerCase() === '.github');
  if (legacyDotGithubIndex >= 0) {
    const legacy = legacyIssueFolderContext(pathParts[legacyDotGithubIndex + 1] || '');
    if (legacy) return legacy;
  }
  return null;
}

function sameGithubIssueContext(a = null, b = null) {
  if (!a || !b) return false;
  return normalizeRepoKey(a.repo || '') === normalizeRepoKey(b.repo || '') && String(a.number || '') === String(b.number || '');
}

function normalizeRepoKey(value = '') { const parts = String(value || '').trim().toLowerCase().split('/').filter(Boolean); return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : ''; }
function normalizeSyntheticRepoToken(value = '') { const parts = String(value || '').trim().toLowerCase().split('-').filter(Boolean); if (parts.length < 2) return ''; const owner = parts.shift(); const repo = parts.join('-'); return owner && repo ? `${owner}/${repo}` : ''; }
function legacyIssueFolderContext(value = '') { const parts = String(value || '').trim().toLowerCase().split('-').filter(Boolean); const numberIndex = parts.findIndex((part, index) => index >= 2 && /^\d+$/.test(part)); if (numberIndex < 2) return null; const owner = parts[0] || ''; const repoParts = parts.slice(1, numberIndex).filter((part) => part !== 'issue' && part !== 'issues'); const repo = normalizeRepoKey(`${owner}/${repoParts.join('-')}`); const number = parts[numberIndex] || ''; return repo && number ? { repo, number } : null; }
function uniqueNodes(nodes = []) { const seen = new Set(); const out = []; for (const node of Array.isArray(nodes) ? nodes : []) { const key = node?.id || node?.path || JSON.stringify(node || {}); if (!key || seen.has(key)) continue; seen.add(key); out.push(node); } return out; }
