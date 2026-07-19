import { topicPresent } from './topic.presenter.js';
export function presentTopicShare(artifact, context = {}) { return { ...topicPresent(artifact, context), surface: 'share' }; }
