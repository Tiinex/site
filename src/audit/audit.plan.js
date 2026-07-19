export function planAudit(scope = {}) {
  return {
    type: 'tiinex.web.audit.plan.v84',
    scope: scope.name || 'single-artifact',
    steps: [
      'parse continuity envelope',
      'resolve schema module',
      'run available validation immediately',
      'disclose root fallback when child module is unavailable',
      'summarize findings visibly'
    ]
  };
}
