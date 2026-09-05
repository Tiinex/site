import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { finding } from './recipientV2.topology.materials.js';
import { RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET } from './recipientV2.packageV1.constants.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';
import { RECIPIENT_V2_ROOT_SCHEMA_TARGET } from './recipientV2.artifacts.js';
import { field, markdownTarget, normalizeCreatedAt, sectionText, unquote, validCarrierDimension } from './recipientV2.packageV1.shared.js';
import { normalizeHandoffCarrierProfile, normalizeWorkspaceIds } from './carrierProfile.js';

export function renderHandoffPackageV1(input = {}) {
  const createdAt = normalizeCreatedAt(input.createdAt || '');
  const lineage = input.carrierLineage || {};
  const carrierProfile = normalizeHandoffCarrierProfile(input.carrierProfile || null);
  const workspaces = input.workspaces || [];
  const workspaceBlocks = workspaces.map((workspace) => `- ${workspace.workspaceId}\n  - Workspace Id: ${workspace.workspaceId}\n  - Workspace Artifact: [${workspace.workspaceId} Workspace](${workspace.workspacePath})\n  - Snapshot Path: [${workspace.workspaceId} Snapshot](${workspace.archivePath})\n  - Workspace Artifact Inner Path: \`${workspace.sourceWorkspaceTargetInnerPath}\`\n  - Snapshot Kind: exact-workspace-byte-tree-archive\n  - Coverage: complete\n  - Binding State: verified\n  - Integrity Method: sha256\n  - Integrity Value: ${workspace.archiveSha256}\n  - Byte Size: ${workspace.archiveBytes || ''}`.replace(/\n  - Byte Size: $/, '')).join('\n');
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${RECIPIENT_V2_ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.handoff.package.v1](${RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET})\n  - Created At: ${createdAt}\n  - Summary: Recipient-facing self-contained Handoff carrier identity, discovery, exact complete Workspace snapshot bindings, and fail-closed qualification boundary.\n\n---\n\n# Handoff Package\n\n## Package Identity\n\n- Package Role: recipient-facing-handoff-carrier\n- Carrier Kind: self-contained\n\n## Bootstrap Exposure\n\n- Start Artifact: [Start](${input.startPath || RECIPIENT_V2_READ_PATH})\n${input.bootstrapPath ? `- Tooling Bootstrap Descriptor: [Bootstrap](${input.bootstrapPath})\n` : '- Tooling Bootstrap Descriptor: [Bootstrap](001-2-bootstrap.trace.md)\n'}- Bootstrap Rule: start-then-qualified-bootstrap\n\n## Workspace Snapshot Bindings\n\n${workspaceBlocks || '- none'}\n\n## Route Discovery\n\n- Route Placement Rule: authoritative-workspace-descended\n- Continue-From Rule: exact-package-local-handoff-pointer\n- Pre-Handoff Closure Rule: selected-pointer-carrier-ancestors\n\n## Carrier Continuity\n\n- Carrier Dimension: ${String(lineage.dimension || '001')}\n${lineage.parentDimension ? `- Parent Carrier Dimension: ${String(lineage.parentDimension)}\n` : ''}- Carrier Checkpoint: ${String(lineage.checkpointKind || 'progression')}\n${lineage.majorReason ? `- Major Reason: ${String(lineage.majorReason)}\n` : ''}- Carrier Profile Id: ${carrierProfile.id || 'none'}\n- Required Major Workspace Ids: ${carrierProfile.requiredMajorWorkspaceIds.length ? carrierProfile.requiredMajorWorkspaceIds.join(', ') : 'none'}\n\n## Qualification Boundary\n\n- Receiver Qualification: reverify-carried-authority-and-bytes\n- Failure Policy: fail-closed\n- Derived Inventory Authority: none\n\n## Interpretation Limits\n\n- Does Not Mean: package placement, discovery ancestry, or byte integrity creates Handoff, Workspace, Role, participation, acceptance, provenance, or Parent authority\n- Must Not Be Used To Claim: carrier convenience metadata overrides the authoritative contained artifacts or exact qualified source bytes\n- Generic Payload Boundary: bootstrap/cache payloads retain explicit External Payload ownership when required; complete Workspace snapshot binding is package-local only\n- Generic Representation Boundary: bounded, partial, independently selectable, multi-representation, or external-lifecycle Workspace representations require the generic Workspace Representation contract\n- Carrier Profile Boundary: required Workspace identifiers come only from the explicit carrier profile; literal project Workspace names have no generic semantic meaning\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') throw new Error(`portable.handoff-package-v1.integrity.seal-failed:${sealed.reason || sealed.state}`);
  return `${sealed.markdown}\n`;
}

