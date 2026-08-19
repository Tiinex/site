const freeze = Object.freeze;
const NONE = freeze([]);

export const PORTABLE_EXPLICIT_GENERATION_BINDING_QUALIFICATION_SCHEMA_ID = 'tiinex.portable.explicit-generation-binding-qualification.v1';

export function projectGenerationAuthority(projection = {}) {
  const identity = ordinaryGroupMap(projection, 'Generation Identity');
  const target = ordinaryGroupMap(projection, 'Generation Target');
  const boundary = ordinaryGroupMap(projection, 'Output Boundary');
  const limits = ordinaryGroupMap(projection, 'Interpretation Limits');
  const requiredInputs = declarationEntries(projection, 'Required Inputs').map(projectDeclaration);
  const generationSteps = declarationEntries(projection, 'Generation Steps').map(projectDeclaration);
  const missing = [];
  for (const [label, value] of [
    ['Generation Identity', identity],
    ['Generation Target', target],
    ['Output Boundary', boundary],
    ['Interpretation Limits', limits]
  ]) if (!value || !Object.keys(value).length) missing.push(label);
  if (!requiredInputs.length) missing.push('Required Inputs');
  if (!generationSteps.length) missing.push('Generation Steps');
  const targetSchema = token(target?.['Target Schema']);
  const targetOutput = token(target?.['Target Output']);
  if (!targetSchema) missing.push('Generation Target -> Target Schema');
  if (!targetOutput) missing.push('Generation Target -> Target Output');
  return freeze({
    complete: missing.length === 0,
    missing: freeze(missing),
    targetSchema,
    targetOutput,
    generationIdentity: freeze(identity),
    requiredInputs: freeze(requiredInputs),
    generationSteps: freeze(generationSteps),
    outputBoundary: freeze(boundary),
    interpretationLimits: freeze(limits)
  });
}

export function projectGenerationBindingResolution(resolution = {}) {
  return freeze({
    qualification: String(resolution.qualification || 'unresolved'),
    target: String(resolution.target || ''),
    escaped: Boolean(resolution.escaped),
    packageQualification: String(resolution.packageQualification || 'not-applied'),
    declaringPackageKey: String(resolution.declaringPackageKey || ''),
    targetPackageKey: String(resolution.targetPackageKey || ''),
    finding: String(resolution.finding || ''),
    candidates: freeze((resolution.candidates || []).map(generationBindingMaterialEvidence))
  });
}

export function generationBindingMaterialEvidence(material = {}) {
  const key = String(material.representationKey || '');
  return freeze({
    representationKey: key,
    representationKeyKind: key.startsWith('supplied-material:') ? 'synthetic-invocation' : 'supplied-explicit',
    path: String(material.path || ''),
    schemaId: String(material.schemaId || ''),
    references: freeze([...(material.referenceAliases || [])]),
    source: freeze({ ...(material.source || {}) })
  });
}

export function finalizeGenerationBindingQualification(input = {}) {
  return freeze({
    schema: PORTABLE_EXPLICIT_GENERATION_BINDING_QUALIFICATION_SCHEMA_ID,
    qualification: String(input.qualification || 'unresolved'),
    declaredBinding: String(input.declaredBinding || ''),
    outputRoleName: String(input.outputRoleName || ''),
    expectedTargetSchema: String(input.expectedTargetSchema || ''),
    declaringRepresentation: input.declaringMaterial ? generationBindingMaterialEvidence(input.declaringMaterial) : null,
    resolution: input.resolution || emptyGenerationBindingResolution('unresolved', ''),
    authority: input.qualification === 'qualified' ? input.authority || null : null,
    findings: freeze([...(input.findings || [])]),
    boundary: freeze({
      readOnly: true,
      networkFetch: false,
      repositoryFallback: false,
      siteRegistryFallback: false,
      creationAuthorized: false,
      transitionApplicabilityEvaluated: false,
      invocationExecuted: false,
      materialized: false,
      placementDecided: false,
      persisted: false
    })
  });
}

export function emptyGenerationBindingResolution(qualification = 'unresolved', finding = '') {
  return freeze({ qualification, target: '', escaped: false, packageQualification: 'not-applied', declaringPackageKey: '', targetPackageKey: '', finding: String(finding || ''), candidates: NONE });
}

export function projectGenerationBindingFindings(findings = []) {
  return freeze((findings || []).map((item) => freeze({
    severity: String(item.severity || ''),
    code: String(item.code || ''),
    state: String(item.state || ''),
    message: String(item.message || '')
  })));
}

function ordinaryGroupMap(projection = {}, groupName = '') {
  const group = (projection.ordinaryGroups || []).find((item) => token(item.group) === token(groupName));
  if (!group || group.qualification !== 'resolved') return {};
  const out = {};
  for (const field of group.fields || []) {
    if (field.qualification !== 'present' || field.occurrences?.length !== 1) continue;
    out[field.label] = String(field.occurrences[0].value ?? '');
  }
  return out;
}

function declarationEntries(projection = {}, groupName = '') {
  const group = (projection.validation?.declarations || []).find((item) => token(item.contract?.group) === token(groupName));
  return (group?.sections || []).flatMap((section) => section.present ? section.entries : []).filter((entry) => entry.name !== 'none');
}

function projectDeclaration(entry = {}) {
  return freeze({
    name: String(entry.name || ''),
    fields: freeze({ ...(entry.fields || {}) }),
    fieldOrder: freeze([...(entry.fieldOrder || [])]),
    source: entry.source ? freeze({ ...entry.source }) : null
  });
}

function token(value = '') { return String(value || '').trim(); }
