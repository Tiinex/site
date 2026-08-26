import { projectHandoffMaterialRequirements } from './materialClosure.requirements.js';
import { collectHandoffMaterialCandidates, recipientCanResolveReference, resolveRequirementMaterial } from './materialClosure.materials.js';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';

export const PORTABLE_HANDOFF_MATERIAL_CLOSURE_INPUT_BINDING_SCHEMA_ID = 'tiinex.portable.handoff-material-closure-input-binding.v1';

export function buildHandoffMaterialClosurePlanInputBinding(requirements = {}, recipient = {}, materialResolution = {}, planning = {}) {
  const handoff = handoffBinding(requirements);
  const recipientResolution = recipientBinding(requirements, recipient);
  const resolution = materialResolutionBinding(materialResolution);
  const plannerInputs = plannerInputBinding(planning);
  const evidence = deepFreeze({
    schema: PORTABLE_HANDOFF_MATERIAL_CLOSURE_INPUT_BINDING_SCHEMA_ID,
    handoff,
    recipientResolution,
    materialResolution: resolution,
    plannerInputs
  });
  return deepFreeze({ ...evidence, key: stableJson(evidence) });
}

export function qualifyHandoffMaterialClosurePlanInputBinding(plan = {}, input = {}, options = {}) {
  const externallySupplied = options.externallySupplied === true;
  const supplied = plan.inputBinding || null;
  const hasCurrentRequirements = hasOwnUsable(input, 'requirements');
  const hasCurrentHandoff = hasOwnUsable(input, 'handoff');
  const hasCurrentRecipient = hasOwnUsable(input, 'recipient');
  const hasCurrentMaterialResolutionInputs = ['materials', 'providerResults', 'priorPackages'].some((key) => hasOwnUsable(input, key));
  const hasCurrentPreferReferencePolicy = hasOwnUsable(input, 'preferReferenceWhenResolvable');
  const hasCurrentIncludeReferencePolicy = hasOwnUsable(input, 'includeReferenceMaterial');
  const hasCurrentBootstrap = hasOwnUsable(input, 'bootstrap');
  const hasCurrentPlannerInputs = hasCurrentRequirements || hasCurrentPreferReferencePolicy || hasCurrentIncludeReferencePolicy || hasCurrentBootstrap;
  const parallelInputsPresented = hasCurrentHandoff || hasCurrentRecipient || hasCurrentMaterialResolutionInputs || hasCurrentPlannerInputs;
  const findings = [];

  if (!externallySupplied) {
    return deepFreeze({
      state: 'qualified',
      mode: 'derived-current-invocation',
      parallelInputsPresented,
      findings: Object.freeze([]),
      suppliedKey: String(supplied?.key || ''),
      currentKey: String(supplied?.key || '')
    });
  }

  if (!supplied || supplied.schema !== PORTABLE_HANDOFF_MATERIAL_CLOSURE_INPUT_BINDING_SCHEMA_ID) {
    findings.push('plan-input-binding-missing');
    return qualification(findings, parallelInputsPresented ? 'parallel-current-inputs' : 'plan-sole-current-authority', supplied, null, parallelInputsPresented);
  }

  const selfFindings = qualifyBindingAgainstPlan(plan, supplied);
  findings.push(...selfFindings);

  if (!parallelInputsPresented) {
    return qualification(findings, 'plan-sole-current-authority', supplied, null, false);
  }

  const suppliedPlannerInputs = supplied.plannerInputs || null;
  if (!suppliedPlannerInputs) findings.push('plan-input-binding-planner-inputs-missing');

  const explicitRequirements = hasCurrentRequirements ? normalizeRequirementsInput(input.requirements || {}) : null;
  const projectedHandoffRequirements = hasCurrentHandoff ? projectHandoffMaterialRequirements(input.handoff || {}) : null;

  if (explicitRequirements) {
    const currentRequirementsBinding = handoffBinding(explicitRequirements);
    if (stableJson(currentRequirementsBinding) !== stableJson(supplied.handoff || {})) findings.push('current-requirements-input-mismatch');
  }
  if (projectedHandoffRequirements) {
    const currentHandoff = handoffBinding(projectedHandoffRequirements);
    if (stableJson(currentHandoff) !== stableJson(supplied.handoff || {})) findings.push('current-handoff-input-mismatch');
  }

  const bindingRequirements = explicitRequirements || projectedHandoffRequirements || requirementsFromBinding(supplied);
  const currentRecipientInput = hasCurrentRecipient ? input.recipient || {} : recipientFromSuppliedBinding(supplied);

  if (hasCurrentRecipient) {
    const currentRecipient = recipientBinding(bindingRequirements, currentRecipientInput);
    if (stableJson(currentRecipient) !== stableJson(supplied.recipientResolution || [])) findings.push('current-recipient-resolution-input-mismatch');
  }

  const boundPolicy = normalizeBoundPolicy(suppliedPlannerInputs?.policy || plan.policy || {});
  const currentPolicy = Object.freeze({
    preferReferenceWhenResolvable: hasCurrentPreferReferencePolicy ? input.preferReferenceWhenResolvable !== false : boundPolicy.preferReferenceWhenResolvable,
    includeReferenceMaterial: hasCurrentIncludeReferencePolicy ? input.includeReferenceMaterial === true : boundPolicy.includeReferenceMaterial,
    bootstrap: hasCurrentBootstrap ? bootstrapStatus(input.bootstrap || {}) : boundPolicy.bootstrap
  });

  if (hasCurrentPreferReferencePolicy && currentPolicy.preferReferenceWhenResolvable !== boundPolicy.preferReferenceWhenResolvable) findings.push('current-prefer-reference-when-resolvable-input-mismatch');
  if (hasCurrentIncludeReferencePolicy && currentPolicy.includeReferenceMaterial !== boundPolicy.includeReferenceMaterial) findings.push('current-include-reference-material-input-mismatch');

  const boundBootstrap = suppliedPlannerInputs?.bootstrap || bootstrapBinding({}, boundPolicy.bootstrap);
  const currentBootstrap = hasCurrentBootstrap ? bootstrapBinding(input.bootstrap || {}, currentPolicy.bootstrap) : boundBootstrap;
  if (hasCurrentBootstrap && stableJson(currentBootstrap) !== stableJson(boundBootstrap)) findings.push('current-bootstrap-input-mismatch');

  let currentMaterialResolution = null;
  if (hasCurrentMaterialResolutionInputs || hasCurrentPreferReferencePolicy || hasCurrentIncludeReferencePolicy || hasCurrentRequirements || hasCurrentRecipient) {
    const candidates = hasCurrentMaterialResolutionInputs
      ? collectHandoffMaterialCandidates(input)
      : candidatesFromBinding(supplied);
    currentMaterialResolution = resolveMaterialResolution(bindingRequirements, candidates, currentRecipientInput, currentPolicy);
    if (!supplied.materialResolution) findings.push('plan-input-binding-material-resolution-missing');
    else if (stableJson(materialResolutionBinding(currentMaterialResolution)) !== stableJson(supplied.materialResolution || {})) findings.push('current-material-resolution-input-mismatch');
  }

  const currentEvidence = buildHandoffMaterialClosurePlanInputBinding(
    bindingRequirements,
    currentRecipientInput,
    currentMaterialResolution || materialResolutionFromBinding(supplied),
    { policy: currentPolicy, bootstrapBinding: currentBootstrap }
  );
  return qualification(findings, 'parallel-current-inputs', supplied, currentEvidence, parallelInputsPresented);
}

