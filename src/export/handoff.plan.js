import { buildExportPackageBundle, inspectExportPackageBundle } from './package.builder.js';

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
