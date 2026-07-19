import { modulePresent } from './module.presenter.js';
export function presentModuleTree(artifact, context = {}) { return { ...modulePresent(artifact, context), surface: 'tree' }; }
