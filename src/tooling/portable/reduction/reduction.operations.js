import { portableOperationResult as operationResult } from '../operation.result.js';
import { preflightPortableReduction } from './reduction.preflight.js';

export function preflightPortableReductionOperation(input = {}, options = {}) {
  const preflight = preflightPortableReduction(input, options);
  return operationResult('reduction-preflight', {
    status: preflight.status,
    destructiveEligible: preflight.destructiveEligible,
    inventory: preflight.inventory,
    reduction: preflight.reduction,
    candidates: preflight.candidates,
    summary: preflight.summary,
    boundary: preflight.boundary,
    findings: preflight.findings || []
  });
}

export const portableReductionOperationDescriptors = Object.freeze([
  Object.freeze({
    name: 'reduction-preflight',
    description: 'Inventory loaded material and fail closed on proposed disappearing semantic leaves unless an exact pre-delete Reduction artifact, immutable leaf recovery, lifecycle eligibility, and leaf-to-collapse-boundary Parent-span proof are explicit.',
    safety: 'planning-only-read-only',
    inputSchema: 'tiinex.portable.reduction-preflight.request.v1',
    sourceMutation: false,
    remoteWrite: false,
    handler: preflightPortableReductionOperation
  })
]);
