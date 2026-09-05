import { runAudit } from '../../../audit/audit.run.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding } from '../findings.js';
import { portableRuntimeValidationContractForSchema } from '../schema/qualifiedLocalRoot.runtime.js';
import { hasPositiveBlockingCue } from './blockingCue.js';

export const PORTABLE_OPERATING_OVERVIEW_SCHEMA_ID = 'tiinex.portable.operating-overview.v1';

const SCHEMA = Object.freeze({
  project: 'tiinex.project.v1',
  task: 'tiinex.task.v1',
  resourceNeed: 'tiinex.resource.need.v1',
  resource: 'tiinex.resource.v1',
  signal: 'tiinex.signal.v1',
  monitoring: 'tiinex.discovery.monitoring.v1',
  source: 'tiinex.source.v1',
  relation: 'tiinex.relation.v1',
  workspace: 'tiinex.workspace.v1'
});

const TERMINAL_STATUS = /(?:^|[\s/_-])(completed?|done|closed|cancelled|canceled|superseded|rejected|abandoned)(?:$|[\s/_-])/i;
const CURRENT_STATUS = /(?:^|[\s/_-])(active|in[ -]?progress|open|ready|blocked|blocking|pending|draft)(?:$|[\s/_-])/i;
const BLOCKER_TEXT = /\b(block(?:ed|er|ing)?|unavailable|missing|insufficient|waiting)\b/i;

export function projectPortableOperatingOverview(input = {}, options = {}) {
  const material = normalizePortableInput(input.materials || input);
  const qualifications = new Map(material.records.map((record) => [record.id, qualifyRecord(record)]));
  const findings = [...material.findings];

  const projects = material.records
    .filter((record) => record.schemaId === SCHEMA.project)
    .map((record) => overviewItem(record, qualifications.get(record.id)));

  const taskRecords = material.records.filter((record) => record.schemaId === SCHEMA.task);
  const frontierCandidates = [];
  let deferredFrontierCandidates = 0;
  for (const record of taskRecords) {
    if (!isDeclaredCurrent(record.lifecycleStatus)) continue;
    const qualification = qualifications.get(record.id);
    if (qualification?.state !== 'exact') {
      deferredFrontierCandidates += 1;
      continue;
    }
    const objective = sectionText(record.markdown, 'Objective');
    if (!objective) continue;
    frontierCandidates.push(Object.freeze({
      ...overviewItem(record, qualification),
      objective,
      dependencies: sectionList(record.markdown, 'Dependencies'),
      basis: Object.freeze({
        kind: 'task-declared-nonterminal-status',
        declaredStatus: String(record.lifecycleStatus || ''),
        lineageLeafUsed: false,
        taskLifecycleIsLineagePosition: false,
        interpretation: 'candidate-only; current workflow truth remains with the owning Task and its declared dependencies/status'
      })
    }));
  }

  const blockerSignals = taskRecords.flatMap((record) => taskBlockerSignals(record, qualifications.get(record.id)));
  const resourceSignals = material.records
    .filter((record) => [SCHEMA.resourceNeed, SCHEMA.resource, SCHEMA.signal].includes(record.schemaId))
    .map((record) => Object.freeze({
      ...overviewItem(record, qualifications.get(record.id)),
      kind: record.schemaId === SCHEMA.resourceNeed ? 'resource-need' : record.schemaId === SCHEMA.resource ? 'resource' : 'signal',
      blockingCue: BLOCKER_TEXT.test(`${record.lifecycleStatus || ''}\n${record.summary || ''}\n${record.markdown || ''}`)
    }));

  const monitoringRecords = material.records.filter((record) => record.schemaId === SCHEMA.monitoring);
  const sourceRecords = material.records.filter((record) => record.schemaId === SCHEMA.source);
  const relationRecords = material.records.filter((record) => record.schemaId === SCHEMA.relation);
  const workspaceRecords = material.records.filter((record) => record.schemaId === SCHEMA.workspace);
  const relevanceEdges = relationRecords.flatMap((record) => projectLoadedRelationRelevance(record, material.records, qualifications));

  if (deferredFrontierCandidates) findings.push(portableFinding(
    'info',
    'portable.operating-overview.frontier.partial-qualification',
    'Some declared-current Task records were not promoted to qualified frontier candidates because exact local schema qualification was unavailable.',
    { count: deferredFrontierCandidates }
  ));

  return Object.freeze({
    schema: PORTABLE_OPERATING_OVERVIEW_SCHEMA_ID,
    status: 'ready',
    boundary: Object.freeze({
      material: 'loaded-only',
      remoteFetch: false,
      remoteWrite: false,
      semanticAuthority: 'projection-only',
      owningArtifactsRemainAuthoritative: true,
      lineageLeafMeansFrontier: false,
      taskLifecycleIsLineagePosition: false,
      inferredRemoteState: false
    }),
    projects: Object.freeze(projects),
    frontierCandidates: Object.freeze(frontierCandidates),
    blockerSignals: Object.freeze(blockerSignals),
    resourceSignals: Object.freeze(resourceSignals),
    monitoring: Object.freeze({
      state: monitoringRecords.length || sourceRecords.length ? 'loaded-declarations-only' : 'unavailable-no-loaded-monitoring-or-source-material',
      loadedMonitoring: monitoringRecords.length,
      loadedSources: sourceRecords.length,
      monitoring: Object.freeze(monitoringRecords.map((record) => overviewItem(record, qualifications.get(record.id)))),
      sources: Object.freeze(sourceRecords.map((record) => overviewItem(record, qualifications.get(record.id)))),
      freshnessProjection: 'deferred-no-dedicated-freshness-derivation',
      boundary: 'Monitoring and Source declarations can be surfaced when loaded, but freshness is not inferred from host time, network state, or undeclared observations.'
    }),
    crossRepository: Object.freeze({
      state: relationRecords.length || workspaceRecords.length ? 'loaded-relevance-only' : 'unavailable-no-loaded-relation-or-workspace-material',
      loadedRelations: relationRecords.length,
      loadedWorkspaces: workspaceRecords.length,
      relations: Object.freeze(relationRecords.map((record) => overviewItem(record, qualifications.get(record.id)))),
      workspaces: Object.freeze(workspaceRecords.map((record) => overviewItem(record, qualifications.get(record.id)))),
      relevanceEdges: Object.freeze(relevanceEdges),
      relevance: Object.freeze({
        resolved: relevanceEdges.filter((edge) => edge.resolution.state === 'resolved').length,
        ambiguous: relevanceEdges.filter((edge) => edge.resolution.state === 'ambiguous').length,
        unresolved: relevanceEdges.filter((edge) => edge.resolution.state === 'unresolved').length
      }),
      remoteTraversal: false,
      boundary: 'Only already-loaded Relation and Workspace declarations are projected. Relation relevance may resolve only from explicit Relation targets plus exact already-loaded record/source facts; ambiguity remains visible and no repository crawl, remote fetch, hidden provider traversal, basename matching, similarity matching, or lifecycle inference is performed.'
    }),
    capabilities: Object.freeze({
      projectInventory: 'ready',
      qualifiedFrontierCandidates: 'ready',
      blockerAndResourceSignals: 'ready',
      firstLoadedMaterialSlice: 'ready',
      loadedRelationRelevance: 'ready',
      monitoringFreshness: 'deferred',
      crossRepositoryTraversal: 'deferred'
    }),
    counts: Object.freeze({
      loadedRecords: material.records.length,
      projects: projects.length,
      qualifiedFrontierCandidates: frontierCandidates.length,
      deferredFrontierCandidates,
      blockerSignals: blockerSignals.length,
      resourceSignals: resourceSignals.length,
      relationRelevanceEdges: relevanceEdges.length
    }),
    findings: Object.freeze(findings)
  });
}

