import { topicPresent } from './topic.presenter.js';
export function presentTopicLineage(artifact, context = {}) { return { ...topicPresent(artifact, context), surface: 'lineage' }; }