function qualifyBindingAgainstPlan(plan = {}, supplied = {}) {
  const findings = [];
  const planHandoff = {
    id: String(plan.handoff?.id || ''),
    path: String(plan.handoff?.path || ''),
    reference: String(plan.handoff?.reference || ''),
    semanticStatus: String(plan.semanticHandoffStatus || plan.handoff?.semanticStatus || 'unknown')
  };
  const boundHandoff = supplied.handoff?.handoff || {};
  if (stableJson(planHandoff) !== stableJson(boundHandoff)) findings.push('plan-input-binding-handoff-self-mismatch');

  const planRequirements = requirementResolutionProjection(plan.requirements || {});
  const boundRequirements = bindingRequirementResolutionProjection(supplied.handoff || {});
  if (stableJson(planRequirements) !== stableJson(boundRequirements)) findings.push('plan-input-binding-requirements-self-mismatch');

  const boundRecipient = new Map((supplied.recipientResolution || []).map((entry) => [String(entry.requirementId || ''), Boolean(entry.resolvable)]));
  for (const entry of [...(plan.requirements?.required || []), ...(plan.requirements?.reference || []), ...(plan.requirements?.endpointRoles || []), ...(plan.requirements?.participantRoles || []), ...(plan.requirements?.dependencies || [])]) {
    const id = String(entry.requirementId || '');
    if (!boundRecipient.has(id) || boundRecipient.get(id) !== Boolean(entry.recipientReferenceCapability)) {
      findings.push('plan-input-binding-recipient-self-mismatch');
      break;
    }
  }

  const planMaterialResolution = materialResolutionBinding(plan.requirements || {});
  if (!supplied.materialResolution) findings.push('plan-input-binding-material-resolution-self-missing');
  else if (stableJson(planMaterialResolution) !== stableJson(supplied.materialResolution || {})) findings.push('plan-input-binding-material-resolution-self-mismatch');

  const boundPlannerInputs = supplied.plannerInputs || null;
  if (!boundPlannerInputs) findings.push('plan-input-binding-planner-inputs-self-missing');
  else {
    const planPolicy = normalizeBoundPolicy(plan.policy || {});
    if (stableJson(boundPlannerInputs.policy || {}) !== stableJson(planPolicy)) findings.push('plan-input-binding-policy-self-mismatch');
    if (String(boundPlannerInputs.bootstrap?.status || '') !== String(plan.bootstrap?.status || planPolicy.bootstrap || 'absent')) findings.push('plan-input-binding-bootstrap-self-mismatch');
  }

  const evidenceWithoutKey = {
    schema: supplied.schema,
    handoff: supplied.handoff || {},
    recipientResolution: supplied.recipientResolution || [],
    materialResolution: supplied.materialResolution || {},
    plannerInputs: supplied.plannerInputs || {}
  };
  if (!supplied.key || supplied.key !== stableJson(evidenceWithoutKey)) findings.push('plan-input-binding-key-stale');
  return findings;
}

