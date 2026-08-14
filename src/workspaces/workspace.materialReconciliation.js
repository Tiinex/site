const RECONCILIATION_SCHEMA = 'tiinex.workspace.material.reconciliation.v1';
const SOURCE_MATCH_STATUS = new Set(['checksum-match']);
const LOCAL_SHADOW_STATUS = 'local-shadowed-by-source';

export function reconcileSourceRecordWithWorkspace(workspace = {}, sourceRecord = {}, source = {}) {
  const records = Array.isArray(workspace.records) ? workspace.records.slice() : [];
  const sourceIndex = records.findIndex((record) => sameSourceRecord(record, sourceRecord, source));
  if (sourceIndex >= 0) {
    const prior = records[sourceIndex] || {};
    const nextRecord = preserveLocalReconciliation(prior, sourceRecord);
    records[sourceIndex] = nextRecord;
    workspace.records = records;
    return { action: 'source-upsert', record: nextRecord, index: sourceIndex, replacedLocal: false, conflict: false };
  }

  const localMatch = findLocalReconciliationCandidate(records, sourceRecord);
  if (!localMatch) return { action: 'insert', record: sourceRecord, index: -1, replacedLocal: false, conflict: false };

  const localRecord = records[localMatch.index];
  const sourceChecksum = selfChecksum(sourceRecord);
  const localChecksum = selfChecksum(localRecord);
  const hasComparableChecksum = Boolean(sourceChecksum && localChecksum);
  const base = {
    schema: RECONCILIATION_SCHEMA,
    sourceId: source?.id || sourceRecord?.source?.id || '',
    sourceLabel: source?.label || sourceRecord?.source?.label || '',
    sourceRecordId: sourceRecord.id || '',
    sourcePath: sourceRecord.path || '',
    localRecordId: localRecord.id || '',
    localPath: localRecord.path || '',
    matchedBy: localMatch.reason
  };

  if (hasComparableChecksum && sourceChecksum === localChecksum) {
    const canonicalSource = Object.assign({}, sourceRecord, {
      materialReconciliation: Object.assign({}, base, {
        status: 'source-canonical-pruned-local-duplicate',
        checksum: sourceChecksum,
        displayLabel: 'source-backed',
        message: 'Verified source material matches the imported/local copy. The redundant local payload was removed; source remains canonical.'
      }),
      materialAuthorities: uniqueAuthorityList([sourceRecord.materialAuthorities, 'source-backed'])
    });
    records.splice(localMatch.index, 1);
    records.unshift(canonicalSource);
    workspace.records = dedupeRecordsById(records);
    return { action: 'source-canonical-pruned-local-duplicate', record: canonicalSource, index: 0, replacedLocal: true, conflict: false, prunedLocalRecordId: localRecord.id || '' };
  }

  const status = hasComparableChecksum ? 'checksum-mismatch' : 'same-origin-unverified';
  const message = hasComparableChecksum
    ? 'Imported/local copy and loaded source material share an identity but their checksums differ; inspect before continuing.'
    : 'Imported/local copy and loaded source material share an identity, but one side lacks a comparable checksum.';
  const localReconciliation = Object.assign({}, base, {
    status,
    sourceChecksum,
    localChecksum,
    displayLabel: hasComparableChecksum ? 'material mismatch' : 'same origin · unverified',
    message,
    counterpartId: sourceRecord.id || ''
  });
  const sourceReconciliation = Object.assign({}, localReconciliation, {
    counterpartId: localRecord.id || ''
  });
  records[localMatch.index] = Object.assign({}, localRecord, {
    materialReconciliation: localReconciliation,
    materialAuthorities: uniqueAuthorityList([localRecord.materialAuthorities, 'local-imported'])
  });
  const conflictedSource = Object.assign({}, sourceRecord, {
    materialReconciliation: sourceReconciliation,
    materialAuthorities: uniqueAuthorityList([sourceRecord.materialAuthorities, 'source-backed'])
  });
  records.unshift(conflictedSource);
  workspace.records = dedupeRecordsById(records);
  return { action: status, record: conflictedSource, index: 0, replacedLocal: false, conflict: hasComparableChecksum, localRecord };
}



