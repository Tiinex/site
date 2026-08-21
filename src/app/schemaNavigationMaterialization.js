import { normalizeExplicitFileRefs } from '../sources/source.explicitTargets.js';
import { qualifySchemaRecordRecoveryRepresentation } from './schemaSourceRecovery.js';
import { qualifySchemaReadingContractMarkdown } from './schemaReadingContractQualification.js';

export function qualifySchemaMaterializationReuse(records = [], schemaRecord = {}, schemaId = '') {
  const collisions = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const evidence = materializationCollisionEvidence(record, schemaRecord);
    if (!evidence.dimensions.length) continue;
    let semanticQualification = null;
    let representationQualification = null;
    let reusable = false;
    let readFailure = null;
    try {
      const requiredRepresentation = String(schemaRecord?.schemaNavigation?.representationIdentity || '');
      if (requiredRepresentation) {
        representationQualification = qualifySchemaRecordRecoveryRepresentation(record);
        if (representationQualification.state !== 'qualified' || representationQualification.identity !== requiredRepresentation) {
          collisions.push(Object.freeze({ index, id: String(record?.id || ''), dimensions: Object.freeze(evidence.dimensions), reusable: false, representationQualification, semanticQualification: null, readFailure: null }));
          continue;
        }
      }
      semanticQualification = qualifySchemaReadingContractMarkdown(record?.markdown || '', schemaId);
      reusable = semanticQualification.state === 'qualified';
    } catch (exception) {
      readFailure = exception;
    }
    collisions.push(Object.freeze({ index, id: String(record?.id || ''), dimensions: Object.freeze(evidence.dimensions), reusable, representationQualification, semanticQualification, readFailure }));
  }

  const reusable = collisions.filter((candidate) => candidate.reusable);
  if (reusable.length === 1) return Object.freeze({ state: 'qualified', index: reusable[0].index, collisions: Object.freeze(collisions), reusable: Object.freeze(reusable) });
  if (reusable.length > 1) return Object.freeze({ state: 'ambiguous', index: -1, collisions: Object.freeze(collisions), reusable: Object.freeze(reusable) });
  const representationBackedIdentity = Boolean(schemaRecord?.schemaNavigation?.representationIdentity);
  const storageConflicts = collisions.filter((candidate) => candidate.dimensions.includes('id') || (!representationBackedIdentity && candidate.dimensions.includes('path')));
  if (storageConflicts.length) return Object.freeze({ state: 'conflict', index: -1, collisions: Object.freeze(collisions), reusable: Object.freeze([]), storageConflicts: Object.freeze(storageConflicts) });
  return Object.freeze({ state: 'materialize', index: -1, collisions: Object.freeze(collisions), reusable: Object.freeze([]) });
}

export function coalesceRecoveredGithubSchemaSource(sources = [], recovered = {}, targetPath = '') {
  const list = Array.isArray(sources) ? sources.slice() : [];
  const targetBoundary = exactGithubSchemaBoundary(recovered, targetPath);
  if (targetBoundary.state !== 'qualified') return { ok: false, reason: 'github-recovered-source-boundary-unavailable', qualification: targetBoundary, source: null, sources: list };
  const { repo, ref, rootPath, path } = targetBoundary;
  const compatible = [];
  for (let index = 0; index < list.length; index += 1) {
    const qualification = compatibleGithubSchemaBoundary(list[index], { repo, ref, rootPath });
    if (qualification.state === 'qualified') compatible.push(index);
  }
  if (compatible.length > 1) return { ok: false, reason: 'github-source-boundary-ambiguous', matchingIndices: compatible.slice(), source: null, sources: list };
  const compatibleIndex = compatible.length === 1 ? compatible[0] : -1;
  const existing = compatibleIndex >= 0 ? list[compatibleIndex] : null;
  const explicitFileRefs = normalizeExplicitFileRefs([...(existing?.explicitFileRefs || existing?.config?.explicitFileRefs || []), path]);
  const id = existing?.id || `github-exact:${repo.toLowerCase()}:${ref || 'default'}:${rootPath}`;
  const source = Object.assign({}, existing || {}, recovered, {
    id,
    label: existing?.label || recovered.label || repo,
    kind: existing?.kind || 'github-tree',
    adapterId: 'github',
    sourceKind: 'github.repo',
    repo,
    repository: repo,
    ref,
    rootPath,
    sourceBacked: true,
    originReferenceSource: false,
    recoveryOnly: false,
    loadable: true,
    closeable: existing?.closeable !== false,
    repoDiscovery: Boolean(existing?.repoDiscovery),
    issueDiscovery: Boolean(existing?.issueDiscovery),
    issueUrls: existing?.issueUrls || existing?.config?.issueUrls || '',
    explicitFileRefs,
    config: Object.assign({}, existing?.config || {}, recovered.config || {}, { repo, ref, rootPath, issueUrls: existing?.issueUrls || existing?.config?.issueUrls || '', explicitFileRefs: explicitFileRefs.slice() }),
    requestedSurfaces: Object.assign({}, existing?.requestedSurfaces || {}, {
      explicitFiles: Object.assign({}, existing?.requestedSurfaces?.explicitFiles || {}, { requested: true, requestedCount: explicitFileRefs.length })
    }),
    boundary: existing?.boundary || 'configured exact-target GitHub source; broad discovery remains explicit'
  });
  delete source.path;
  delete source.permalink;
  if (compatibleIndex >= 0) list[compatibleIndex] = source;
  else {
    if (list.some((item) => String(item?.id || '') === String(source.id || ''))) return { ok: false, reason: 'github-source-id-conflict', source: null, sources: list };
    list.push(source);
  }
  return { ok: true, source, sources: list };
}

