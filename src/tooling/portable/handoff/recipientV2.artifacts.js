import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { qualifyTiinexRouteArtifact } from './routeArtifactConformance.js';
import {
  correlateExternalPayloadFacts,
  correlatePointerFacts,
  correlateRelationFacts,
  currentSchemaId,
  decodeUtf8,
  deepFreeze,
  fieldValue,
  finding,
  inspectExternalPayloadShape,
  inspectRelationShape,
  markdownTarget,
  sectionText,
  unquoteCode
} from './recipientV2.artifactInspection.js';
import {
  RECIPIENT_V2_WORKSPACE_REPRESENTATION_SCHEMA_TARGET,
  correlateWorkspaceRepresentationFacts,
  inspectWorkspaceRepresentationShape,
  parseRecipientV2WorkspaceRepresentation,
  parseRecipientV2ExternalPayload,
  renderRecipientV2WorkspaceRepresentation
} from './recipientV2.workspaceRepresentation.js';
export {
  RECIPIENT_V2_WORKSPACE_REPRESENTATION_SCHEMA_TARGET,
  parseRecipientV2WorkspaceRepresentation,
  parseRecipientV2ExternalPayload,
  renderRecipientV2WorkspaceRepresentation
};


export const RECIPIENT_V2_ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
export const RECIPIENT_V2_POINTER_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/pointer/tiinex.pointer.v1.schema.md';
export const RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/external/payload/tiinex.external.payload.v1.schema.md';
export const RECIPIENT_V2_RELATION_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/relation/tiinex.relation.v1.schema.md';
export const RECIPIENT_V2_WORKSPACE_SCHEMA_TARGET = 'https://github.com/Tiinex/site/blob/17283cd2f0b9b0782a149a0cd113fb88a5a55ef3/src/schemas/workspace/tiinex.workspace.v1.schema.md';
export const RECIPIENT_V2_FACTS_BEGIN = '<!-- TIINEX-RECIPIENT-V2-FACTS:BEGIN -->';
export const RECIPIENT_V2_FACTS_END = '<!-- TIINEX-RECIPIENT-V2-FACTS:END -->';

