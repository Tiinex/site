import { surfacePresent } from './surface.presenter.js';
export function presentSurfaceShare(artifact, context = {}) { return { ...surfacePresent(artifact, context), surface: 'share' }; }
