import { evidencePresent } from './evidence.presenter.js';
export function presentEvidenceLineage(artifact, context = {}) { return { ...evidencePresent(artifact, context), surface: 'lineage' }; }
