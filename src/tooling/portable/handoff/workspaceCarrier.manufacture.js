import { finalizeFile } from '../../../export/package.fileMap.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { summarizePortableFindings } from '../findings.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';
import { qualifyDirectWorkspaceForArchive, indexWorkspaceTargetDeclarations } from './materialClosure.archiveV2.workspace.js';
import { renderRecipientV2Pointer } from './recipientV2.artifacts.js';
import { RECIPIENT_V2_READ_PATH, RECIPIENT_V2_FORMAT_ID } from './recipientV2.topology.js';
import { recipientV2WorkspaceEntryCurrentRead } from './recipientV2.entryContract.js';
import { recipientV2TransportFacts } from './recipientV2.transportManifest.js';
import { buildRecipientV2BootstrapCarrier, recipientV2ParentAuthority } from './recipientV2.topology.workspaces.js';
import { safeToken, finding } from './recipientV2.topology.materials.js';
import { RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET } from './recipientV2.packageV1.constants.js';
import { renderHandoffPackageV1, WORKSPACE_PACKAGE_ROLE } from './recipientV2.packageV1.contract.js';
import { exactFile, workspaceSchemaTarget, deepFreeze } from './recipientV2.packageV1.shared.js';
import { inspectRecipientFacingV2Topology, roundTripRecipientFacingV2Topology } from './recipientV2.inspect.js';

