import { modulePresent } from './module.presenter.js';
export function presentModulePreview(artifact, context = {}) { return { ...modulePresent(artifact, context), surface: 'preview' }; }
