import { prepareArtifactGraphProjection } from './artifactGraph.project.js';

self.addEventListener('message', (event) => {
  const request = event.data || {};
  try {
    self.postMessage({ id: request.id, ok: true, projection: prepareArtifactGraphProjection(request.input || {}) });
  } catch (error) {
    self.postMessage({ id: request.id, ok: false, error: String(error?.message || error || 'Graph projection failed.') });
  }
});
