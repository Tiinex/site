import { evidencePresent } from './evidence.presenter.js';
export function presentEvidenceFeed(artifact, context = {}) { return { ...evidencePresent(artifact, context), surface: 'feed' }; }
