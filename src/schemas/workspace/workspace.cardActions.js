export function appendTransitionActionsToStaticRow(actions = [], transitionActions = []) {
  const stable = Array.isArray(actions) ? actions : [];
  const transitions = Array.isArray(transitionActions) ? transitionActions : [];
  if (!transitions.length) return stable;
  // Keep learned/static controls in their stable order. Schema-owned transition
  // affordances are dynamic, so they are appended as the right-edge group
  // instead of inserted between static record actions.
  return stable.concat(transitions);
}
