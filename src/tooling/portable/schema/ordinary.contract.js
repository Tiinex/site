export function compileOrdinaryFieldAuthority(document = {}) {
  const groups = document?.validation?.groups || [];
  const targeting = groups.find((group) => exactToken(group.name) === 'Ordinary Instance Field Targeting');
  const override = groups.find((group) => exactToken(group.name) === 'Instance Target');
  if (!targeting || !override) return null;

  const targetingRules = categoryItems(targeting, ['Rules']).map(exactToken);
  const overrideRules = categoryItems(override, ['Rules']).map(exactToken);
  const overrideShape = categoryItems(override, ['Required Shape']).map(cleanToken);
  const hasDefault = targetingRules.includes('Unless an ordinary instance-field group declares `Instance Target`, its Artifact instance target is the exact second-level heading whose text equals the contract group name.');
  const hasLocalOwnership = targetingRules.includes('Ordinary field occurrences are owned only by their authorized target block. Fields inside a nested heading or named-declaration-owned region are not claimed by an ancestor ordinary group merely because the label matches.');
  const hasSingularOverride = overrideRules.includes('`Instance Target` is singular; it must not be used as a list of multiple Artifact targets.');
  const hasLiteralHeadingShape = overrideShape.includes('one literal Markdown heading token');
  if (!hasDefault || !hasLocalOwnership || !hasSingularOverride || !hasLiteralHeadingShape) return null;

  return Object.freeze({
    state: 'available',
    sourceSchemaId: document?.schemaId || '',
    defaultTarget: 'exact-second-level-same-name',
    overrideCategory: 'Instance Target',
    overrideShape: 'one-literal-markdown-heading-token',
    rules: Object.freeze([...targetingRules, ...overrideRules])
  });
}

export function mergeOrdinaryFieldAuthorities(authorities = []) {
  const available = authorities.filter((authority) => authority?.state === 'available');
  if (!available.length) return Object.freeze({ state: 'unavailable', sources: Object.freeze([]) });
  const signatures = unique(available.map((authority) => `${authority.defaultTarget}\u0000${authority.overrideCategory}\u0000${authority.overrideShape}`));
  if (signatures.length !== 1) {
    return Object.freeze({
      state: 'contradictory',
      sources: Object.freeze(unique(available.map((authority) => authority.sourceSchemaId))),
      findings: Object.freeze(['Ordinary instance-field authority declarations disagree.'])
    });
  }
  return Object.freeze({
    state: 'available',
    sources: Object.freeze(unique(available.map((authority) => authority.sourceSchemaId))),
    defaultTarget: available[0].defaultTarget,
    overrideCategory: available[0].overrideCategory,
    overrideShape: available[0].overrideShape
  });
}

export function compileOrdinaryInstanceFieldGroups({ groups = [], declarations = [], requiredSections = [], requiredHeadings = [], optionalSections = [], authority = null } = {}) {
  if (authority?.state !== 'available') return Object.freeze([]);
  const declarationGroups = new Set((declarations || []).map((item) => exactToken(item.group)));
  const requiredTargets = new Set((requiredSections || []).map(exactToken));
  const optionalTargets = new Set((optionalSections || []).map(exactToken));
  const out = [];

  const authoritySources = new Set(authority.sources || []);
  for (const group of groups || []) {
    if (!isOrdinaryInstanceFieldGroup(group, declarationGroups, authoritySources)) continue;
    const contributors = (group.contributors?.length ? group.contributors : [group])
      .map((contribution) => compileOrdinaryContribution(contribution, authority));
    const target = reconcileOrdinaryTargets(contributors, requiredTargets, optionalTargets, requiredHeadings);
    const requiredFields = unique(contributors.flatMap((item) => item.requiredFields || []));
    const requiredKeys = new Set(requiredFields.map(exactToken));
    const optionalFields = unique(contributors.flatMap((item) => item.optionalFields || []))
      .filter((field) => !requiredKeys.has(exactToken(field)));
    out.push(Object.freeze({
      group: group.name,
      qualification: target.qualification,
      target,
      requiredFields: Object.freeze(requiredFields),
      optionalFields: Object.freeze(optionalFields),
      contributors: Object.freeze(contributors)
    }));
  }
  return Object.freeze(out);
}

function isOrdinaryInstanceFieldGroup(group = {}, declarationGroups = new Set(), authoritySources = new Set()) {
  if (declarationGroups.has(exactToken(group.name))) return false;
  const contributors = group.contributors?.length ? group.contributors : [group];
  if (contributors.length && contributors.every((item) => authoritySources.has(String(item.sourceSchemaId || '')))) return false;
  const requiredFields = categoryItems(group, ['Required Fields']).map(cleanToken);
  const optionalFields = categoryItems(group, ['Optional Fields']).map(cleanToken);
  if (!requiredFields.length && !optionalFields.length) return false;
  if (categoryItems(group, ['Entry Shape']).length) return false;
  if ([...requiredFields, ...optionalFields].some((field) => !isOrdinaryUnqualifiedField(field))) return false;
  return true;
}

