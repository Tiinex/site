import { rootPresent } from './root.presenter.js';
export function presentRootLineage(artifact, context = {}) { return { ...rootPresent(artifact, context), surface: 'lineage' }; }
