import { topicPresent } from './topic.presenter.js';
export function presentTopicFeed(artifact, context = {}) { return { ...topicPresent(artifact, context), surface: 'feed' }; }
