export function compileFieldValueConstraints(document = {}) {
  const groups = document.validation?.groups || [];
  const sourceSchemaId = String(document.schemaId || '');
  const groupIndex = new Map();
  for (const group of groups) {
    const key = exactToken(group.name);
    if (!groupIndex.has(key)) groupIndex.set(key, []);
    groupIndex.get(key).push(group);
  }

  const constraints = [];
  for (const group of groups) {
    const category = (group.categories || []).find((item) => exactToken(item.name) === 'Field Value Constraints');
    if (!category) continue;

    for (const declaration of category.nodes || []) {
      const field = exactToken(declaration.value);
      const parsed = parseFieldValueConstraintDeclaration(declaration);
      const local = ownedFields(group).has(field);
      const base = {
        kind: 'field-domain',
        sourceSchemaId,
        sourceGroup: group.name,
        field,
        allowedValues: Object.freeze(parsed.allowedValues),
        allowedShapes: Object.freeze(parsed.allowedShapes),
        domainPolicy: parsed.domainPolicy,
        declarationLine: Number(declaration.line || 0),
        declarationQualification: parsed.qualification,
        declarationFindings: Object.freeze(parsed.findings)
      };

      if (!field) {
        constraints.push(Object.freeze({
          ...base,
          targetMode: 'unresolved',
          targetOwnership: 'unresolved',
          targetGroup: '',
          authorityQualification: 'structurally-invalid',
          authorityFindings: Object.freeze(['Field Value Constraints declaration has no exact field label.'])
        }));
        continue;
      }

      if (local) {
        constraints.push(Object.freeze({
          ...base,
          targetMode: 'local',
          targetOwnership: 'source-local',
          ownershipSourceSchemaIds: Object.freeze(sourceSchemaId ? [sourceSchemaId] : []),
          targetGroup: group.name,
          appliesToTarget: '',
          authorityQualification: parsed.qualification,
          authorityFindings: Object.freeze(parsed.findings)
        }));
        continue;
      }

      const appliesTo = unique(categoryItems(group, ['Applies To']).map(cleanToken).filter(Boolean));
      const failures = [];
      const resolvedTargets = [];
      if (!appliesTo.length) failures.push(`Field ${field} is not owned locally and the declaring group has no Applies To targets.`);
      for (const targetName of appliesTo) {
        const matches = groupIndex.get(exactToken(targetName)) || [];
        if (matches.length !== 1) {
          failures.push(`Applies To target ${targetName} resolves to ${matches.length} contract groups.`);
          continue;
        }
        if (!ownedFields(matches[0]).has(field)) {
          failures.push(`Applies To target ${targetName} does not own exact field ${field} under Required Fields or Optional Fields.`);
          continue;
        }
        resolvedTargets.push(matches[0]);
      }

      if (failures.length || resolvedTargets.length !== appliesTo.length) {
        constraints.push(Object.freeze({
          ...base,
          targetMode: 'shared',
          targetOwnership: 'unresolved',
          targetGroup: '',
          appliesToTargets: Object.freeze([...appliesTo]),
          authorityQualification: parsed.qualification === 'valid' ? 'unresolved' : parsed.qualification,
          authorityFindings: Object.freeze([...parsed.findings, ...failures])
        }));
        continue;
      }

      for (const target of resolvedTargets) {
        constraints.push(Object.freeze({
          ...base,
          targetMode: 'shared',
          targetOwnership: 'shared-applies-to',
          targetGroup: target.name,
          appliesToTarget: target.name,
          appliesToTargets: Object.freeze([...appliesTo]),
          targetOwnershipSourceSchemaIds: Object.freeze(sourceSchemaId ? [sourceSchemaId] : []),
          authorityQualification: parsed.qualification,
          authorityFindings: Object.freeze(parsed.findings)
        }));
      }
    }
  }
  return Object.freeze(constraints);
}

