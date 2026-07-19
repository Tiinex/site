import { preservationPresent } from './preservation.presenter.js';
export function presentPreservationFeed(artifact, context = {}) { return { ...preservationPresent(artifact, context), surface: 'feed' }; }
