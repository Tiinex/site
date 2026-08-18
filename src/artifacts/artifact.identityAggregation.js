import '../sources/source.identity.js';

export function collectLoadedArtifactAggregates(input = {}, declaredSchemaIdForRecord = () => '', metadataSchemaIdForRecord = () => '', canonicalSchemaId = '', identityPrefix = 'tiinex.artifact.registry') {
  const aggregates = new Map();
  const append = (record, containingWorkspaceId = '') => {
    if (!record || typeof record !== 'object') return;
    const memberships = recordWorkspaceMemberships(record, containingWorkspaceId);
    const identity = artifactRegistryIdentityForRecord(record, memberships, declaredSchemaIdForRecord, metadataSchemaIdForRecord, identityPrefix);
    const observation = {
      record,
      memberships,
      representation: normalizedRepresentation(record.markdown || ''),
      declaredSchemaId: String(declaredSchemaIdForRecord(record) || '').trim(),
      metadataSchemaId: String(metadataSchemaIdForRecord(record) || '').trim()
    };
    const existing = aggregates.get(identity.key);
    if (existing) {
      for (const membership of memberships) existing.workspaceIds.add(membership);
      existing.observations.push(observation);
      return;
    }
    aggregates.set(identity.key, { identity, observations: [observation], workspaceIds: new Set(memberships) });
  };
  for (const record of Array.isArray(input.records) ? input.records : []) append(record);
  for (const workspace of Array.isArray(input.state?.workspaces) ? input.state.workspaces : []) {
    for (const record of Array.isArray(workspace?.records) ? workspace.records : []) append(record, workspace?.id || '');
  }
  return [...aggregates.values()].map((aggregate) => finalizeRecordAggregate(aggregate, canonicalSchemaId));
}

export function artifactRegistryIdentityForRecord(record = {}, workspaceIds = [], declaredSchemaIdForRecord = () => '', metadataSchemaIdForRecord = () => '', identityPrefix = 'tiinex.artifact.registry') {
  const boundary = artifactSourceBoundaryIdentity(record);
  const sourceArtifactPath = canonicalSourceArtifactPath(record);
  const inputTarget = String(record.sourceTarget?.inputTarget || '').trim();
  if (boundary?.key && sourceArtifactPath) {
    return Object.freeze({
      global: true,
      kind: 'configured-source',
      key: ['source-boundary', boundary.key, sourceArtifactPath].join('\u0000'),
      id: registryIdentityId(identityPrefix, 'source-boundary', [boundary.key, sourceArtifactPath]),
      sourceBoundary: boundary,
      boundaryKey: boundary.key,
      boundarySignature: boundary.signature,
      sourceArtifactPath
    });
  }
  if (inputTarget) {
    const artifactScoped = Boolean(sourceArtifactPath && embeddedIssueArtifact(record));
    const kind = artifactScoped ? 'input-target-artifact' : 'input-target';
    const identityParts = artifactScoped ? [inputTarget, sourceArtifactPath] : [inputTarget];
    return Object.freeze({
      global: true,
      kind,
      key: ['target', ...identityParts].join('\u0000'),
      id: registryIdentityId(identityPrefix, kind, identityParts),
      inputTarget,
      sourceArtifactPath: artifactScoped ? sourceArtifactPath : ''
    });
  }
  const membershipScope = (Array.isArray(workspaceIds) ? workspaceIds : []).join(',');
  const key = ['workspace-record', membershipScope, record.id || '', record.path || ''].join('\u0000');
  return Object.freeze({
    global: false,
    kind: 'workspace-record',
    key,
    id: String(record.id || registryIdentityId(identityPrefix, 'workspace-record', [membershipScope, record.path || '']))
  });
}