export function reconcileLocalRecordWithSourceBackedWorkspace(workspace = {}, localRecord = {}) {
  if (!isLocalRecord(localRecord)) return { action: 'insert', record: localRecord, index: -1, reconciled: false };
  const records = Array.isArray(workspace.records) ? workspace.records.slice() : [];
  const match = findSourceBackedReconciliationCandidate(records, localRecord);
  if (!match) return { action: 'insert', record: localRecord, index: -1, reconciled: false };

  const sourceRecord = records[match.index] || {};
  const sourceChecksum = selfChecksum(sourceRecord);
  const localChecksum = selfChecksum(localRecord);
  const hasComparableChecksum = Boolean(sourceChecksum && localChecksum);
  const markdownMatches = Boolean(String(sourceRecord.markdown || '') && String(sourceRecord.markdown || '') === String(localRecord.markdown || ''));
  if (!(hasComparableChecksum && sourceChecksum === localChecksum) && !markdownMatches) {
    const conflictStatus = hasComparableChecksum ? 'checksum-mismatch' : 'same-origin-unverified';
    const baseConflict = {
      schema: RECONCILIATION_SCHEMA,
      status: conflictStatus,
      sourceId: sourceRecord?.source?.id || '',
      sourceLabel: sourceRecord?.source?.label || sourceRecord?.source?.repo || '',
      sourceRecordId: sourceRecord.id || '',
      sourcePath: sourceRecord.path || '',
      localRecordId: localRecord.id || '',
      localPath: localRecord.path || '',
      matchedBy: match.reason,
      sourceChecksum,
      localChecksum,
      displayLabel: hasComparableChecksum ? 'material mismatch' : 'same origin · unverified',
      message: hasComparableChecksum
        ? 'Local/imported material diverges from the loaded source artifact and remains explicit local material.'
        : 'Local/imported material shares identity with source material but cannot be proven equivalent; both remain explicit.'
    };
    records[match.index] = Object.assign({}, sourceRecord, {
      materialReconciliation: Object.assign({}, baseConflict, { counterpartId: localRecord.id || '' }),
      materialAuthorities: uniqueAuthorityList([sourceRecord.materialAuthorities, 'source-backed'])
    });
    workspace.records = records;
    localRecord.materialReconciliation = Object.assign({}, baseConflict, { counterpartId: sourceRecord.id || '' });
    localRecord.materialAuthorities = uniqueAuthorityList([localRecord.materialAuthorities, 'local-imported']);
    return { action: 'local-source-conflict-explicit', record: localRecord, index: -1, reconciled: false, conflict: true, candidate: records[match.index], reason: match.reason };
  }

  const reconciliation = {
    schema: RECONCILIATION_SCHEMA,
    sourceId: sourceRecord?.source?.id || '',
    sourceLabel: sourceRecord?.source?.label || sourceRecord?.source?.repo || '',
    sourceRecordId: sourceRecord.id || '',
    sourcePath: sourceRecord.path || '',
    localRecordId: localRecord.id || '',
    localPath: localRecord.path || '',
    matchedBy: `${match.reason}${hasComparableChecksum ? '+checksum' : '+content'}`,
    status: 'local-duplicate-pruned-source-canonical',
    checksum: sourceChecksum || localChecksum || '',
    displayLabel: 'source-backed',
    message: 'Imported/local material matches already-loaded source material. The redundant local payload was not retained; source remains canonical.'
  };
  const canonical = Object.assign({}, sourceRecord, {
    materialReconciliation: reconciliation,
    materialAuthorities: uniqueAuthorityList([sourceRecord.materialAuthorities, 'source-backed'])
  });
  records[match.index] = canonical;
  workspace.records = records;
  return { action: 'local-duplicate-pruned-source-canonical', record: canonical, index: match.index, reconciled: true, localRecord, prunedLocal: true };
}

export function restoreLocalSnapshotsForRemovedSourceRecord(record = {}) {
  const reconciliation = record?.materialReconciliation || {};
  const sourceId = String(record?.source?.id || '').trim();
  if (!SOURCE_MATCH_STATUS.has(reconciliation.status)) return null;
  if (String(reconciliation.sourceId || '').trim() && String(reconciliation.sourceId || '').trim() !== sourceId) return null;
  if (String(reconciliation.retainedLocalRecordId || '').trim()) return null;
  const snapshot = reconciliation.localSnapshot;
  if (!snapshot || typeof snapshot !== 'object') return null;
  return Object.assign({}, snapshot, {
    materialReconciliation: {
      schema: RECONCILIATION_SCHEMA,
      status: 'source-removed-local-restored',
      previousSourceId: sourceId,
      previousSourceLabel: reconciliation.sourceLabel || record?.source?.label || '',
      sourcePath: record.path || reconciliation.sourcePath || '',
      message: 'Configured source material was removed; the matching imported/local copy was restored.'
    },
    materialAuthorities: uniqueAuthorityList([snapshot.materialAuthorities, 'local-imported'])
  });
}

