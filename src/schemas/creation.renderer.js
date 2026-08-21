import { sealC14nV2Self } from '../integrity/integrity.c14nV2.js';
import { schemaIdForRecord } from './schema.identity.js';
import { canonicalRootCreatedAt } from './creation.rootMetadata.js';
import { renderSchemaReference } from './schema.reference.js';

export const GENERIC_ARTIFACT_CREATION_RENDERER_ID = 'tiinex.site.generic-artifact-creation-renderer.v1';

export function renderArtifactCreationDraftMarkdown(contract = {}, input = {}) {
  const parentRecord = input.parentRecord || {};
  const rootCreation = String(contract?.transitionType || 'create-artifact') === 'create-artifact';
  const currentSchemaId = String(input.currentSchemaId || contract.target?.schemaId || '').trim();
  const createdAt = rootCreation ? canonicalRootCreatedAt(input.createdAt) : String(input.createdAt || new Date().toISOString()).trim();
  const values = creationValues(input);
  const summaryBinding = (contract?.creation?.inputBindings || []).find((binding) => binding?.kind === 'root-current-summary-body-title');
  const boundSummary = summaryBinding ? creationValue(values, summaryBinding.input) : undefined;
  const hasBoundSummary = Boolean(summaryBinding && boundSummary !== undefined);
  const boundSummaryText = hasBoundSummary ? exactOneLineValue(boundSummary, 'Summary') : '';
  if (hasBoundSummary && input.title !== undefined && String(input.title) !== boundSummaryText) throw new Error('creation-summary-title-conflict');
  if (hasBoundSummary && input.summary !== undefined && String(input.summary) !== boundSummaryText) throw new Error('creation-summary-envelope-conflict');
  const title = hasBoundSummary
    ? boundSummaryText
    : exactOneLineValue(input.title !== undefined ? input.title : `${contract.target?.label || labelFromSchemaId(currentSchemaId)} Draft`, 'title');
  const summary = hasBoundSummary
    ? boundSummaryText
    : exactOneLineValue(input.summary !== undefined ? input.summary : title, 'summary');
  const status = rootCreation ? '' : exactOneLineValue(input.status !== undefined ? input.status : 'draft/local', 'status');
  const why = rootCreation ? '' : exactOneLineValue(input.why !== undefined ? input.why : 'Created as a browser-local draft. No source provenance is inferred.', 'why');
  const bodyMarkdown = input.bodyMarkdown !== undefined
    ? String(input.bodyMarkdown)
    : contractDrivenBodyMarkdown(contract, { title, values });
  const rootSchemaId = 'tiinex.root.v1';
  const envelopeSchemaReference = rootCreation
    ? renderSchemaReference(contract?.schemaReferences?.envelope || { schemaId: rootSchemaId })
    : `[${rootSchemaId}](${rootSchemaId}.schema.md)`;
  const currentSchemaReference = rootCreation
    ? renderSchemaReference(contract?.schemaReferences?.current || { schemaId: currentSchemaId })
    : `[${currentSchemaId}](${currentSchemaId}.schema.md)`;
  const parent = parentEnvelope(parentRecord);
  if (contract?.transitionType === 'create-artifact' && parent) throw new Error('creation-root-parent-not-authorized');
  const integrityLines = rootCreation
    ? ['- sha256-base64url-c14n-v2', '  - Towards: self', '  - Value: pending']
    : ['- Draft Local Integrity', '  - Method: browser-local-draft', '  - Value: pending-publication-or-export'];
  const unsigned = [
    '# Continuity Context', '',
    `- Envelope Schema: ${envelopeSchemaReference}`,
    ...(parent ? [
      '- Parent',
      `  - Parent Schema: [${parent.schemaId}](${parent.schemaId}.schema.md)`,
      parent.createdAt ? `  - Created At: ${parent.createdAt}` : '',
      `  - Trace: ${parent.trace}`,
      parent.origin ? `  - Origin: ${parent.origin}` : '',
      `  - Boundary: ${parent.boundary}`
    ] : []),
    '- Current',
    `  - Current Schema: ${currentSchemaReference}`,
    `  - Created At: ${createdAt}`,
    `  - Summary: ${summary}`,
    ...(!rootCreation ? [`  - Status: ${status}`, `  - Why: ${why}`] : []),
    '', '---', '', bodyMarkdown, '', '# Continuity Integrity', '',
    ...integrityLines
  ].filter((line) => line !== '').join('\n');
  if (!rootCreation) return unsigned;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') throw new Error(`creation-integrity-seal-${sealed.reason || sealed.state}`);
  return sealed.markdown;
}

