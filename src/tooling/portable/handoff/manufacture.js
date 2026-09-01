import { summarizePortableFindings } from '../findings.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';
import { upgradeRecipientRelativeHandoffTransportPackageV2 } from './materialClosure.archiveV2.js';
import { buildRecipientRelativeHandoffV2DirectBaseline } from './materialClosure.archiveV2.direct.js';
import { qualifyMajorCarrierReadiness } from './carrierLineage.js';

export function manufactureRecipientRelativeHandoffPackage(input = {}, options = {}) {
  const baseline = buildRecipientRelativeHandoffV2DirectBaseline(input, options);
  const upgraded = upgradeRecipientRelativeHandoffTransportPackageV2(baseline, input, options);
  const toolingBootstrapInspection = upgraded.inspection?.bootstrapInspection || inspectPortableToolingBootstrap(baseline.bundle || upgraded.bundle || {});
  const majorReadiness = qualifyMajorCarrierReadiness({
    ...input,
    requireBusinessDocsSiteMajorClosure: Boolean(upgraded.inspection?.packageContract?.packageRole === 'recipient-facing-handoff-carrier')
  }, input.carrierLineage || upgraded.carrierProjection?.lineage || baseline.carrierProjection?.lineage || {});
  const majorFindings = majorReadiness.state === 'blocked' ? [Object.freeze({ severity: 'error', code: 'portable.handoff-carrier-lineage.major.not-self-contained', message: 'Major Handoff carrier requires complete replacement-capable carried Workspace snapshots.' })] : [];
  const findings = Object.freeze([
    ...majorFindings,
    ...(baseline.findings || []),
    ...(upgraded.findings || []),
    ...(upgraded.inspection?.findings || []),
    ...(upgraded.closureInspection?.findings || []),
    ...(upgraded.carrierInspection?.findings || []),
    ...(upgraded.pointerEntrypointInspection?.findings || []),
    ...(upgraded.coldConsumerEntrypointInspection?.findings || []),
    ...(upgraded.companionInspection?.findings || []),
    ...(upgraded.roundtrip?.findings || []),
    ...(toolingBootstrapInspection?.findings || [])
  ]);
  const status = baseline.status !== 'blocked' && upgraded.status !== 'blocked' && toolingBootstrapInspection?.status === 'valid' && majorReadiness.state !== 'blocked' ? upgraded.status : 'blocked';
  return Object.freeze({
    schema: 'tiinex.portable.handoff-manufacturing.v2',
    status,
    executable: Boolean(baseline.executable) && status !== 'blocked',
    transportExecutable: status !== 'blocked',
    verification: Object.freeze({
      baselineManufacture: String(baseline.status || 'unavailable'),
      manufacturePath: 'direct-qualified-workspace-to-archive',
      packageInspection: String(upgraded.inspection?.status || 'unavailable'),
      closureInspection: String(upgraded.closureInspection?.status || 'unavailable'),
      carrierInspection: String(upgraded.carrierInspection?.status || 'unavailable'),
      selectedHandoffConformance: (upgraded.carrierProjection?.routes || []).length > 0 && (upgraded.carrierProjection?.routes || []).every((route) => route.conformance?.status === 'qualified') ? 'qualified' : 'blocked',
      pointerEntrypointInspection: String(upgraded.pointerEntrypointInspection?.status || 'unavailable'),
      coldConsumerEntrypointInspection: String(upgraded.coldConsumerEntrypointInspection?.status || 'unavailable'),
      companionInspection: String(upgraded.companionInspection?.status || 'unavailable'),
      roundtrip: upgraded.roundtrip ? String(upgraded.roundtrip.status || 'unknown') : 'not-requested',
      toolingBootstrap: String(toolingBootstrapInspection?.status || 'unavailable')
    }),
    plan: baseline.plan,
    bundle: upgraded.bundle || baseline.bundle,
    descriptor: upgraded.descriptor || baseline.descriptor,
    transportCompanion: upgraded.transportCompanion || baseline.transportCompanion,
    inspection: upgraded.inspection || baseline.inspection,
    closureInspection: upgraded.closureInspection || baseline.closureInspection,
    carrierProjection: upgraded.carrierProjection || baseline.carrierProjection,
    carrierInspection: upgraded.carrierInspection || baseline.carrierInspection,
    pointerEntrypointProjection: upgraded.pointerEntrypointProjection || baseline.pointerEntrypointProjection,
    pointerEntrypointInspection: upgraded.pointerEntrypointInspection || baseline.pointerEntrypointInspection,
    coldConsumerProjection: upgraded.coldConsumerProjection || baseline.coldConsumerProjection,
    coldConsumerEntrypointInspection: upgraded.coldConsumerEntrypointInspection || baseline.coldConsumerEntrypointInspection,
    companionInspection: upgraded.companionInspection || baseline.companionInspection,
    roundtrip: upgraded.roundtrip || null,
    toolingBootstrap: input.toolingBootstrap || null,
    manufacturingEvidence: input.manufacturingEvidence || null,
    toolingBootstrapInspection,
    carrierLineage: upgraded.carrierProjection?.lineage || baseline.carrierProjection?.lineage || input.carrierLineage || null,
    majorReadiness,
    operationBoundary: Object.freeze({
      operationClass: 'local-handoff-package-manufacture',
      inputScope: 'caller-provided-local-workspace-material-and-optional-parent-package',
      localPackageConstruction: true,
      sourceMutation: false,
      remoteMutation: false,
      physicalRoundtripVerification: upgraded.roundtrip ? String(upgraded.roundtrip.status || 'unknown') : 'not-requested',
      hostBehaviorAuthority: 'none'
    }),
    migration: upgraded.migration || null,
    baseline: Object.freeze({ schema: baseline.schema, status: baseline.status, packageRepresentationSha256: String(baseline.bundle?.packageRepresentationSha256 || ''), representation: 'semantic-control-plus-detached-material-without-exploded-workspace-carrier' }),
    findings,
    findingSummary: summarizePortableFindings(findings),
    boundary: 'Canonical archive-backed Handoff manufacturing facade. It fails closed unless each carrier workspace is bound to one exact carried tiinex.workspace.v1 artifact and one independently verified complete workspace archive.'
  });
}