function materializationCollisionEvidence(record = {}, schemaRecord = {}) {
  const dimensions = [];
  if (String(record?.id || '') && String(record.id) === String(schemaRecord?.id || '')) dimensions.push('id');
  const leftPath = normalizePath(record?.path || '');
  const rightPath = normalizePath(schemaRecord?.path || '');
  if (leftPath && rightPath && leftPath === rightPath) dimensions.push('path');
  try {
    const leftRepresentation = qualifySchemaRecordRecoveryRepresentation(record);
    const rightRepresentation = qualifySchemaRecordRecoveryRepresentation(schemaRecord);
    const leftSchemaId = normalizeSchemaId(recordSchemaId(record) || record?.schemaNavigation?.schemaId);
    const rightSchemaId = normalizeSchemaId(recordSchemaId(schemaRecord) || schemaRecord?.schemaNavigation?.schemaId);
    if (leftRepresentation.state === 'qualified' && rightRepresentation.state === 'qualified' && leftRepresentation.identity === rightRepresentation.identity && leftSchemaId === rightSchemaId) dimensions.push('representation');
  } catch {
    // Collision discovery is bounded evidence only; semantic reuse qualification owns material read failures.
  }
  return Object.freeze({ dimensions });
}

function compatibleGithubSchemaBoundary(source = {}, target = {}) {
  if (String(source.adapterId || '').toLowerCase() !== 'github') return Object.freeze({ state: 'unavailable', reason: 'not-github-source' });
  if (source.originReferenceSource === true || source.recoveryOnly === true) return Object.freeze({ state: 'unavailable', reason: 'non-coalescing-source-boundary' });
  const repo = qualifyExactSourceDimension([source.repo, source.repository, source.config?.repo]);
  const ref = qualifyExactSourceDimension([source.ref, source.config?.ref]);
  const root = qualifyExactSourceDimension([source.rootPath, source.config?.rootPath]);
  if (repo.state !== 'qualified') return Object.freeze({ state: repo.state, reason: `github-source-repo-${repo.state}`, repo, ref, root });
  if (ref.state !== 'qualified') return Object.freeze({ state: ref.state, reason: `github-source-ref-${ref.state}`, repo, ref, root });
  if (root.state === 'ambiguous') return Object.freeze({ state: 'ambiguous', reason: 'github-source-root-ambiguous', repo, ref, root });
  const rootPath = root.state === 'qualified' ? schemaSourceRootPath('', root.value) : '.';
  const matches = repo.value === String(target.repo || '') && ref.value === String(target.ref || '') && rootPath === String(target.rootPath || '');
  return Object.freeze({ state: matches ? 'qualified' : 'unavailable', reason: matches ? '' : 'github-source-boundary-mismatch', repo, ref, root, rootPath });
}

function exactGithubSchemaBoundary(source = {}, targetPath = '') {
  if (String(source.adapterId || '').toLowerCase() !== 'github') return Object.freeze({ state: 'unavailable', reason: 'not-github-source' });
  const repo = qualifyExactSourceDimension([source.repo, source.repository, source.config?.repo]);
  const ref = qualifyExactSourceDimension([source.ref, source.config?.ref]);
  const configuredRoot = qualifyExactSourceDimension([source.rootPath, source.config?.rootPath]);
  if (repo.state !== 'qualified') return Object.freeze({ state: repo.state, reason: `github-recovered-repo-${repo.state}`, repo, ref, configuredRoot });
  if (ref.state !== 'qualified') return Object.freeze({ state: ref.state, reason: `github-recovered-ref-${ref.state}`, repo, ref, configuredRoot });
  if (configuredRoot.state === 'ambiguous') return Object.freeze({ state: 'ambiguous', reason: 'github-recovered-root-ambiguous', repo, ref, configuredRoot });
  const path = normalizePath(targetPath || source.path || '');
  if (!path) return Object.freeze({ state: 'unavailable', reason: 'github-recovered-path-unavailable', repo, ref, configuredRoot });
  const rootPath = schemaSourceRootPath(path, configuredRoot.state === 'qualified' ? configuredRoot.value : '');
  return Object.freeze({ state: 'qualified', repo: repo.value, ref: ref.value, rootPath, path, repoQualification: repo, refQualification: ref, rootQualification: configuredRoot });
}

function qualifyExactSourceDimension(values = []) {
  const asserted = [];
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const raw = String(value);
    if (!raw || asserted.includes(raw)) continue;
    asserted.push(raw);
  }
  if (asserted.length === 1) return Object.freeze({ state: 'qualified', value: asserted[0], values: Object.freeze(asserted) });
  if (asserted.length > 1) return Object.freeze({ state: 'ambiguous', value: '', values: Object.freeze(asserted) });
  return Object.freeze({ state: 'unavailable', value: '', values: Object.freeze([]) });
}

function schemaSourceRootPath(path = '', configuredRoot = '') {
  const root = normalizePath(configuredRoot);
  if (root && root !== '.') return root;
  const clean = normalizePath(path);
  if (clean === '.topics' || clean.startsWith('.topics/')) return '.topics';
  const parts = clean.split('/').filter(Boolean);
  return parts.length > 1 ? parts[0] : '.';
}

function recordSchemaId(record = {}) { return record?.schemaId || record?.currentSchemaId || ''; }
function normalizeSchemaId(value = '') { return String(value || '').replace(/^Current Schema:\s*/i, '').replace(/^\[([^\]]+)\]\([^)]*\)$/u, '$1').trim(); }
function normalizePath(value = '') {
  const raw = String(value || '').replace(/\\/g, '/').trim();
  if (!raw) return '';
  const out = [];
  for (const part of raw.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}
