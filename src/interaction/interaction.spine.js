export const interactionSpineContract = {
  id: 'tiinex.interaction.spine.v1',
  status: 'scaffold',
  purpose: 'Give the workspace a compact action rhythm without replacing source truth or validator results.',
  steps: ['load', 'read', 'trace', 'audit', 'act'],
  rules: [
    'The spine shows the next useful interaction without making hidden state changes.',
    'Scaffolded actions must look scaffolded or disabled.',
    'Audit remains explicit and user-invoked.',
    'Read, trace, and audit may change arrangement or disclosure but not source truth.'
  ]
};
