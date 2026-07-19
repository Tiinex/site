import { preservationPresent } from './preservation.presenter.js';
export function presentPreservationLineage(artifact, context = {}) { return { ...preservationPresent(artifact, context), surface: 'lineage' }; }
