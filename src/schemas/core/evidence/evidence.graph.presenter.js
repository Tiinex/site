import { evidencePresent } from './evidence.presenter.js';
export function presentEvidenceGraph(artifact, context = {}) { return { ...evidencePresent(artifact, context), surface: 'graph' }; }
