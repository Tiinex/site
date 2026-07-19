import { preservationPresent } from './preservation.presenter.js';
export function presentPreservationGraph(artifact, context = {}) { return { ...preservationPresent(artifact, context), surface: 'graph' }; }
