import { relevantLineageIssues } from './grounding.readiness.support.js';

const MAX_ITEMS = 12;

export function projectColdStartContinuity({ mode = '', lineage = {}, routeRecordIds = new Set(), authority = {}, material = {} } = {}) {
  if (mode !== 'routed-handoff-package') return Object.freeze({
    state: 'not-applicable',
    proof: emptyProof(),
    blockingIssues: Object.freeze([]),
    recovery: Object.freeze({ state: 'not-applicable' }),
    boundary: continuityBoundary()
  });

  const ancestorIds = ancestorLineageCone(lineage, routeRecordIds);
  const nodeById = new Map((lineage.nodes || []).map((node) => [node.id, node]));
  const parentEdges = (lineage.edges || []).filter((edge) => edge.kind === 'parent' && ancestorIds.has(edge.to));
  const issues = relevantLineageIssues(lineage, ancestorIds);
  const rootNodes = [...ancestorIds]
    .map((id) => nodeById.get(id))
    .filter(Boolean)
    .filter((node) => !hasResolvedParent(parentEdges, node.id));
  const qualifiedRoots = rootNodes.filter(isQualifiedSemanticRoot);
  const apparentRoots = rootNodes.filter((node) => !isQualifiedSemanticRoot(node));
  const rootIssues = apparentRoots.map((node) => Object.freeze({
    code: 'continuity.root.unqualified',
    severity: 'warning',
    nodeId: node.id || '',
    target: String(node.trace || ''),
    message: node.trace
      ? 'A loaded apparent root still declares a Parent that is not qualified in the current continuity proof.'
      : 'A loaded root lacks the continuity/integrity evidence required for compact cold-start root qualification.'
  }));
  const blockingIssues = dedupe([...issues, ...rootIssues]);
  const qualified = ancestorIds.size > 0 && blockingIssues.length === 0 && qualifiedRoots.length > 0;
  const firstIssue = blockingIssues.find((item) => String(item.target || '').trim()) || null;
  const recovery = qualified ? Object.freeze({ state: 'not-required' }) : projectExactRecovery(firstIssue || {}, authority, nodeById);
  const losses = projectNonCriticalLosses(material);

  return Object.freeze({
    state: qualified ? 'qualified' : 'unproven',
    proof: Object.freeze({
      schema: 'tiinex.portable.cold-start-continuity-proof.v1',
      state: qualified ? 'qualified' : 'unproven',
      basis: 'declared-parent-only + loaded edge qualification + qualified semantic root',
      routeRecordIds: Object.freeze([...routeRecordIds].slice(0, MAX_ITEMS)),
      ancestorRecordsChecked: ancestorIds.size,
      parentEdgesChecked: parentEdges.length,
      roots: Object.freeze(rootNodes.slice(0, MAX_ITEMS).map(rootSummary)),
      qualifiedRoots: Object.freeze(qualifiedRoots.slice(0, MAX_ITEMS).map(rootSummary)),
      bodiesProjected: 0,
      compactReceiptOnly: true,
      filenameDimensionsUsed: false,
      carrierDimensionsUsed: false
    }),
    blockingIssues: Object.freeze(blockingIssues.slice(0, MAX_ITEMS)),
    blockingIssuesOmitted: Math.max(0, blockingIssues.length - MAX_ITEMS),
    recovery,
    losses,
    boundary: continuityBoundary()
  });
}

export function acceptedRecoveryMaterial(value = {}) {
  const acceptance = value?.result || value || {};
  if (!acceptance || String(acceptance.status || '') !== 'accepted') return Object.freeze({
    files: Object.freeze([]),
    findings: Object.freeze(acceptance && Object.keys(acceptance).length ? [Object.freeze({
      severity: 'warning',
      code: 'portable.grounding.recovery.unaccepted',
      message: 'Recovery input was supplied but is not an accepted host-action receipt result, so it was not used as lineage material.',
      source: 'tiinex.portable.grounding-readiness.v1'
    })] : [])
  });
  const files = [];
  for (const response of Array.isArray(acceptance.providerResponses) ? acceptance.providerResponses : []) {
    for (const file of Array.isArray(response?.files) ? response.files : []) files.push(file);
  }
  for (const file of Array.isArray(acceptance.material?.files) ? acceptance.material.files : []) files.push(file);
  return Object.freeze({ files: Object.freeze(files), findings: Object.freeze([]) });
}

