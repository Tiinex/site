import { CapabilityStatus } from '../../schemas/capability.registry.js';

export const PORTABLE_QUALIFICATION_SCHEMA_ID = 'tiinex.portable.qualification.v1';

export function qualifyCapabilityResolution(resolution = {}, capabilityName = '') {
  const requestedSchema = String(resolution.requested?.schemaId || resolution.unresolvedSchemaId || '').trim();
  const resolvedThrough = String(resolution.descriptor?.moduleId || 'tiinex.root.v1').trim();
  const capability = resolution.capability || resolution.descriptor?.actions?.[capabilityName] || resolution.descriptor?.surfaces?.[capabilityName] || null;
  const moduleExact = Boolean(requestedSchema && requestedSchema === resolvedThrough && !resolution.fallbackUsed);
  const capabilityImplemented = capabilityName ? capability?.status === CapabilityStatus.implemented : null;
  const exact = capabilityName ? moduleExact && capabilityImplemented : moduleExact;
  const limitations = [];
  if (resolution.fallbackUsed) limitations.push(`Requested schema ${requestedSchema || 'unknown'} is not registered; the current site runtime resolved directly through Root fallback.`);
  if (capabilityName && !capabilityImplemented) limitations.push(`${capabilityName} is not implemented for the resolved schema module.`);
  if (!capabilityName) limitations.push('No individual capability was selected; this result describes exact module resolution only.');
  if (resolution.fallbackUsed) limitations.push('Semantic-parent capability fallback was not evaluated by the current shared-core resolver.');
  return makePortableQualification({
    requestedSchema,
    capability: capabilityName || '',
    resolvedThrough,
    exact,
    moduleExact,
    capabilityStatus: capability?.status || '',
    resolutionStatus: resolution.status || '',
    outcome: capability?.status || resolution.status || '',
    fallbackUsed: Boolean(resolution.fallbackUsed),
    fallbackMode: resolution.fallbackUsed ? 'direct-root' : 'none',
    fallbackDepth: resolution.fallbackUsed ? null : 0,
    parentCapabilitiesEvaluated: false,
    limitations,
    safeActions: capabilitySafeActions(capabilityName, capability, exact),
    blockedActions: capabilityBlockedActions(capabilityName, capability, exact)
  });
}

export function qualifyAuditResult(result = {}) {
  const requestedSchema = String(result.parsed?.envelope?.current?.schema?.id || result.artifact?.schemaId || '').trim();
  const resolvedThrough = String(result.resolution?.module?.id || result.artifact?.moduleId || 'tiinex.root.v1').trim();
  const fallbackUsed = Boolean(result.resolution?.fallbackUsed || result.artifact?.fallbackUsed);
  const limitations = [];
  if (fallbackUsed) limitations.push('Schema-specific validation was unavailable; Root validation was used.');
  if (fallbackUsed) limitations.push('Semantic-parent validator fallback was not evaluated by the current shared-core audit resolver.');
  if (result.status === 'supporting-material') limitations.push('Plain Markdown was retained as supporting material, not qualified as a Tiinex leaf.');
  if (result.status === 'pending-unavailable') limitations.push('Material was not loaded; validation remains pending.');
  const moduleExact = Boolean(requestedSchema && requestedSchema === resolvedThrough && !fallbackUsed);
  return makePortableQualification({
    requestedSchema,
    capability: 'validate',
    resolvedThrough,
    exact: moduleExact && result.status !== 'pending-unavailable' && result.status !== 'supporting-material',
    moduleExact,
    capabilityStatus: result.status === 'pending-unavailable' ? 'pending' : 'implemented',
    resolutionStatus: result.resolution?.status || '',
    outcome: result.status || '',
    fallbackUsed,
    fallbackMode: fallbackUsed ? 'direct-root' : 'none',
    fallbackDepth: fallbackUsed ? null : 0,
    parentCapabilitiesEvaluated: false,
    limitations,
    safeActions: ['preserve', 'inspect', 'traverse-loaded-parent'].filter((action) => result.status !== 'pending-unavailable' || action !== 'traverse-loaded-parent'),
    blockedActions: fallbackUsed ? ['claim-exact-schema-valid'] : []
  });
}

