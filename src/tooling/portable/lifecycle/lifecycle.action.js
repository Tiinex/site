export function nextLifecycleAction({ readiness, retest, closure, blockers, missingEvidence, ambiguities, controllingTask }) {
  const target = controllingTask?.path || controllingTask?.id || '';
  if (closure.state === 'closed') return Object.freeze({ kind: 'none-unless-authoritatively-reopened', target, basis: 'qualified explicit closure after authoritative pass' });
  if (closure.state === 'unresolved') return Object.freeze({ kind: 'repair-closure-qualification', target, basis: 'apparent closure exists but exact scope/pass basis/authority/currentness does not qualify' });
  if (retest.state === 'unresolved') return Object.freeze({ kind: 'repair-retest-qualification', target, basis: 'apparent re-test exists but exact scope/method/coverage/authority/currentness does not qualify' });
  if (readiness.state === 'unresolved') return Object.freeze({ kind: 'repair-lifecycle-evidence', target, basis: [...missingEvidence, ...ambiguities].slice(0, 6).map((item) => item.code).join(', ') || 'unresolved lifecycle evidence' });
  if (retest.state === 'failed') return Object.freeze({ kind: 'address-failed-criteria-with-bounded-work', target, basis: 'authoritative current re-test failed' });
  if (readiness.state === 'not-ready-for-retest') return Object.freeze({ kind: 'resolve-blocking-work-or-evidence', target: blockers[0]?.target || target, basis: blockers[0]?.code || 'qualified current blocker' });
  if (retest.state === 'passed' && closure.state === 'open') return Object.freeze({ kind: 'obtain-explicit-authoritative-closure', target, basis: 'authoritative pass is qualified but no explicit closure governs the Task' });
  return Object.freeze({ kind: 'invoke-authorized-retest', target, basis: 'derived readiness is ready-for-retest and no authoritative current outcome is observed' });
}
