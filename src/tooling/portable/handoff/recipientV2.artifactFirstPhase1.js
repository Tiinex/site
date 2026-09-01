import { buildRecipientV2ArtifactFirstPhase1Specimen } from './recipientV2.artifactFirst.build.js';
import { selectPhase1SourceRoute } from './recipientV2.artifactFirst.materials.js';
import { blocked, deepFreeze } from './recipientV2.artifactFirst.shared.js';

export { RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID, RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_SCHEMA_ID, RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_FORMAT_ID, RECIPIENT_V2_ARTIFACT_FIRST_PHASE2_CLEAN_SCHEMA_ID } from './recipientV2.artifactFirst.shared.js';
export { buildRecipientV2ArtifactFirstPhase1Specimen } from './recipientV2.artifactFirst.build.js';
export { inspectRecipientV2ArtifactFirstPhase1Specimen } from './recipientV2.artifactFirst.inspect.js';
export { isRecipientV2ArtifactFirstPhase1Surface, inspectRecipientFacingV2ArtifactFirstPhase1 } from './recipientV2.artifactFirst.projection.js';
export { deriveRecipientV2ArtifactFirstPhase1Facts } from './recipientV2.artifactFirst.materials.js';
export { qualifyRecipientV2ArtifactFirstPhase1RequiredContextClosure } from './recipientV2.artifactFirst.closure.js';

export function buildRecipientFacingV2ArtifactFirstPhase1(input = {}) {
  return buildRecipientFacingV2ArtifactFirst(input, false);
}

export function buildRecipientFacingV2ArtifactFirstPhase2Clean(input = {}) {
  return buildRecipientFacingV2ArtifactFirst(input, true);
}

function buildRecipientFacingV2ArtifactFirst(input = {}, cleanCarrierPhase2 = false) {
  const sourceSurface = input.sourceSurface || null;
  const selectionFindings = [];
  const routeSelection = selectPhase1SourceRoute(input.carrierProjection || sourceSurface?.carrierProjection || {}, input.routeSelector || input.routeId || '', selectionFindings);
  if (routeSelection.state !== 'qualified') return blocked('route-selection-blocked', selectionFindings);
  if (!sourceSurface || sourceSurface.status !== 'ready') return blocked('source-surface-unready', sourceSurface?.findings || []);
  const specimen = buildRecipientV2ArtifactFirstPhase1Specimen({
    bundle: { files: sourceSurface.files || [] },
    createdAt: input.createdAt,
    workspaceId: routeSelection.route.workspaceId || input.workspaceId || '',
    routePath: routeSelection.route.workspaceRelativePath || '',
    routeSelection,
    bootstrap: sourceSurface.topology?.bootstrap || null,
    cleanCarrierPhase2
  });
  if (specimen.status !== 'ready') return specimen;
  return deepFreeze({
    status: 'ready',
    files: specimen.files,
    topology: specimen.topology,
    inspection: specimen.inspection,
    findings: specimen.inspection.findings,
    boundary: specimen.boundary
  });
}
