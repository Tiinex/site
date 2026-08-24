import { createPortableLocalDraft } from './draft.create.js';
import { prepareEpistemicMaterialization } from '../materialization/epistemic.plan.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';

export const PORTABLE_ARTIFACT_SET_CREATION_SCHEMA_ID = 'tiinex.portable.artifact-set-creation.v1';

export function createPortableLocalArtifactSet(input = {}, options = {}) {
  const planResult = input.plan?.schema === 'tiinex.portable.epistemic-materialization-plan.v1'
    ? input.plan
    : prepareEpistemicMaterialization(input, options);
  const findings = [...(planResult.findings || [])];
  if (planResult.status !== 'ready') {
    findings.push(portableFinding('error', 'portable.artifact-set.plan.not-ready', 'Artifact-set creation requires a ready epistemic materialization plan.', { planStatus: planResult.status }));
    return finalize('blocked', planResult, [], findings, emptyLineageClosure());
  }

  const created = [];
  const byProposal = new Map();
  for (const proposal of planResult.proposals) {
    const parentRecord = proposal.parentKind === 'proposal'
      ? createdParent(byProposal.get(proposal.parent?.proposalId), proposal.path, proposal.parent?.proposalId)
      : proposal.parentKind === 'loaded-record'
        ? parentForChild(proposal.parent, proposal.path)
        : {};
    if (proposal.parentKind === 'proposal' && !parentRecord.id) {
      findings.push(portableFinding('error', 'portable.artifact-set.parent.proposal-unavailable', 'An earlier proposal did not produce a usable Parent artifact.', { proposalId: proposal.id, parentProposalId: proposal.parent?.proposalId || '' }));
      break;
    }
    const result = createPortableLocalDraft({
      ...(input.materials ? { materials: input.materials } : input),
      schemaId: proposal.schemaId,
      id: proposal.id,
      path: proposal.path,
      title: proposal.title,
      summary: proposal.summary,
      why: proposal.why || proposal.rationale,
      values: proposal.values,
      sections: proposal.sections,
      bodyMarkdown: proposal.bodyMarkdown,
      createdAt: proposal.createdAt || input.createdAt || options.createdAt,
      schemaReferences: proposal.schemaReferences || input.schemaReferences || null,
      transitionType: proposal.creationContract?.transitionType || (proposal.parentKind ? 'continue-from-record' : 'create-artifact'),
      parentRecord
    }, options);
    findings.push(...(result.findings || []));
    const entry = Object.freeze({
      proposalId: proposal.id,
      parentProposalId: proposal.parentKind === 'proposal' ? proposal.parent?.proposalId || '' : '',
      parentLoadedRef: proposal.parentKind === 'loaded-record' ? proposal.parent?.path || proposal.parent?.id || '' : '',
      result
    });
    created.push(entry);
    byProposal.set(proposal.id, entry);
    if (!usableCreation(result)) {
      findings.push(portableFinding('error', 'portable.artifact-set.creation.not-clean', 'Artifact-set creation stopped because one proposal did not produce a clean local artifact.', { proposalId: proposal.id, status: result.status }));
      break;
    }
  }

  const complete = created.length === planResult.proposals.length && created.every((entry) => usableCreation(entry.result));
  const localContinuity = complete && created.some((entry) => entry.result.qualification?.localContinuityUsable === true);
  const status = complete ? localContinuity ? 'created-local-continuity' : 'created-clean' : 'blocked';
  return finalize(status, planResult, created, findings, buildLineageClosure(input, planResult, created));
}

function finalize(status, plan, created, findings, lineageClosure) {
  const summary = summarizePortableFindings(findings);
  return Object.freeze({
    schema: PORTABLE_ARTIFACT_SET_CREATION_SCHEMA_ID,
    status,
    plan,
    artifacts: Object.freeze(created.map((entry, index) => Object.freeze({
      order: index + 1,
      proposalId: entry.proposalId,
      parentProposalId: entry.parentProposalId,
      parentLoadedRef: entry.parentLoadedRef,
      draft: entry.result.draft,
      validation: entry.result.validation,
      qualification: entry.result.qualification
    }))),
    lineageClosure,
    boundary: Object.freeze({
      localOutput: true,
      sourceMutation: false,
      remoteWrite: false,
      parentFromLoadedOrEarlierProposalOnly: true,
      schemaSelectionValidatedThroughSharedRegistry: true
    }),
    findings: Object.freeze(findings),
    findingSummary: summary
  });
}

