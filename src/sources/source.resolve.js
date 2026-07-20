import { isLocalSource, normalizeSourceRegistration } from './source.model.js';

export function resolveSource(source) {
  if (!source) return { kind: 'draft', githubPolicy: 'not-guessed' };
  const normalized = normalizeSourceRegistration(source);
  if (isLocalSource(normalized)) return { ...normalized, githubPolicy: 'not-guessed' };
  if (normalized.adapterId === 'github' && !(normalized.repo || normalized.config?.repo || normalized.permalink)) {
    return { ...normalized, kind: 'draft', githubPolicy: 'not-guessed' };
  }
  return { ...normalized, githubPolicy: normalized.adapterId === 'github' ? 'explicit' : 'not-guessed' };
}
