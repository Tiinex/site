import { evidencePresent } from './evidence.presenter.js';
export function presentEvidenceDetail(artifact, context = {}) { return { ...evidencePresent(artifact, context), surface: 'detail' }; }