export function manufactureRecipientRelativeWorkspacePackage(input = {}) {
  const findings = [];
  const targetByWorkspace = indexWorkspaceTargetDeclarations(input.workspaceTargets || []);
  const workspaces = [...(input.workspaceMaterializations || [])].sort((a, b) => String(a.id || '').localeCompare(String(b.id || '')));
  const plans = [];
  for (const [index, raw] of workspaces.entries()) {
    const id = String(raw.id || '').trim();
    const wrapper = Object.freeze({ ...raw, materialization: String(raw.state || ''), qualification: 'qualified', correlationStatus: 'qualified' });
    const qualified = qualifyDirectWorkspaceForArchive(wrapper, raw, targetByWorkspace.get(id) || [], []);
    findings.push(...(qualified.findings || []));
    if (qualified.status !== 'qualified' || !qualified.target) continue;
    const prefix = `001-${index + 3}`;
    const slug = safeToken(id);
    const archiveData = exportFileMapZipUint8Array((qualified.entries || []).map((entry) => ({ path: entry.path, data: entry.data })), 'portable.workspace-carrier.workspace-archive.path.invalid');
    const workspacePath = `${prefix}-${slug}.workspace.md`;
    const archivePath = `${prefix}-${slug}.workspace.zip`;
    const workspaceFile = exactFile(workspacePath, qualified.target.data, 'recipient-v2-package-v1-exact-workspace-artifact', 'text/markdown');
    const archiveFile = exactFile(archivePath, archiveData, 'recipient-v2-package-v1-complete-workspace-snapshot', 'application/zip');
    plans.push(Object.freeze({ id, raw, qualified, workspaceFile, archiveFile, projection: Object.freeze({ workspaceId: id, workspacePath, archivePath, sourceWorkspaceTargetInnerPath: qualified.target.path, sourceWorkspaceTargetSha256: workspaceFile.sha256, archiveSha256: archiveFile.sha256, archiveBytes: archiveFile.bytes, coverage: 'complete' }) }));
  }
  if (!plans.length || findings.some((item) => item.severity === 'error')) return blocked(findings);
  const createdAt = String(input.createdAt || '1970-01-01 00:00:00');
  const bootstrapSource = (input.additionalTransportFiles || []).filter((file) => String(file.path || '').startsWith('tiinex.bootstrap/'));
  const packageFile = finalizeFile({
    path: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH,
    kind: 'tiinex-handoff-package-artifact',
    logicalKind: 'recipient-v2-package-v1-root',
    mediaType: 'text/markdown',
    content: renderHandoffPackageV1({ createdAt, packageRole: WORKSPACE_PACKAGE_ROLE, workspaces: plans.map((plan) => plan.projection), carrierLineage: input.carrierLineage || {}, carrierProfile: input.carrierProfile || null, startPath: RECIPIENT_V2_READ_PATH, bootstrapPath: bootstrapSource.length ? '001-2-bootstrap.trace.md' : '' })
  });
  const packageParent = recipientV2ParentAuthority(packageFile, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET, createdAt);
  const files = [packageFile, ...plans.flatMap((plan) => [plan.workspaceFile, plan.archiveFile])];
  let bootstrap = null;
  if (bootstrapSource.length) {
    bootstrap = buildRecipientV2BootstrapCarrier(bootstrapSource, createdAt, findings, packageParent);
    if (bootstrap) files.push(bootstrap.artifact, bootstrap.payload);
  }
  const readFacts = recipientV2TransportFacts('recovery-orientation', {
    format: 'tiinex-recipient-facing-handoff-package-v1',
    packageRole: WORKSPACE_PACKAGE_ROLE,
    packageRootPath: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH,
    entryArtifactPath: RECIPIENT_V2_READ_PATH,
    artifactSurface: 'tiinex.handoff.package.v1-plus-exact-complete-workspace-snapshots',
    routeAuthority: 'none', routeSelectionAuthority: 'none', siblingRouteInference: false,
    carrierLineage: input.carrierLineage || null, pathParentProjection: true, pathAuthority: false
  });
  const readFile = finalizeFile({
    path: RECIPIENT_V2_READ_PATH, kind: 'handoff-recovery-pointer', logicalKind: 'recipient-v2-package-v1-workspace-recovery-orientation', mediaType: 'text/markdown', transportFacts: readFacts,
    content: renderRecipientV2Pointer({ createdAt, parent: packageParent, role: 'recovery-orientation', title: 'READ BEFORE PROCEEDING — Tiinex Workspace Carrier', summary: 'Qualified recovery/orientation Pointer for the pointerless package-v1 Workspace carrier.', prose: 'Read this Start artifact first and qualify the declared Tooling bootstrap. This carrier intentionally exposes no Handoff route or Continue-from Pointer; do not infer semantic Handoff state from Workspace carriage.', currentRead: [...recipientV2WorkspaceEntryCurrentRead(), { label: 'Package Artifact', value: `[Workspace Package](${RECIPIENT_V2_PACKAGE_V1_ROOT_PATH})` }, { label: 'Carrier Dimension', value: `\`${String(input.carrierLineage?.dimension || '001')}\`` }], destinations: [{ label: 'Workspace Package contract', target: RECIPIENT_V2_PACKAGE_V1_ROOT_PATH }, ...(bootstrap ? [{ label: 'Portable Tooling bootstrap', target: bootstrap.projection.artifactPath }] : []), ...plans.map((plan) => ({ label: `Workspace ${plan.id}`, target: plan.projection.workspacePath }))], facts: readFacts })
  });
  files.push(readFile);
  const sortedFiles = Object.freeze([...files].sort((a, b) => String(a.path || '').localeCompare(String(b.path || ''))));
  const bundle = deepFreeze({ status: 'ready', files: sortedFiles, handoffClosure: null, transportFormat: RECIPIENT_V2_FORMAT_ID, boundary: 'Pointerless recipient-facing Workspace carrier. Exact carried Workspace source bytes retain authority; carrier placement creates no Handoff semantics.' });
  const inspection = inspectRecipientFacingV2Topology(bundle);
  const roundtrip = input.verifyRoundtrip === false ? null : roundTripRecipientFacingV2Topology(bundle, inspection);
  const toolingBootstrapInspection = inspection.bootstrapInspection || inspectPortableToolingBootstrap({ files: bootstrapSource });
  const allFindings = [...findings, ...(inspection.findings || []), ...(roundtrip?.findings || [])];
  const ready = inspection.status === 'valid' && (!roundtrip || roundtrip.status === 'passed') && toolingBootstrapInspection.status === 'valid' && !allFindings.some((item) => item.severity === 'error');
  const carrierProjection = inspection.carrierProjection || workspaceProjection(plans, input.carrierLineage || {});
  return deepFreeze({
    schema: 'tiinex.portable.handoff-manufacturing.v2', status: ready ? 'ready' : 'blocked', executable: ready, transportExecutable: ready,
    verification: Object.freeze({ baselineManufacture: 'ready', manufacturePath: 'direct-qualified-workspace-to-pointerless-package-v1', packageInspection: inspection.status, closureInspection: 'not-applicable', carrierInspection: inspection.status, selectedHandoffConformance: 'not-applicable', pointerEntrypointInspection: 'not-applicable', coldConsumerEntrypointInspection: inspection.status, companionInspection: 'not-applicable', roundtrip: roundtrip?.status || 'not-requested', toolingBootstrap: toolingBootstrapInspection.status }),
    plan: Object.freeze({ status: ready ? 'ready' : 'blocked', requiredClosureReady: true, semanticHandoffStatus: 'not-declared', workspaceMaterializations: Object.freeze(workspaces), requirements: Object.freeze({ required: Object.freeze([]), reference: Object.freeze([]) }) }),
    bundle, inspection, carrierProjection, roundtrip, toolingBootstrapInspection, toolingBootstrap: input.toolingBootstrap || null, carrierLineage: input.carrierLineage || carrierProjection.lineage || null, manufacturingEvidence: input.manufacturingEvidence || null,
    findings: Object.freeze(allFindings), findingSummary: summarizePortableFindings(allFindings), operationBoundary: Object.freeze({ sourceMutation: false, remoteWrite: false, handoffSemantics: false }),
    boundary: 'Canonical pointerless Workspace-carrier manufacture only. No route, Handoff, Role, current-work, transfer, participation, acceptance, completion, or publication authority is created.'
  });
}

