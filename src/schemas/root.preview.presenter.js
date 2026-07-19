import { rootPresent } from './root.presenter.js';
export function presentRootPreview(artifact, context = {}) { return { ...rootPresent(artifact, context), surface: 'preview' }; }
