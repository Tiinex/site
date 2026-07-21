export const SOURCE_TRANSPORT_POLICY_SCHEMA_ID = 'tiinex.sourceTransport.policy.v1';

export function buildSourceTransportPolicy(input = {}) {
  const maxRequestsPerOperation = finitePositive(input.maxRequestsPerOperation, input.maxRequestsPerSource, input.maxRequests) || 0;
  const cooldownUntil = String(input.cooldownUntil || '').trim();
  const now = String(input.now || input.at || '').trim();
  const offline = input.offline === true;
  return Object.freeze({
    schema: SOURCE_TRANSPORT_POLICY_SCHEMA_ID,
    mode: input.mode || (offline ? 'offline' : 'bounded-online'),
    maxRequestsPerOperation,
    cooldownUntil,
    now,
    offline,
    boundary: 'Source transport policy only authorizes or blocks fetch attempts. It does not infer provenance, retry in the background, or mutate source state.'
  });
}

export function authorizeSourceTransport(operation = {}, policyInput = {}) {
  const policy = policyInput?.schema === SOURCE_TRANSPORT_POLICY_SCHEMA_ID ? policyInput : buildSourceTransportPolicy(policyInput);
  const requestedRequests = Math.max(0, Number(operation.requestedRequests || operation.requests || 0));
  const sourceId = operation.sourceId || operation.source?.id || '';
  const adapterId = operation.adapterId || operation.source?.adapterId || '';
  const findings = [];
  if (policy.offline || policy.mode === 'offline') {
    findings.push(finding('warning', 'transport.policy.offline', 'Source transport is offline/disabled for this operation.', { sourceId, adapterId, requestedRequests, retryable: true }));
  }
  if (policy.cooldownUntil && policy.now && new Date(policy.cooldownUntil).getTime() > new Date(policy.now).getTime()) {
    findings.push(finding('warning', 'transport.policy.cooldown-active', 'Source transport is in cooldown; do not retry automatically.', { sourceId, adapterId, requestedRequests, retryable: true, cooldownUntil: policy.cooldownUntil }));
  }
  if (policy.maxRequestsPerOperation > 0 && requestedRequests > policy.maxRequestsPerOperation) {
    findings.push(finding('warning', 'transport.policy.request-budget-exceeded', `Requested ${requestedRequests} source request(s), over budget ${policy.maxRequestsPerOperation}.`, { sourceId, adapterId, requestedRequests, maxRequests: policy.maxRequestsPerOperation, retryable: false }));
  }
  const allowed = findings.length === 0;
  return Object.freeze({
    schema: 'tiinex.sourceTransport.authorization.v1',
    status: allowed ? 'allowed' : 'blocked',
    allowed,
    boundary: policy.boundary,
    operation: Object.freeze({
      kind: operation.kind || 'source-transport',
      sourceId,
      adapterId,
      requestedRequests
    }),
    policy,
    findings: Object.freeze(findings)
  });
}

export function summarizeSourceTransportOutcomes(outcomes = [], input = {}) {
  const items = Array.isArray(outcomes) ? outcomes : [];
  const findings = items.flatMap((outcome) => Array.isArray(outcome.findings) ? outcome.findings : []);
  const blocked = items.filter((outcome) => outcome.allowed === false || outcome.status === 'blocked').length;
  const retryable = findings.filter((item) => item.retryable === true).length;
  return Object.freeze({
    schema: 'tiinex.sourceTransport.policy.summary.v1',
    status: blocked ? 'degraded' : 'clean',
    boundary: 'Policy summary is diagnostic-only and must not trigger hidden retries.',
    counts: Object.freeze({
      operations: items.length,
      allowed: items.length - blocked,
      blocked,
      findings: findings.length,
      retryable
    }),
    findings: Object.freeze(findings.slice(0, Number(input.maxFindings || 20)))
  });
}

function finitePositive(...values) {
  for (const value of values) {
    const n = Number(value || 0);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function finding(severity, code, message, extra = {}) {
  return Object.freeze(Object.assign({ severity, code, message }, extra));
}
