const REVIEW_STATES = new Set(['parent-target-mismatch', 'parent-self-mismatch', 'child-self-mismatch', 'parent-ambiguous', 'parent-target-ambiguous']);
const APPROVED = new Set(['approved', 'accepted']);

export function safeActionsFor({ state, step, decision, intake, localResultReady }) {
  const actions = [action('inspect', 'available'), action('preview', step?.action && step.action !== 'no-change' ? 'available' : 'not-applicable')];
  if (localResultReady) {
    actions.push(action('export-changeset', 'available'));
    return Object.freeze(actions);
  }
  if (decision.required) actions.push(action('approve', decision.blockers.length ? 'blocked' : 'required'));
  else actions.push(action('approve', 'not-required'));
  if (state === 'repair-available' || state === 'review-required') {
    const applyState = !intake.localOwned ? 'requires-local-owned-material' : decision.blockers.length ? 'blocked' : decision.state === 'approved' || !decision.required ? 'available' : 'after-approval';
    actions.push(action('apply-local-result', applyState));
  } else if (state === 'blocked') actions.push(action('apply-local-result', 'blocked'));
  actions.push(action('export-changeset', 'after-local-result'));
  return Object.freeze(actions);
}

export function opportunityState(artifact = {}, step = null) {
  if (REVIEW_STATES.has(String(artifact.state || '')) || step?.approval?.disposition === 'requires-explicit-approval') return 'review-required';
  if (step?.approval?.disposition === 'proposed') return 'repair-available';
  if (artifact.state === 'healthy' && (!step || step.action === 'no-change')) return 'healthy';
  return 'blocked';
}

export function findingClassFor(artifact = {}, step = null, receipt = null) {
  if (receipt && ['changed', 'no-op'].includes(String(receipt.status || ''))) return 'repaired-local-result';
  if (step?.action === 'update-parent-origin-permalink') return 'qualified-permalink-repair';
  if (artifact.publicationOrigin?.state === 'missing' && step?.approval?.disposition === 'blocked') return 'publication-locator-unavailable';
  if (step?.action === 'backfill-parent-target-v2') return 'missing-parent-target';
  if (step?.action === 'review-parent-target-mismatch') return 'parent-target-mismatch';
  if (artifact.state === 'healthy') return 'healthy-lineage';
  if (artifact.publicationOrigin?.state === 'missing') return 'publication-locator-unavailable';
  return String(artifact.state || 'lineage-integrity-blocker');
}

export function severityFor(artifact = {}, state = '') {
  if (state === 'healthy' || state === 'local-result-ready') return 'info';
  if (state === 'review-required' || REVIEW_STATES.has(String(artifact.state || ''))) return 'error';
  return 'warning';
}

export function trustImpactFor(artifact = {}, state = '') {
  if (state === 'healthy') return 'none';
  if (state === 'local-result-ready') return 'local-repair-produced-not-published';
  if (state === 'review-required') return 'trust-sensitive-review-required';
  if (artifact.publicationOrigin?.state === 'missing') return 'publication-truth-unavailable';
  return 'lineage-verification-incomplete';
}

export function humanExplanation({ artifact = {}, step = null, state = '', permalink = false }) {
  const path = normalizePath(artifact.path || '') || 'artifact';
  if (state === 'local-result-ready') return Object.freeze({ headline: 'Local repair is ready to export.', detail: `${path} has a local repair result; source and publication state were not mutated.`, nextAction: 'Export the changeset or merge it through the normal workflow.' });
  if (state === 'healthy') return Object.freeze({ headline: 'Lineage integrity is healthy.', detail: `${path} matches its resolved Parent integrity target.`, nextAction: 'No repair action is required.' });
  if (permalink) return Object.freeze({ headline: 'Qualified Parent permalink repair is available.', detail: 'Accepted provider bytes identify one exact immutable Parent URL; nothing has been applied.', nextAction: 'Review the header/footer mutation and approve it for local application.' });
  if (step?.action === 'review-parent-target-mismatch') return Object.freeze({ headline: 'Parent target mismatch needs review.', detail: 'The recorded Parent target does not match the loaded Parent truth and must not be refreshed automatically.', nextAction: 'Provide a semantic disposition and authority before local application.' });
  if (artifact.publicationOrigin?.state === 'missing') return Object.freeze({ headline: 'Parent publication locator is unavailable.', detail: 'No truthful immutable Parent locator is currently qualified, so none was fabricated.', nextAction: 'Keep this repair blocked until publication evidence exists.' });
  if (step?.action === 'backfill-parent-target-v2') return Object.freeze({ headline: 'Parent integrity repair is ready to review.', detail: 'A verified Parent target can be added without changing authored body content.', nextAction: 'Review the cascade impact and approve the local repair.' });
  return Object.freeze({ headline: 'Lineage repair is blocked.', detail: `${path} has unresolved integrity or publication evidence.`, nextAction: 'Resolve the listed blocker before applying a repair.' });
}

export function mutationProjection(step = null) {
  if (!step || step.action === 'no-change') return Object.freeze({ required: false, headerFields: Object.freeze([]), footerChanges: Object.freeze([]), bodyMutation: false, sourceMutation: false, publicationMutation: false });
  return Object.freeze({
    required: true,
    headerFields: Object.freeze([...(step.expectedMutation?.headerFields || [])]),
    footerChanges: Object.freeze([...(step.expectedMutation?.footerChanges || [])]),
    bodyMutation: false,
    sourceMutation: false,
    publicationMutation: false
  });
}

export function approvalState(approval = null, step = null) {
  if (!step?.approval?.required) return 'not-required';
  if (!approval) return 'pending';
  return APPROVED.has(String(approval.state || approval.disposition || '').toLowerCase()) ? 'approved' : 'not-approved';
}

function action(id, state) { return Object.freeze({ id, state }); }
function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
