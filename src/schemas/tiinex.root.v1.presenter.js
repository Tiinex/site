import { presentRootFallback } from './tiinex.root.v1.fallback.js';

export function rootPresent(artifact, context = {}) {
  return presentRootFallback(artifact, context);
}
