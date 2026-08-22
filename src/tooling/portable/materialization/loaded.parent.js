export function indexPortableLoadedParentRecords(records = []) {
  const index = new Map();
  for (const record of records) {
    for (const key of exactLoadedIdentityKeys(record)) {
      const list = index.get(key) || [];
      if (!list.includes(record)) list.push(record);
      index.set(key, list);
    }
  }
  return index;
}

export function resolvePortableLoadedParentReference(ref = '', indexOrRecords = []) {
  const reference = exact(ref);
  if (!reference) return Object.freeze({ status: 'missing', candidates: Object.freeze([]), record: null });
  const index = indexOrRecords instanceof Map ? indexOrRecords : indexPortableLoadedParentRecords(indexOrRecords);
  const candidates = index.get(reference) || [];
  if (candidates.length !== 1) return Object.freeze({
    status: candidates.length ? 'ambiguous' : 'missing',
    candidates: Object.freeze(candidates.slice()),
    record: null
  });
  return Object.freeze({ status: 'resolved', candidates: Object.freeze(candidates.slice()), record: candidates[0] });
}

export function projectPortableLoadedParentRecord(record = {}) {
  const id = exact(record.id || record.path || '');
  return Object.freeze({
    id,
    path: exact(record.path || ''),
    kind: exact(record.kind || ''),
    schemaId: exact(record.schemaId || ''),
    currentSchemaId: exact(record.currentSchemaId || ''),
    currentCreatedAt: exact(record.currentCreatedAt || ''),
    createdAt: exact(record.createdAt || ''),
    continuationTrace: '',
    boundary: exact(record.boundary || record.source?.boundary || 'loaded material boundary'),
    sourceMode: exact(record.sourceMode || ''),
    source: record.source || null,
    publishedReference: record.publishedReference || null,
    schemaReferenceAuthority: record.schemaReferenceAuthority || null,
    title: exact(record.title || ''),
    summary: exact(record.summary || '')
  });
}

function exactLoadedIdentityKeys(record = {}) {
  const keys = [exact(record.id || ''), exact(record.path || '')].filter((value) => value !== '');
  return [...new Set(keys)];
}

function exact(value) { return String(value ?? ''); }
