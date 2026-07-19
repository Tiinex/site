import { surfacePresent } from './surface.presenter.js';
export function presentSurfaceGraph(artifact, context = {}) { return { ...surfacePresent(artifact, context), surface: 'graph' }; }