export const genericArtifactCreationImplementation = Object.freeze({
  status: 'implemented',
  renderer: Object.freeze({ id: GENERIC_ARTIFACT_CREATION_RENDERER_ID, scope: 'contract-driven-browser-local-draft' }),
  execute: renderArtifactCreationDraftMarkdown
});

function contractDrivenBodyMarkdown(contract = {}, { title = '', values = {} } = {}) {
  const sections = Array.isArray(contract?.creation?.requiredSections) ? contract.creation.requiredSections : [];
  const bindings = Array.isArray(contract?.creation?.inputBindings) ? contract.creation.inputBindings : [];
  if (!sections.length) throw new Error('creation-representation-required-sections-unavailable');
  const lines = [`# ${title}`];
  for (const section of sections) {
    const binding = bindings.find((candidate) => candidate?.kind === 'section-body' && candidate?.section === section);
    if (!binding) throw new Error(`creation-input-binding-unavailable:${section}`);
    const value = creationValue(values, binding.input);
    if (value === undefined || String(value).trim() === '') throw new Error(`creation-required-input-missing:${binding.input}`);
    lines.push('', `## ${section}`, '', String(value));
  }
  return lines.join('\n');
}

function creationValues(input = {}) {
  const explicit = input.values && typeof input.values === 'object' && !Array.isArray(input.values) ? input.values : {};
  const alternate = input.inputs && typeof input.inputs === 'object' && !Array.isArray(input.inputs) ? input.inputs : {};
  return Object.freeze({ ...alternate, ...explicit });
}
function creationValue(values = {}, name = '') {
  return Object.prototype.hasOwnProperty.call(values, name) ? values[name] : undefined;
}
function parentEnvelope(record = {}) {
  const hasParent = Boolean(record?.id || record?.path || record?.schemaId || record?.currentSchemaId || record?.continuationTrace);
  if (!hasParent) return null;
  const schemaId = schemaIdForRecord(record);
  const trace = String(record.continuationTrace || (record.id ? `record:${record.id}` : '')).trim();
  if (!schemaId || !trace) throw new Error('creation-parent-identity-incomplete');
  return Object.freeze({
    schemaId,
    createdAt: String(record.createdAt || '').trim(),
    trace,
    origin: String(record.path || '').trim(),
    boundary: boundaryForRecord(record)
  });
}

function exactOneLineValue(value, label = 'value') {
  const text = String(value ?? '');
  if (!text || /[\r\n]/.test(text) || text !== text.trim()) throw new Error(`creation-one-line-value-unrepresentable:${label}`);
  return text;
}
function labelFromSchemaId(id = '') { const tail = String(id || '').split('.').filter(Boolean).slice(-2, -1)[0] || String(id || 'artifact'); return tail.charAt(0).toUpperCase() + tail.slice(1); }
function boundaryForRecord(record = {}) {
  const source = record.source || {};
  if (source.adapterId === 'github') return 'source-backed github material';
  if (source.adapterId === 'local' || source.kind === 'local-session' || record.sourceMode?.startsWith?.('local')) return 'browser-local session material; no GitHub provenance inferred';
  return String(record.boundary || source.boundary || 'explicit record boundary');
}