export function renderRecipientV2Pointer(input = {}) {
  const role = String(input.role || 'navigation');
  const artifactFirst = input.artifactFirst === true;
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const destinations = (input.destinations || []).map((item) => `- ${String(item.label || 'Destination')}: [${String(item.display || item.target || '')}](${String(item.target || '')})`).join('\n');
  const currentRead = (input.currentRead || []).map((item) => `- ${String(item.label || '')}: ${String(item.value || '')}`).join('\n');
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n${renderParentEnvelope(input.parent)}- Current\n  - Current Schema: [tiinex.pointer.v1](${RECIPIENT_V2_POINTER_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: ${String(input.summary || 'Recipient-facing Handoff carrier navigation pointer.')}\n\n---\n\n# ${String(input.title || 'Handoff Carrier Pointer')}\n\n${String(input.prose || 'This pointer provides one bounded navigation surface.')}\n\n## Current Read\n\n- Carrier Role: ${role}\n${currentRead ? `${currentRead}\n` : ''}\n${artifactFirst ? 'Compatibility transport inventory may be derived from these qualified artifacts and exact payload bytes; it is not semantic authority.' : 'Transport topology and exact byte-map evidence is carried in the package transport manifest.'}\n\n## Destinations\n\n${destinations || '- none'}\n\n## Interpretation Notes\n\n${artifactFirst ? '- Destinations are navigation only; they do not create Parent, provenance, package membership, Handoff acceptance, transfer authority, or representation authority.\n- Numeric pathing, sibling placement, and package adjacency are presentation/container facts only.' : '- Numeric pathing is not generic Tiinex semantic authority. In this Handoff package, the generator deliberately projects the declared package-local Parent lineage into matching numeric pathing for readable random-access traversal.\n- Exact carried source artifact bytes and independently verified payload bytes retain their own authority; package-local lineage does not rewrite their historical provenance.'}\n\n---\n\n# Continuity Integrity\n\n${renderParentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  return seal(unsigned);
}

export function renderRecipientV2ExternalPayload(input = {}) {
  const artifactFirst = input.artifactFirst === true;
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const materialBindings = renderPayloadMaterialBindings(input.materials || []);
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n${renderParentEnvelope(input.parent)}- Current\n  - Current Schema: [tiinex.external.payload.v1](${RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: ${String(input.summary || 'Recipient-facing payload reference.')}\n\n---\n\n# ${String(input.title || 'Carrier Payload')}\n\n## Payload Identity\n\n- Payload Label: ${String(input.label || input.title || 'carrier payload')}\n- Payload Kind: ${String(input.kind || 'archive')}\n- Media Type: ${String(input.mediaType || 'application/zip')}\n- Format: ${String(input.format || 'deterministic stored ZIP')}\n- Byte Size: ${Number(input.bytes || 0)}\n- Payload Role: ${String(input.role || 'recipient-relative transport payload')}\n${input.workspaceId ? `- Workspace Id: ${String(input.workspaceId)}\n` : ''}\n## Payload Location\n\n- Location: [${String(input.location || '')}](${String(input.location || '')})\n- Location Type: local\n- Access Method: read exact package-local payload bytes after this artifact qualifies\n- Storage Boundary: recipient-relative Handoff carrier only\n\n## Integrity Reference\n\n- Integrity Status: verified\n- Integrity Method: sha256\n- Integrity Value: ${String(input.sha256 || '')}\n- Integrity Target: exact payload bytes as carried at the declared local Location\n- Validation Method: independent byte digest plus payload-format qualification\n${materialBindings ? `\n## Payload Material Bindings\n\n${materialBindings}\n` : ''}\n## Access Boundary\n\n- Access Boundary: recipient-local package read\n- Publicly Shareable: unknown\n- Retention Policy: disposable with this recipient-relative carrier unless separately preserved\n\n## Interpretation Limits\n\n${artifactFirst ? '- This artifact owns one explicitly located package-local payload and its exact payload-byte integrity. Package placement and adjacency do not create Parent or representation authority.\n- Payload integrity does not create Workspace identity, Handoff acceptance, completion, semantic truth, or remote provenance.' : '- This artifact owns one package-local payload node. Its Parent is package-local continuity; the ZIP companion cannot carry a Markdown envelope but participates in this node through this artifact.\n- Payload integrity does not create Workspace identity, Handoff acceptance, completion, semantic truth, or remote provenance.'}\n\n## Evidence Basis\n\n${artifactFirst ? 'Compatibility transport inventory may copy this visible payload metadata and mechanical byte identity, but cannot override this artifact or the exact payload bytes.' : 'Transport topology and exact byte-map evidence is carried in the package transport manifest.'}\n\n---\n\n# Continuity Integrity\n\n${renderParentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  return seal(unsigned);
}

export function renderRecipientV2Workspace(input = {}) {
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const workspaceId = String(input.workspaceId || input.title || 'workspace');
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n${renderParentEnvelope(input.parent)}- Current\n  - Current Schema: [tiinex.workspace.v1](${RECIPIENT_V2_WORKSPACE_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: Package-local Workspace node for ${workspaceId}; its archive-backed provider authority is the explicit canonical Workspace Representation artifact while the durable source Workspace artifact remains unchanged inside the payload.\n\n---\n\n# ${String(input.title || workspaceId)}\n\nThis is the package-local Workspace lineage node for **${workspaceId}**. Its canonical archive-backed provider binding is [${String(input.representationPath || 'Workspace Representation')}](${String(input.representationPath || '')}). The exact durable Workspace source remains inside the bound representation payload at \`${String(input.sourceWorkspaceInnerPath || '')}\` and keeps its original bytes and provenance.\n\nTransport topology and exact byte-map evidence is carried in the package transport manifest.\n\n---\n\n# Continuity Integrity\n\n${renderParentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  return seal(unsigned);
}

// Retained for backward inspection compatibility; the corrected recipient-v2 topology no longer emits a visible relation artifact.
export function renderRecipientV2Relation(input = {}) {
  const artifactFirst = input.artifactFirst === true;
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n${renderParentEnvelope(input.parent)}- Current\n  - Current Schema: [tiinex.relation.v1](${RECIPIENT_V2_RELATION_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: ${String(input.summary || 'Typed non-Parent carrier representation relation.')}\n\n---\n\n# ${String(input.title || 'Workspace Representation Relation')}\n\n## Relation Declaration\n\n- Relation Type: ${String(input.relationType || 'exact workspace archive representation')}\n- Relation Direction: ${String(input.direction || 'Workspace artifact -> archive representation payload')}\n- Relation Scope: ${String(input.scope || 'artifact-level recipient-relative package carriage representation')}\n\n## Relation Target\n\n- Source: [${String(input.sourceLabel || 'Relation source')}](${String(input.source || '')})\n${input.sourceWorkspaceId ? `- Source Workspace Id: ${String(input.sourceWorkspaceId)}\n` : ''}${input.sourceWorkspaceInnerPath ? `- Source Workspace Inner Path: \`${String(input.sourceWorkspaceInnerPath)}\`\n` : ''}- Target: [${String(input.targetLabel || 'Relation target')}](${String(input.target || '')})\n${input.targetWorkspaceId ? `- Target Workspace Id: ${String(input.targetWorkspaceId)}\n` : ''}${input.targetWorkspaceInnerPath ? `- Target Workspace Inner Path: \`${String(input.targetWorkspaceInnerPath)}\`\n` : ''}\n\n## Relation Boundary\n\n- The relation target is not Parent.\n\n## Evidence Basis\n\n${artifactFirst ? 'This relation is receiver-readable semantic meaning. Any compatibility transport projection is derived evidence only and cannot override the visible relation endpoints or scope.' : 'Transport topology and exact byte-map evidence is carried in the package transport manifest.'}\n\n---\n\n# Continuity Integrity\n\n${renderParentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  return seal(unsigned);
}

export function parseRecipientV2Relation(markdown = '') {
  const declaration = sectionText(markdown, 'Relation Declaration');
  const target = sectionText(markdown, 'Relation Target');
  return Object.freeze({
    relationType: fieldValue(declaration, 'Relation Type'),
    direction: fieldValue(declaration, 'Relation Direction'),
    scope: fieldValue(declaration, 'Relation Scope'),
    source: markdownTarget(fieldValue(target, 'Source')),
    sourceWorkspaceId: unquoteCode(fieldValue(target, 'Source Workspace Id')),
    sourceWorkspaceInnerPath: unquoteCode(fieldValue(target, 'Source Workspace Inner Path')),
    target: markdownTarget(fieldValue(target, 'Target')),
    targetWorkspaceId: unquoteCode(fieldValue(target, 'Target Workspace Id')),
    targetWorkspaceInnerPath: unquoteCode(fieldValue(target, 'Target Workspace Inner Path'))
  });
}

export { parseRecipientV2Pointer } from './recipientV2.pointer.js';
export function inspectRecipientV2Artifact(file = {}, options = {}) {
  const markdown = decodeUtf8(packageFileBytes(file));
  const schemaId = currentSchemaId(markdown);
  const facts = options.facts || parseFacts(markdown);
  const findings = [];
  const requireExactContract = options.requireExactContract === true || schemaId === 'tiinex.relation.v1' || schemaId === 'tiinex.workspace.representation.v1';
  let conformance = null;
  if (!schemaId) findings.push(finding('error', 'portable.handoff-v2-surface.artifact.schema-missing', 'Recipient-facing Markdown carrier lacks a Current Schema declaration.', { path: file.path || '' }));
  else {
    try {
      conformance = qualifyTiinexRouteArtifact({
        markdown,
        expectedSchemaId: schemaId,
        requireExactContract,
        resolveParent: options.resolveParent,
        parentMarkdown: options.parentMarkdown
      });
    } catch (error) {
      findings.push(finding('error', 'portable.handoff-v2-surface.artifact.conformance-error', 'Recipient-facing Tiinex artifact conformance could not be evaluated.', { path: file.path || '', detail: String(error?.message || error || '') }));
    }
  }
  if (conformance && conformance.status !== 'qualified') findings.push(...(conformance.findings || []).map((item) => finding(item.severity || 'error', item.code || 'portable.handoff-v2-surface.artifact.unqualified', item.message || 'Recipient-facing artifact failed Tiinex conformance.', { path: file.path || '' })));
  if (!markdown.startsWith(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n`)) findings.push(finding('error', 'portable.handoff-v2-surface.artifact.root-reference-noncanonical', 'Generated recipient artifact does not begin with the maintained Root schema link.', { path: file.path || '' }));
  if (!/\n---\n\n# Continuity Integrity\n/.test(markdown)) findings.push(finding('error', 'portable.handoff-v2-surface.artifact.footer-divider-missing', 'Generated recipient artifact is missing the canonical body/footer divider before Continuity Integrity.', { path: file.path || '' }));
  if (schemaId === 'tiinex.external.payload.v1') { inspectExternalPayloadShape(markdown, findings, file.path || ''); correlateExternalPayloadFacts(markdown, facts, findings, file.path || ''); }
  if (schemaId === 'tiinex.relation.v1') { inspectRelationShape(markdown, findings, file.path || ''); correlateRelationFacts(markdown, facts, findings, file.path || ''); }
  if (schemaId === 'tiinex.workspace.representation.v1') { inspectWorkspaceRepresentationShape(markdown, findings, file.path || ''); correlateWorkspaceRepresentationFacts(markdown, facts, findings, file.path || ''); }
  if (schemaId === 'tiinex.pointer.v1') correlatePointerFacts(markdown, facts, findings, file.path || '');
  if (!facts) findings.push(finding('error', 'portable.handoff-v2-surface.artifact.facts-missing', 'Recipient-facing generated carrier artifact is missing its transport-owned machine facts record.', { path: file.path || '', schemaId }));
  else if (facts.factsFormat !== 'portable-recipient-v2' || Number(facts.factsVersion || 0) !== 1) findings.push(finding('error', 'portable.handoff-v2-surface.artifact.facts-format-invalid', 'Recipient-facing generated carrier facts use an unsupported transport format.', { path: file.path || '', schemaId }));
  return deepFreeze({ status: findings.some((item) => item.severity === 'error') ? 'invalid' : 'qualified', path: String(file.path || ''), markdown, schemaId, facts, conformance, sha256: sha256Hex(packageFileBytes(file)), findings: Object.freeze(findings) });
}

export function parseRecipientV2Facts(markdown = '') { return parseFacts(markdown); }

function renderParentEnvelope(parent = null) {
  if (!parent) return '';
  const path = String(parent.path || '').trim();
  const label = String(parent.label || path || 'Parent');
  const schemaId = String(parent.schemaId || '').trim();
  const schemaTarget = String(parent.schemaTarget || '').trim();
  const createdAt = normalizeCreatedAt(parent.createdAt || '');
  if (!path || !schemaId || !schemaTarget || !String(parent.selfDigest || '').trim()) throw new Error('portable.handoff-v2-surface.parent-authority-incomplete');
  return `- Parent\n  - Parent Schema: [${schemaId}](${schemaTarget})\n  - Created At: ${createdAt}\n  - Trace: [${label}](${path})\n  - Origin:\n    - [relative](${path})\n`;
}

function renderParentIntegrity(parent = null) {
  if (!parent) return '';
  const path = String(parent.path || '').trim();
  const label = String(parent.label || path || 'Parent');
  const digest = String(parent.selfDigest || '').trim();
  if (!path || !digest) throw new Error('portable.handoff-v2-surface.parent-integrity-incomplete');
  return `- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: [${label}](${path})\n  - Value: ${digest}\n\n`;
}


function renderPayloadMaterialBindings(materials = []) {
  return [...materials].map((item) => {
    const requirementId = String(item?.requirementId || '').trim();
    const classification = String(item?.classification || '').trim();
    const referenceTarget = String(item?.referenceTarget || '').trim();
    const archiveEntry = String(item?.archiveEntry || '').trim();
    if (!requirementId || !referenceTarget || !archiveEntry) return '';
    return `- Requirement Id: ${requirementId}\n  - Classification: ${classification || 'detached-material'}\n  - Material Reference: ${referenceTarget}\n  - Archive Entry: ${archiveEntry}`;
  }).filter(Boolean).join('\n');
}

function parseFacts(markdown = '') {
  const source = String(markdown || '');
  const begin = source.indexOf(RECIPIENT_V2_FACTS_BEGIN);
  const end = source.indexOf(RECIPIENT_V2_FACTS_END);
  if (begin < 0 || end <= begin || source.indexOf(RECIPIENT_V2_FACTS_BEGIN, begin + RECIPIENT_V2_FACTS_BEGIN.length) >= 0) return null;
  const bounded = source.slice(begin + RECIPIENT_V2_FACTS_BEGIN.length, end).trim();
  const match = bounded.match(/^```json\s*\n([\s\S]*?)\n```$/);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}
function seal(unsigned) { const result = sealC14nV2Self(unsigned); if (result.state !== 'sealed') throw new Error(`portable.handoff-v2-surface.integrity.seal-failed:${result.reason || result.state}`); return `${result.markdown}\n`; }
function normalizeCreatedAt(value = '') { const text = String(value || '').trim(); if (!text) return '1970-01-01 00:00:00'; return text.replace('T', ' ').replace(/\.\d{3}Z$/, '').replace(/Z$/, '').slice(0, 19); }
function stablePrettyJson(value) { return JSON.stringify(sortJson(value), null, 2); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
