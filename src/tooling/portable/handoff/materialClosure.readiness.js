export function qualifyHandoffMaterialClosurePlanReadiness(plan = {}) {
  const requiredBlockers = Object.freeze((plan.requirements?.required || [])
    .filter((entry) => ['unresolved', 'ambiguous', 'integrity-conflict'].includes(String(entry?.disposition || '')))
    .map((entry) => Object.freeze({ requirementId: String(entry?.requirementId || ''), disposition: String(entry?.disposition || '') })));
  const workspaceBlockers = Object.freeze((plan.workspaceMaterializations || [])
    .filter((entry) => String(entry?.qualification || '') !== 'qualified')
    .map((entry) => Object.freeze({ id: String(entry?.id || ''), materialization: String(entry?.materialization || 'partial'), qualification: String(entry?.qualification || 'unresolved') })));
  const expectedRequiredClosureReady = requiredBlockers.length === 0 && workspaceBlockers.length === 0;
  const expectedStatus = expectedRequiredClosureReady ? 'ready' : 'blocked';
  const declaredRequiredClosureReady = Boolean(plan.requiredClosureReady);
  const declaredStatus = String(plan.status || 'blocked');
  const findings = [];
  if (declaredRequiredClosureReady !== expectedRequiredClosureReady) findings.push('required-closure-ready-contradictory');
  if (declaredStatus !== expectedStatus) findings.push('plan-status-contradictory');
  return deepFreeze({
    state: findings.length ? 'invalid' : 'qualified',
    declaredStatus,
    declaredRequiredClosureReady,
    expectedStatus,
    expectedRequiredClosureReady,
    blockers: Object.freeze({ required: requiredBlockers, workspaces: workspaceBlockers }),
    findings: Object.freeze(findings)
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