export function projectNonCriticalLosses(material = {}) {
  const assets = Array.isArray(material.assets) ? material.assets : [];
  const unavailable = assets.filter((asset) => asset?.previewState === 'metadata-only' || asset?.contentAvailable === false);
  return Object.freeze({
    state: unavailable.length ? 'degraded' : 'none',
    blocking: false,
    items: Object.freeze(unavailable.slice(0, MAX_ITEMS).map((asset) => Object.freeze({
      path: String(asset.path || ''),
      kind: String(asset.kind || 'asset'),
      state: 'unavailable',
      necessity: 'non-critical'
    }))),
    itemsOmitted: Math.max(0, unavailable.length - MAX_ITEMS),
    boundary: 'Unavailable non-lineage assets remain visible degradation only. They do not block cold-start act-readiness unless another authoritative relation makes them required grounding material.'
  });
}

function ancestorLineageCone(lineage = {}, startIds = new Set()) {
  const all = new Set((lineage.nodes || []).map((node) => node.id));
  const parents = new Map();
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || !edge.from || !edge.to) continue;
    if (['missing', 'mismatch'].includes(String(edge.status || ''))) continue;
    if (!parents.has(edge.to)) parents.set(edge.to, []);
    parents.get(edge.to).push(edge.from);
  }
  const starts = [...startIds].filter((id) => all.has(id));
  const out = new Set(starts);
  const queue = [...starts];
  while (queue.length) {
    const id = queue.shift();
    for (const parentId of parents.get(id) || []) {
      if (out.has(parentId)) continue;
      out.add(parentId);
      queue.push(parentId);
    }
  }
  return out;
}

function hasResolvedParent(edges = [], nodeId = '') {
  return edges.some((edge) => edge.to === nodeId && edge.from && !['missing', 'mismatch'].includes(String(edge.status || '')));
}

function isQualifiedSemanticRoot(node = {}) {
  return Boolean(node && !String(node.trace || '').trim() && node.hasContinuityContext && node.hasIntegrity);
}

function rootSummary(node = {}) {
  return Object.freeze({
    id: String(node.id || ''),
    path: String(node.path || ''),
    title: String(node.title || ''),
    schemaId: String(node.schemaId || ''),
    declaresParent: Boolean(String(node.trace || '').trim()),
    hasContinuityContext: Boolean(node.hasContinuityContext),
    hasIntegrity: Boolean(node.hasIntegrity)
  });
}

function projectExactRecovery(issue = {}, authority = {}, nodeById = new Map()) {
  const exactTarget = String(issue?.target || '').trim();
  if (!exactTarget) return Object.freeze({
    state: 'operator-required',
    target: '',
    whyRequired: 'Cold-start Parent continuity is unproven and no exact machine-recoverable target was available from the blocking lineage evidence.',
    allowedScope: 'Resolve only the declared blocking Parent/continuity evidence; do not search for semantically similar substitutes.',
    operatorRequest: operatorRequest('', authority)
  });

  const sourceNode = nodeById.get(String(issue?.nodeId || '')) || null;
  const github = parseGithubBlob(exactTarget) || acceptedPinnedRelativeRepositoryTarget(exactTarget, sourceNode);
  const repositoryBinding = authority?.capabilities?.discovery?.profile?.toolBindings?.repositoryRead?.selected || null;
  if (github && repositoryBinding) {
    return Object.freeze({
      state: 'host-action-available',
      target: exactTarget,
      whyRequired: 'This exact declared Parent is required to prove cold-start continuity to a qualified root.',
      allowedScope: 'Read only the exact declared or deterministically resolved repository path/ref. Do not broaden search or substitute similar material.',
      ...(github.basis ? { resolutionBasis: github.basis } : {}),
      hostAction: Object.freeze({
        operation: 'plan-host-action',
        action: 'repository-read',
        request: Object.freeze({
          repository: github.repository,
          ref: github.ref,
          path: github.path,
          purpose: 'recover exact declared Parent for cold-start continuity proof',
          nextOperation: 'ground'
        }),
        selectedTool: Object.freeze({
          id: String(repositoryBinding.tool?.id || ''),
          name: String(repositoryBinding.tool?.name || '')
        })
      }),
      resume: resumeGround(authority)
    });
  }

  return Object.freeze({
    state: 'operator-required',
    target: exactTarget,
    whyRequired: 'This exact declared Parent is required to prove cold-start continuity to a qualified root, and no currently bound exact repository-read capability can supply it.',
    allowedScope: 'Provide the exact declared target bytes or an accepted exact-read receipt. Do not substitute semantically similar material or widen origin scope.',
    operatorRequest: operatorRequest(exactTarget, authority),
    resume: resumeGround(authority)
  });
}

