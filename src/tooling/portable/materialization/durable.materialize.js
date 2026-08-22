import { createPortableLocalDraft, stagePortableDraft } from '../draft/draft.create.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { resolvePortableSchemaChainMaterial } from '../providers/schema.providers.js';
import { openPortableSession } from '../session/portable.session.js';

export const PORTABLE_DURABLE_MATERIALIZATION_PLAN_SCHEMA_ID = 'tiinex.portable.durable-materialization.plan.v1';
export const PORTABLE_DURABLE_MATERIALIZATION_RESULT_SCHEMA_ID = 'tiinex.portable.durable-materialization.result.v1';

export function planPortableDurableMaterialization(input = {}) {
  const durableFindings = normalizeFindings(input.durableFindings || input.session?.durableFindings || input.snapshot?.durableFindings || []);
  const specs = normalizeSpecs(input.materializations || input.specs || []);
  const findings = [];
  const knownIds = new Set(durableFindings.map(findingId));
  const assigned = new Set();
  for (const spec of specs) {
    if (!spec.schemaId) findings.push(portableFinding('error', 'portable.materialization.schema.required', 'Each durable materialization requires an explicit target schema id; portable tooling will not guess artifact type.', { materializationId: spec.id }));
    if (!spec.findingIds.length) findings.push(portableFinding('warning', 'portable.materialization.findings.empty', 'A materialization spec references no durable findings.', { materializationId: spec.id }));
    for (const id of spec.findingIds) {
      if (!knownIds.has(id)) findings.push(portableFinding('error', 'portable.materialization.finding.unknown', 'A materialization spec references an unknown durable finding.', { materializationId: spec.id, findingId: id }));
      else if (assigned.has(id)) findings.push(portableFinding('error', 'portable.materialization.finding.duplicate', 'A durable finding is assigned to more than one materialization in the same operation.', { findingId: id }));
      else assigned.add(id);
    }
  }
  const unassigned = durableFindings.filter((finding) => !assigned.has(findingId(finding)));
  if (unassigned.length) findings.push(portableFinding('info', 'portable.materialization.findings.unassigned', 'Some durable findings remain explicit session state and will not be silently materialized.', { count: unassigned.length }));
  const findingSummary = summarizePortableFindings(findings);
  return Object.freeze({
    schema: PORTABLE_DURABLE_MATERIALIZATION_PLAN_SCHEMA_ID,
    status: findingSummary.counts.error ? 'blocked' : specs.length ? 'ready' : durableFindings.length ? 'mapping-required' : 'empty',
    durableFindings: Object.freeze(durableFindings),
    materializations: Object.freeze(specs.map((spec) => Object.freeze({
      ...spec,
      selectedFindings: Object.freeze(durableFindings.filter((finding) => spec.findingIds.includes(findingId(finding))))
    }))),
    unassignedFindings: Object.freeze(unassigned),
    boundary: Object.freeze({ schemaSelectionMustBeExplicit: true, remoteWrite: false, sourceMutation: false }),
    findings: Object.freeze(findings),
    findingSummary
  });
}

