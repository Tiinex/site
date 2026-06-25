export function schemaKey(schemaId) {
  const text = String(schemaId || '').toLowerCase();
  if (text.includes('topic')) return 'topic';
  if (text.includes('task')) return 'task';
  if (text.includes('decision')) return 'decision';
  if (text.includes('evidence')) return 'evidence';
  if (text.includes('feedback')) return 'feedback';
  if (text.includes('reduction')) return 'reduction';
  if (text.includes('runtime')) return 'runtime';
  if (text.includes('signal')) return 'signal';
  if (text.includes('pointer')) return 'pointer';
  return schemaId ? 'unknown' : 'plain';
}

export function schemaBadgeClass(schemaId) {
  const key = schemaKey(schemaId);
  if (['topic', 'task', 'decision', 'evidence', 'feedback', 'reduction'].includes(key)) return key;
  return key === 'plain' ? 'plain' : 'unknown';
}

export function schemaIdFromText(value, fallback = 'tiinex.topic.v1') {
  const text = String(value || '').trim();
  if (!text) return fallback;
  const markdown = text.match(/\[([^\]]+)\]\([^)]+\)/);
  if (markdown) return markdown[1].trim() || fallback;
  return text.replace(/^Current Schema:\s*/i, '').trim() || fallback;
}
