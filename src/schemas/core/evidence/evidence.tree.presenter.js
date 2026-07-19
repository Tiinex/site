import { evidencePresent } from './evidence.presenter.js';
export function presentEvidenceTree(artifact, context = {}) { return { ...evidencePresent(artifact, context), surface: 'tree' }; }
