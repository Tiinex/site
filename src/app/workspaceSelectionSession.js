export const WORKSPACE_SELECTION_SESSION_SCHEMA_ID = 'tiinex.site.workspace-selection-session.v1';

export function createWorkspaceSelectionSession(input = {}) {
  const role = token(input.role);
  const candidates = normalizeCandidates(input.candidates);
  if (!role) return Object.freeze({ ok: false, error: 'selection-role-missing' });
  const enabled = candidates.filter((item) => item.enabled !== false);
  return Object.freeze({
    ok: true,
    schema: WORKSPACE_SELECTION_SESSION_SCHEMA_ID,
    id: token(input.id) || `selection:${role}:${token(input.ownerKey) || 'session'}`,
    role,
    ownerKey: token(input.ownerKey),
    title: token(input.title) || 'Choose in workspace',
    guidance: token(input.guidance),
    originWorkspaceId: token(input.originWorkspaceId),
    originContext: input.originContext ?? null,
    presentation: input.presentation && typeof input.presentation === 'object' ? Object.freeze({ ...input.presentation }) : null,
    candidates,
    candidateKeys: Object.freeze(enabled.map((item) => item.key)),
    boundary: token(input.boundary) || 'Selection chooses only among caller-qualified candidates; session core owns no semantic role, eligibility, identity, or presentation meaning.'
  });
}

export function workspaceSelectionCandidateFor(session = {}, candidate = {}) {
  if (!session?.ok) return null;
  const key = candidateKey(candidate);
  return session.candidates?.find((item) => item.key === key) || null;
}

export function workspaceSelectionAllows(session = {}, candidate = {}) {
  const qualified = workspaceSelectionCandidateFor(session, candidate);
  return Boolean(qualified && qualified.enabled !== false);
}

export function workspaceSelectionResult(session = {}, candidate = {}) {
  const qualified = workspaceSelectionCandidateFor(session, candidate);
  if (!qualified || qualified.enabled === false) return Object.freeze({ ok: false, error: 'selection-candidate-unqualified', sessionId: session?.id || '' });
  return Object.freeze({ ok: true, schema: 'tiinex.site.workspace-selection-result.v1', sessionId: session.id, role: session.role, ownerKey: session.ownerKey, candidate: qualified });
}

export function candidateKey(candidate = {}) { return candidate?.key == null ? '' : String(candidate.key); }

function normalizeCandidates(values = []) {
  const out = [], seen = new Set();
  for (const raw of Array.isArray(values) ? values : []) {
    const key = candidateKey(raw);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(Object.freeze({ ...raw, key, enabled: raw?.enabled !== false }));
  }
  return Object.freeze(out);
}
function token(value = '') { return String(value || '').trim(); }
