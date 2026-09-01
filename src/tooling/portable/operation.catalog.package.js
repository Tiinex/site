import { openPortableSession, restorePortableSession, serializePortableSession } from './session/portable.session.js';
import { createPortableCheckpoint, restorePortableCheckpoint } from './checkpoint/portable.checkpoint.js';
import { buildPortableRuntimePackage, inspectPortableRuntimePackage, rehydratePortableRuntimePackage, roundTripPortableRuntimePackage } from './package/runtime.package.js';
import { acceptPortablePublicationResult, planPortablePublication } from './publication/runtime.publication.js';
import { manufactureRecipientRelativeHandoffPackage } from './handoff/manufacture.js';
import { projectPortableHandoffCarrierOutputFromPackage } from './handoff/recipientV2.humanOutput.js';
import { orientColdConsumerFromHandoffPackage } from './handoff/coldConsumerEntrypoint.js';
import { auditHandoffPackageContextCarriage } from './handoff/contextAudit.js';

export function createPortablePackageOperationEntries({ operation, wrapPortableResult, sessionOperationResult }) {
  return Object.freeze({
  'create-checkpoint': operation({
    name: 'create-checkpoint',
    description: 'Create a recoverable explicit portable session checkpoint. This is not a canonical Tiinex handoff artifact.',
    safety: 'local-state',
    inputSchema: 'tiinex.portable.checkpoint.create.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('create-checkpoint', createPortableCheckpoint(input, options))
  }),
  'restore-checkpoint': operation({
    name: 'restore-checkpoint',
    description: 'Verify and restore a portable checkpoint while preserving its explicit non-handoff boundary.',
    safety: 'local-state',
    inputSchema: 'tiinex.portable.checkpoint.v1',
    handler: (input = {}) => wrapPortableResult('restore-checkpoint', restorePortableCheckpoint(input))
  }),
  'manufacture-handoff-package': operation({
    name: 'manufacture-handoff-package',
    description: 'Build/verify qualified Handoff packages.',
    safety: 'local-package-result',
    inputSchema: 'tiinex.portable.handoff-manufacturing.request.v2',
    handler: (input = {}, options = {}) => wrapPortableResult('manufacture-handoff-package', manufactureRecipientRelativeHandoffPackage(input, options))
  }),
  'project-handoff-carrier-output': operation({
    name: 'project-handoff-carrier-output',
    description: 'Regenerate qualified human carrier output.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.handoff-carrier-output.request.v1',
    handler: (input = {}) => wrapPortableResult('project-handoff-carrier-output', projectPortableHandoffCarrierOutputFromPackage(input))
  }),
  'orient-handoff-package': operation({
    name: 'orient-handoff-package',
    description: 'Verify START/Pointer orientation.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.handoff-cold-consumer-orientation.request.v1',
    handler: (input = {}) => wrapPortableResult('orient-handoff-package', orientColdConsumerFromHandoffPackage(input))
  }),
  'audit-handoff-package-context': operation({
    name: 'audit-handoff-package-context',
    description: 'Audit recipient package carriage.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.handoff-context-carriage-audit.request.v1',
    handler: (input = {}) => wrapPortableResult('audit-handoff-package-context', auditHandoffPackageContextCarriage(input))
  }),
  'build-runtime-package': operation({
    name: 'build-runtime-package',
    description: 'Build the current Tiinex/site runtime export-package bundle from loaded and staged material without claiming a locked canonical package schema.',
    safety: 'local-package-result',
    inputSchema: 'tiinex.portable.runtime-package.build.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('build-runtime-package', buildPortableRuntimePackage(input, options))
  }),
  'inspect-runtime-package': operation({
    name: 'inspect-runtime-package',
    description: 'Inspect a current runtime export-package bundle through the existing Tiinex/site package implementation.',
    safety: 'read-only',
    inputSchema: 'tiinex.export.package.bundle.v1',
    handler: (input = {}) => wrapPortableResult('inspect-runtime-package', inspectPortableRuntimePackage(input))
  }),
  'rehydrate-runtime-package': operation({
    name: 'rehydrate-runtime-package',
    description: 'Reconstruct the current in-memory runtime package contract from explicitly supplied serialized package files without executing received content.',
    safety: 'read-only',
    inputSchema: 'tiinex.portable.input.v1',
    handler: (input = {}) => wrapPortableResult('rehydrate-runtime-package', rehydratePortableRuntimePackage(input))
  }),
  'roundtrip-runtime-package': operation({
    name: 'roundtrip-runtime-package',
    description: 'Build or inspect, import-plan, apply-plan, and compare the current runtime package contract for a no-GitHub-inference round trip.',
    safety: 'read-only-or-local-package-result',
    inputSchema: 'tiinex.portable.runtime-package.roundtrip.request.v1',
    handler: (input = {}, options = {}) => wrapPortableResult('roundtrip-runtime-package', roundTripPortableRuntimePackage(input, options))
  }),
  'plan-publication': operation({
    name: 'plan-publication',
    description: 'Build an exact shared publication plan for one qualified owned-local artifact without performing a host write.',
    safety: 'planning-only',
    inputSchema: 'tiinex.portable.publication.plan.request.v1',
    handler: (input = {}) => wrapPortableResult('plan-publication', planPortablePublication(input))
  }),
  'accept-publication-result': operation({
    name: 'accept-publication-result',
    description: 'Qualify explicit host publication execution/verification evidence and derive an exact source binding only when target-surface-specific verification succeeds.',
    safety: 'read-only-normalization',
    inputSchema: 'tiinex.portable.publication.result.request.v1',
    handler: (input = {}) => wrapPortableResult('accept-publication-result', acceptPortablePublicationResult(input))
  }),
  'serialize-session': operation({
    name: 'serialize-session',
    description: 'Serialize portable loaded material and explicit long-lived dialogue state without hidden chat provenance.',
    safety: 'local-state',
    inputSchema: 'tiinex.portable.session.open.v1',
    handler: (input = {}) => sessionOperationResult('serialize-session', serializePortableSession(openPortableSession(input)))
  }),
  'restore-session': operation({
    name: 'restore-session',
    description: 'Validate and normalize a previously serialized portable session snapshot.',
    safety: 'local-state',
    inputSchema: 'tiinex.portable.session.v1',
    handler: (input = {}) => sessionOperationResult('restore-session', restorePortableSession(input).snapshot())
  })
  });
}
