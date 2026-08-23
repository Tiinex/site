import { buildExportPackageBundle, inspectExportPackageBundle } from './package.builder.js';
import { buildRecipientRelativeHandoffTransportPackage, roundTripRecipientRelativeHandoffTransportPackage } from '../tooling/portable/handoff/materialClosure.package.js';

export function prepareWorkspaceHandoffExport(workspace = {}, options = {}) {
  const bundle = options.prebuiltBundle || buildExportPackageBundle(workspace, {
    clock: options.clock,
    builtAt: options.builtAt,
    includeDegraded: options.includeDegraded !== false
  });
  const inspection = options.inspection || inspectExportPackageBundle(bundle);
  const executable = inspection.status === 'valid' && bundle.status !== 'blocked';
  return Object.freeze({
    schema: 'tiinex.export.handoff.preparation.v1',
    status: executable ? (bundle.status === 'degraded' ? 'degraded' : 'ready') : 'blocked',
    executable,
    bundle,
    inspection,
    boundary: 'Explicit Handoff package preparation only. Shared package owners define material/source/context truth; callers do not reinterpret package files or mutate workspace/source state.'
  });
}


export function prepareRecipientRelativeWorkspaceHandoffExport(input = {}, options = {}) {
  const built = buildRecipientRelativeHandoffTransportPackage(input, options);
  const roundtrip = options.verifyRoundtrip === false ? null : roundTripRecipientRelativeHandoffTransportPackage(built, options);
  const executable = built.status !== 'blocked' && built.inspection?.status === 'valid' && built.closureInspection?.status === 'valid' && built.carrierInspection?.status === 'valid' && built.coldConsumerEntrypointInspection?.status === 'valid' && (!roundtrip || roundtrip.status === 'passed');
  const carrierTransportReady = built.carrierProjection?.mode !== 'shared' || built.carrierProjection?.status === 'ready';
  const transportExecutable = executable && carrierTransportReady && built.transportCompanion?.status === 'ready' && built.companionInspection?.status === 'valid';
  return Object.freeze({
    schema: 'tiinex.export.handoff.recipient-relative-preparation.v1',
    status: executable ? built.status : 'blocked',
    executable,
    transportExecutable,
    plan: built.plan,
    bundle: built.bundle,
    descriptor: built.descriptor,
    transportCompanion: built.transportCompanion,
    inspection: built.inspection,
    closureInspection: built.closureInspection,
    carrierProjection: built.carrierProjection,
    carrierInspection: built.carrierInspection,
    coldConsumerProjection: built.coldConsumerProjection,
    coldConsumerEntrypointInspection: built.coldConsumerEntrypointInspection,
    companionInspection: built.companionInspection,
    roundtrip,
    boundary: 'Site-facing delegation to shared portable recipient-relative package and non-authoritative transport companion owners. Projection readiness is exposed separately and does not redefine Handoff semantics, provider authority, workspace completeness, or acceptance/completion.'
  });
}
