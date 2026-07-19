import { topicPresent } from './topic.presenter.js';
export function presentTopicPreview(artifact, context = {}) { return { ...topicPresent(artifact, context), surface: 'preview' }; }
