import { compilePortableSchemaContract } from './contract.compile.js';
import { validatePortableContractInstance } from './contract.validate.js';
import { resolveClassificationAgreement } from './contract.semantic-resolution.js';

export const PORTABLE_RESOLVED_INSTANCE_PROJECTION_SCHEMA_ID = 'tiinex.portable.resolved-contract-instance.v1';

export function projectPortableContractInstance(input = {}, options = {}) {
  if (Object.prototype.hasOwnProperty.call(input, 'validation')) {
    throw new TypeError('projectPortableContractInstance owns validation; precomputed validation input is not accepted because authority context must remain coherent.');
  }
  const compiled = input.compiledContract || compilePortableSchemaContract(input.schemaMarkdown || input.schemaDocument || '');
  const resolvers = input.resolvers || options.resolvers || {};
  const validation = validatePortableContractInstance({
    markdown: String(input.markdown || ''),
    compiledContract: compiled,
    resolvers
  });
  const constraintIndex = classificationConstraintsByGroup(compiled.constraints || []);
  const declarations = [];

  for (const parsedGroup of validation.declarations || []) {
    const group = parsedGroup.contract.group;
    const constraints = constraintIndex.get(exactToken(group)) || [];
    if (!constraints.length) continue;
    const sections = [];
    for (const section of parsedGroup.sections || []) {
      const entries = [];
      for (const entry of section.entries || []) {
        if (entry.name === 'none') continue;
        const semantics = constraints.map((constraint) => resolveClassificationAgreement({ entry, constraint, resolvers }));
        entries.push(Object.freeze({
          name: entry.name,
          declaredFields: entry.fields,
          semantics: Object.freeze(semantics)
        }));
      }
      sections.push(Object.freeze({
        heading: section.heading,
        present: Boolean(section.present),
        entries: Object.freeze(entries)
      }));
    }
    declarations.push(Object.freeze({
      group,
      targetHeadings: parsedGroup.contract.targetHeadings,
      sections: Object.freeze(sections)
    }));
  }

  return Object.freeze({
    schema: PORTABLE_RESOLVED_INSTANCE_PROJECTION_SCHEMA_ID,
    schemaId: compiled.schemaId,
    validation,
    ordinaryGroups: validation.ordinaryGroups || Object.freeze([]),
    fieldDomains: validation.fieldDomains || Object.freeze({ groups: Object.freeze([]), findings: Object.freeze([]) }),
    declarations: Object.freeze(declarations),
    limitations: Object.freeze([
      'Projection is read-only and preserves declared fields separately from resolved semantics.',
      'Ordinary contract-instance fields are projected only through compiled Root/schema target authority; document-wide label fallback is not used.',
      'Field-domain truth is projected from compiled Field Value Constraints contributions without reinterpreting Allowed Labels.',
      'Schema assignability/ancestor matching is not inferred by this projection.'
    ])
  });
}

function classificationConstraintsByGroup(constraints = []) {
  const out = new Map();
  for (const constraint of constraints) {
    if (constraint.kind !== 'classification-agreement') continue;
    for (const group of constraint.groups || []) {
      const key = exactToken(group);
      if (!out.has(key)) out.set(key, []);
      out.get(key).push(constraint);
    }
  }
  return out;
}

function exactToken(value = '') {
  return String(value || '').trim();
}
