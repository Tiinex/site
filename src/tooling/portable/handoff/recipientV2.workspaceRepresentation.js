import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';

const RECIPIENT_V2_ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
export const RECIPIENT_V2_WORKSPACE_REPRESENTATION_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/0fdce5f265298321a41cd90cf5382bcb6ae31a13/.topics/.schemas/relation/workspace/representation/tiinex.workspace.representation.v1.schema.md';

export function renderRecipientV2WorkspaceRepresentation(input = {}) {
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n${renderParentEnvelope(input.parent)}- Current\n  - Current Schema: [tiinex.workspace.representation.v1](${RECIPIENT_V2_WORKSPACE_REPRESENTATION_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: ${String(input.summary || 'Explicit canonical binding between one package-local Workspace artifact and one exact Workspace archive External Payload.')}\n\n---\n\n# ${String(input.title || 'Workspace Representation')}\n\n## Representation Binding\n\n- Workspace Artifact: [${String(input.workspaceLabel || 'Workspace artifact')}](${String(input.workspaceArtifactPath || '')})\n- Representation Payload: [${String(input.payloadLabel || 'Workspace representation payload')}](${String(input.payloadArtifactPath || '')})\n- Representation Kind: exact-workspace-byte-tree-archive\n- Coverage: ${String(input.coverage || 'complete')}\n- Binding State: ${String(input.bindingState || 'verified')}\n\n## Representation Correlation\n\n- Workspace Tree Root: ${String(input.workspaceTreeRoot || '.')}\n- Workspace Artifact Inner Path: ${String(input.workspaceArtifactInnerPath || '')}\n- Archive Entry Root: ${String(input.archiveEntryRoot || '.')}\n- Path Mapping: ${String(input.pathMapping || 'identity-relative-paths')}\n- Collision Policy: reject-ambiguous-or-unsafe-paths\n- Decoder Requirement: ${String(input.decoderRequirement || 'deterministic stored ZIP with safe-entry validation')}\n${input.mappingManifest ? `- Mapping Manifest: [Mapping Manifest](${String(input.mappingManifest)})\n` : ''}${input.entryIntegrityManifest ? `- Entry Integrity Manifest: [Entry Integrity Manifest](${String(input.entryIntegrityManifest)})\n` : ''}\n## Provider Qualification\n\n- Activation Rule: verified-complete-only\n- Payload Integrity Requirement: verified-exact-payload-bytes\n- Coverage Requirement: complete\n- Staleness Rule: requalify-on-binding-relevant-change\n- Selection Rule: exactly-one-binding-per-workspace\n- Multi-Workspace Isolation: independent-binding-closure\n\n## Relation Boundary\n\n- Parent Boundary: neither endpoint becomes Parent through this representation relation\n- Workspace Identity Boundary: the referenced Workspace artifact remains the semantic Workspace identity\n- Payload Identity Boundary: the referenced External Payload owns archive identity and exact payload-byte integrity\n- Transport Boundary: package location, archive adjacency, repository transport, and decoder success are not binding authority\n- Outer Integrity Boundary: package-wide exact-file/tamper authority remains separately owned\n\n## Interpretation Limits\n\n- Does Not Prove: semantic correctness, provenance, authorship, acceptance, completion, source identity, permission, consent, or truth\n- Must Not Be Used As: a replacement for Workspace identity, External Payload authority, Parent continuity, repository transport, preservation, Handoff state, or package-wide integrity authority\n\n## Evidence Basis\n\nProvider activation must requalify this visible binding, its explicit Workspace and External Payload endpoints, the exact payload bytes, decoder/mapping safety, bound Workspace inner entry, and complete archive entry set. Transport facts may detect tampering but are not semantic binding authority.\n\n---\n\n# Continuity Integrity\n\n${renderParentIntegrity(input.parent)}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  return seal(unsigned);
}


export function parseRecipientV2WorkspaceRepresentation(markdown = '') {
  const binding = sectionText(markdown, 'Representation Binding');
  const correlation = sectionText(markdown, 'Representation Correlation');
  const qualification = sectionText(markdown, 'Provider Qualification');
  return Object.freeze({
    workspaceArtifactPath: markdownTarget(fieldValue(binding, 'Workspace Artifact')),
    payloadArtifactPath: markdownTarget(fieldValue(binding, 'Representation Payload')),
    representationKind: fieldValue(binding, 'Representation Kind'),
    coverage: fieldValue(binding, 'Coverage'),
    bindingState: fieldValue(binding, 'Binding State'),
    workspaceTreeRoot: fieldValue(correlation, 'Workspace Tree Root'),
    workspaceArtifactInnerPath: fieldValue(correlation, 'Workspace Artifact Inner Path'),
    archiveEntryRoot: fieldValue(correlation, 'Archive Entry Root'),
    pathMapping: fieldValue(correlation, 'Path Mapping'),
    collisionPolicy: fieldValue(correlation, 'Collision Policy'),
    decoderRequirement: fieldValue(correlation, 'Decoder Requirement'),
    mappingManifest: markdownTarget(fieldValue(correlation, 'Mapping Manifest')),
    entryIntegrityManifest: markdownTarget(fieldValue(correlation, 'Entry Integrity Manifest')),
    activationRule: fieldValue(qualification, 'Activation Rule'),
    payloadIntegrityRequirement: fieldValue(qualification, 'Payload Integrity Requirement'),
    coverageRequirement: fieldValue(qualification, 'Coverage Requirement'),
    stalenessRule: fieldValue(qualification, 'Staleness Rule'),
    selectionRule: fieldValue(qualification, 'Selection Rule'),
    multiWorkspaceIsolation: fieldValue(qualification, 'Multi-Workspace Isolation')
  });
}

export function parseRecipientV2ExternalPayload(markdown = '') {
  const identity = sectionText(markdown, 'Payload Identity');
  const location = sectionText(markdown, 'Payload Location');
  const integrity = sectionText(markdown, 'Integrity Reference');
  return Object.freeze({
    mediaType: fieldValue(identity, 'Media Type'),
    format: fieldValue(identity, 'Format'),
    bytes: Number(fieldValue(identity, 'Byte Size') || 0),
    location: markdownTarget(fieldValue(location, 'Location')),
    integrityStatus: fieldValue(integrity, 'Integrity Status'),
    integrityMethod: fieldValue(integrity, 'Integrity Method'),
    integrityValue: fieldValue(integrity, 'Integrity Value'),
    integrityTarget: fieldValue(integrity, 'Integrity Target')
  });
}


export function correlateWorkspaceRepresentationFacts(markdown, facts, findings, path) {
  if (!facts || facts.factsFormat !== 'portable-recipient-v2' || Number(facts.factsVersion || 0) !== 1) return;
  const visible = parseRecipientV2WorkspaceRepresentation(markdown);
  const checks = [
    ['workspaceArtifactPath', visible.workspaceArtifactPath],
    ['payloadArtifactPath', visible.payloadArtifactPath],
    ['sourceWorkspaceTargetInnerPath', visible.workspaceArtifactInnerPath]
  ];
  for (const [key, observed] of checks) if (facts[key] && String(facts[key]) !== String(observed || '')) findings.push(finding('error', `portable.handoff-v2-surface.workspace-representation.visible-${key}-mismatch`, 'Workspace Representation visible semantic field diverges from its transport tamper-check facts.', { path, field: key }));
}


export function inspectWorkspaceRepresentationShape(markdown, findings, path) {
  const required = {
    'Representation Binding': ['Workspace Artifact','Representation Payload','Representation Kind','Coverage','Binding State'],
    'Representation Correlation': ['Workspace Tree Root','Workspace Artifact Inner Path','Archive Entry Root','Path Mapping','Collision Policy','Decoder Requirement'],
    'Provider Qualification': ['Activation Rule','Payload Integrity Requirement','Coverage Requirement','Staleness Rule','Selection Rule','Multi-Workspace Isolation'],
    'Relation Boundary': ['Parent Boundary','Workspace Identity Boundary','Payload Identity Boundary','Transport Boundary','Outer Integrity Boundary'],
    'Interpretation Limits': ['Does Not Prove','Must Not Be Used As']
  };
  for (const [section, fields] of Object.entries(required)) {
    const text = sectionText(markdown, section);
    if (!text) { findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.section-missing', `Workspace Representation artifact is missing required section ${section}.`, { path, section })); continue; }
    for (const field of fields) if (!fieldValue(text, field)) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.field-missing', `Workspace Representation artifact is missing required field ${field}.`, { path, section, field }));
  }
  const parsed = parseRecipientV2WorkspaceRepresentation(markdown);
  const fixed = {
    representationKind: 'exact-workspace-byte-tree-archive',
    workspaceTreeRoot: '.', archiveEntryRoot: '.', pathMapping: 'identity-relative-paths', collisionPolicy: 'reject-ambiguous-or-unsafe-paths',
    activationRule: 'verified-complete-only', payloadIntegrityRequirement: 'verified-exact-payload-bytes', coverageRequirement: 'complete',
    stalenessRule: 'requalify-on-binding-relevant-change', selectionRule: 'exactly-one-binding-per-workspace', multiWorkspaceIsolation: 'independent-binding-closure'
  };
  for (const [key, expected] of Object.entries(fixed)) if (parsed[key] && parsed[key] !== expected) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.contract-mismatch', 'Workspace Representation artifact diverges from the canonical ready-provider contract.', { path, field: key, expected, observed: parsed[key] }));
  if (!parsed.workspaceArtifactPath || !parsed.payloadArtifactPath) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.endpoint-missing', 'Workspace Representation must expose both semantic endpoints.', { path }));
  if (parsed.pathMapping === 'manifest' && !parsed.mappingManifest) findings.push(finding('error', 'portable.handoff-v2-surface.workspace-representation.mapping-manifest-missing', 'Manifest path mapping requires an explicit Mapping Manifest.', { path }));
}


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
function markdownTarget(value = '') { return String(value || '').match(/\[[^\]]*\]\(([^)]+)\)/)?.[1] || String(value || '').trim(); }
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
function escapeRe(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
