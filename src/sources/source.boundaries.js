import { isLocalSource, normalizeSourceRegistration } from './source.model.js';

export function resolveSourceBoundary(source = {}) {
  const normalized = normalizeSourceRegistration(source || {});
  const local = isLocalSource(normalized);
  const explicitGithub = normalized.adapterId === 'github' && Boolean(normalized.repo || normalized.config?.repo || normalized.permalink);
  return {
    kind: normalized.kind || normalized.sourceKind || 'draft',
    adapterId: normalized.adapterId,
    sourceKind: normalized.sourceKind,
    label: normalized.label || normalized.sourceKind || normalized.adapterId || 'source',
    sourceBacked: !local && Boolean(normalized.adapterId),
    githubPolicy: explicitGithub ? 'explicit' : 'not-guessed',
    disclosure: normalized.boundary || (local ? 'browser-local session material' : 'explicit source boundary'),
    config: normalized.config
  };
}

export function mustNotGuessGithubSource(source = {}) {
  const normalized = normalizeSourceRegistration(source || {});
  if (isLocalSource(normalized)) return true;
  if (normalized.adapterId !== 'github') return true;
  return Boolean(normalized.repo || normalized.config?.repo || normalized.permalink);
}
