import { listCreatableArtifactSchemas, buildArtifactCreationContract } from '../../../schemas/creation.contracts.js';
import { resolveLineage } from '../../../lineage/lineage.resolve.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { planPortableArtifact } from '../schema/schema.guide.js';
import { indexPortableLoadedParentRecords, projectPortableLoadedParentRecord, resolvePortableLoadedParentReference } from './loaded.parent.js';

export const PORTABLE_EPISTEMIC_PLAN_SCHEMA_ID = 'tiinex.portable.epistemic-materialization-plan.v1';

export function prepareEpistemicMaterialization(input = {}, options = {}) {
  const material = normalizePortableInput(input.materials || input);
  const proposals = normalizeProposals(input.proposals || input.proposal || []);
  const artifactRecords = material.records.filter(isArtifactRecord);
  const lineage = resolveLineage(artifactRecords, { depth: 'portable-epistemic-plan' });
  const loadedIndex = indexPortableLoadedParentRecords(artifactRecords);
  const proposalIds = new Set(proposals.map((proposal) => proposal.id));
  const candidateSchemas = listCreatableArtifactSchemas().map((contract) => Object.freeze({
    schemaId: contract.target.schemaId,
    label: contract.target.label,
    role: contract.target.role,
    transitionType: contract.transitionType,
    status: contract.status,
    binding: contract.target.binding
  }));
  const parentCandidates = lineageParentCandidates(lineage);
  const findings = [...(material.findings || []), ...(lineage.findings || []).map((finding) => portableFinding(finding.severity, finding.code, finding.message, finding))];

  if (!proposals.length) {
    findings.push(portableFinding('info', 'portable.materialization.proposal.required', 'No artifact proposal was supplied. The LLM should form a bounded proposal from the dialogue before materialization.', { qualification: 'epistemic-planning' }));
    return finalize({
      status: 'needs-proposal',
      material: { ...material, records: artifactRecords },
      proposals: [],
      candidateSchemas,
      parentCandidates,
      lineage,
      findings,
      clarificationNeeds: [{ code: 'proposal', statement: 'Declare what knowledge should be preserved, in which implemented schema, and whether it is a new root or continues an explicit loaded/proposed Parent.' }]
    });
  }

  const planned = proposals.map((proposal, index) => planProposal({
    proposal,
    index,
    proposals,
    proposalIds,
    loadedIndex,
    material,
    options
  }));
  findings.push(...planned.flatMap((entry) => entry.findings));
  const clarificationNeeds = planned.flatMap((entry) => entry.clarificationNeeds.map((need) => ({ proposalId: entry.id, ...need })));
  const status = planned.some((entry) => entry.status === 'blocked')
    ? 'blocked'
    : clarificationNeeds.length
      ? 'needs-clarification'
      : 'ready';

  return finalize({ status, material: { ...material, records: artifactRecords }, proposals: planned, candidateSchemas, parentCandidates, lineage, findings, clarificationNeeds });
}

