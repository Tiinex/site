import { portableOperationResult as operationResult } from '../operation.result.js';
import { preflightPortableReduction } from './reduction.preflight.js';

export function preflightPortableReductionOperation(input = {}, options = {}) {
  const preflight = preflightPortableReduction(input, options);
  return operationResult('reduction-preflight', {
    status: preflight.status,
    destructiveEligible: preflight.destructiveEligible,
    composition: preflight.composition,
    eligibility: preflight.eligibility,
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
    description: 'Project ordinary hierarchical Reduction composition/recovery and, only when an exact destructive candidate set is supplied, a separate fail-closed eligible|blocked|unresolved destructive-lineage qualification bound to exact inputs. The operation is read-only and never authorizes apply.',
    safety: 'planning-only-read-only',
    inputSchema: 'tiinex.portable.reduction-preflight.request.v1',
    sourceMutation: false,
    remoteWrite: false,
    handler: preflightPortableReductionOperation
  })
]);