function workspaceProjection(plans, lineage) {
  const workspaces = plans.map((plan) => Object.freeze({ id: plan.id, title: String(plan.raw.title || plan.id), slug: safeToken(plan.id), qualification: 'qualified' }));
  return deepFreeze({ schema: 'tiinex.portable.handoff-carrier-projection.v1', version: 1, status: 'ready', mode: 'workspace', lineage, workspaces: Object.freeze(workspaces), workspace: workspaces[0] || Object.freeze({ id: '', title: '', slug: '', qualification: 'unresolved' }), selection: Object.freeze({ policy: 'none', qualifiedRouteCount: 0, implicitRouteId: '', packageRole: WORKSPACE_PACKAGE_ROLE }), routes: Object.freeze([]), authority: Object.freeze({ semanticAuthority: 'none', filenameAuthority: false, dimensionalParentAuthority: false, routeSelectionAuthority: 'none' }), findings: Object.freeze([]) });
}
function blocked(findings = []) {
  const all = findings.length ? findings : [finding('error', 'portable.workspace-carrier.manufacture.blocked', 'Pointerless Workspace carrier manufacture failed closed.')];
  return deepFreeze({ schema: 'tiinex.portable.handoff-manufacturing.v2', status: 'blocked', executable: false, transportExecutable: false, verification: Object.freeze({ manufacturePath: 'direct-qualified-workspace-to-pointerless-package-v1' }), plan: Object.freeze({ status: 'blocked', workspaceMaterializations: Object.freeze([]), requirements: Object.freeze({ required: Object.freeze([]), reference: Object.freeze([]) }) }), bundle: null, inspection: null, carrierProjection: Object.freeze({ schema: 'tiinex.portable.handoff-carrier-projection.v1', status: 'blocked', mode: 'workspace', workspaces: Object.freeze([]), routes: Object.freeze([]), findings: Object.freeze(all) }), findings: Object.freeze(all), findingSummary: summarizePortableFindings(all), boundary: 'Failed closed before emitting pointerless Workspace carrier bytes.' });
}