function plannerInputBinding(planning = {}) {
  const policy = normalizeBoundPolicy(planning.policy || {});
  const bootstrap = planning.bootstrapBinding
    ? deepFreeze(sortJson(serializable(planning.bootstrapBinding)))
    : bootstrapBinding(planning.bootstrap || {}, policy.bootstrap);
  return deepFreeze({ policy, bootstrap });
}

function normalizeBoundPolicy(policy = {}) {
  return Object.freeze({
    preferReferenceWhenResolvable: policy.preferReferenceWhenResolvable !== false,
    includeReferenceMaterial: policy.includeReferenceMaterial === true,
    bootstrap: String(policy.bootstrap || 'absent') === 'present' ? 'present' : 'absent'
  });
}

function bootstrapStatus(value = {}) {
  return value?.present === true || value?.include === true ? 'present' : 'absent';
}

function bootstrapBinding(value = {}, status = bootstrapStatus(value)) {
  const normalizedStatus = String(status || 'absent') === 'present' ? 'present' : 'absent';
  const data = normalizedStatus === 'present' ? packageFileBytes(value) : new Uint8Array();
  return Object.freeze({
    status: normalizedStatus,
    path: normalizedStatus === 'present' ? String(value.path || 'tiinex.package/bootstrap.md') : '',
    bytes: data.byteLength,
    sha256: normalizedStatus === 'present' ? sha256Hex(data) : ''
  });
}

function normalizeRequirementsInput(requirements = {}) {
  return {
    ...requirements,
    handoff: requirements.handoff || {},
    required: requirements.required || [],
    reference: requirements.reference || [],
    endpointRoles: requirements.endpointRoles || [],
    participantRoles: requirements.participantRoles || [],
    dependencies: requirements.dependencies || []
  };
}

function candidatesFromBinding(binding = {}) {
  const all = [
    ...(binding.materialResolution?.required || []),
    ...(binding.materialResolution?.reference || []),
    ...(binding.materialResolution?.endpointRoles || []),
    ...(binding.materialResolution?.participantRoles || []),
    ...(binding.materialResolution?.dependencies || [])
  ].flatMap((entry) => entry.candidates || []);
  const byStable = new Map();
  for (const candidate of all) {
    const key = stableJson(candidate);
    if (!byStable.has(key)) byStable.set(key, bindingCandidateAsCandidate(candidate));
  }
  return [...byStable.values()];
}

function bindingCandidateAsCandidate(candidate = {}) {
  return {
    ...candidate,
    data: new Uint8Array(),
    bytes: Number(candidate.bytes || 0)
  };
}


function handoffBinding(requirements = {}) {
  return deepFreeze({
    handoff: Object.freeze({
      id: String(requirements.handoff?.id || ''),
      path: String(requirements.handoff?.path || ''),
      reference: String(requirements.handoff?.reference || ''),
      semanticStatus: String(requirements.handoff?.semanticStatus || 'unknown')
    }),
    required: Object.freeze((requirements.required || []).map(requirementBinding)),
    reference: Object.freeze((requirements.reference || []).map(requirementBinding)),
    endpointRoles: Object.freeze((requirements.endpointRoles || []).map(requirementBinding)),
    participantRoles: Object.freeze((requirements.participantRoles || []).map(requirementBinding)),
    dependencies: Object.freeze((requirements.dependencies || []).map(requirementBinding))
  });
}

