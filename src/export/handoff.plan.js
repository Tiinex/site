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
  const executable = built.status !== 'blocked' && built.inspection?.status === 'valid' && built.closureInspection?.status === 'valid' && (!roundtrip || roundtrip.status === 'passed');
  return Object.freeze({
    schema: 'tiinex.export.handoff.recipient-relative-preparation.v1',
    status: executable ? built.status : 'blocked',
    executable,
    plan: built.plan,
    bundle: built.bundle,
    descriptor: built.descriptor,
    inspection: built.inspection,
    closureInspection: built.closureInspection,
    roundtrip,
    boundary: 'Site-facing delegation to the shared portable recipient-relative material-closure owner. Handoff semantics, provider authority, workspace completeness, and acceptance/completion are not reinterpreted here.'
  });
}
