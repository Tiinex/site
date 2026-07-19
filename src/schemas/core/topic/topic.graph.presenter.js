import { topicPresent } from './topic.presenter.js';
export function presentTopicGraph(artifact, context = {}) { return { ...topicPresent(artifact, context), surface: 'graph' }; }