function planProposal({ proposal, index, proposals, proposalIds, loadedIndex, material, options }) {
  const findings = [];
  const clarificationNeeds = [];
  const contract = buildArtifactCreationContract({ schemaId: proposal.schemaId, transitionType: proposal.parentRef ? 'continue-from-record' : 'create-artifact' });
  const artifactPlan = planPortableArtifact({ ...material, schemaId: proposal.schemaId, task: proposal.parentRef ? 'continue' : 'create', values: proposal.values || {}, inputs: proposal.values || {} }, options);
  const parent = resolveParentReference(proposal.parentRef, { loadedIndex, proposalIds, proposalIndex: index, proposals });

  if (!proposal.schemaId) {
    findings.push(portableFinding('error', 'portable.materialization.schema.required', 'Each proposal must declare an implemented schema id; schema meaning is never inferred by the writer.', { proposalId: proposal.id }));
    clarificationNeeds.push({ code: 'schema', statement: 'Choose one implemented schema using the dialogue purpose and schema companion guidance.' });
  } else if (contract.status !== 'ready') {
    findings.push(...(contract.findings || []).map((finding) => portableFinding(finding.severity, finding.code, finding.message, { ...finding, proposalId: proposal.id })));
  }

  if (proposal.parentRef && parent.status !== 'resolved') {
    findings.push(portableFinding('error', parent.code, parent.message, { proposalId: proposal.id, parentRef: proposal.parentRef, candidates: parent.candidates || [] }));
    clarificationNeeds.push({ code: 'parent', statement: 'Select one exact loaded artifact or one earlier proposal as Parent. Do not infer a Parent from title similarity, Origin, or basename.' });
  }
  if (!proposal.parentRef && proposal.mode === 'continue') {
    findings.push(portableFinding('error', 'portable.materialization.parent.required', 'Continuation mode requires an explicit Parent reference.', { proposalId: proposal.id }));
    clarificationNeeds.push({ code: 'parent', statement: 'Declare the exact Parent or change the proposal to a new lineage root.' });
  }
  if (proposal.mode === 'root' && proposal.parentRef) findings.push(portableFinding('error', 'portable.materialization.root.parent-conflict', 'A root proposal must not declare a Parent.', { proposalId: proposal.id }));
  if (!proposal.rationale) {
    findings.push(portableFinding('warning', 'portable.materialization.rationale.missing', 'The proposal should state why this artifact is warranted by the dialogue or loaded material.', { proposalId: proposal.id, fixability: 'manual' }));
    clarificationNeeds.push({ code: 'rationale', statement: 'State the smallest evidence-grounded reason this artifact should exist.' });
  }
  if (!proposal.evidenceRefs.length) {
    findings.push(portableFinding('warning', 'portable.materialization.evidence-refs.missing', 'The proposal should bind its rationale to dialogue turns or loaded artifact paths.', { proposalId: proposal.id, fixability: 'manual' }));
    clarificationNeeds.push({ code: 'evidence', statement: 'Reference the dialogue turn(s) or loaded artifact path(s) that support the proposal.' });
  }
  if (artifactPlan.plan.missingInputs.length) {
    findings.push(portableFinding('warning', 'portable.materialization.inputs.missing', 'The proposed artifact is missing schema-required authoring inputs.', { proposalId: proposal.id, schemaId: proposal.schemaId, missingInputs: artifactPlan.plan.missingInputs }));
    clarificationNeeds.push({ code: 'inputs', statement: `Obtain only the missing schema inputs: ${artifactPlan.plan.missingInputs.join(', ')}.` });
  }

  const blocking = findings.some((finding) => finding.severity === 'error');
  return Object.freeze({
    id: proposal.id,
    order: index + 1,
    status: blocking ? 'blocked' : clarificationNeeds.length ? 'needs-clarification' : 'ready',
    mode: proposal.parentRef ? 'continue-lineage' : 'new-lineage-root',
    schemaId: proposal.schemaId,
    path: proposal.path,
    title: proposal.title,
    summary: proposal.summary,
    why: proposal.why,
    values: proposal.values,
    sections: proposal.sections,
    bodyMarkdown: proposal.bodyMarkdown,
    createdAt: proposal.createdAt,
    rationale: proposal.rationale,
    evidenceRefs: proposal.evidenceRefs,
    parentRef: proposal.parentRef,
    parent: parent.status === 'resolved' ? parent.parent : null,
    parentKind: parent.status === 'resolved' ? parent.kind : '',
    creationContract: contract,
    artifactPlan: artifactPlan.plan,
    clarificationNeeds: Object.freeze(clarificationNeeds),
    findings: Object.freeze(findings)
  });
}

function normalizeProposals(value) {
  const list = Array.isArray(value) ? value : value && typeof value === 'object' ? [value] : [];
  return Object.freeze(list.map((raw, index) => {
    const id = clean(raw.id || `artifact-${index + 1}`);
    return Object.freeze({
      id,
      mode: clean(raw.mode || ''),
      schemaId: clean(raw.schemaId || raw.schema || ''),
      parentRef: exact(raw.parentRef ?? raw.parent ?? ''),
      path: clean(raw.path || `lineage/${String(index + 1).padStart(3, '0')}-${slug(id)}.trace.md`),
      title: clean(raw.title || ''),
      summary: clean(raw.summary || ''),
      why: clean(raw.why || raw.rationale || ''),
      values: clone(raw.values || {}),
      sections: clone(raw.sections || {}),
      bodyMarkdown: String(raw.bodyMarkdown || ''),
      createdAt: clean(raw.createdAt || ''),
      rationale: clean(raw.rationale || ''),
      evidenceRefs: Object.freeze(normalizeStrings(raw.evidenceRefs || raw.evidence || []))
    });
  }));
}

