import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../integrity/integrity.c14nV2.js';
import { schemaIdForRecord } from './schema.identity.js';
import { canonicalRootCreatedAt } from './creation.rootMetadata.js';
import { renderSchemaReference } from './schema.reference.js';
import { C14N_V2_METHOD_ID, renderIntegrityMethodReference } from '../integrity/integrity.methodReference.js';

export const GENERIC_ARTIFACT_CREATION_RENDERER_ID = 'tiinex.site.generic-artifact-creation-renderer.v1';

export function renderArtifactCreationDraftMarkdown(contract = {}, input = {}) {
  const parentRecord = input.parentRecord || {};
  const rootCreation = String(contract?.transitionType || 'create-artifact') === 'create-artifact';
  const currentSchemaId = String(input.currentSchemaId || contract.target?.schemaId || '').trim();
  const createdAt = canonicalRootCreatedAt(input.createdAt);
  const values = creationValues(input);
  const summaryBinding = (contract?.creation?.inputBindings || []).find((binding) => binding?.kind === 'root-current-summary-body-title');
  const boundSummary = summaryBinding ? creationValue(values, summaryBinding.input) : undefined;
  const hasBoundSummary = Boolean(summaryBinding && boundSummary !== undefined);
  const boundSummaryText = hasBoundSummary ? exactOneLineValue(boundSummary, 'Summary') : '';
  if (hasBoundSummary && input.title !== undefined && String(input.title) !== boundSummaryText) throw new Error('creation-summary-title-conflict');
  if (hasBoundSummary && input.summary !== undefined && String(input.summary) !== boundSummaryText) throw new Error('creation-summary-envelope-conflict');
  const title = hasBoundSummary ? boundSummaryText : exactOneLineValue(input.title !== undefined ? input.title : `${contract.target?.label || labelFromSchemaId(currentSchemaId)} Draft`, 'title');
  const summary = hasBoundSummary ? boundSummaryText : exactOneLineValue(input.summary !== undefined ? input.summary : title, 'summary');
  const authorsValue = input.authors !== undefined ? input.authors : creationValue(values, 'Authors');
  const authors = authorsValue === undefined ? '' : exactOneLineValue(authorsValue, 'Authors');
  const whyValue = input.why !== undefined ? input.why : creationValue(values, 'Why');
  const why = whyValue === undefined || String(whyValue) === '' ? '' : exactOneLineValue(whyValue, 'Why');
  const statusValue = input.status !== undefined ? input.status : creationValue(values, 'Status');
  const status = statusValue === undefined || String(statusValue) === '' ? '' : exactOneLineValue(statusValue, 'Status');
  const bodyMarkdown = input.bodyMarkdown !== undefined ? String(input.bodyMarkdown) : contractDrivenBodyMarkdown(contract, { title, values });
  const rootSchemaId = 'tiinex.root.v1';
  const envelopeSchemaReference = renderSchemaReference(contract?.schemaReferences?.envelope || { schemaId: rootSchemaId });
  const currentSchemaReference = renderSchemaReference(contract?.schemaReferences?.current || { schemaId: currentSchemaId });
  const parent = parentEnvelope(parentRecord, input.childPath || '');
  const integrityMethodReference = renderIntegrityMethodReference(contract?.integrityMethodReferences?.primarySelf || { methodId: C14N_V2_METHOD_ID });
  if (rootCreation && parent) throw new Error('creation-root-parent-not-authorized');
  if (!rootCreation && !parent) throw new Error('creation-continuation-parent-required');
  const lines = [
    '# Continuity Context', '',
    `- Envelope Schema: ${envelopeSchemaReference}`,
    ...(parent ? renderParent(parent) : []),
    '- Current',
    `  - Current Schema: ${currentSchemaReference}`,
    `  - Created At: ${createdAt}`,
    ...(authors ? [`  - Authors: ${authors}`] : []),
    ...(why ? [`  - Why: ${why}`] : []),
    `  - Summary: ${summary}`,
    ...(status ? [`  - Status: ${status}`] : []),
    '', '---', '', bodyMarkdown, '', '# Continuity Integrity', '',
    ...(parent ? [
      `- ${integrityMethodReference}`,
      `  - Towards: [${parent.traceLabel}](${parent.integrityTarget})`,
      `  - Value: ${parent.primarySelfDigest}`,
      ''
    ] : []),
    `- ${integrityMethodReference}`,
    '  - Towards: self',
    '  - Value: pending'
  ];
  const unsigned = lines.join('\n');
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') throw new Error(`creation-integrity-seal-${sealed.reason || sealed.state}`);
  return sealed.markdown;
}

