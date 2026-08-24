import {
  PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,
  acceptPortableHostActionReceipt,
  planPortableHostAction
} from '../host/tool.bindings.js';

const repositoryReadTool = Object.freeze({
  id: 'test-repository-read',
  name: 'GitHub.fetch_file',
  description: 'Fetch UTF-8 file content from an exact repository path and ref.',
  capabilities: ['repositoryRead']
});

export function publicationProviderReceipt({ repository, commit, path, content, sourceOverrides = {}, action = 'repository-read', omitStep = false, status = 'completed' } = {}) {
  const plan = planPortableHostAction({
    tools: [repositoryReadTool],
    action,
    request: { repository, ref: commit, path }
  });
  const receipt = {
    schema: PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,
    actionId: plan.actionId,
    action: plan.action,
    steps: omitStep ? [] : [{
      stepId: plan.steps[0]?.stepId || `${plan.actionId}:1`,
      toolId: plan.steps[0]?.tool?.id || repositoryReadTool.id,
      status,
      normalized: {
        files: [{
          path,
          content,
          source: {
            repository,
            ref: commit,
            commit,
            path,
            authority: 'remote-repository-unverified',
            ...sourceOverrides
          }
        }]
      }
    }]
  };
  return Object.freeze({ plan, receipt });
}

export function publicationProviderAcceptance(options = {}) {
  const pair = publicationProviderReceipt(options);
  return acceptPortableHostActionReceipt(pair);
}