function projectLoadedRelationRelevance(relationRecord = {}, records = [], qualifications = new Map()) {
  const relationQualification = qualifications.get(relationRecord.id) || Object.freeze({ state: 'not-evaluated' });
  const relation = overviewItem(relationRecord, relationQualification);
  return relationTargetDescriptors(relationRecord).map((descriptor) => {
    const matches = loadedTargetMatches(descriptor, relationRecord, records, qualifications);
    const exactQualified = matches.filter((candidate) => candidate.qualification?.state === 'exact');
    let state = 'unresolved';
    let reason = 'no-exact-loaded-target-match';
    let target = null;
    if (relationQualification.state !== 'exact') {
      reason = 'relation-not-exact-qualified';
    } else if (matches.length > 1) {
      state = 'ambiguous';
      reason = 'multiple-exact-identity-candidates';
    } else if (matches.length === 1 && exactQualified.length === 1) {
      state = 'resolved';
      reason = 'unique-exact-loaded-target-match';
      target = matches[0];
    } else if (matches.length === 1) {
      reason = 'unique-identity-candidate-not-exact-qualified';
    } else if (descriptor.kind === 'bounded-descriptor') {
      reason = 'target-is-not-an-exact-loaded-artifact-locator';
    }
    const candidates = Object.freeze(matches);
    return Object.freeze({
      relation,
      targetDescriptor: descriptor,
      resolution: Object.freeze({
        state,
        reason,
        candidateCount: matches.length,
        exactQualifiedCandidateCount: exactQualified.length,
        exactIdentityOnly: true,
        remoteTraversal: false,
        heuristicMatching: false,
        lifecycleInference: false,
        parentInference: false
      }),
      target,
      candidates,
      sourceBases: Object.freeze({
        relation: relation.loadedSourceBasis,
        target: target?.loadedSourceBasis || null
      }),
      boundary: 'Projection-only loaded Relation relevance. The Relation remains non-Parent; the resolved target retains its own schema, lifecycle, provenance, acceptance, ownership, and publication authority.'
    });
  });
}

