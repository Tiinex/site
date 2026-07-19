import { rootPresent } from './root.presenter.js';
export function presentRootGraph(artifact, context = {}) { return { ...rootPresent(artifact, context), surface: 'graph' }; }
