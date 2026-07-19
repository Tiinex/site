import { preservationPresent } from './preservation.presenter.js';
export function presentPreservationDetail(artifact, context = {}) { return { ...preservationPresent(artifact, context), surface: 'detail' }; }
