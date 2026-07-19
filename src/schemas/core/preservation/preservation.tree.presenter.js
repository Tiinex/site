import { preservationPresent } from './preservation.presenter.js';
export function presentPreservationTree(artifact, context = {}) { return { ...preservationPresent(artifact, context), surface: 'tree' }; }