export function readArtifactRepresentationQualification(record = {}) {
  const aggregation = record.registryAggregation || {};
  const variants = Array.isArray(aggregation.representationVariants) ? aggregation.representationVariants : [];
  return Object.freeze({
    state: String(aggregation.representationState || (variants.length ? 'equivalent' : 'unresolved')),
    observationCount: Number(aggregation.observationCount || (variants.length ? 1 : 0)),
    variantCount: variants.length,
    variants: Object.freeze(variants.map((variant) => Object.freeze({
      markdown: String(variant.markdown || ''),
      recordIds: Object.freeze([...(variant.recordIds || [])]),
      workspaceIds: Object.freeze([...(variant.workspaceIds || [])])
    }))),
    reconciliationStatuses: Object.freeze([...(aggregation.reconciliationStatuses || [])])
  });
}

export function readArtifactSchemaQualification(record = {}, canonicalSchemaId = '') {
  const aggregation = record.registryAggregation || {};
  const declaredSchemaIds = [...(aggregation.declaredSchemaIds || [])];
  return Object.freeze({
    state: String(aggregation.schemaState || (declaredSchemaIds.length === 1 ? 'equivalent' : 'unresolved')),
    declaredSchemaIds: Object.freeze(declaredSchemaIds),
    canonicalSchemaId: String(canonicalSchemaId || aggregation.canonicalSchemaId || ''),
    canonicalObserved: aggregation.canonicalSchemaObserved === true,
    unresolvedObservationCount: Number(aggregation.unresolvedSchemaObservationCount || 0),
    observationCount: Number(aggregation.observationCount || 0)
  });
}

export function artifactSourceBoundaryIdentity(record = {}) {
  const source = record.source || {};
  return globalThis.TiinexSourceIdentity?.configuredSourceBoundaryIdentity?.({
    repository: source.repository || source.repo || source.config?.repo || '',
    ref: source.ref || source.requestedRef || source.config?.ref || '',
    rootPath: source.rootPath || source.config?.rootPath || '.topics'
  }) || null;
}

export function artifactSourceBoundarySignature(record = {}) {
  return String(artifactSourceBoundaryIdentity(record)?.signature || '');
}

function finalizeRecordAggregate(aggregate = {}, canonicalSchemaId = '') {
  const memberships = [...(aggregate.workspaceIds || [])].sort();
  const observations = [...(aggregate.observations || [])].sort(compareObservations);
  const schemaQualification = schemaAggregateQualification(observations, canonicalSchemaId);
  const representative = representativeObservation(observations, canonicalSchemaId)?.record || {};
  const loadedRecordIds = [...new Set(observations.map((item) => String(item.record?.id || '').trim()).filter(Boolean))].sort();
  const loadedSourceIds = [...new Set(observations.map((item) => String(item.record?.source?.id || '').trim()).filter(Boolean))].sort();
  const variants = representationVariants(observations);
  const reconciliationStatuses = [...new Set(observations.map((item) => String(item.record?.materialReconciliation?.status || '').trim()).filter(Boolean))].sort();
  const representationState = representationAggregateState(variants, reconciliationStatuses);
  const identity = aggregate.identity || {};
  return Object.assign({}, representative, {
    id: identity.global ? String(loadedRecordIds[0] || identity.id || '') : String(representative.id || identity.id || ''),
    workspaceId: memberships[0] || '',
    workspaceIds: memberships,
    registryIdentity: identity,
    loadedRecordIds,
    loadedSourceIds,
    registryAggregation: Object.freeze({
      observationCount: observations.length,
      representationState,
      representationVariants: Object.freeze(variants),
      reconciliationStatuses: Object.freeze(reconciliationStatuses),
      schemaState: schemaQualification.state,
      declaredSchemaIds: Object.freeze(schemaQualification.declaredSchemaIds),
      canonicalSchemaId: String(canonicalSchemaId || ''),
      canonicalSchemaObserved: schemaQualification.canonicalObserved,
      unresolvedSchemaObservationCount: schemaQualification.unresolvedObservationCount
    })
  });
}

