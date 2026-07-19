import { modulePresent } from './module.presenter.js';
export function presentModuleFeed(artifact, context = {}) { return { ...modulePresent(artifact, context), surface: 'feed' }; }