function parseGithubBlob(value = '') {
  const match = String(value || '').match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/([^/]+)\/(.+)$/i);
  if (!match) return null;
  return Object.freeze({ repository: match[1], ref: match[2], path: match[3], basis: 'declared-github-blob-target' });
}

function acceptedPinnedRelativeRepositoryTarget(target = '', node = {}) {
  const raw = String(target || '').trim();
  if (!raw || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('/')) return null;
  const source = node?.record?.source || {};
  if (source.receiptQualification !== 'accepted-host-repository-read') return null;
  if (source.provenanceQualification !== 'accepted-host-repository-pinned') return null;
  const repository = String(source.repository || '').trim();
  const ref = String(source.commit || source.ref || '').trim();
  const sourcePath = String(source.path || '').trim();
  const path = resolveRelativeRepositoryPath(sourcePath, raw);
  if (!repository || !ref || !path) return null;
  return Object.freeze({
    repository,
    ref,
    path,
    basis: 'accepted-pinned-parent-source-relative-resolution'
  });
}

function resolveRelativeRepositoryPath(sourcePath = '', target = '') {
  const base = String(sourcePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const raw = String(target || '').replace(/\\/g, '/').trim();
  if (!base || !raw || raw.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(raw)) return '';
  const parts = base.split('/').filter(Boolean);
  parts.pop();
  for (const segment of raw.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (!parts.length) return '';
      parts.pop();
      continue;
    }
    parts.push(segment);
  }
  return parts.join('/');
}

function operatorRequest(target = '', authority = {}) {
  return Object.freeze({
    role: 'Transport Operator',
    target: String(target || ''),
    request: target
      ? 'Provide exactly the declared Parent material (or an accepted host exact-read receipt for it) so Tooling can resume the same ground operation.'
      : 'Provide the exact missing Parent/continuity material identified by Tooling so the same ground operation can resume.',
    semanticJudgmentRequired: false,
    resume: resumeGround(authority)
  });
}

function resumeGround(authority = {}) {
  return Object.freeze({
    operation: 'ground',
    route: String(authority?.selectedRoute?.pointerPath || ''),
    recoveryOption: '--recovery <accepted-host-receipt.json>',
    note: 'Resume the same ground command after accept-host-receipt; recovered material remains candidate input until lineage identity/integrity qualification succeeds.'
  });
}

function emptyProof() {
  return Object.freeze({
    schema: 'tiinex.portable.cold-start-continuity-proof.v1',
    state: 'not-applicable',
    basis: 'not-applicable',
    routeRecordIds: Object.freeze([]),
    ancestorRecordsChecked: 0,
    parentEdgesChecked: 0,
    roots: Object.freeze([]),
    qualifiedRoots: Object.freeze([]),
    bodiesProjected: 0,
    compactReceiptOnly: true,
    filenameDimensionsUsed: false,
    carrierDimensionsUsed: false
  });
}

function continuityBoundary() {
  return 'Cold-start continuity is proven only through declared Parent topology and qualified loaded evidence. Apparent roots with an unavailable declared Parent are not closure; full ancestor bodies are not projected by this proof; fetched/recovered representations remain candidate material until independently qualified.';
}

function dedupe(items = []) {
  const map = new Map();
  for (const item of items) {
    const key = `${item.code || ''}:${item.nodeId || ''}:${item.target || ''}`;
    if (!map.has(key)) map.set(key, item);
  }
  return [...map.values()];
}
