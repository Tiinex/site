import { evidencePresent } from './evidence.presenter.js';
export function presentEvidenceShare(artifact, context = {}) { return { ...evidencePresent(artifact, context), surface: 'share' }; }
