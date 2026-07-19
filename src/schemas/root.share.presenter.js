import { rootPresent } from './root.presenter.js';
export function presentRootShare(artifact, context = {}) { return { ...rootPresent(artifact, context), surface: 'share' }; }
