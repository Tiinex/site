export const TRANSITION_DEFINITION_PORTABLE_READ_PROJECTION_SCHEMA_ID = 'tiinex.site.transition-definition-portable-read-projection.v1';

const DECLARATION_GROUPS = Object.freeze({
  inputRoles: 'Input Role Declaration',
  outputRoles: 'Output Role Declaration',
  lifecycleEffects: 'Lifecycle Effect Declaration',
  parentEffects: 'Parent Effect Declaration',
  relationEffects: 'Relation Effect Declaration',
  destinationBindings: 'Destination Binding Declaration',
  outputPlacements: 'Output Placement Declaration'
});

export function projectTransitionDefinitionPortableRead(portableProjection = {}) {
  const ordinaryGroups = Object.freeze((portableProjection.ordinaryGroups || []).map(projectOrdinaryGroup));
  const ordinaryByGroup = Object.freeze(Object.fromEntries(ordinaryGroups.map((group) => [group.group, group])));
  const declarations = declarationReadModelFromProjection(portableProjection);
  return Object.freeze({
    schema: TRANSITION_DEFINITION_PORTABLE_READ_PROJECTION_SCHEMA_ID,
    ordinaryProjection: Object.freeze({
      groups: ordinaryGroups,
      byGroup: ordinaryByGroup
    }),
    transitionIdentity: Object.freeze(ordinaryScalarValues(ordinaryByGroup['Transition Identity'])),
    ...declarations
  });
}

function projectOrdinaryGroup(group = {}) {
  const fields = Object.freeze((group.fields || []).map((field) => Object.freeze({
    label: String(field.label || ''),
    requirement: String(field.requirement || ''),
    qualification: String(field.qualification || 'unresolved'),
    occurrences: Object.freeze((field.occurrences || []).map((occurrence) => Object.freeze({
      value: occurrence.value,
      rawValue: occurrence.rawValue,
      line: occurrence.line,
      order: occurrence.order,
      form: occurrence.form
    })))
  })));
  return Object.freeze({
    group: String(group.group || ''),
    qualification: String(group.qualification || 'unresolved'),
    target: Object.freeze({ ...(group.target || {}), occurrences: Object.freeze([...(group.target?.occurrences || [])]) }),
    fields,
    values: Object.freeze(ordinaryScalarValues({ fields }))
  });
}

function ordinaryScalarValues(group = {}) {
  const values = {};
  for (const field of group?.fields || []) {
    if (field.qualification !== 'present' || (field.occurrences || []).length !== 1) continue;
    values[field.label] = field.occurrences[0].value;
  }
  return values;
}

function declarationReadModelFromProjection(portableProjection = {}) {
  const validationGroups = portableProjection.validation?.declarations || [];
  const semanticGroups = portableProjection.declarations || [];
  const out = {};
  for (const [key, groupName] of Object.entries(DECLARATION_GROUPS)) {
    out[key] = Object.freeze(readDeclarationGroup(validationGroups, semanticGroups, groupName));
  }
  return out;
}

function readDeclarationGroup(validationGroups = [], semanticGroups = [], groupName = '') {
  const group = validationGroups.find((item) => item?.contract?.group === groupName);
  if (!group) return [];
  const semanticGroup = semanticGroups.find((item) => item?.group === groupName);
  return group.sections.flatMap((section) => (section.entries || []).map((entry) => {
    const semanticEntry = semanticEntryFor(semanticGroup, section.heading, entry.name);
    const semantics = Object.freeze((semanticEntry?.semantics || []).map(projectSemanticResolution));
    const participantClassification = semantics.find((item) => item.kind === 'classification-agreement') || null;
    return Object.freeze({
      name: entry.name,
      fields: Object.freeze({ ...(entry.fields || {}) }),
      semantics,
      participantClassification
    });
  }));
}

function semanticEntryFor(group = {}, heading = '', name = '') {
  for (const section of group?.sections || []) {
    if (section.heading !== heading) continue;
    const entry = (section.entries || []).find((candidate) => candidate.name === name);
    if (entry) return entry;
  }
  return null;
}

function projectSemanticResolution(item = {}) {
  return Object.freeze({
    kind: String(item.kind || ''),
    field: String(item.field || ''),
    schemaField: String(item.schemaField || ''),
    declared: String(item.declared || ''),
    resolved: String(item.resolved || ''),
    qualification: String(item.qualification || 'unresolved'),
    authority: String(item.authority || ''),
    schemaConstraint: Object.freeze({ ...(item.schemaConstraint || {}) }),
    evidence: Object.freeze((item.evidence || []).map((evidence) => Object.freeze({ ...evidence })))
  });
}
