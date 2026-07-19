import { surfacePresent } from './surface.presenter.js';
export function presentSurfaceLineage(artifact, context = {}) { return { ...surfacePresent(artifact, context), surface: 'lineage' }; }
