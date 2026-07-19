import { modulePresent } from './module.presenter.js';
export function presentModuleLineage(artifact, context = {}) { return { ...modulePresent(artifact, context), surface: 'lineage' }; }
