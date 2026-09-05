export const SCHEMA_FACTORY_DESCRIPTOR_SCHEMA_ID = 'tiinex.schema.factory.descriptor.v1';

export function buildSchemaFactoryDescriptor(module = {}, capabilities = {}) {
  const sourceQualification = typeof module?.schemaSource?.qualify === 'function' ? module.schemaSource.qualify() : null;
  const compiled = sourceQualification?.state === 'qualified' ? sourceQualification.compiledContract : null;
  const validation = compiled?.validationContract || null;
  const creation = compiled?.creation || null;
  const ordinaryGroups = validation?.validation?.ordinaryGroups || [];
  const constraints = validation?.constraints || [];
  const sections = ordinaryGroups.map((group) => Object.freeze({
    group: String(group?.group || ''),
    heading: String(group?.target?.heading || ''),
    title: String(group?.target?.title || group?.group || ''),
    requiredness: String(group?.target?.requiredness || ''),
    qualification: String(group?.qualification || group?.target?.qualification || 'unresolved'),
    requiredFields: Object.freeze([...(group?.requiredFields || [])]),
    optionalFields: Object.freeze([...(group?.optionalFields || [])]),
    contributors: Object.freeze((group?.contributors || []).map((item) => deepFreezeJson(item))),
    fieldConstraints: Object.freeze(constraints.filter((item) => String(item?.targetGroup || item?.sourceGroup || '') === String(group?.group || '')).map((item) => deepFreezeJson(item)))
  }));
  const declarations = (validation?.declarations || []).map((contract) => Object.freeze({
    group: String(contract?.group || ''),
    targetHeadings: Object.freeze([...(contract?.targetHeadings || [])]),
    entryShape: Object.freeze([...(contract?.entryShape || [])]),
    requiredFields: Object.freeze([...(contract?.requiredFields || [])]),
    optionalFields: Object.freeze([...(contract?.optionalFields || [])]),
    allowLiteralNone: Boolean(contract?.allowLiteralNone),
    fieldConstraints: Object.freeze(constraints.filter((item) => String(item?.targetGroup || item?.sourceGroup || '') === String(contract?.group || '')).map((item) => deepFreezeJson(item)))
  }));
  const requiredShape = creation?.requiredShape || [];
  return Object.freeze({
    schema: SCHEMA_FACTORY_DESCRIPTOR_SCHEMA_ID,
    schemaId: String(module?.id || compiled?.schemaId || ''),
    label: String(module?.label || module?.id || ''),
    kind: String(module?.kind || ''),
    role: String(module?.role || ''),
    source: Object.freeze({
      state: String(sourceQualification?.state || 'unavailable'),
      checksum: String(sourceQualification?.checksum || ''),
      path: String(sourceQualification?.authority?.path || ''),
      repository: String(sourceQualification?.authority?.repository || ''),
      commit: String(sourceQualification?.authority?.commit || '')
    }),
    inheritance: Object.freeze({
      parentSchemaId: String(module?.parentSchemaId || ''),
      lineage: Object.freeze([...(validation?.lineage || [])]),
      qualification: deepFreezeJson(validation?.lineageQualification || { state: 'unavailable', complete: false, findings: ['Compiled validation lineage unavailable.'] }),
      resolution: deepFreezeJson(validation?.inheritanceResolution || { schema: 'tiinex.portable.schema-inheritance-resolution.v1', state: 'not-declared', applications: [], findings: [] })
    }),
    sections: Object.freeze(sections),
    declarations: Object.freeze(declarations),
    fieldShapes: Object.freeze((validation?.validation?.fieldShapes || []).map((item) => deepFreezeJson(item))),
    machineShapes: deepFreezeJson(validation?.machineShapes || { schema: '', definitions: [], active: [], findings: [] }),
    creation: Object.freeze({
      authorityState: String(capabilities?.generation?.authority?.state || (creation ? 'qualified' : 'unavailable')),
      requiredInputs: Object.freeze([...(creation?.requiredInputs || [])]),
      optionalInputs: Object.freeze([...(creation?.optionalInputs || [])]),
      inputBindings: Object.freeze((creation?.inputBindings || []).map((item) => deepFreezeJson(item))),
      supplementalRequiredFields: Object.freeze((creation?.supplementalRequiredFields || []).map((item) => deepFreezeJson(item))),
      representationSections: Object.freeze([...(creation?.representationSections || [])]),
      requiredShape: Object.freeze(requiredShape.map((item) => deepFreezeJson(item))),
      residualRequiredShape: Object.freeze(requiredShape.filter((item) => String(item?.primitive?.kind || 'residual') === 'residual').map((item) => deepFreezeJson(item)))
    }),
    generation: Object.freeze({
      authorityState: String(capabilities?.generation?.authority?.state || (creation ? 'qualified' : 'unavailable')),
      implementationState: String(capabilities?.generation?.implementation?.state || 'unavailable'),
      ready: Boolean(capabilities?.generation?.ready),
      boundary: 'Artifact Creation Contract + generic renderer qualification only; this does not authorize an invocable lifecycle transition.'
    }),
    invocation: Object.freeze({
      create: Object.freeze({
        state: capabilities?.actions?.create?.status === 'implemented' ? 'qualified' : 'unavailable',
        authority: 'canonical-transition-definition',
        applicability: capabilities?.actions?.create?.status === 'implemented' ? 'explicitly-qualified' : 'not-qualified',
        boundary: 'Invocable Create is independent from generation authority and must not be inferred from Artifact Creation Contract presence.'
      })
    }),
    capabilities: deepFreezeJson(capabilities),
    transitionParticipation: Object.freeze({
      authority: 'canonical-transition-definition',
      companionMetadataPresent: Boolean(module?.transitions && (typeof module.transitions === 'function' || Object.keys(module.transitions || {}).length)),
      applicability: 'not-inferred-from-schema-module'
    }),
    relationAndCompanionNeeds: Object.freeze({
      relationMetadataPresent: Boolean(module?.relations),
      findingsCompanionPresent: Boolean(module?.findings),
      i18nCompanionPresent: Boolean(module?.i18n),
      presenterPresent: typeof module?.present === 'function',
      policy: 'presence-only-no-semantic-inference'
    }),
    findings: Object.freeze([
      ...(sourceQualification?.findings || []).map((item) => typeof item === 'string' ? item : String(item?.message || item?.code || item)),
      ...(validation?.lineageQualification?.findings || []).map(String)
    ])
  });
}

function deepFreezeJson(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return Object.freeze(value.map(deepFreezeJson));
  const out = {};
  for (const [key, item] of Object.entries(value)) out[key] = deepFreezeJson(item);
  return Object.freeze(out);
}