export function resolveFieldDomainConstraintsAcrossChain(constraints = [], groups = [], compiledLineage = []) {
  const groupIndex = new Map((groups || []).map((group) => [exactToken(group.name), group]));
  const out = [];
  for (const constraint of constraints || []) {
    if (constraint.kind !== 'field-domain' || constraint.targetGroup || constraint.declarationQualification !== 'valid') {
      out.push(constraint);
      continue;
    }

    // Root local ownership is lineage-aware: a descendant contribution may narrow a field
    // inherited by the same contract group without restating Required/Optional Fields.
    // Full-chain composition is the first point where that ownership can be proven.
    const declaringGroup = groupIndex.get(exactToken(constraint.sourceGroup));
    const inheritedLocal = compiledLineage?.length
      ? lineageLocalOwnershipAtSourcePoint(constraint, compiledLineage)
      : lineageLocalOwnershipFromMergedGroup(declaringGroup, constraint.field, constraint.sourceSchemaId);
    if (inheritedLocal.ambiguous) {
      out.push(Object.freeze({
        ...constraint,
        targetOwnership: 'unresolved',
        targetGroup: '',
        authorityQualification: 'unresolved',
        authorityFindings: inheritedLocal.findings
      }));
      continue;
    }
    if (inheritedLocal.owned) {
      out.push(Object.freeze({
        ...constraint,
        targetMode: 'local',
        targetOwnership: 'inherited-local',
        ownershipSourceSchemaIds: inheritedLocal.sourceSchemaIds,
        targetGroup: constraint.sourceGroup || declaringGroup?.name || '',
        appliesToTarget: '',
        authorityQualification: 'valid',
        authorityFindings: Object.freeze([])
      }));
      continue;
    }

    const targetsWanted = unique(constraint.appliesToTargets || []);
    if (!targetsWanted.length) {
      out.push(Object.freeze({
        ...constraint,
        targetOwnership: 'unresolved',
        authorityQualification: 'unresolved',
        authorityFindings: Object.freeze([
          `Field ${constraint.field} is not owned by declaring group ${constraint.sourceGroup || '(unknown group)'} in the supplied contract chain and no Applies To targets are available.`
        ])
      }));
      continue;
    }

    const shared = compiledLineage?.length
      ? resolveSharedTargetsAtSourcePoint(constraint, targetsWanted, compiledLineage)
      : resolveSharedTargetsFromMergedGroups(constraint, targetsWanted, groupIndex);

    if (!shared.resolved) {
      out.push(Object.freeze({
        ...constraint,
        targetOwnership: 'unresolved',
        authorityQualification: 'unresolved',
        authorityFindings: shared.findings
      }));
      continue;
    }

    for (const target of shared.targets) {
      out.push(Object.freeze({
        ...constraint,
        targetMode: 'shared',
        targetOwnership: 'shared-applies-to',
        targetGroup: target.name,
        appliesToTarget: target.name,
        targetOwnershipSourceSchemaIds: target.sourceSchemaIds,
        authorityQualification: 'valid',
        authorityFindings: Object.freeze([])
      }));
    }
  }
  return Object.freeze(out);
}

function resolveSharedTargetsAtSourcePoint(constraint = {}, targetsWanted = [], compiledLineage = []) {
  const sourceSchemaId = String(constraint.sourceSchemaId || '');
  const sourceMatches = compiledLineage
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => String(item?.schemaId || '') === sourceSchemaId);

  if (sourceMatches.length !== 1) {
    return Object.freeze({
      resolved: false,
      targets: Object.freeze([]),
      findings: Object.freeze([
        `Field-domain source schema ${sourceSchemaId || '(unknown schema)'} resolves to ${sourceMatches.length} supplied lineage positions.`
      ])
    });
  }

  const sourceIndex = sourceMatches[0].index;
  const prefix = compiledLineage.slice(0, sourceIndex + 1);
  const failures = [];
  const targets = [];

  for (const targetName of targetsWanted) {
    const occurrences = [];
    let ambiguous = false;
    for (const compiled of prefix) {
      const matches = (compiled.validation?.groups || []).filter((group) => exactToken(group.name) === exactToken(targetName));
      if (matches.length > 1) {
        failures.push(`Applies To target ${targetName} resolves to ${matches.length} contract groups in source schema ${compiled.schemaId || '(unknown schema)'} at contribution source point ${sourceSchemaId || '(unknown schema)'}.`);
        ambiguous = true;
        break;
      }
      if (matches.length === 1) occurrences.push({ group: matches[0], sourceSchemaId: String(compiled.schemaId || '') });
    }
    if (ambiguous) continue;
    if (!occurrences.length) {
      failures.push(`Applies To target ${targetName} is unavailable at contribution source point ${sourceSchemaId || '(unknown schema)'}.`);
      continue;
    }

    const owners = occurrences.filter(({ group }) => ownedFields(group).has(constraint.field));
    if (!owners.length) {
      failures.push(`Applies To target ${targetName} does not own exact field ${constraint.field} under Required Fields or Optional Fields at contribution source point ${sourceSchemaId || '(unknown schema)'}.`);
      continue;
    }

    targets.push(Object.freeze({
      name: occurrences.at(-1).group.name,
      sourceSchemaIds: Object.freeze(unique(owners.map((item) => item.sourceSchemaId).filter(Boolean)))
    }));
  }

  if (failures.length || targets.length !== targetsWanted.length) {
    return Object.freeze({
      resolved: false,
      targets: Object.freeze([]),
      findings: Object.freeze(failures)
    });
  }

  return Object.freeze({ resolved: true, targets: Object.freeze(targets), findings: Object.freeze([]) });
}

