export function filterExactGitHubIssueCandidatesForTarget(candidates = [], rawTarget = '', declaringNode = null) {
  const expected = canonicalExactGitHubIssueTarget(rawTarget);
  if (!expected || expected.commentId) return [];
  return uniqueNodes(candidates).filter((candidate) => {
    if (sameLineageNode(candidate, declaringNode)) return false;
    return exactGitHubIssueProvenanceValuesForNode(candidate).some((value) => {
      const actual = canonicalExactGitHubIssueTarget(value);
      return Boolean(actual && !actual.commentId && actual.repo === expected.repo && actual.number === expected.number);
    });
  });
}

function exactGitHubIssueProvenanceValuesForNode(node = {}) {
  const record = node.record || node || {};
  const sourceTarget = record.sourceTarget || {};
  const snapshot = record.snapshot || {};
  const target = snapshot.target || {};
  return [
    record.recoveredFromUrl,
    record.sourceOrigin,
    record.rawUrl,
    record.browseUrl,
    sourceTarget.inputTarget,
    sourceTarget.rawUrl,
    sourceTarget.browseUrl,
    snapshot.sourceUrl,
    target.canonicalUrl,
    target.html_url,
    target.url
  ].map((value) => String(value || '').trim()).filter(Boolean);
}

function canonicalExactGitHubIssueTarget(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    if ((host === 'github.com' || host.endsWith('.github.com')) && parts.length >= 4 && parts[2] === 'issues') {
      const repo = `${String(parts[0] || '').toLowerCase()}/${String(parts[1] || '').toLowerCase()}`;
      const number = String(parts[3] || '').trim();
      return repo && number ? { repo, number, commentId: githubIssueCommentIdFromValue(value) } : null;
    }
    if (host === 'api.github.com' && parts.length >= 5 && parts[0] === 'repos' && parts[3] === 'issues') {
      const repo = `${String(parts[1] || '').toLowerCase()}/${String(parts[2] || '').toLowerCase()}`;
      const number = String(parts[4] || '').trim();
      return repo && number ? { repo, number, commentId: '' } : null;
    }
  } catch (_) {}
  return null;
}

function githubIssueCommentIdFromValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const direct = raw.match(/(?:issuecomment-|issues\/comments\/|comment-(?:\d+-)?)(\d{4,})/i)?.[1] || '';
  if (direct) return direct;
  try { return new URL(raw).hash.match(/issuecomment-(\d+)/i)?.[1] || ''; } catch (_) { return ''; }
}

function sameLineageNode(candidate = {}, declaringNode = null) {
  if (!candidate || !declaringNode) return false;
  const candidateId = String(candidate.id || '').trim();
  const declaringId = String(declaringNode.id || '').trim();
  if (candidateId && declaringId) return candidateId === declaringId;
  const candidatePath = canonicalPath(candidate.path || candidate.record?.path || '');
  const declaringPath = canonicalPath(declaringNode.path || declaringNode.record?.path || '');
  return Boolean(candidatePath && declaringPath && candidatePath === declaringPath);
}

function canonicalPath(value = '') {
  const out = [];
  for (const part of String(value || '').replace(/^record:/i, '').replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop(); else out.push(part);
  }
  return out.join('/');
}

function uniqueNodes(nodes = []) {
  const seen = new Set();
  const out = [];
  for (const node of Array.isArray(nodes) ? nodes : []) {
    const key = node?.id || node?.path || JSON.stringify(node || {});
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(node);
  }
  return out;
}