export function qualifyCreationContract(contract = {}) {
  const exact = contract.status === 'ready' && contract.target?.fallbackUsed !== true && contract.capabilities?.create === CapabilityStatus.implemented;
  const limitations = (contract.findings || []).map((finding) => finding.message).filter(Boolean);
  if (!exact && !limitations.length) limitations.push('Exact creation tooling is not ready for the requested schema and transition.');
  if (contract.target?.fallbackUsed) limitations.push('Creation through Root fallback is blocked; parent tooling must not fabricate a child artifact.');
  return makePortableQualification({
    requestedSchema: contract.target?.schemaId || '',
    capability: 'create',
    resolvedThrough: contract.target?.moduleId || 'tiinex.root.v1',
    exact,
    moduleExact: Boolean(contract.target?.schemaId && contract.target?.schemaId === contract.target?.moduleId && !contract.target?.fallbackUsed),
    capabilityStatus: contract.capabilities?.create || '',
    resolutionStatus: contract.status || '',
    outcome: contract.status || '',
    fallbackUsed: Boolean(contract.target?.fallbackUsed),
    fallbackMode: contract.target?.fallbackUsed ? 'direct-root-blocked-for-creation' : 'none',
    fallbackDepth: contract.target?.fallbackUsed ? null : 0,
    parentCapabilitiesEvaluated: false,
    limitations,
    safeActions: exact ? ['create-local-draft', 'validate-created-draft'] : ['inspect-schema', 'request-writer-brief', 'preserve-intent'],
    blockedActions: exact ? ['remote-write', 'inherit-parent-source'] : ['claim-exact-create-tooling', 'create-child-through-parent-fallback']
  });
}

export function qualifyWriterBrief({ mode = '', base = {}, requestedSchema = '' } = {}) {
  const limitations = [...(base.limitations || [])];
  const safeActions = [...(base.safeActions || [])];
  const blockedActions = [...(base.blockedActions || [])];
  if (mode === 'llm-writer-fallback') {
    limitations.push('Child-specific create tooling is unavailable; a writer must interpret supplied readable schema material.');
    safeActions.push('write-local-draft-from-supplied-schema', 'run-available-validation', 'preserve-unqualified-child-semantics');
    blockedActions.push('claim-exact-create-tooling', 'claim-full-child-semantic-qualification');
  }
  if (mode === 'parent-or-root-artifact-only') {
    limitations.push(`Readable schema material for ${requestedSchema || 'the requested child schema'} is unavailable.`);
    safeActions.push('preserve-intent', 'create-genuine-supported-parent-or-root-artifact');
    blockedActions.push('create-requested-child', 'guess-child-format');
  }
  return makePortableQualification({
    ...base,
    exact: mode === 'exact-create-tooling-available' && Boolean(base.exact),
    outcome: mode,
    limitations,
    safeActions,
    blockedActions
  });
}

export function makePortableQualification(input = {}) {
  return Object.freeze({
    schema: PORTABLE_QUALIFICATION_SCHEMA_ID,
    requestedSchema: String(input.requestedSchema || ''),
    capability: String(input.capability || ''),
    resolvedThrough: String(input.resolvedThrough || 'tiinex.root.v1'),
    exact: Boolean(input.exact),
    moduleExact: Boolean(input.moduleExact),
    capabilityStatus: String(input.capabilityStatus || ''),
    resolutionStatus: String(input.resolutionStatus || ''),
    outcome: String(input.outcome || ''),
    fallback: Object.freeze({
      used: Boolean(input.fallbackUsed),
      mode: String(input.fallbackMode || (input.fallbackUsed ? 'unspecified' : 'none')),
      depth: Number.isFinite(input.fallbackDepth) ? Number(input.fallbackDepth) : null,
      parentCapabilitiesEvaluated: Boolean(input.parentCapabilitiesEvaluated)
    }),
    limitations: Object.freeze(uniqueStrings(input.limitations)),
    safeActions: Object.freeze(uniqueStrings(input.safeActions)),
    blockedActions: Object.freeze(uniqueStrings(input.blockedActions))
  });
}

function capabilitySafeActions(name, capability, exact) {
  if (capability?.status === CapabilityStatus.implemented && exact) return [name || 'inspect'];
  return ['preserve', 'inspect-schema', 'inspect-root-envelope'];
}

function capabilityBlockedActions(name, capability, exact) {
  if (!name || (capability?.status === CapabilityStatus.implemented && exact)) return [];
  return [`claim-exact-${name}`];
}

function uniqueStrings(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || '').trim()).filter(Boolean))];
}