export function parseHandoffPackageV1(markdown = '') {
  const body = String(markdown || '');
  const workspaceHeading = '## Workspace Snapshot Bindings';
  const workspaceStart = body.indexOf(workspaceHeading);
  const workspaceEnd = workspaceStart >= 0 ? body.indexOf('## Route Discovery', workspaceStart + workspaceHeading.length) : -1;
  const workspacesSection = workspaceStart >= 0 ? body.slice(workspaceStart + workspaceHeading.length, workspaceEnd >= 0 ? workspaceEnd : undefined).trim() : '';
  const workspaces = parseWorkspaceBindings(workspacesSection);
  return Object.freeze({
    packageRole: field(sectionText(body, 'Package Identity'), 'Package Role'), carrierKind: field(sectionText(body, 'Package Identity'), 'Carrier Kind'),
    startPath: markdownTarget(field(sectionText(body, 'Bootstrap Exposure'), 'Start Artifact')), bootstrapPath: markdownTarget(field(sectionText(body, 'Bootstrap Exposure'), 'Tooling Bootstrap Descriptor')), bootstrapRule: field(sectionText(body, 'Bootstrap Exposure'), 'Bootstrap Rule'),
    workspaces: Object.freeze(workspaces), routePlacementRule: field(sectionText(body, 'Route Discovery'), 'Route Placement Rule'), continueFromRule: field(sectionText(body, 'Route Discovery'), 'Continue-From Rule'), preHandoffClosureRule: field(sectionText(body, 'Route Discovery'), 'Pre-Handoff Closure Rule'),
    carrierDimension: field(sectionText(body, 'Carrier Continuity'), 'Carrier Dimension'), parentCarrierDimension: field(sectionText(body, 'Carrier Continuity'), 'Parent Carrier Dimension'), carrierCheckpoint: field(sectionText(body, 'Carrier Continuity'), 'Carrier Checkpoint'), majorReason: field(sectionText(body, 'Carrier Continuity'), 'Major Reason'), carrierProfileId: normalizeProfileId(field(sectionText(body, 'Carrier Continuity'), 'Carrier Profile Id')), requiredMajorWorkspaceIds: normalizeWorkspaceIds(field(sectionText(body, 'Carrier Continuity'), 'Required Major Workspace Ids')),
    receiverQualification: field(sectionText(body, 'Qualification Boundary'), 'Receiver Qualification'), failurePolicy: field(sectionText(body, 'Qualification Boundary'), 'Failure Policy'), derivedInventoryAuthority: field(sectionText(body, 'Qualification Boundary'), 'Derived Inventory Authority')
  });
}