function schemaAggregateQualification(observations = [], canonicalSchemaId = '') {
  const declaredSchemaIds = [...new Set(observations.map((item) => String(item.declaredSchemaId || '').trim()).filter(Boolean))].sort();
  const unresolvedObservationCount = observations.filter((item) => !String(item.declaredSchemaId || '').trim()).length;
  const canonicalObserved = Boolean(canonicalSchemaId && declaredSchemaIds.includes(canonicalSchemaId));
  let state = 'unresolved';
  if (!unresolvedObservationCount && declaredSchemaIds.length === 1) state = 'equivalent';
  else if (declaredSchemaIds.length > 1) state = 'conflicting';
  return { state, declaredSchemaIds, canonicalObserved, unresolvedObservationCount };
}

function representativeObservation(observations = [], canonicalSchemaId = '') {
  if (canonicalSchemaId) {
    const canonical = observations.filter((item) => item.declaredSchemaId === canonicalSchemaId);
    if (canonical.length) return canonical[0];
  }
  return observations[0];
}

function recordWorkspaceMemberships(record = {}, containingWorkspaceId = '') {
  const memberships = new Set();
  const add = (value) => {
    const id = String(value || '').trim();
    if (id) memberships.add(id);
  };
  add(containingWorkspaceId);
  add(record.workspaceId);
  for (const value of Array.isArray(record.workspaceIds) ? record.workspaceIds : []) add(value);
  return [...memberships].sort();
}

function compareObservations(left = {}, right = {}) {
  return String(left.representation || '').localeCompare(String(right.representation || ''))
    || String(left.declaredSchemaId || '').localeCompare(String(right.declaredSchemaId || ''))
    || String(left.record?.path || '').localeCompare(String(right.record?.path || ''))
    || String(left.record?.id || '').localeCompare(String(right.record?.id || ''))
    || String((left.memberships || []).join(',')).localeCompare(String((right.memberships || []).join(',')));
}

function representationVariants(observations = []) {
  const variants = new Map();
  for (const observation of observations) {
    const markdown = String(observation.representation || '');
    const existing = variants.get(markdown) || { markdown, recordIds: new Set(), workspaceIds: new Set() };
    const recordId = String(observation.record?.id || '').trim();
    if (recordId) existing.recordIds.add(recordId);
    for (const workspaceId of observation.memberships || []) if (workspaceId) existing.workspaceIds.add(workspaceId);
    variants.set(markdown, existing);
  }
  return [...variants.values()]
    .sort((a, b) => a.markdown.localeCompare(b.markdown))
    .map((variant) => Object.freeze({
      markdown: variant.markdown,
      recordIds: Object.freeze([...variant.recordIds].sort()),
      workspaceIds: Object.freeze([...variant.workspaceIds].sort())
    }));
}

function representationAggregateState(variants = [], reconciliationStatuses = []) {
  if (variants.length > 1 || reconciliationStatuses.includes('checksum-mismatch')) return 'conflicting';
  if (reconciliationStatuses.includes('same-origin-unverified')) return 'unresolved';
  return variants.length === 1 ? 'equivalent' : 'unresolved';
}

function normalizedRepresentation(markdown = '') { return String(markdown || '').replace(/\r\n?/g, '\n'); }

function embeddedIssueArtifact(record = {}) {
  const mode = String(record.sourceMode || '').trim();
  const targetKind = String(record.sourceTarget?.targetKind || '').trim();
  return mode === 'github-issue-embedded-artifact'
    || mode === 'github-comment-embedded-artifact'
    || targetKind === 'github-issue-embedded-artifact'
    || targetKind === 'github-comment-embedded-artifact';
}
function canonicalSourceArtifactPath(record = {}) { return String(record.sourceTarget?.sourceArtifactPath || record.path || '').trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/{2,}/g, '/'); }
function registryIdentityId(prefix, kind, parts = []) { return `${prefix}:${kind}:${parts.map((value) => encodeURIComponent(String(value || ''))).join(':')}`; }