function isOrdinaryUnqualifiedField(field = '') {
  const token = cleanToken(field);
  return Boolean(token) && !token.includes('->') && !/^#{1,6}\s+/.test(token);
}

function compileOrdinaryContribution(group = {}, authority = {}) {
  const requiredFields = categoryItems(group, ['Required Fields']).map(cleanToken).filter(isOrdinaryUnqualifiedField);
  const optionalFields = categoryItems(group, ['Optional Fields']).map(cleanToken).filter(isOrdinaryUnqualifiedField);
  const targetCategory = (group.categories || []).find((category) => exactToken(category.name) === exactToken(authority.overrideCategory));
  const targetLabelPresent = Boolean(targetCategory) || (group.labelCandidates || []).some((label) => exactToken(label) === exactToken(authority.overrideCategory));
  const tokens = targetCategory ? (targetCategory.items || []).map(cleanToken).filter(Boolean) : [];
  let target;
  if (!targetLabelPresent) {
    target = Object.freeze({
      heading: `## ${group.name}`,
      title: group.name,
      level: 2,
      authority: 'root-same-name-default',
      qualification: 'valid'
    });
  } else if (tokens.length !== 1) {
    target = Object.freeze({
      heading: '', title: '', level: 0,
      authority: 'explicit-instance-target',
      qualification: 'structurally-invalid',
      findings: Object.freeze([`Instance Target requires exactly one heading token; observed ${tokens.length}.`])
    });
  } else {
    const parsed = parseExactHeadingToken(tokens[0]);
    target = parsed
      ? Object.freeze({ heading: tokens[0], title: parsed.title, level: parsed.level, authority: 'explicit-instance-target', qualification: 'valid' })
      : Object.freeze({ heading: tokens[0], title: '', level: 0, authority: 'explicit-instance-target', qualification: 'structurally-invalid', findings: Object.freeze(['Instance Target must be one exact literal Markdown heading token.']) });
  }
  return Object.freeze({
    sourceSchemaId: String(group.sourceSchemaId || ''),
    group: group.name,
    requiredFields: Object.freeze(unique(requiredFields)),
    optionalFields: Object.freeze(unique(optionalFields)),
    target
  });
}

function reconcileOrdinaryTargets(contributors = [], requiredTargets = new Set(), optionalTargets = new Set(), requiredHeadings = []) {
  const invalid = contributors.filter((item) => item.target?.qualification !== 'valid');
  if (invalid.length) {
    return Object.freeze({
      heading: '', title: '', level: 0, authority: '', requiredness: 'unresolved',
      qualification: 'structurally-invalid',
      findings: Object.freeze(invalid.flatMap((item) => item.target?.findings || []))
    });
  }
  const headings = unique(contributors.map((item) => item.target.heading));
  if (headings.length !== 1) {
    return Object.freeze({
      heading: '', title: '', level: 0, authority: 'conflicting-contributions', requiredness: 'unresolved',
      qualification: 'conflicting',
      findings: Object.freeze([`Ordinary group contributors resolve to different targets: ${headings.join(', ')}.`])
    });
  }
  const first = contributors[0]?.target || {};
  const title = first.title || exactHeadingTitle(first.heading);
  const level = Number(first.level || 0);
  const requiredByExactHeading = (requiredHeadings || []).some((item) => Number(item?.level || 0) === level && exactToken(item?.title) === exactToken(title));
  const requiredBySection = level === 2 && requiredTargets.has(title);
  const optionalBySection = level === 2 && optionalTargets.has(title);
  const required = requiredByExactHeading || requiredBySection;
  const optional = optionalBySection;
  // Root inheritance is additive and descendants may strengthen local requirements.
  // Therefore an inherited optional target plus a required target resolves to required;
  // a field requirement by itself never participates in this decision.
  const requiredness = required ? 'required' : optional ? 'optional' : 'unresolved';
  const targetAuthorities = unique(contributors.map((item) => item.target.authority));
  return Object.freeze({
    heading: first.heading,
    title,
    level,
    authority: targetAuthorities.length === 1 ? targetAuthorities[0] : 'compatible-mixed-authority',
    requiredness,
    qualification: 'valid',
    findings: Object.freeze([])
  });
}

function parseExactHeadingToken(value = '') {
  const match = exactToken(value).match(/^(#{1,6})\s+(.+?)\s*$/);
  return match ? { level: match[1].length, title: match[2].trim() } : null;
}

function categoryItems(group = {}, names = []) {
  const wanted = new Set(names.map(exactToken));
  return (group.categories || []).flatMap((category) => wanted.has(exactToken(category.name)) ? category.items : []);
}

function cleanToken(value = '') { return String(value || '').trim().replace(/^`|`$/g, '').trim(); }
function exactToken(value = '') { return String(value || '').trim(); }
function exactHeadingTitle(value = '') { return exactToken(value).replace(/^#{1,6}\s+/, ''); }
function unique(values = []) { return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]; }