export function validatePackageFields(value, findings) {
  const exact = [
    ['packageRole', 'recipient-facing-handoff-carrier'], ['carrierKind', 'self-contained'], ['bootstrapRule', 'start-then-qualified-bootstrap'], ['routePlacementRule', 'authoritative-workspace-descended'], ['continueFromRule', 'exact-package-local-handoff-pointer'], ['preHandoffClosureRule', 'selected-pointer-carrier-ancestors'], ['receiverQualification', 'reverify-carried-authority-and-bytes'], ['failurePolicy', 'fail-closed'], ['derivedInventoryAuthority', 'none']
  ];
  for (const [key, expected] of exact) if (String(value?.[key] || '') !== expected) findings.push(finding('error', `portable.handoff-package-v1.field.${key}.invalid`, 'Handoff package v1 required closed-domain field is missing or invalid.', { field: key, expected, observed: String(value?.[key] || '') }));
  if (!value?.startPath || !value?.bootstrapPath) findings.push(finding('error', 'portable.handoff-package-v1.bootstrap-exposure-invalid', 'Start Artifact and Tooling Bootstrap Descriptor must be package-local links.'));
  if (!Array.isArray(value?.workspaces) || !value.workspaces.length) findings.push(finding('error', 'portable.handoff-package-v1.workspace-bindings-missing', 'Handoff package v1 requires at least one complete Workspace snapshot binding.'));
  if (!validCarrierDimension(value?.carrierDimension)) findings.push(finding('error', 'portable.handoff-package-v1.carrier-dimension-invalid', 'Carrier Dimension must be a canonical numeric hyphen path.', { value: value?.carrierDimension || '' }));
  if (value?.parentCarrierDimension && !validCarrierDimension(value.parentCarrierDimension)) findings.push(finding('error', 'portable.handoff-package-v1.parent-carrier-dimension-invalid', 'Parent Carrier Dimension must be a canonical numeric hyphen path.', { value: value.parentCarrierDimension || '' }));
  if (!['progression', 'major'].includes(String(value?.carrierCheckpoint || ''))) findings.push(finding('error', 'portable.handoff-package-v1.carrier-checkpoint-invalid', 'Carrier Checkpoint must be progression or major.'));
  if (value?.carrierCheckpoint === 'major' && !String(value.majorReason || '').trim()) findings.push(finding('error', 'portable.handoff-package-v1.major-reason-missing', 'Major carrier requires one meaningful Major Reason.'));
  if (value?.carrierCheckpoint === 'major') {
    if ((value.requiredMajorWorkspaceIds || []).length && !String(value.carrierProfileId || '').trim()) findings.push(finding('error', 'portable.handoff-package-v1.major-carrier-profile-missing', 'Named Major Workspace requirements require one explicit carrier profile id.'));
    const carried = new Set((value?.workspaces || []).map((item) => String(item.workspaceId || '').trim().toLowerCase()).filter(Boolean));
    const missing = normalizeWorkspaceIds(value.requiredMajorWorkspaceIds || []).filter((workspaceId) => !carried.has(workspaceId));
    if (missing.length) findings.push(finding('error', 'portable.handoff-package-v1.major-source-closure-incomplete', 'Major package-v1 carrier is missing one or more Workspace snapshot bindings required by its explicit carrier profile.', { carrierProfileId: String(value.carrierProfileId || ''), missingWorkspaceIds: missing }));
  }
}

function parseWorkspaceBindings(text = '') {
  const out = [];
  const re = /^-\s+([^\n]+)\n((?:\s{2}-\s+[^\n]+\n?)*)/gm;
  for (const match of String(text || '').matchAll(re)) {
    const current = { label: String(match[1] || '').trim() };
    for (const line of String(match[2] || '').split('\n')) {
      const fieldMatch = line.match(/^\s{2}-\s+([^:]+):\s*(.*)$/);
      if (!fieldMatch) continue;
      const key = fieldMatch[1].trim(); const value = fieldMatch[2].trim();
      if (key === 'Workspace Id') current.workspaceId = value;
      else if (key === 'Workspace Artifact') current.workspaceArtifactPath = markdownTarget(value);
      else if (key === 'Snapshot Path') current.snapshotPath = markdownTarget(value);
      else if (key === 'Workspace Artifact Inner Path') current.workspaceArtifactInnerPath = unquote(value);
      else if (key === 'Snapshot Kind') current.snapshotKind = value;
      else if (key === 'Coverage') current.coverage = value;
      else if (key === 'Binding State') current.bindingState = value;
      else if (key === 'Integrity Method') current.integrityMethod = value;
      else if (key === 'Integrity Value') current.integrityValue = value;
      else if (key === 'Byte Size') current.byteSize = /^\d+$/.test(value) ? Number(value) : null;
    }
    out.push(current);
  }
  return out.map((item) => Object.freeze({ ...item, byteSize: item.byteSize ?? null }));
}

function normalizeProfileId(value = '') {
  const text = String(value || '').trim();
  return text.toLowerCase() === 'none' ? '' : text;
}
