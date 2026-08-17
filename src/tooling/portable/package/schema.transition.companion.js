import { portableFinding, summarizePortableFindings } from '../findings.js';
import { projectPortableContractInstance } from '../schema/contract.project.js';
import { extractQualifiedMarkdownLinkTarget, portableFieldDomainOccurrenceQualification } from './material.graph.js';

export const PORTABLE_SCHEMA_TRANSITION_COMPANION_SCHEMA_ID = 'tiinex.portable.schema-transition-companion.v1';

export function compilePortableSchemaTransitionCompanion(input = {}) {
  const material = input.material || {};
  const compiledContract = input.compiledContract;
  const findings = [];
  if (!compiledContract) {
    findings.push(portableFinding('error', 'portable.companion.contract.missing', 'Schema Transition Companion compilation requires a compiled canonical contract chain.', { ref: material.path || material.representationKey || '' }));
    return companionResult(material, null, null, [], findings);
  }

  const projection = projectPortableContractInstance({
    markdown: material.markdown || '',
    compiledContract,
    resolvers: input.resolvers || {}
  });
  findings.push(...projection.validation.findings);

  const schemaReference = ordinaryFieldValue(projection, 'Schema Binding', 'Schema Reference');
  const rawSchemaBinding = resolveQualifiedReference({
    projection,
    group: 'Schema Binding',
    field: 'Schema Reference',
    value: schemaReference,
    resolve: input.resolveSchemaReference,
    material,
    entry: ''
  });
  const schemaBinding = Object.freeze({
    ...rawSchemaBinding,
    representationKey: String(rawSchemaBinding.material?.representationKey || ''),
    schemaId: String(rawSchemaBinding.material?.schemaId || ''),
    path: String(rawSchemaBinding.material?.path || '')
  });
  if (schemaBinding.finding) findings.push(schemaBinding.finding);

  const attachmentGroup = declarationGroup(projection.validation.declarations, 'Transition Attachment Declaration');
  const entries = attachmentGroup?.sections?.flatMap((section) => section.present ? section.entries : []) || [];
  const noneEntries = entries.filter((entry) => entry.name === 'none');
  const explicitEmpty = noneEntries.length === 1 && entries.length === 1;
  const attachments = [];
  const seenRepresentationKeys = new Set();

  if (noneEntries.length && !explicitEmpty) {
    findings.push(portableFinding('error', 'portable.companion.attachments.none.invalid', 'Literal none must be the sole Transition Attachments entry.', { ref: material.path || '' }));
  }

  for (const entry of entries) {
    if (entry.name === 'none') continue;
    const reference = String(entry.fields?.['Transition Reference'] || '');
    const resolution = resolveQualifiedReference({
      projection,
      group: 'Transition Attachment Declaration',
      field: 'Transition Reference',
      value: reference,
      resolve: input.resolveTransitionReference,
      material,
      entry: entry.name
    });
    if (resolution.finding) findings.push(resolution.finding);
    const targetKey = String(resolution.material?.representationKey || '');
    let duplicate = false;
    if (resolution.qualification === 'resolved' && targetKey) {
      if (seenRepresentationKeys.has(targetKey)) {
        duplicate = true;
        findings.push(portableFinding('error', 'portable.companion.attachment.duplicate', 'Two companion attachment entries resolve to the same exact Transition representation.', {
          ref: material.path || '',
          entry: entry.name,
          transitionRepresentationKey: targetKey
        }));
      }
      seenRepresentationKeys.add(targetKey);
    }
    const participation = resolution.qualification === 'resolved' && typeof input.qualifyParticipation === 'function'
      ? input.qualifyParticipation({ companionMaterial: material, schemaBinding, transitionMaterial: resolution.material, attachmentEntry: entry })
      : Object.freeze({ qualification: 'unresolved', evidence: Object.freeze([]) });
    if (participation?.qualification === 'contradictory') {
      findings.push(portableFinding('error', 'portable.companion.attachment.participation.contradictory', 'Resolved Transition participation definitively excludes the companion-bound schema.', {
        ref: material.path || '',
        entry: entry.name,
        transitionRepresentationKey: targetKey
      }));
    } else if (resolution.qualification === 'resolved' && participation?.qualification === 'unresolved') {
      findings.push(portableFinding('warning', 'portable.companion.attachment.participation.unresolved', 'Attachment resolves, but Transition participation for the companion-bound schema remains unresolved.', {
        ref: material.path || '',
        entry: entry.name,
        transitionRepresentationKey: targetKey
      }));
    }
    attachments.push(Object.freeze({
      name: entry.name,
      reference,
      referenceTarget: resolution.referenceTarget,
      referenceQualification: resolution.qualification,
      transitionRepresentationKey: targetKey,
      transitionPath: String(resolution.material?.path || ''),
      duplicate,
      note: String(entry.fields?.Note || ''),
      participation: participation || Object.freeze({ qualification: 'unresolved', evidence: Object.freeze([]) }),
      source: entry.source || null
    }));
  }

  return companionResult(material, projection, schemaBinding, attachments, findings, explicitEmpty);
}

