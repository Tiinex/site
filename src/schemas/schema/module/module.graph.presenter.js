import { modulePresent } from './module.presenter.js';
export function presentModuleGraph(artifact, context = {}) { return { ...modulePresent(artifact, context), surface: 'graph' }; }
