import { modulePresent } from './module.presenter.js';
export function presentModuleShare(artifact, context = {}) { return { ...modulePresent(artifact, context), surface: 'share' }; }
