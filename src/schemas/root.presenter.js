import { presentRootFallback } from './root.fallback.js';

export function rootPresent(artifact, context = {}) {
  return presentRootFallback(artifact, context);
}
