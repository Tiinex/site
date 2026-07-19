import { evidencePresent } from './evidence.presenter.js';
export function presentEvidencePreview(artifact, context = {}) { return { ...evidencePresent(artifact, context), surface: 'preview' }; }
