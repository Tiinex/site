import { rootPresent } from './root.presenter.js';
export function presentRootDetail(artifact, context = {}) { return { ...rootPresent(artifact, context), surface: 'detail' }; }