function companionResult(material, projection, schemaBinding, attachments, findings, explicitEmpty = false) {
  const summary = summarizePortableFindings(findings);
  const status = summary.counts.error ? 'invalid' : summary.counts.warning ? 'unresolved' : 'valid';
  return Object.freeze({
    schema: PORTABLE_SCHEMA_TRANSITION_COMPANION_SCHEMA_ID,
    status,
    representationKey: String(material?.representationKey || ''),
    path: String(material?.path || ''),
    source: Object.freeze({ ...(material?.source || {}) }),
    references: Object.freeze([...(material?.referenceAliases || [])]),
    projection,
    schemaBinding: schemaBinding || Object.freeze({ qualification: 'unresolved', reference: '', representationKey: '', schemaId: '' }),
    attachmentSet: Object.freeze({
      state: explicitEmpty ? 'explicit-empty' : 'declared',
      explicitEmpty,
      attachments: Object.freeze([...(attachments || [])])
    }),
    findings: Object.freeze([...(findings || [])]),
    findingSummary: summary
  });
}

function resolveQualifiedReference({ projection, group, field, value, resolve, material, entry }) {
  const text = String(value || '');
  if (!text) {
    return Object.freeze({
      qualification: 'unresolved', reference: text, referenceTarget: '', material: null,
      finding: portableFinding('error', 'portable.companion.reference.missing', `Required reference field is missing: ${group}.${field}.`, { ref: material.path || '', entry, field })
    });
  }
  const shape = portableFieldDomainOccurrenceQualification(projection, group, field, text, entry);
  if (shape !== 'core') {
    return Object.freeze({
      qualification: 'unresolved', reference: text, referenceTarget: '', material: null,
      finding: portableFinding('warning', 'portable.companion.reference.shape.unresolved', `Reference field does not have resolved canonical Markdown Link shape authority: ${group}.${field}.`, { ref: material.path || '', entry, field, fieldDomainQualification: shape })
    });
  }
  const target = extractQualifiedMarkdownLinkTarget(text);
  if (!target) {
    return Object.freeze({
      qualification: 'unresolved', reference: text, referenceTarget: '', material: null,
      finding: portableFinding('error', 'portable.companion.reference.decomposition.failed', 'A shape-qualified Markdown Link could not be decomposed into its target.', { ref: material.path || '', entry, field })
    });
  }
  if (typeof resolve !== 'function') {
    return Object.freeze({
      qualification: 'unresolved', reference: text, referenceTarget: target, material: null,
      finding: portableFinding('warning', 'portable.companion.reference.resolver.unavailable', 'No package-scoped reference resolver was supplied for a shape-qualified reference.', { ref: material.path || '', entry, field, target })
    });
  }
  const resolved = resolve({ target, value: text, fromMaterial: material, entry, field, group }) || {};
  const qualification = String(resolved.qualification || 'unresolved');
  const severity = qualification === 'ambiguous' || qualification === 'invalid' ? 'error' : 'warning';
  const finding = qualification === 'resolved'
    ? null
    : portableFinding(severity, qualification === 'ambiguous' ? 'portable.companion.reference.ambiguous' : qualification === 'invalid' ? 'portable.companion.reference.invalid' : 'portable.companion.reference.unresolved', resolved.finding || `Reference could not resolve exactly: ${target}.`, { ref: material.path || '', entry, field, target });
  const candidates = Object.freeze((resolved.candidates || []).map((candidate) => Object.freeze({
    representationKey: String(candidate?.representationKey || ''),
    path: String(candidate?.path || ''),
    schemaId: String(candidate?.schemaId || ''),
    source: Object.freeze({ ...(candidate?.source || {}) })
  })));
  return Object.freeze({
    qualification,
    reference: text,
    referenceTarget: target,
    material: qualification === 'resolved' ? (resolved.material || resolved.candidates?.[0] || null) : null,
    candidates,
    finding
  });
}

function ordinaryFieldValue(projection = {}, groupName = '', fieldName = '') {
  const group = (projection.ordinaryGroups || []).find((item) => exact(item.group) === exact(groupName));
  const field = (group?.fields || []).find((item) => exact(item.label) === exact(fieldName));
  const occurrences = field?.occurrences || [];
  return occurrences.length === 1 ? String(occurrences[0].value ?? '') : '';
}

function declarationGroup(groups = [], name = '') {
  return (groups || []).find((item) => exact(item.contract?.group) === exact(name));
}

function exact(value = '') {
  return String(value || '').trim();
}
