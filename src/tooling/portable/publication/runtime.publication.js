import { buildPublicationPlan, buildPublicationResult } from '../../../publication/publication.contract.js';
import { summarizePortableFindings } from '../findings.js';

export const PORTABLE_PUBLICATION_PLAN_SCHEMA_ID = 'tiinex.portable.publication.plan.v1';
export const PORTABLE_PUBLICATION_RESULT_SCHEMA_ID = 'tiinex.portable.publication.result.v1';

export function planPortablePublication(input = {}) {
  const workspace = input.workspace || input.session || input;
  const plan = buildPublicationPlan(workspace, input);
  return Object.freeze({
    schema: PORTABLE_PUBLICATION_PLAN_SCHEMA_ID,
    status: plan.status,
    boundary: 'Portable facade over the shared platform-neutral publication plan. It performs no host write, credential lookup, UI action, or source mutation.',
    plan,
    qualification: qualification(plan),
    findings: plan.findings || Object.freeze([]),
    findingSummary: summarizePortableFindings(plan.findings || [])
  });
}

export function acceptPortablePublicationResult(input = {}) {
  const plan = input.plan?.plan || input.plan || {};
  const execution = input.execution || input.receipt || {};
  const result = buildPublicationResult(plan, execution);
  return Object.freeze({
    schema: PORTABLE_PUBLICATION_RESULT_SCHEMA_ID,
    status: result.status,
    boundary: 'Portable facade over supplied host execution evidence. It validates result/receipt truth but never executes a remote write.',
    result,
    qualification: qualification(plan, result),
    findings: result.findings || Object.freeze([]),
    findingSummary: summarizePortableFindings(result.findings || [])
  });
}

function qualification(plan = {}, result = null) {
  const bindingMutability = String(result?.sourceBinding?.mutability || '');
  const exactSourceBinding = Boolean(result?.sourceBinding?.verified);
  const immutableSourceBinding = exactSourceBinding && bindingMutability === 'immutable-materialized-representation';
  return Object.freeze({
    sharedPublicationContract: plan.schema === 'tiinex.publication.plan.v1',
    remoteFetch: false,
    remoteWrite: false,
    sourceMutation: false,
    exactPayloadIdentity: Boolean(plan.outboundPayload?.sha256),
    verificationRequired: plan.verification?.required === true,
    exactSourceBinding,
    bindingMutability,
    immutableSourceBinding,
    durableSourceBinding: immutableSourceBinding,
    statement: 'Publication planning/result qualification is shared contract truth; exact mutable social bindings stay distinct from immutable repo-file bindings, and provider execution/product UX remain adapter/Site responsibilities.'
  });
}
