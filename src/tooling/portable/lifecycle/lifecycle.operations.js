import { portableOperationResult as operationResult } from '../operation.result.js';
import { projectPortableLifecycleReadiness } from './lifecycle.readiness.js';

export function projectPortableLifecycleReadinessOperation(input = {}, options = {}) {
  const projection = projectPortableLifecycleReadiness(input, options);
  return operationResult('project-lifecycle-readiness', {
    status: projection.status,
    resultSchema: projection.schema,
    controllingTask: projection.controllingTask,
    readiness: projection.readiness,
    retest: projection.retest,
    closure: projection.closure,
    currentRepresentatives: projection.currentRepresentatives,
    blockers: projection.blockers,
    missingEvidence: projection.missingEvidence,
    ambiguities: projection.ambiguities,
    authorityBasis: projection.authorityBasis,
    nextAction: projection.nextAction,
    boundary: projection.boundary,
    findings: projection.findings || []
  });
}

export const portableLifecycleOperationDescriptors = Object.freeze([
  Object.freeze({
    name: 'project-lifecycle-readiness',
    description: 'Project one exact controlling Task into separate derived readiness, authoritative re-test, and explicit closure surfaces from qualified Task continuity plus explicit normalized currentness/authority evidence, failing closed on ambiguity.',
    safety: 'read-only-projection',
    inputSchema: 'tiinex.portable.lifecycle-readiness.request.v1',
    sourceMutation: false,
    remoteWrite: false,
    handler: projectPortableLifecycleReadinessOperation
  })
]);
