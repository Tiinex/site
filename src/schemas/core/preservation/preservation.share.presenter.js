import { preservationPresent } from './preservation.presenter.js';
export function presentPreservationShare(artifact, context = {}) { return { ...preservationPresent(artifact, context), surface: 'share' }; }
