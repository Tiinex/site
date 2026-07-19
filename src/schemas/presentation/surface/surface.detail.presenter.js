import { surfacePresent } from './surface.presenter.js';
export function presentSurfaceDetail(artifact, context = {}) { return { ...surfacePresent(artifact, context), surface: 'detail' }; }
