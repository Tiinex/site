import { rootPresent } from './root.presenter.js';
export function presentRootFeed(artifact, context = {}) { return { ...rootPresent(artifact, context), surface: 'feed' }; }