export async function materializePortableDurableFindings(input = {}, options = {}) {
  const plan = planPortableDurableMaterialization(input);
  const findings = [...plan.findings];
  if (plan.status === 'blocked') return result('blocked', plan, [], input, findings);
  const created = [];
  for (const item of plan.materializations) {
    const chain = await resolvePortableSchemaChainMaterial({ ...input, schemaId: item.schemaId }, options);
    findings.push(...(chain.findings || []));
    if (chain.status === 'provider-action-required') {
      created.push(Object.freeze({ id: item.id, status: 'provider-action-required', schemaId: item.schemaId, providerRequest: chain.providerRequest, findingIds: item.findingIds }));
      continue;
    }
    const files = mergeFiles(input.files || input.session?.materials?.files || [], chain.materials?.files || []);
    const draftResult = createPortableLocalDraft({
      ...input,
      ...item,
      files,
      schemaId: item.schemaId,
      values: item.values,
      sections: item.sections,
      bodyMarkdown: item.bodyMarkdown,
      title: item.title,
      summary: item.summary,
      path: item.path,
      parent: item.parent,
      allowIncomplete: item.allowIncomplete
    }, options);
    findings.push(...dedupeNewFindings(findings, draftResult.findings || []));
    let stageResult = null;
    const unresolvedSchemaLocator = (draftResult.validation?.findings || []).some((finding) => finding.code === 'schema.reference.locator.unresolved');
    if (unresolvedSchemaLocator) findings.push(portableFinding('error', 'portable.materialization.schema-reference.locator-unresolved', 'Durable materialization retained a readable local draft but will not stage it while a declared schema representation locator remains unresolved.', { materializationId: item.id, schemaId: item.schemaId }));
    if (draftResult.draft && item.stage !== false && !unresolvedSchemaLocator) {
      stageResult = stagePortableDraft({
        draft: draftResult.draft,
        validation: draftResult.validation,
        files,
        schemaId: item.schemaId,
        allowInvalid: item.allowInvalid
      }, options);
      findings.push(...dedupeNewFindings(findings, stageResult.findings || []));
    }
    created.push(Object.freeze({
      id: item.id,
      schemaId: item.schemaId,
      findingIds: item.findingIds,
      status: stageResult?.status === 'staged' ? 'materialized-and-staged' : draftResult.status,
      schemaChain: chain,
      draft: draftResult.draft,
      validation: draftResult.validation,
      stagedArtifact: stageResult?.stagedArtifact || null,
      qualification: draftResult.qualification
    }));
  }
  const successfulIds = new Set(created.filter((item) => item.draft && (!item.stagedArtifact ? item.status !== 'blocked' : true)).flatMap((item) => item.findingIds));
  const remaining = plan.durableFindings.filter((finding) => !successfulIds.has(findingId(finding)));
  const status = created.some((item) => item.status === 'provider-action-required') ? 'provider-action-required'
    : findings.some((finding) => finding.severity === 'error') ? 'degraded'
      : remaining.length ? 'partial' : 'materialized';
  return result(status, plan, created, input, findings, remaining);
}

function result(status, plan, created, input, findings, remaining = plan.unassignedFindings || []) {
  const baseSession = input.session || input.snapshot || {
    files: input.files || [],
    records: input.records || [],
    assets: input.assets || [],
    durableFindings: plan.durableFindings,
    stagedArtifacts: input.stagedArtifacts || []
  };
  const existingStaged = baseSession.stagedArtifacts || baseSession.materials?.stagedArtifacts || [];
  const newStaged = created.map((item) => item.stagedArtifact).filter(Boolean);
  const session = openPortableSession({
    ...baseSession,
    materials: baseSession.materials,
    durableFindings: remaining,
    stagedArtifacts: [...existingStaged, ...newStaged]
  }).snapshot();
  const findingSummary = summarizePortableFindings(findings);
  return Object.freeze({
    schema: PORTABLE_DURABLE_MATERIALIZATION_RESULT_SCHEMA_ID,
    status,
    plan,
    materialized: Object.freeze(created),
    remainingFindings: Object.freeze(remaining),
    session,
    boundary: Object.freeze({ schemaSelectionWasExplicit: true, localDraftsOnly: true, remoteWrite: false, sourceMutation: false }),
    findings: Object.freeze(findings),
    findingSummary
  });
}

function normalizeFindings(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((finding, index) => Object.freeze({ ...finding, id: findingId(finding, index) }));
}

function normalizeSpecs(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((spec, index) => Object.freeze({
    ...spec,
    id: String(spec?.id || `materialization-${index + 1}`),
    schemaId: String(spec?.schemaId || ''),
    findingIds: Object.freeze((Array.isArray(spec?.findingIds) ? spec.findingIds : spec?.findingId ? [spec.findingId] : []).map(String)),
    values: Object.freeze({ ...(spec?.values || {}) }),
    sections: Object.freeze({ ...(spec?.sections || {}) })
  }));
}

function findingId(finding = {}, index = 0) {
  return String(finding.id || finding.code || `finding-${index + 1}`);
}

function mergeFiles(left, right) {
  const map = new Map();
  for (const file of [...left, ...right]) map.set(`${file.path}:${String(file.content || '').length}`, file);
  return [...map.values()];
}

function dedupeNewFindings(existing, next) {
  return next.filter((finding) => !existing.some((item) => item.code === finding.code && item.message === finding.message && item.ref === finding.ref));
}
