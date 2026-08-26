import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { qualifyTiinexRouteArtifact } from './routeArtifactConformance.js';

export const RECIPIENT_V2_ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
export const RECIPIENT_V2_POINTER_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/pointer/tiinex.pointer.v1.schema.md';
export const RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/external/payload/tiinex.external.payload.v1.schema.md';
export const RECIPIENT_V2_RELATION_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/relation/tiinex.relation.v1.schema.md';
export const RECIPIENT_V2_WORKSPACE_SCHEMA_TARGET = 'https://github.com/Tiinex/site/blob/17283cd2f0b9b0782a149a0cd113fb88a5a55ef3/src/schemas/workspace/tiinex.workspace.v1.schema.md';
export const RECIPIENT_V2_FACTS_BEGIN = '<!-- TIINEX-RECIPIENT-V2-FACTS:BEGIN -->';
export const RECIPIENT_V2_FACTS_END = '<!-- TIINEX-RECIPIENT-V2-FACTS:END -->';

export function renderRecipientV2Pointer(input = {}) {
  const role = String(input.role || 'navigation');
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const destinations = (input.destinations || []).map((item) => `- ${String(item.label || 'Destination')}: [${String(item.display || item.target || '')}](${String(item.target || '')})`).join('\n');
  const currentRead = (input.currentRead || []).map((item) => `- ${String(item.label || '')}: ${String(item.value || '')}`).join('\n');
  const facts = stablePrettyJson({ factsFormat: 'portable-recipient-v2', factsVersion: 1, role, ...(input.facts || {}) });
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n${renderParentEnvelope(input.parent)}- Current\n  - Current Schema: [tiinex.pointer.v1](${RECIPIENT_V2_POINTER_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: ${String(input.summary || 'Recipient-facing Handoff carrier navigation pointer.')}\n\n---\n\n# ${String(input.title || 'Handoff Carrier Pointer')}\n\n${String(input.prose || 'This pointer provides one bounded navigation surface.')}\n\n## Current Read\n\n- Carrier Role: ${role}\n${currentRead ? `${currentRead}\n` : ''}\n${RECIPIENT_V2_FACTS_BEGIN}\n\`\`\`json\n${facts}\n\`\`\`\n${RECIPIENT_V2_FACTS_END}\n\n## Destinations\n\n${destinations || '- none'}\n\n## Interpretation Notes\n\n- Numeric pathing is not generic Tiinex semantic authority. In this Handoff package, the generator deliberately projects the declared package-local Parent lineage into matching numeric pathing for readable random-access traversal.\n- Exact carried source artifact bytes and independently verified payload bytes retain their own authority; package-local lineage does not rewrite their historical provenance.\n\n---\n\n# Continuity Integrity\n\n${renderParentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  return seal(unsigned);
}

export function renderRecipientV2ExternalPayload(input = {}) {
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const facts = stablePrettyJson({ factsFormat: 'portable-recipient-v2', factsVersion: 1, role: String(input.role || ''), ...(input.facts || {}) });
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n${renderParentEnvelope(input.parent)}- Current\n  - Current Schema: [tiinex.external.payload.v1](${RECIPIENT_V2_EXTERNAL_PAYLOAD_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: ${String(input.summary || 'Recipient-facing payload reference.')}\n\n---\n\n# ${String(input.title || 'Carrier Payload')}\n\n## Payload Identity\n\n- Payload Label: ${String(input.label || input.title || 'carrier payload')}\n- Payload Kind: ${String(input.kind || 'archive')}\n- Media Type: ${String(input.mediaType || 'application/zip')}\n- Format: ${String(input.format || 'deterministic stored ZIP')}\n- Byte Size: ${Number(input.bytes || 0)}\n- Payload Role: ${String(input.role || 'recipient-relative transport payload')}\n\n## Payload Location\n\n- Location: [${String(input.location || '')}](${String(input.location || '')})\n- Location Type: local\n- Access Method: read exact package-local payload bytes after this artifact qualifies\n- Storage Boundary: recipient-relative Handoff carrier only\n\n## Integrity Reference\n\n- Integrity Status: verified\n- Integrity Method: sha256\n- Integrity Value: ${String(input.sha256 || '')}\n- Integrity Target: exact payload bytes as carried at the declared local Location\n- Validation Method: independent byte digest plus payload-format qualification\n\n## Access Boundary\n\n- Access Boundary: recipient-local package read\n- Publicly Shareable: unknown\n- Retention Policy: disposable with this recipient-relative carrier unless separately preserved\n\n## Interpretation Limits\n\n- This artifact owns one package-local payload node. Its Parent is package-local continuity; the ZIP companion cannot carry a Markdown envelope but participates in this node through this artifact.\n- Payload integrity does not create Workspace identity, Handoff acceptance, completion, semantic truth, or remote provenance.\n\n## Evidence Basis\n\n${RECIPIENT_V2_FACTS_BEGIN}\n\`\`\`json\n${facts}\n\`\`\`\n${RECIPIENT_V2_FACTS_END}\n\n---\n\n# Continuity Integrity\n\n${renderParentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  return seal(unsigned);
}

export function renderRecipientV2Workspace(input = {}) {
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const workspaceId = String(input.workspaceId || input.title || 'workspace');
  const facts = stablePrettyJson({ factsFormat: 'portable-recipient-v2', factsVersion: 1, role: 'workspace-node', ...(input.facts || {}) });
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n${renderParentEnvelope(input.parent)}- Current\n  - Current Schema: [tiinex.workspace.v1](${RECIPIENT_V2_WORKSPACE_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: Package-local Workspace node for ${workspaceId}; binds the visible node to one exact carried complete Workspace archive without rewriting the durable source Workspace artifact inside that archive.\n\n---\n\n# ${String(input.title || workspaceId)}\n\nThis is the package-local Workspace lineage node for **${workspaceId}**. Its companion archive is [${String(input.archivePath || '')}](${String(input.archivePath || '')}). The exact durable Workspace source remains inside that archive at \`${String(input.sourceWorkspaceInnerPath || '')}\` and keeps its original bytes and provenance.\n\n${RECIPIENT_V2_FACTS_BEGIN}\n\`\`\`json\n${facts}\n\`\`\`\n${RECIPIENT_V2_FACTS_END}\n\n---\n\n# Continuity Integrity\n\n${renderParentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  return seal(unsigned);
}

// Retained for backward inspection compatibility; the corrected recipient-v2 topology no longer emits a visible relation artifact.
export function renderRecipientV2Relation(input = {}) {
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const facts = stablePrettyJson({ factsFormat: 'portable-recipient-v2', factsVersion: 1, role: String(input.role || ''), ...(input.facts || {}) });
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n${renderParentEnvelope(input.parent)}- Current\n  - Current Schema: [tiinex.relation.v1](${RECIPIENT_V2_RELATION_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: ${String(input.summary || 'Typed non-Parent carrier representation relation.')}\n\n---\n\n# ${String(input.title || 'Workspace Representation Relation')}\n\n## Relation Declaration\n\n- Relation Type: ${String(input.relationType || 'exact workspace archive representation')}\n- Relation Direction: ${String(input.direction || 'Workspace artifact -> archive representation payload')}\n- Relation Scope: ${String(input.scope || 'artifact-level recipient-relative package carriage representation')}\n\n## Relation Target\n\n- Source: [${String(input.sourceLabel || 'Workspace artifact')}](${String(input.source || '')})\n- Target: [${String(input.targetLabel || 'Archive payload artifact')}](${String(input.target || '')})\n\n## Relation Boundary\n\n- The relation target is not Parent.\n\n## Evidence Basis\n\n${RECIPIENT_V2_FACTS_BEGIN}\n\`\`\`json\n${facts}\n\`\`\`\n${RECIPIENT_V2_FACTS_END}\n\n---\n\n# Continuity Integrity\n\n${renderParentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  return seal(unsigned);
}

export function inspectRecipientV2Artifact(file = {}, options = {}) {
  const markdown = decodeUtf8(packageFileBytes(file));
  const schemaId = currentSchemaId(markdown);
  const facts = parseFacts(markdown);
  const findings = [];
  const requireExactContract = options.requireExactContract === true || schemaId === 'tiinex.relation.v1';
  let conformance = null;
  if (!schemaId) findings.push(finding('error', 'portable.handoff-v2-surface.artifact.schema-missing', 'Recipient-facing Markdown carrier lacks a Current Schema declaration.', { path: file.path || '' }));
  else {
    try {
      conformance = qualifyTiinexRouteArtifact({
        markdown,
        expectedSchemaId: schemaId,
        requireExactContract,
        resolveParent: options.resolveParent,
        parentMarkdown: options.parentMarkdown,
        allowPackageLocalParentOrigin: options.allowPackageLocalParentOrigin === true
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
  if (schemaId === 'tiinex.pointer.v1') correlatePointerFacts(markdown, facts, findings, file.path || '');
  if (!facts) findings.push(finding('error', 'portable.handoff-v2-surface.artifact.facts-missing', 'Recipient-facing generated carrier artifact is missing its bounded visible machine facts block.', { path: file.path || '', schemaId }));
  else if (facts.factsFormat !== 'portable-recipient-v2' || Number(facts.factsVersion || 0) !== 1) findings.push(finding('error', 'portable.handoff-v2-surface.artifact.facts-format-invalid', 'Recipient-facing generated carrier facts use an unsupported bounded extension format.', { path: file.path || '', schemaId }));
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

function correlateExternalPayloadFacts(markdown, facts, findings, path) {
  if (!facts || facts.factsFormat !== 'portable-recipient-v2' || Number(facts.factsVersion || 0) !== 1) return;
  const identity = sectionText(markdown, 'Payload Identity');
  const location = sectionText(markdown, 'Payload Location');
  const integrity = sectionText(markdown, 'Integrity Reference');
  const visiblePath = markdownTarget(fieldValue(location, 'Location'));
  if (facts.archivePath && visiblePath !== String(facts.archivePath)) findings.push(finding('error', 'portable.handoff-v2-surface.payload.visible-location-mismatch', 'External Payload visible Location diverges from its sealed machine facts.', { path }));
  if (facts.archiveSha256 && fieldValue(integrity, 'Integrity Value') !== String(facts.archiveSha256)) findings.push(finding('error', 'portable.handoff-v2-surface.payload.visible-integrity-mismatch', 'External Payload visible integrity value diverges from its sealed machine facts.', { path }));
  if (facts.archiveBytes !== undefined && Number(fieldValue(identity, 'Byte Size') || -1) !== Number(facts.archiveBytes)) findings.push(finding('error', 'portable.handoff-v2-surface.payload.visible-bytes-mismatch', 'External Payload visible byte size diverges from its sealed machine facts.', { path }));
}
function correlateRelationFacts(markdown, facts, findings, path) {
  if (!facts || facts.factsFormat !== 'portable-recipient-v2' || Number(facts.factsVersion || 0) !== 1) return;
  const target = sectionText(markdown, 'Relation Target');
  if (facts.workspaceArtifactPath && markdownTarget(fieldValue(target, 'Source')) !== String(facts.workspaceArtifactPath)) findings.push(finding('error', 'portable.handoff-v2-surface.relation.visible-source-mismatch', 'Relation visible Source diverges from its sealed machine facts.', { path }));
  if (facts.payloadArtifactPath && markdownTarget(fieldValue(target, 'Target')) !== String(facts.payloadArtifactPath)) findings.push(finding('error', 'portable.handoff-v2-surface.relation.visible-target-mismatch', 'Relation visible Target diverges from its sealed machine facts.', { path }));
}
function correlatePointerFacts(markdown, facts, findings, path) {
  if (!facts || facts.factsFormat !== 'portable-recipient-v2' || Number(facts.factsVersion || 0) !== 1) return;
  if (facts.role !== 'handoff-route' || !facts.archivePath) return;
  const targets = [...sectionText(markdown, 'Destinations').matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1]);
  if (targets.length !== 1 || targets[0] !== String(facts.archivePath)) findings.push(finding('error', 'portable.handoff-v2-surface.pointer.visible-destination-mismatch', 'Route Pointer visible Destination diverges from its sealed machine facts.', { path }));
}
function markdownTarget(value = '') { return String(value || '').match(/\[[^\]]*\]\(([^)]+)\)/)?.[1] || String(value || '').trim(); }

function inspectExternalPayloadShape(markdown, findings, path) {
  for (const section of ['Payload Identity', 'Payload Location', 'Integrity Reference', 'Access Boundary', 'Interpretation Limits']) if (!sectionText(markdown, section)) findings.push(finding('error', 'portable.handoff-v2-surface.payload.section-missing', `External Payload artifact is missing required section ${section}.`, { path, section }));
  const required = [['Payload Identity', 'Payload Label'], ['Payload Identity', 'Payload Kind'], ['Payload Location', 'Location'], ['Payload Location', 'Location Type'], ['Integrity Reference', 'Integrity Status'], ['Access Boundary', 'Access Boundary']];
  for (const [section, field] of required) if (!fieldValue(sectionText(markdown, section), field)) findings.push(finding('error', 'portable.handoff-v2-surface.payload.field-missing', `External Payload artifact is missing required field ${field}.`, { path, section, field }));
}
function inspectRelationShape(markdown, findings, path) {
  for (const section of ['Relation Declaration', 'Relation Target', 'Relation Boundary']) if (!sectionText(markdown, section)) findings.push(finding('error', 'portable.handoff-v2-surface.relation.section-missing', `Relation artifact is missing required section ${section}.`, { path, section }));
  for (const field of ['Relation Type', 'Relation Direction', 'Relation Scope']) if (!fieldValue(sectionText(markdown, 'Relation Declaration'), field)) findings.push(finding('error', 'portable.handoff-v2-surface.relation.field-missing', `Relation artifact is missing required field ${field}.`, { path, field }));
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
function currentSchemaId(markdown = '') {
  const match = String(markdown || '').match(/Current Schema:\s*(?:\[)?(tiinex\.[a-z0-9._-]+)(?:\])?/i);
  return String(match?.[1] || '').toLowerCase();
}
function sectionText(markdown = '', heading = '') {
  const re = new RegExp(`^##\\s+${escapeRe(heading)}\\s*$`, 'mi');
  const match = re.exec(String(markdown || ''));
  if (!match) return '';
  const rest = String(markdown || '').slice(match.index + match[0].length);
  const next = /^##\s+/m.exec(rest);
  return (next ? rest.slice(0, next.index) : rest).trim();
}
function fieldValue(section = '', name = '') { const m = String(section || '').match(new RegExp(`^\\s*-\\s+${escapeRe(name)}:\\s*(.+?)\\s*$`, 'mi')); return String(m?.[1] || '').trim(); }
function seal(unsigned) { const result = sealC14nV2Self(unsigned); if (result.state !== 'sealed') throw new Error(`portable.handoff-v2-surface.integrity.seal-failed:${result.reason || result.state}`); return `${result.markdown}\n`; }
function normalizeCreatedAt(value = '') { const text = String(value || '').trim(); if (!text) return '1970-01-01 00:00:00'; return text.replace('T', ' ').replace(/\.\d{3}Z$/, '').replace(/Z$/, '').slice(0, 19); }
function stablePrettyJson(value) { return JSON.stringify(sortJson(value), null, 2); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function escapeRe(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
