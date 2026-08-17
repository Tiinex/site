import { lineageBasePathForNode } from './lineage.pathBasis.js';
import { preferredLineageMaterialCandidates } from './lineage.materialPreference.js';
import { canonicalPath } from './lineage.targetKeys.js';

export function resolveCandidateNodes(nodes = [], method = 'unknown', declaringNode = null) {
  const unique = uniqueNodes(nodes || []);
  if (!unique.length) return null;
  const withoutSelf = unique.filter((candidate) => !sameLineageNode(candidate, declaringNode));
  if (!withoutSelf.length) return { selfReference: true, method, candidates: unique };
  const preferred = preferredLineageMaterialCandidates(withoutSelf, method);
  if (preferred.length === 1) return Object.assign({ method }, preferred[0]);
  if (withoutSelf.length === 1) return Object.assign({ method }, withoutSelf[0]);
  return { ambiguous: true, method, candidates: preferred.length ? preferred : withoutSelf };
}

export function relativeCandidatePath(rawTarget, declaringNode = null) {
  const raw = String(rawTarget || '').trim();
  const declaringPath = canonicalPath(lineageBasePathForNode(declaringNode));
  const targetPath = canonicalPath(raw);
  if (!targetPath) return null;
  const dir = dirname(declaringPath);
  return { path: normalizeJoinedPath(dir, raw), method: dir ? 'relative-path' : 'relative-root-path' };
}

export function isSimpleRelativeReference(value = '') {
  const raw = String(value || '').trim();
  const path = canonicalPath(raw);
  return Boolean(raw && path && !path.includes('/') && !isUrlLike(raw) && !/^record:/i.test(raw));
}

export function isDotRelativeReference(value = '') { return /^\.\.?(?:\/|$)/.test(String(value || '').replace(/\\/g, '/').trim()); }

function sameLineageNode(candidate = {}, declaringNode = null) {
  if (!candidate || !declaringNode) return false;
  const candidateId = String(candidate.id || '').trim();
  const declaringId = String(declaringNode.id || '').trim();
  if (candidateId && declaringId) return candidateId === declaringId;
  const candidatePath = canonicalPath(candidate.path || candidate.record?.path || '');
  const declaringPath = canonicalPath(declaringNode.path || declaringNode.record?.path || '');
  return Boolean(candidatePath && declaringPath && candidatePath === declaringPath);
}

function dirname(path = '') { const parts = canonicalPath(path).split('/').filter(Boolean); parts.pop(); return parts.join('/'); }
function normalizeJoinedPath(base = '', target = '') { const text = String(target || '').replace(/\\/g, '/'); return canonicalPath(text.startsWith('/') ? text : [base, text].filter(Boolean).join('/')); }
export function isUrlLike(value = '') { return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(String(value || '').trim()); }
function uniqueNodes(nodes = []) { const seen = new Set(); const out = []; for (const node of Array.isArray(nodes) ? nodes : []) { const key = node?.id || node?.path || JSON.stringify(node || {}); if (!key || seen.has(key)) continue; seen.add(key); out.push(node); } return out; }
