import { rootPresent } from './root.presenter.js';
export function presentRootTree(artifact, context = {}) { return { ...rootPresent(artifact, context), surface: 'tree' }; }
