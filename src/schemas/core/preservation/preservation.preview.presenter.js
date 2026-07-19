import { preservationPresent } from './preservation.presenter.js';
export function presentPreservationPreview(artifact, context = {}) { return { ...preservationPresent(artifact, context), surface: 'preview' }; }