function requirementBinding(entry = {}) {
  return Object.freeze({
    requirementId: String(entry.id || entry.requirementId || ''),
    name: String(entry.name || ''),
    classification: String(entry.classification || ''),
    material: String(entry.material || ''),
    purpose: String(entry.purpose || ''),
    availability: String(entry.availability || ''),
    materialReference: String(entry.materialReference || ''),
    referenceTarget: String(entry.reference?.target || entry.referenceTarget || ''),
    exactTargetDeclared: Boolean(entry.reference?.exactTargetDeclared ?? Boolean(entry.referenceTarget))
  });
}

function recipientBinding(requirements = {}, recipient = {}) {
  return Object.freeze([...(requirements.required || []), ...(requirements.reference || []), ...(requirements.endpointRoles || []), ...(requirements.participantRoles || []), ...(requirements.dependencies || [])].map((entry) => {
    const target = String(entry.reference?.target || entry.referenceTarget || '');
    return Object.freeze({
      requirementId: String(entry.id || entry.requirementId || ''),
      classification: String(entry.classification || ''),
      referenceTarget: target,
      resolvable: recipientCanResolveReference(recipient, target)
    });
  }));
}

function resolveMaterialResolution(requirements = {}, candidates = [], recipient = {}, policy = {}) {
  const required = (requirements.required || []).map((requirement) => resolveRequirementMaterial(requirement, candidates, recipient, policy));
  const reference = (requirements.reference || []).map((requirement) => {
    const resolved = resolveRequirementMaterial(requirement, candidates, recipient, policy);
    if (policy.includeReferenceMaterial === true || resolved.disposition === 'reference-sufficient') return resolved;
    return Object.freeze({ ...resolved, disposition: 'omitted-by-plan', selectedMaterial: null, reason: 'Reference-only material was intentionally omitted by this recipient-relative plan.' });
  });
  const endpointRoles = (requirements.endpointRoles || []).map((requirement) => resolveRequirementMaterial(requirement, candidates, recipient, { ...policy, preferReferenceWhenResolvable: false }));
  const participantRoles = (requirements.participantRoles || []).map((requirement) => resolveRequirementMaterial(requirement, candidates, recipient, { ...policy, preferReferenceWhenResolvable: false }));
  const dependencies = (requirements.dependencies || []).map((requirement) => resolveRequirementMaterial(requirement, candidates, recipient, { ...policy, preferReferenceWhenResolvable: false }));
  return Object.freeze({ required: Object.freeze(required), reference: Object.freeze(reference), endpointRoles: Object.freeze(endpointRoles), participantRoles: Object.freeze(participantRoles), dependencies: Object.freeze(dependencies) });
}

function materialResolutionBinding(materialResolution = {}) {
  return deepFreeze({
    required: Object.freeze((materialResolution.required || []).map(resolutionBinding)),
    reference: Object.freeze((materialResolution.reference || []).map(resolutionBinding)),
    endpointRoles: Object.freeze((materialResolution.endpointRoles || []).map(resolutionBinding)),
    participantRoles: Object.freeze((materialResolution.participantRoles || []).map(resolutionBinding)),
    dependencies: Object.freeze((materialResolution.dependencies || []).map(resolutionBinding))
  });
}

function resolutionBinding(entry = {}) {
  const candidates = (entry.candidates || []).map(candidateBinding).sort((a, b) => stableJson(a).localeCompare(stableJson(b)));
  return Object.freeze({
    requirementId: String(entry.requirementId || ''),
    classification: String(entry.classification || ''),
    referenceTarget: String(entry.referenceTarget || ''),
    disposition: String(entry.disposition || ''),
    recipientReferenceCapability: Boolean(entry.recipientReferenceCapability),
    selectedMaterial: entry.selectedMaterial ? candidateBinding(entry.selectedMaterial) : null,
    candidates: Object.freeze(candidates)
  });
}

function candidateBinding(candidate = {}) {
  return Object.freeze({
    id: String(candidate.id || ''),
    requirementId: String(candidate.requirementId || ''),
    referenceTarget: String(candidate.referenceTarget || ''),
    path: String(candidate.path || ''),
    packagePath: String(candidate.packagePath || ''),
    workspaceId: String(candidate.workspaceId || ''),
    bytes: Number(candidate.bytes || 0),
    sha256: String(candidate.sha256 || ''),
    expectedSha256: String(candidate.expectedSha256 || ''),
    mediaType: String(candidate.mediaType || ''),
    provider: Object.freeze({
      id: String(candidate.provider?.id || ''),
      kind: String(candidate.provider?.kind || ''),
      responseStatus: String(candidate.provider?.responseStatus || ''),
      priorPackageId: String(candidate.provider?.priorPackageId || '')
    }),
    provenance: Object.freeze(serializable(candidate.provenance || {})),
    authority: Object.freeze(serializable(candidate.authority || {}))
  });
}

