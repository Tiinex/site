import { surfacePresent } from './surface.presenter.js';
export function presentSurfacePreview(artifact, context = {}) { return { ...surfacePresent(artifact, context), surface: 'preview' }; }
