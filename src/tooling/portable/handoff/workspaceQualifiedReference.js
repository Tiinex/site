export const SHARED_ROUTE_REQUIRED_CONTEXT_BOUNDARY = 'Shared-route recipient grounding proof only. Every Required Context item must resolve to exact carried package bytes; Reference Context is intentionally excluded from this blocking projection.';

export function parseWorkspaceQualifiedReference(value = '') {
  const match = String(value || '').trim().match(/^([a-zA-Z0-9._-]+)::(.+)$/);
  if (!match) return null;
  const raw = String(match[2] || '').split('#')[0].split('?')[0].replace(/\\/g, '/');
  if (!raw || raw.startsWith('/') || raw.split('/').some((part) => part === '..')) return null;
  const path = raw.split('/').filter((part) => part && part !== '.').join('/');
  return path ? Object.freeze({ workspaceId: match[1], path }) : null;
}