function resolveSharedTargetsFromMergedGroups(constraint = {}, targetsWanted = [], groupIndex = new Map()) {
  const failures = [];
  const targets = [];
  for (const targetName of targetsWanted) {
    const target = groupIndex.get(exactToken(targetName));
    if (!target) {
      failures.push(`Applies To target ${targetName} is unavailable in the supplied contract chain.`);
      continue;
    }
    if (!ownedFields(target).has(constraint.field)) {
      failures.push(`Applies To target ${targetName} does not own exact field ${constraint.field} under Required Fields or Optional Fields in the supplied contract chain.`);
      continue;
    }
    targets.push(Object.freeze({
      name: target.name,
      sourceSchemaIds: Object.freeze(unique((target.contributors || [])
        .filter((item) => ownedFields(item).has(constraint.field))
        .map((item) => String(item.sourceSchemaId || ''))
        .filter(Boolean)))
    }));
  }
  if (failures.length || targets.length !== targetsWanted.length) {
    return Object.freeze({ resolved: false, targets: Object.freeze([]), findings: Object.freeze(failures) });
  }
  return Object.freeze({ resolved: true, targets: Object.freeze(targets), findings: Object.freeze([]) });
}


function lineageLocalOwnershipAtSourcePoint(constraint = {}, compiledLineage = []) {
  const sourceSchemaId = String(constraint.sourceSchemaId || '');
  const sourceMatches = compiledLineage
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => String(item?.schemaId || '') === sourceSchemaId);
  if (sourceMatches.length !== 1) return Object.freeze({
    owned: false,
    ambiguous: true,
    sourceSchemaIds: Object.freeze([]),
    findings: Object.freeze([`Field-domain source schema ${sourceSchemaId || '(unknown schema)'} resolves to ${sourceMatches.length} supplied lineage positions.`])
  });

  const prefix = compiledLineage.slice(0, sourceMatches[0].index + 1);
  const owners = [];
  for (const compiled of prefix) {
    const matches = (compiled.validation?.groups || []).filter((group) => exactToken(group.name) === exactToken(constraint.sourceGroup));
    if (matches.length > 1) return Object.freeze({
      owned: false,
      ambiguous: true,
      sourceSchemaIds: Object.freeze([]),
      findings: Object.freeze([
        `Inherited local contract group ${constraint.sourceGroup || '(unknown group)'} resolves to ${matches.length} exact groups in source schema ${compiled.schemaId || '(unknown schema)'} at contribution source point ${sourceSchemaId || '(unknown schema)'}.`
      ])
    });
    if (matches.length === 1 && ownedFields(matches[0]).has(constraint.field)) owners.push(String(compiled.schemaId || ''));
  }
  return Object.freeze({
    owned: owners.length > 0,
    ambiguous: false,
    sourceSchemaIds: Object.freeze(unique(owners.filter(Boolean))),
    findings: Object.freeze([])
  });
}

