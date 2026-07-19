import { topicPresent } from './topic.presenter.js';
export function presentTopicDetail(artifact, context = {}) { return { ...topicPresent(artifact, context), surface: 'detail' }; }
