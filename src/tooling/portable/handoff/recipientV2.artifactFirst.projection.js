import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { inspectRecipientV2ArtifactFirstPhase1Specimen } from './recipientV2.artifactFirst.inspect.js';
import { RECIPIENT_V2_READ_PATH, RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID, PHASE2_CLEAN_PROFILE, decodeUtf8, deepFreeze } from './recipientV2.artifactFirst.shared.js';

export function isRecipientV2ArtifactFirstPhase1Surface(files = []) {
  return files.some((file) => {
    if (String(file.path || '') !== RECIPIENT_V2_READ_PATH) return false;
    const markdown = decodeUtf8(packageFileBytes(file));
    return markdown.includes('Artifact-First Phase 1 Specimen') || markdown.includes(`Carrier Profile: ${PHASE2_CLEAN_PROFILE}`);
  });
}

export function inspectRecipientFacingV2ArtifactFirstPhase1(bundle = {}) {
  const inspection = inspectRecipientV2ArtifactFirstPhase1Specimen(bundle);
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const facts = inspection.semanticFactsByPath || new Map();
  const ingressFile = files.find((file) => String(file.path || '') === RECIPIENT_V2_READ_PATH) || null;
  const payloadEntries = [...facts.entries()].filter(([, item]) => item?.role === 'workspace-representation-payload');
  const relationEntries = [...facts.entries()].filter(([, item]) => item?.role === 'workspace-representation');
  const relationByWorkspace = new Map(relationEntries.map((entry) => [String(entry[1]?.workspaceId || ''), entry]));
  const routeEntries = [...facts.entries()].filter(([, item]) => item?.role === 'handoff-route');
  const bootstrapEntry = [...facts.entries()].find(([, item]) => item?.role === 'tooling-bootstrap') || null;
  const cacheEntries = [...facts.entries()].filter(([, item]) => item?.role === 'workspace-dependency-cache');
  return deepFreeze({
    schema: 'tiinex.portable.recipient-facing-handoff-v2.inspection.v1',
    detected: true,
    status: inspection.status === 'ready' ? 'valid' : 'invalid',
    format: inspection.format || RECIPIENT_V2_ARTIFACT_FIRST_PHASE1_FORMAT_ID,
    rootArtifact: null,
    readArtifact: ingressFile ? Object.freeze({ path: RECIPIENT_V2_READ_PATH, schemaId: 'tiinex.pointer.v1', sha256: sha256Hex(packageFileBytes(ingressFile)), facts: facts.get(RECIPIENT_V2_READ_PATH) || null }) : null,
    workspaces: Object.freeze(payloadEntries.map(([payloadPath, item]) => {
      const relationEntry = relationByWorkspace.get(String(item?.workspaceId || '')) || null;
      return Object.freeze({
        workspaceId: String(item?.workspaceId || ''),
        workspaceArtifactPath: '',
        workspaceRepresentationArtifactPath: String(relationEntry?.[0] || ''),
        workspacePayloadArtifactPath: payloadPath,
        workspaceArchivePath: String(item?.archivePath || ''),
        sourceWorkspaceTargetInnerPath: String(relationEntry?.[1]?.workspaceArtifactInnerPath || ''),
        sourceWorkspaceTargetSha256: ''
      });
    })),
    routes: Object.freeze(routeEntries.map(([pointerPath, item]) => {
      const routeId = String(item?.routeId || `handoff-route:${String(item?.workspaceId || '')}:${String(item?.workspaceRelativeHandoffPath || '')}`);
      return Object.freeze({
        pointerPath,
        routeId,
        workspaceId: String(item?.workspaceId || ''),
        workspaceRelativeHandoffPath: String(item?.workspaceRelativeHandoffPath || ''),
        endpointRolePointers: Object.freeze((inspection.endpointRoles || []).filter((role) => String(role.routeId || '') === routeId).map((role) => role.pointerPath)),
        participantRolePointers: Object.freeze((inspection.participantRoles || []).filter((role) => String(role.routeId || '') === routeId).map((role) => role.pointerPath))
      });
    })),
    endpointRoles: Object.freeze(inspection.endpointRoles || []),
    participantRoles: Object.freeze(inspection.participantRoles || []),
    caches: Object.freeze(inspection.caches || cacheEntries.map(([artifactPath, item]) => Object.freeze({ workspaceId: String(item?.workspaceId || ''), artifactPath, archivePath: String(item?.archivePath || ''), materials: Object.freeze(item?.materials || []) }))),
    bootstrapInspection: bootstrapEntry ? Object.freeze({ status: inspection.bootstrapQualification?.state === 'qualified' ? 'valid' : 'invalid', path: bootstrapEntry[0], state: inspection.bootstrapQualification?.state || 'blocked', archivePath: String(bootstrapEntry[1]?.archivePath || ''), bytes: Number(bootstrapEntry[1]?.archiveBytes || 0), sha256: String(bootstrapEntry[1]?.archiveSha256 || ''), findings: Object.freeze([...(inspection.bootstrapQualification?.findings || [])]) }) : null,
    transportManifest: inspection.transportManifest,
    artifactFacts: Object.freeze([...facts.entries()].map(([path, item]) => Object.freeze({ path, facts: item }))),
    descriptor: null,
    workspaceByteProvider: null,
    carrierProjection: inspection.carrierProjection,
    coldConsumerProjection: inspection.coldConsumerProjection,
    findings: inspection.findings,
    findingSummary: Object.freeze({ errors: inspection.findings.filter((item) => item.severity === 'error').length, findings: inspection.findings.length }),
    boundary: inspection.boundary,
    phase1: inspection
  });
}