function resolveParentReference(ref, { loadedIndex, proposalIds, proposalIndex, proposals }) {
  if (!ref) return { status: 'none', kind: 'none', parent: null };
  const reference = exact(ref);
  const proposalRef = reference.startsWith('proposal:') ? reference.slice('proposal:'.length) : proposalIds.has(reference) ? reference : '';
  if (proposalRef) {
    const targetIndex = proposals.findIndex((proposal) => proposal.id === proposalRef);
    if (targetIndex < 0) return { status: 'missing', code: 'portable.materialization.parent.proposal-missing', message: 'The Parent proposal does not exist.', candidates: [] };
    if (targetIndex >= proposalIndex) return { status: 'invalid-order', code: 'portable.materialization.parent.proposal-order', message: 'A proposal may only continue an earlier proposal in the same artifact set.', candidates: [proposalRef] };
    return { status: 'resolved', kind: 'proposal', parent: Object.freeze({ proposalId: proposalRef }) };
  }
  const resolved = resolvePortableLoadedParentReference(reference, loadedIndex);
  if (resolved.status === 'missing') return { status: 'missing', code: 'portable.materialization.parent.missing', message: 'The declared Parent reference is not present in loaded material.', candidates: [] };
  if (resolved.status === 'ambiguous') return { status: 'ambiguous', code: 'portable.materialization.parent.ambiguous', message: 'The declared Parent reference matches multiple loaded records.', candidates: resolved.candidates.map((record) => record.id || record.path) };
  return { status: 'resolved', kind: 'loaded-record', parent: projectPortableLoadedParentRecord(resolved.record) };
}

function lineageParentCandidates(lineage = {}) {
  const childIds = new Set((lineage.edges || []).filter((edge) => edge.kind === 'parent' && edge.from).map((edge) => edge.from));
  return Object.freeze((lineage.nodes || []).map((node) => Object.freeze({
    id: node.id,
    path: node.path,
    title: node.title,
    schemaId: node.schemaId,
    sourceMode: node.sourceMode,
    boundary: node.boundary,
    role: childIds.has(node.id) ? 'ancestor-or-branch' : 'loaded-leaf-candidate',
    explicitOnly: true
  })));
}

function finalize({ status, material, proposals, candidateSchemas, parentCandidates, lineage, findings, clarificationNeeds }) {
  const summary = summarizePortableFindings(findings);
  return Object.freeze({
    schema: PORTABLE_EPISTEMIC_PLAN_SCHEMA_ID,
    status,
    material: Object.freeze({ records: material.records.length, files: material.files.length, sourceMode: material.sourceMode || '', boundary: material.boundary || null }),
    candidateSchemas: Object.freeze(candidateSchemas),
    parentCandidates: Object.freeze(parentCandidates),
    proposals: Object.freeze(proposals),
    clarificationNeeds: Object.freeze(clarificationNeeds),
    lineage: Object.freeze({ stats: lineage.stats, findings: Object.freeze(lineage.findings || []) }),
    epistemicBoundary: Object.freeze({
      fixedQuestionnaire: false,
      oneQuestionAtATimeWhenBlocked: true,
      materializationMustBeEvidenceGrounded: true,
      schemaSelectionMustUseSharedCompanion: true,
      parentMustBeExplicitLoadedOrEarlierProposal: true,
      originIsNotParent: true,
      sourceProvenanceIsNeverGuessed: true,
      noArtifactIsAlsoAValidOutcome: true
    }),
    findings: Object.freeze(findings),
    findingSummary: summary
  });
}

function isArtifactRecord(record = {}) {
  const path = String(record.path || '').toLowerCase();
  const role = String(record.materialRole || '').toLowerCase();
  if (path.endsWith('.schema.md') || path.includes('/canonical/schemas/')) return false;
  if (role.includes('schema') || role.includes('supporting')) return false;
  return Boolean(record.hasContinuityContext || record.schemaId || record.kind?.startsWith?.('tiinex.'));
}

function normalizeStrings(value) { return [...new Set((Array.isArray(value) ? value : [value]).map(clean).filter(Boolean))]; }
function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function exact(value) { return String(value ?? ''); }
function slug(value) { return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'artifact'; }
function clone(value) { return value == null ? {} : JSON.parse(JSON.stringify(value)); }