function createdParent(entry, childPath = '', proposalId = '') {
  const draft = entry?.result?.draft;
  if (!draft || !usableCreation(entry.result)) return {};
  const parsed = safeParse(draft.markdown);
  const currentSchema = parsed?.envelope?.current?.schema || {};
  return parentForChild({
    id: draft.id || proposalId,
    path: draft.path,
    kind: draft.schemaId,
    schemaId: draft.schemaId,
    createdAt: draft.createdAt,
    schemaReferenceAuthority: currentSchema.target ? {
      schemaId: currentSchema.id || draft.schemaId,
      preferredTarget: currentSchema.target,
      exactTargets: [currentSchema.target],
      resolutionState: 'qualified',
      evidence: { source: 'earlier-proposal-rendered-current-schema-reference' }
    } : null,
    boundary: 'portable local artifact set; no remote source provenance inferred',
    sourceMode: draft.sourceMode,
    source: null,
    markdown: String(draft.markdown || ''),
    integrity: parsed?.integrity || null
  }, childPath);
}

function parentForChild(parent = {}, childPath = '') {
  void childPath;
  return Object.freeze({ ...parent, continuationTrace: '' });
}

function usableCreation(result = {}) {
  return Boolean(result?.draft && (result.status === 'created-clean' || result.qualification?.localContinuityUsable === true));
}

function safeParse(markdown = '') {
  try { return parseArtifactMarkdown(markdown); }
  catch { return null; }
}


function buildLineageClosure(input = {}, plan = {}, created = []) {
  const material = normalizePortableInput(input.materials || input);
  const records = (material.records || []).filter((record) => record.path && record.markdown && (record.hasContinuityContext || record.schemaId || String(record.kind || '').startsWith('tiinex.')));
  const lineage = resolveLineage(records, { depth: 'portable-artifact-set-closure' });
  const nodeById = new Map((lineage.nodes || []).map((node) => [node.id, node]));
  const nodesByPath = new Map((lineage.nodes || []).map((node) => [String(node.path || ''), node]));
  const selected = new Set();
  const queue = [];
  for (const proposal of plan.proposals || []) {
    if (proposal.parentKind !== 'loaded-record') continue;
    const node = nodesByPath.get(String(proposal.parent?.path || '')) || nodeById.get(String(proposal.parent?.id || ''));
    if (node) queue.push(node.id);
  }
  while (queue.length) {
    const id = queue.shift();
    if (!id || selected.has(id)) continue;
    selected.add(id);
    for (const edge of lineage.edges || []) if (edge.kind === 'parent' && edge.to === id && edge.from) queue.push(edge.from);
  }
  const context = [...selected].map((id) => nodeById.get(id)).filter(Boolean).map((node) => Object.freeze({
    id: node.id,
    path: node.path,
    schemaId: node.schemaId,
    markdown: String(node.record?.markdown || ''),
    trace: String(node.trace || ''),
    parentSchemaId: String(node.parentSchemaId || ''),
    sourceMode: String(node.sourceMode || ''),
    boundary: String(node.boundary || '')
  })).sort((a, b) => a.path.localeCompare(b.path));
  const createdByProposal = new Map(created.map((entry) => [entry.proposalId, entry.result?.draft]));
  const edges = [];
  for (const edge of lineage.edges || []) {
    if (edge.kind !== 'parent' || !edge.from || !edge.to || !selected.has(edge.to) || !selected.has(edge.from)) continue;
    const parent = nodeById.get(edge.from);
    const child = nodeById.get(edge.to);
    if (parent?.path && child?.path) edges.push(Object.freeze({ childPath: child.path, parentPath: parent.path, parentKind: 'loaded-context' }));
  }
  for (const proposal of plan.proposals || []) {
    const child = createdByProposal.get(proposal.id);
    if (!child?.path) continue;
    if (proposal.parentKind === 'proposal') {
      const parent = createdByProposal.get(proposal.parent?.proposalId);
      if (parent?.path) edges.push(Object.freeze({ childPath: child.path, parentPath: parent.path, parentKind: 'created-in-set' }));
    } else if (proposal.parentKind === 'loaded-record' && proposal.parent?.path) {
      edges.push(Object.freeze({ childPath: child.path, parentPath: proposal.parent.path, parentKind: 'loaded-context' }));
    }
  }
  return Object.freeze({
    schema: 'tiinex.portable.lineage-closure.v1',
    context: Object.freeze(context),
    edges: Object.freeze(uniqueEdges(edges)),
    boundary: 'Minimum loaded Parent closure for changed artifacts. Context remains unchanged and carries exact loaded Markdown bytes.'
  });
}
function emptyLineageClosure() { return Object.freeze({ schema: 'tiinex.portable.lineage-closure.v1', context: Object.freeze([]), edges: Object.freeze([]), boundary: 'No ready artifact plan.' }); }
function uniqueEdges(edges = []) { const map = new Map(); for (const edge of edges) map.set(`${edge.childPath}\0${edge.parentPath}`, edge); return [...map.values()].sort((a, b) => `${a.childPath}\0${a.parentPath}`.localeCompare(`${b.childPath}\0${b.parentPath}`)); }