export const genericArtifactCreationImplementation = Object.freeze({
  status: 'implemented',
  renderer: Object.freeze({ id: GENERIC_ARTIFACT_CREATION_RENDERER_ID, scope: 'contract-driven-browser-local-draft' }),
  execute: renderArtifactCreationDraftMarkdown
});

function renderParent(parent) {
  return [
    '- Parent',
    `  - Parent Schema: ${renderSchemaReference(parent.schemaReferenceAuthority)}`,
    ...(parent.createdAt ? [`  - Created At: ${parent.createdAt}`] : []),
    `  - Trace: [${parent.traceLabel}](${parent.relativeReference})`,
    '  - Origin:',
    `    - [relative](${parent.relativeReference})`,
    ...(parent.publishedReference ? [`    - [browse + git](${parent.publishedReference})`] : [])
  ];
}

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
function creationValue(values = {}, name = '') { return Object.prototype.hasOwnProperty.call(values, name) ? values[name] : undefined; }

function parentEnvelope(record = {}, childPath = '') {
  const hasParent = Boolean(record?.id || record?.path || record?.schemaId || record?.currentSchemaId || record?.publishedReference);
  if (!hasParent) return null;
  const schemaId = schemaIdForRecord(record);
  const parentPath = normalizePath(record.path);
  const child = normalizePath(childPath);
  const relativeReference = String(record.relativeReference || relativePath(dirname(child), parentPath)).trim();
  const published = normalizePublishedReference(record.publishedReference || record.browseGitReference || record.browseGit || '');
  const schemaReferenceAuthority = normalizeParentSchemaReferenceAuthority(record.schemaReferenceAuthority || record.parentSchemaReferenceAuthority, schemaId);
  if (!schemaId || !parentPath || !child || !relativeReference) throw new Error('creation-parent-identity-incomplete');
  const parentSelf = validatedC14nV2PrimarySelfDigest(record.markdown || '');
  if (parentSelf.state !== 'verified') throw new Error(`creation-parent-primary-self-${parentSelf.reason || parentSelf.state}`);
  const publishedReference = published.state === 'qualified' ? published.target : '';
  const integrityTarget = publishedReference || relativeReference;
  if (!integrityTarget) throw new Error('creation-parent-integrity-target-unavailable');
  return Object.freeze({
    schemaId,
    schemaReferenceAuthority,
    createdAt: String(record.createdAt || '').trim(),
    relativeReference,
    publishedReference,
    integrityTarget,
    primarySelfDigest: parentSelf.value,
    traceLabel: basename(parentPath)
  });
}

function normalizePublishedReference(value) {
  if (typeof value === 'string') return Object.freeze({ target: value, state: value ? 'unresolved' : 'unavailable' });
  return Object.freeze({ target: String(value?.target || value?.url || ''), state: String(value?.state || value?.resolutionState || 'unresolved') });
}
function normalizeParentSchemaReferenceAuthority(value, schemaId) {
  if (typeof value === 'string') return Object.freeze({ schemaId, exactTargets: Object.freeze([value]), preferredTarget: value, resolutionState: 'unresolved' });
  const target = String(value?.preferredTarget || value?.target || '');
  const exactTargets = [...new Set([...(value?.exactTargets || []), target].map(String).filter(Boolean))];
  return Object.freeze({ schemaId: String(value?.schemaId || schemaId), exactTargets: Object.freeze(exactTargets), preferredTarget: target || exactTargets[0] || '', resolutionState: String(value?.resolutionState || value?.state || 'unresolved') });
}
function exactOneLineValue(value, label = 'value') {
  const text = String(value ?? '');
  if (!text || /[\r\n]/.test(text) || text !== text.trim()) throw new Error(`creation-one-line-value-unrepresentable:${label}`);
  return text;
}
function labelFromSchemaId(id = '') { const tail = String(id || '').split('.').filter(Boolean).slice(-2, -1)[0] || String(id || 'artifact'); return tail.charAt(0).toUpperCase() + tail.slice(1); }
function normalizePath(value='') { return String(value || '').replace(/\\/g,'/').replace(/^\.\//,'').replace(/^\/+|\/+$/g,''); }
function dirname(value='') { const p=normalizePath(value); const i=p.lastIndexOf('/'); return i<0?'':p.slice(0,i); }
function basename(value='') { const p=normalizePath(value); return p.split('/').pop() || 'parent'; }
function relativePath(fromDir='', toPath='') {
  const from=normalizePath(fromDir).split('/').filter(Boolean), to=normalizePath(toPath).split('/').filter(Boolean);
  let i=0; while (i<from.length && i<to.length && from[i]===to[i]) i+=1;
  return [...Array(from.length-i).fill('..'), ...to.slice(i)].join('/') || basename(toPath);
}
