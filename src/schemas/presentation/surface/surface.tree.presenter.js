import { surfacePresent } from './surface.presenter.js';
export function presentSurfaceTree(artifact, context = {}) { return { ...surfacePresent(artifact, context), surface: 'tree' }; }