export function restoreLocalShadowForRemovedSource(record = {}, sourceId = '') {
  const reconciliation = record?.materialReconciliation || {};
  const cleanSourceId = String(sourceId || '').trim();
  if (reconciliation.status !== LOCAL_SHADOW_STATUS) return record;
  if (cleanSourceId && String(reconciliation.sourceId || '').trim() !== cleanSourceId) return record;
  return Object.assign({}, record, {
    materialReconciliation: {
      schema: RECONCILIATION_SCHEMA,
      status: 'source-removed-local-restored',
      previousSourceId: cleanSourceId,
      previousSourceLabel: reconciliation.sourceLabel || '',
      sourcePath: reconciliation.sourcePath || '',
      message: 'Configured source material was removed; this imported/local continuity copy is visible again.'
    },
    materialAuthorities: uniqueAuthorityList([record.materialAuthorities, 'local-imported'])
  });
}

export function stripLocalSnapshotFromReconciledRecord(record = {}) {
  const reconciliation = record?.materialReconciliation || {};
  if (!SOURCE_MATCH_STATUS.has(reconciliation.status) || !reconciliation.localSnapshot) return { record, stripped: false };
  const nextReconciliation = Object.assign({}, reconciliation, {
    status: 'source-only-after-local-clear',
    localSnapshot: null,
    retainedLocalRecordId: '',
    displayLabel: 'source-backed',
    message: 'Local/imported copy was cleared; source-backed material remains.'
  });
  delete nextReconciliation.localSnapshot;
  return {
    record: Object.assign({}, record, {
      materialReconciliation: nextReconciliation,
      materialAuthorities: uniqueAuthorityList(['source-backed'])
    }),
    stripped: true
  };
}

export function countReconciledLocalSnapshots(records = []) {
  return (Array.isArray(records) ? records : []).filter((record) => {
    const reconciliation = record?.materialReconciliation || {};
    return SOURCE_MATCH_STATUS.has(reconciliation.status)
      && reconciliation.localSnapshot
      && !String(reconciliation.retainedLocalRecordId || '').trim();
  }).length;
}

export function materialReconciliationCounts(records = []) {
  const counts = { checksumMatches: 0, prunedLocalDuplicates: 0, localShadows: 0, checksumMismatches: 0, unverifiedSameOrigin: 0, sourceOnlyAfterLocalClear: 0 };
  for (const record of Array.isArray(records) ? records : []) {
    const status = String(record?.materialReconciliation?.status || '').trim();
    if (status === 'checksum-match') counts.checksumMatches += 1;
    else if (status === 'source-canonical-pruned-local-duplicate' || status === 'local-duplicate-pruned-source-canonical') { counts.checksumMatches += 1; counts.prunedLocalDuplicates += 1; }
    else if (status === LOCAL_SHADOW_STATUS) counts.localShadows += 1;
    else if (status === 'checksum-mismatch') counts.checksumMismatches += 1;
    else if (status === 'same-origin-unverified') counts.unverifiedSameOrigin += 1;
    else if (status === 'source-only-after-local-clear') counts.sourceOnlyAfterLocalClear += 1;
  }
  return Object.freeze(counts);
}

export function isLocalShadowedBySourceRecord(record = {}) {
  return record?.materialReconciliation?.status === LOCAL_SHADOW_STATUS;
}


function findSourceBackedReconciliationCandidate(records = [], localRecord = {}) {
  const localKeys = identityKeys(localRecord);
  let fallback = null;
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (isLocalRecord(record)) continue;
    const source = record.source || {};
    const sourceBacked = source.adapterId && source.adapterId !== 'local' || source.kind === 'github-tree' || source.sourceKind === 'github.repo' || String(record.sourceMode || '').trim().toLowerCase() === 'source-backed';
    if (!sourceBacked) continue;
    const sourceKeys = identityKeys(record);
    const overlap = Array.from(localKeys).find((key) => sourceKeys.has(key));
    if (overlap) return { index, reason: `identity:${overlap}` };
    const sourceChecksum = selfChecksum(record);
    const localChecksum = selfChecksum(localRecord);
    if (sourceChecksum && localChecksum && sourceChecksum === localChecksum && !fallback) fallback = { index, reason: 'checksum:self' };
  }
  return fallback;
}

function findLocalReconciliationCandidate(records = [], sourceRecord = {}) {
  const sourceKeys = identityKeys(sourceRecord);
  const sourceChecksum = selfChecksum(sourceRecord);
  let fallback = null;
  let checksumFallback = null;
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (!isLocalRecord(record)) continue;
    if (isLocalShadowedBySourceRecord(record)) continue;
    const localKeys = identityKeys(record);
    const overlap = Array.from(sourceKeys).find((key) => localKeys.has(key));
    const localChecksum = selfChecksum(record);
    if (overlap && sourceChecksum && localChecksum && sourceChecksum === localChecksum) return { index, reason: `identity:${overlap}+checksum` };
    if (sourceChecksum && localChecksum && sourceChecksum === localChecksum && !checksumFallback) checksumFallback = { index, reason: 'checksum:self' };
    if (overlap && !fallback) fallback = { index, reason: `identity:${overlap}` };
  }
  return checksumFallback || fallback;
}

