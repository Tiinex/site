import { surfacePresent } from './surface.presenter.js';
export function presentSurfaceFeed(artifact, context = {}) { return { ...surfacePresent(artifact, context), surface: 'feed' }; }