function lineageLocalOwnershipFromMergedGroup(group = null, field = '', sourceSchemaId = '') {
  if (!group || !sourceSchemaId) return Object.freeze({ owned: false, ambiguous: false, sourceSchemaIds: Object.freeze([]), findings: Object.freeze([]) });
  const contributors = group.contributors?.length ? group.contributors : [group];
  const sourceIndex = contributors.findIndex((item) => String(item.sourceSchemaId || '') === String(sourceSchemaId || ''));
  if (sourceIndex < 0) return Object.freeze({ owned: false, ambiguous: false, sourceSchemaIds: Object.freeze([]), findings: Object.freeze([]) });
  const prefix = contributors.slice(0, sourceIndex + 1);
  const duplicateSources = unique(prefix.map((item) => String(item.sourceSchemaId || '')).filter(Boolean))
    .filter((schemaId) => prefix.filter((item) => String(item.sourceSchemaId || '') === schemaId).length > 1);
  if (duplicateSources.length) return Object.freeze({
    owned: false,
    ambiguous: true,
    sourceSchemaIds: Object.freeze([]),
    findings: Object.freeze(duplicateSources.map((schemaId) => `Inherited local contract group ${group.name || '(unknown group)'} is duplicated in source schema ${schemaId}.`))
  });
  const owners = prefix.filter((item) => ownedFields(item).has(field));
  return Object.freeze({
    owned: owners.length > 0,
    ambiguous: false,
    sourceSchemaIds: Object.freeze(unique(owners.map((item) => String(item.sourceSchemaId || '')).filter(Boolean))),
    findings: Object.freeze([])
  });
}

function parseFieldValueConstraintDeclaration(node = {}) {
  const allowedValues = [];
  const allowedShapes = [];
  const policies = [];
  const findings = [];
  const unknownChildren = [];

  for (const child of node.children || []) {
    const parsed = splitConstraintProperty(child.value);
    if (!parsed) {
      unknownChildren.push(String(child.value || ''));
      continue;
    }
    if ((child.children || []).length) {
      unknownChildren.push(`${String(child.value || '')} -> nested declaration content`);
      continue;
    }
    if (parsed.name === 'Allowed Value') allowedValues.push(parsed.value);
    else if (parsed.name === 'Allowed Shape') allowedShapes.push(parsed.value);
    else if (parsed.name === 'Domain Policy') policies.push(parsed.value);
    else unknownChildren.push(String(child.value || ''));
  }

  if (policies.length !== 1) findings.push(`Expected exactly one Domain Policy; found ${policies.length}.`);
  const domainPolicy = policies.length === 1 ? policies[0] : '';
  if (domainPolicy && domainPolicy !== 'closed' && domainPolicy !== 'extension-authorized') findings.push(`Unsupported Domain Policy: ${domainPolicy}.`);
  if (!allowedValues.length && !allowedShapes.length) findings.push('At least one Allowed Value or Allowed Shape is required.');
  if (unknownChildren.length) findings.push(`Unsupported Field Value Constraints declaration properties: ${unknownChildren.join(', ')}.`);

  return Object.freeze({
    allowedValues: Object.freeze([...allowedValues]),
    allowedShapes: Object.freeze([...allowedShapes]),
    domainPolicy,
    qualification: findings.length ? 'structurally-invalid' : 'valid',
    findings: Object.freeze(findings)
  });
}

function splitConstraintProperty(value = '') {
  const text = String(value || '');
  const separator = text.indexOf(':');
  if (separator <= 0) return null;
  const name = text.slice(0, separator).trim();
  const propertyValue = text.slice(separator + 1).trim();
  if (!name || !propertyValue) return null;
  return { name, value: propertyValue };
}

function ownedFields(group = {}) {
  return new Set([
    ...categoryItems(group, ['Required Fields']),
    ...categoryItems(group, ['Optional Fields'])
  ].map(cleanToken).filter(Boolean));
}

function categoryItems(group = {}, names = []) {
  const wanted = new Set(names.map(exactToken));
  return (group.categories || []).flatMap((category) => wanted.has(exactToken(category.name)) ? category.items : []);
}

function cleanToken(value = '') { return String(value || '').trim().replace(/^`|`$/g, '').trim(); }
function exactToken(value = '') { return String(value || '').trim(); }
function unique(values = []) { return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]; }