function materialResolutionFromBinding(binding = {}) {
  return {
    required: (binding.materialResolution?.required || []).map(bindingResolutionAsResolution),
    reference: (binding.materialResolution?.reference || []).map(bindingResolutionAsResolution),
    endpointRoles: (binding.materialResolution?.endpointRoles || []).map(bindingResolutionAsResolution),
    participantRoles: (binding.materialResolution?.participantRoles || []).map(bindingResolutionAsResolution),
    dependencies: (binding.materialResolution?.dependencies || []).map(bindingResolutionAsResolution)
  };
}

function bindingResolutionAsResolution(entry = {}) {
  return {
    requirementId: String(entry.requirementId || ''),
    classification: String(entry.classification || ''),
    referenceTarget: String(entry.referenceTarget || ''),
    disposition: String(entry.disposition || ''),
    recipientReferenceCapability: Boolean(entry.recipientReferenceCapability),
    selectedMaterial: entry.selectedMaterial || null,
    candidates: entry.candidates || []
  };
}

function requirementResolutionProjection(requirements = {}) {
  return {
    required: (requirements.required || []).map((entry) => ({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || '') })),
    reference: (requirements.reference || []).map((entry) => ({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || '') })),
    endpointRoles: (requirements.endpointRoles || []).map((entry) => ({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || '') })),
    participantRoles: (requirements.participantRoles || []).map((entry) => ({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || '') })),
    dependencies: (requirements.dependencies || []).map((entry) => ({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || '') }))
  };
}

function bindingRequirementResolutionProjection(handoff = {}) {
  return {
    required: (handoff.required || []).map((entry) => ({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || '') })),
    reference: (handoff.reference || []).map((entry) => ({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || '') })),
    endpointRoles: (handoff.endpointRoles || []).map((entry) => ({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || '') })),
    participantRoles: (handoff.participantRoles || []).map((entry) => ({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || '') })),
    dependencies: (handoff.dependencies || []).map((entry) => ({ requirementId: String(entry.requirementId || ''), classification: String(entry.classification || ''), referenceTarget: String(entry.referenceTarget || '') }))
  };
}

function requirementsFromBinding(binding = {}) {
  return {
    handoff: binding.handoff?.handoff || {},
    required: (binding.handoff?.required || []).map(bindingRequirementAsRequirement),
    reference: (binding.handoff?.reference || []).map(bindingRequirementAsRequirement),
    endpointRoles: (binding.handoff?.endpointRoles || []).map(bindingRequirementAsRequirement),
    participantRoles: (binding.handoff?.participantRoles || []).map(bindingRequirementAsRequirement),
    dependencies: (binding.handoff?.dependencies || []).map(bindingRequirementAsRequirement)
  };
}

function bindingRequirementAsRequirement(entry = {}) {
  return {
    id: String(entry.requirementId || ''),
    classification: String(entry.classification || ''),
    reference: { target: String(entry.referenceTarget || ''), exactTargetDeclared: Boolean(entry.exactTargetDeclared) }
  };
}

function recipientFromSuppliedBinding(binding = {}) {
  return { referenceTargets: (binding.recipientResolution || []).filter((entry) => entry.resolvable).map((entry) => String(entry.referenceTarget || '')).filter(Boolean) };
}

function qualification(findings, mode, supplied, current, parallelInputsPresented) {
  return deepFreeze({
    state: findings.length ? 'invalid' : 'qualified',
    mode,
    parallelInputsPresented,
    findings: Object.freeze([...new Set(findings)]),
    suppliedKey: String(supplied?.key || ''),
    currentKey: String(current?.key || '')
  });
}

function hasOwnUsable(value, key) {
  return Object.prototype.hasOwnProperty.call(value || {}, key) && value[key] !== null && typeof value[key] !== 'undefined';
}

function stableJson(value) { return JSON.stringify(sortJson(serializable(value))); }
function serializable(value) {
  if (Array.isArray(value)) return value.map(serializable);
  if (!value || typeof value !== 'object') return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return undefined;
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'function' || typeof item === 'undefined') continue;
    const normalized = serializable(item);
    if (typeof normalized !== 'undefined') out[key] = normalized;
  }
  return out;
}
function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]));
}
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