function sameSourceRecord(record = {}, sourceRecord = {}, source = {}) {
  const sourceId = String(source?.id || sourceRecord?.source?.id || '').trim();
  if (!sourceId || String(record?.source?.id || '').trim() !== sourceId) return false;
  if (record.id && sourceRecord.id && record.id === sourceRecord.id) return true;
  const a = identityKeys(record);
  for (const key of identityKeys(sourceRecord)) if (a.has(key)) return true;
  return false;
}

function preserveLocalReconciliation(prior = {}, sourceRecord = {}) {
  const reconciliation = SOURCE_MATCH_STATUS.has(prior.materialReconciliation?.status) && prior.materialReconciliation.localSnapshot
    ? prior.materialReconciliation
    : null;
  if (!reconciliation) return sourceRecord;
  return Object.assign({}, sourceRecord, {
    materialReconciliation: Object.assign({}, reconciliation, {
      sourceRecordId: sourceRecord.id || reconciliation.sourceRecordId || '',
      sourcePath: sourceRecord.path || reconciliation.sourcePath || '',
      checksum: selfChecksum(sourceRecord) || reconciliation.checksum || '',
      message: reconciliation.message || 'Imported/local copy matches loaded source material by checksum; shown as one artifact cluster.'
    }),
    materialAuthorities: uniqueAuthorityList([sourceRecord.materialAuthorities, 'source-backed', 'local-imported'])
  });
}

function identityKeys(record = {}) {
  const values = [
    record.path,
    record.sourcePath,
    record.trace,
    record.originArtifactPath,
    record.sourceTarget?.sourceArtifactPath,
    record.sourceTarget?.path,
    record.snapshot?.sourceArtifactPath
  ].map((value) => normalizePath(value)).filter(Boolean);
  return new Set(values);
}


function explicitArtifactPathFromUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const path = url.pathname.replace(/^\/+/, '');
    if (/\.(?:trace|workspace|schema)\.md$/i.test(path) || /\.(?:md|markdown)$/i.test(path)) return path;
  } catch (_) {}
  return /^https?:\/\//i.test(raw) ? '' : raw;
}

function selfChecksum(record = {}) {
  const entries = Array.isArray(record?.integrity?.entries) ? record.integrity.entries : [];
  const self = entries.find((entry) => String(entry?.towards || '').trim().toLowerCase() === 'self' && entry.value);
  if (self?.value) return String(self.value).trim();
  const explicit = [record.selfChecksum, record.checksum, record.integrity?.self, record.integrity?.checksum]
    .map((value) => String(value || '').trim())
    .find(Boolean);
  return explicit || '';
}

function isLocalRecord(record = {}) {
  const source = record.source || {};
  const mode = String(record.sourceMode || '').trim().toLowerCase();
  return source.adapterId === 'local'
    || source.kind === 'local-session'
    || source.sourceKind === 'local.session'
    || mode === 'archive-local'
    || mode === 'manual-file'
    || mode === 'manual-folder'
    || mode.startsWith('local')
    || mode.startsWith('package-import');
}

function cloneLocalSnapshot(record = {}) {
  return JSON.parse(JSON.stringify(record || {}));
}

function uniqueAuthorityList(values = []) {
  const raw = Array.isArray(values) ? values.flat(Infinity) : [values];
  const out = [];
  for (const value of raw.map((item) => String(item || '').trim()).filter(Boolean)) {
    if (!out.includes(value)) out.push(value);
  }
  return out;
}

function dedupeRecordsById(records = []) {
  const out = [];
  const seen = new Set();
  for (const record of Array.isArray(records) ? records : []) {
    const id = String(record?.id || '').trim();
    if (id && seen.has(id)) continue;
    if (id) seen.add(id);
    out.push(record);
  }
  return out;
}

function normalizePath(value = '') {
  let raw = String(value || '').trim();
  if (!raw) return '';
  let hashIdentity = '';
  try {
    const url = new URL(raw);
    const hash = String(url.hash || '').replace(/^#/, '');
    hashIdentity = /(?:issuecomment-|discussioncomment-)\d+/i.test(hash) ? `#${hash}` : '';
    raw = url.hostname === 'raw.githubusercontent.com'
      ? url.pathname.split('/').filter(Boolean).slice(3).join('/')
      : url.pathname.replace(/^\/+/, '');
  } catch (_) {
    const hash = raw.match(/#((?:issuecomment-|discussioncomment-)\d+)/i)?.[1] || '';
    hashIdentity = hash ? `#${hash}` : '';
  }
  const withoutQuery = raw.replace(/\?.*$/, '');
  const withoutHash = withoutQuery.replace(/#.*/, '');
  const out = [];
  for (const part of withoutHash.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return `${out.join('/')}${hashIdentity}`;
}
