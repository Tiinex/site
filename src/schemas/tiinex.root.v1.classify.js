export function schemaKey(schemaId) {
  const text = String(schemaId || '').toLowerCase();
  if (text.includes('discovery.')) return 'discovery';
  if (text.includes('resource.')) return 'resource';
  if (text.includes('instrument.')) return 'instrument';
  if (text.includes('relation')) return 'relation';
  if (text.includes('privacy') || text.includes('redaction')) return 'privacy';
  if (text.includes('attestation')) return 'attestation';
  if (text.includes('external.payload')) return 'payload';
  if (text.includes('topic')) return 'topic';
  if (text.includes('task')) return 'task';
  if (text.includes('decision')) return 'decision';
  if (text.includes('evidence')) return 'evidence';
  if (text.includes('feedback')) return 'feedback';
  if (text.includes('reduction')) return 'reduction';
  if (text.includes('runtime')) return 'runtime';
  if (text.includes('signal')) return 'signal';
  if (text.includes('pointer')) return 'pointer';
  if (text.includes('lineage.upgrade')) return 'lineage-upgrade';
  if (text.includes('schema.family') || text.includes('definition')) return 'schema-governance';
  if (text.includes('schema.module')) return 'schema-module';
  if (text.includes('presentation.surface')) return 'surface';
  if (text.includes('validation.method')) return 'validation';
  if (text.includes('workspace')) return 'workspace';
  return schemaId ? 'unknown' : 'plain';
}

export function schemaBadgeClass(schemaId) {
  const key = schemaKey(schemaId);
  const known = [
    'topic', 'task', 'decision', 'evidence', 'feedback', 'reduction',
    'runtime', 'signal', 'pointer', 'discovery', 'resource', 'instrument',
    'relation', 'privacy', 'attestation', 'payload', 'lineage-upgrade',
    'schema-governance', 'schema-module', 'surface', 'workspace', 'validation'
  ];
  if (known.includes(key)) return key;
  return key === 'plain' ? 'plain' : 'unknown';
}

export function schemaIdFromText(value, fallback = 'tiinex.topic.v1') {
  const text = String(value || '').trim();
  if (!text) return fallback;
  const markdown = text.match(/\[([^\]]+)\]\([^)]+\)/);
  if (markdown) return markdown[1].trim() || fallback;
  return text.replace(/^Current Schema:\s*/i, '').trim() || fallback;
}

export function schemaLabel(schemaId = '') {
  const id = String(schemaId || '').trim();
  if (!id) return 'Plain material';
  const key = schemaKey(id);
  if (key && key !== 'unknown') return key.replace(/-/g, ' ');
  const parts = id.split('.').filter(Boolean);
  return parts.length ? parts.slice(-2, -1)[0] || parts.at(-1) : id;
}