function relationTargetDescriptors(record = {}) {
  const section = sectionText(record.markdown, 'Relation Target');
  if (!section) return Object.freeze([]);
  const descriptors = [];
  for (const line of section.split('\n')) {
    const match = line.match(/^\s*-\s*Target:\s*(.+?)\s*$/i);
    if (!match) continue;
    const raw = String(match[1] || '').trim();
    if (!raw) continue;
    const markdownLink = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    const value = unquoteCode(markdownLink ? markdownLink[2] : raw);
    const uri = /^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value);
    const resolvedPath = uri ? '' : resolveRelationTargetPath(record.path, value);
    descriptors.push(Object.freeze({
      raw,
      value,
      label: markdownLink ? markdownLink[1].trim() : '',
      kind: uri ? 'explicit-uri' : resolvedPath ? 'relative-artifact-path' : 'bounded-descriptor',
      resolvedPath,
      relationPath: String(record.path || '')
    }));
  }
  return Object.freeze(descriptors);
}

function loadedTargetMatches(descriptor = {}, relationRecord = {}, records = [], qualifications = new Map()) {
  const out = [];
  for (const record of records) {
    if (record === relationRecord) continue;
    const matchBasis = [];
    if (descriptor.kind === 'relative-artifact-path' && descriptor.resolvedPath) {
      if (String(record.path || '') === descriptor.resolvedPath) matchBasis.push('record-path');
      if (String(record.id || '') === descriptor.resolvedPath) matchBasis.push('record-id');
      if (isAcceptedRepositorySource(record.source) && String(record.source.path || '') === descriptor.resolvedPath) matchBasis.push('accepted-repository-path');
    } else if (descriptor.kind === 'explicit-uri') {
      if (isAcceptedRepositorySource(record.source) && String(record.source.permalink || '') === descriptor.value) matchBasis.push('accepted-repository-permalink');
      if (isAcceptedRepositorySource(record.source) && String(record.source.durableLocator || '') === descriptor.value) matchBasis.push('accepted-repository-durable-locator');
    }
    if (!matchBasis.length) continue;
    out.push(Object.freeze({
      ...overviewItem(record, qualifications.get(record.id)),
      matchBasis: Object.freeze(matchBasis)
    }));
  }
  return Object.freeze(out);
}

function resolveRelationTargetPath(relationPath = '', target = '') {
  const raw = String(target || '').replace(/\\/g, '/').trim();
  if (!raw || raw.startsWith('/') || /^[A-Za-z]:\//.test(raw) || /[?#]/.test(raw)) return '';
  const base = String(relationPath || '').replace(/\\/g, '/').split('/').filter(Boolean);
  if (base.length) base.pop();
  const stack = [...base];
  for (const segment of raw.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (!stack.length) return '';
      stack.pop();
      continue;
    }
    stack.push(segment);
  }
  return stack.join('/');
}

function unquoteCode(value = '') {
  const text = String(value || '').trim();
  return text.startsWith('`') && text.endsWith('`') ? text.slice(1, -1).trim() : text;
}

function overviewItem(record = {}, qualification = {}) {
  return Object.freeze({
    id: String(record.id || record.path || ''),
    path: String(record.path || ''),
    title: String(record.title || record.path || ''),
    summary: String(record.summary || ''),
    schemaId: String(record.schemaId || ''),
    declaredStatus: String(record.lifecycleStatus || ''),
    sourceMode: String(record.sourceMode || ''),
    loadedSourceBasis: loadedSourceBasis(record),
    qualification: qualification || Object.freeze({ state: 'not-evaluated' })
  });
}

