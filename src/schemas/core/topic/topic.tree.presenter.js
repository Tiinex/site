import { topicPresent } from './topic.presenter.js';
export function presentTopicTree(artifact, context = {}) { return { ...topicPresent(artifact, context), surface: 'tree' }; }
