import { modulePresent } from './module.presenter.js';
export function presentModuleDetail(artifact, context = {}) { return { ...modulePresent(artifact, context), surface: 'detail' }; }