function loadedSourceBasis(record = {}) {
  const locator = record.locator && typeof record.locator === 'object'
    ? Object.freeze({ ...record.locator })
    : null;
  const acceptedRepository = isAcceptedRepositorySource(record.source)
    ? Object.freeze({
        repository: String(record.source.repository || ''),
        ref: String(record.source.ref || ''),
        commit: String(record.source.commit || ''),
        path: String(record.source.path || record.path || ''),
        authority: String(record.source.authority || ''),
        remoteFetch: record.source.remoteFetch === true,
        receiptQualification: 'accepted-host-repository-read',
        provenanceQualification: String(record.source.provenanceQualification || ''),
        ...(record.source.permalink ? { permalink: String(record.source.permalink) } : {}),
        ...(record.source.durableLocator ? { durableLocator: String(record.source.durableLocator) } : {})
      })
    : null;
  const suppliedSource = !acceptedRepository && record.source && record.source.adapterId && record.source.adapterId !== 'local'
    ? Object.freeze({ ...record.source })
    : null;
  const locatorClass = acceptedRepository
    ? 'accepted-repository-receipt'
    : locator?.kind === 'node-file'
      ? 'local-file'
      : locator?.kind === 'node-zip-entry'
        ? 'archive-entry'
        : suppliedSource
          ? 'supplied-source-metadata'
          : 'unavailable';
  return Object.freeze({
    sourceMode: String(record.sourceMode || ''),
    locatorClass,
    locator,
    suppliedSource,
    repositorySource: acceptedRepository,
    authority: 'non-authoritative-consumer-evidence',
    repositoryIdentity: acceptedRepository ? 'explicit-accepted-repository-material' : 'unavailable-not-explicitly-qualified',
    stability: acceptedRepository ? (acceptedRepository.commit ? 'pinned-commit' : 'moving-ref') : 'unavailable-not-explicitly-qualified',
    durableLocator: acceptedRepository?.durableLocator || 'unavailable-not-explicitly-qualified',
    publicPermalink: acceptedRepository?.permalink || 'unavailable-not-explicitly-qualified',
    boundary: acceptedRepository
      ? 'Accepted repository-read receipt evidence only. Explicit repository/ref/commit/path and any explicit durable locator/permalink are preserved without remote fetch, URL synthesis, canonical ownership inference, Parent authority, or Source semantic authority.'
      : 'Loaded material source/locator evidence only. Local filesystem/archive location and separately supplied source metadata do not create canonical repository identity, GitHub provenance, Parent authority, Source semantic authority, or a public permalink.'
  });
}

function isAcceptedRepositorySource(source = {}) {
  return Boolean(
    source
    && source.receiptQualification === 'accepted-host-repository-read'
    && /^accepted-host-repository-(?:pinned|moving-ref)$/.test(String(source.provenanceQualification || ''))
    && source.repository
    && source.path
  );
}

function qualifyRecord(record = {}) {
  const runtimeProjection = portableRuntimeValidationContractForSchema(record.schemaId || '');
  const audit = runAudit({
    record,
    markdown: record.markdown || '',
    validationContractOverride: runtimeProjection.state === 'qualified' ? runtimeProjection.compiledContract : null
  });
  const findings = Array.isArray(audit.findings) ? audit.findings : [];
  const errors = findings.filter((finding) => finding.severity === 'error').length;
  const warnings = findings.filter((finding) => finding.severity === 'warning').length;
  const validatorUnavailable = findings.some((finding) => finding.code === 'audit.validator.unavailable');
  const fallbackUsed = Boolean(audit.resolution?.fallbackUsed || audit.artifact?.fallbackUsed);
  const state = errors ? 'blocked' : validatorUnavailable ? 'partial' : fallbackUsed ? 'fallback' : 'exact';
  return Object.freeze({
    state,
    exact: state === 'exact',
    runtimeContract: runtimeProjection.state === 'qualified' ? 'qualified' : 'unavailable',
    errors,
    warnings,
    hasContinuityContext: Boolean(record.hasContinuityContext),
    hasIntegrity: Boolean(record.hasIntegrity)
  });
}

function isDeclaredCurrent(status = '') {
  const value = String(status || '').trim();
  if (!value || TERMINAL_STATUS.test(value)) return false;
  return CURRENT_STATUS.test(value);
}

function taskBlockerSignals(record = {}, qualification = {}) {
  const out = [];
  const status = String(record.lifecycleStatus || '');
  if (/\bblock(?:ed|ing)?\b/i.test(status)) {
    out.push(Object.freeze({
      kind: 'task-status',
      ...overviewItem(record, qualification),
      text: status,
      basis: 'explicit-declared-task-status'
    }));
  }
  for (const dependency of sectionList(record.markdown, 'Dependencies')) {
    if (!hasPositiveBlockingCue(dependency)) continue;
    out.push(Object.freeze({
      kind: 'task-dependency',
      ...overviewItem(record, qualification),
      text: dependency,
      basis: 'explicit-blocking-cue-in-task-dependencies'
    }));
  }
  return out;
}

function sectionText(markdown = '', heading = '') {
  const parsed = parseArtifactMarkdown(markdown || '');
  const text = String(parsed.body?.text || '');
  const lines = text.split('\n');
  const wanted = String(heading || '').trim().toLowerCase();
  const start = lines.findIndex((line) => {
    const match = line.match(/^##\s+(.+?)\s*$/);
    return match && match[1].trim().toLowerCase() === wanted;
  });
  if (start < 0) return '';
  const out = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) break;
    out.push(lines[index]);
  }
  return out.join('\n').trim();
}

function sectionList(markdown = '', heading = '') {
  return Object.freeze(sectionText(markdown, heading)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+\S/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').trim()));
}
