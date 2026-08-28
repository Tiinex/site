import assert from 'node:assert/strict';
import {
  PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,
  acceptPortableHostActionReceipt,
  buildPortableToolBindings,
  planPortableHostAction
} from './tool.bindings.js';

const tools = [
  { name: 'web.search', description: 'Search the public web and news.' },
  { name: 'GitHub.search', description: 'Search files within a specific GitHub repository.' },
  { name: 'GitHub.fetch_file', description: 'Fetch UTF-8 file content by repository path and ref.' },
  { name: 'container.exec', description: 'Execute shell commands, read local files, and extract zip archives.' },
  { name: 'container.open_image', description: 'Open an image for multimodal visual analysis.' },
  { name: 'GitHub.update_file', description: 'Update a repository file through the GitHub API.' }
];

const bindings = buildPortableToolBindings({ tools });
assert.equal(bindings.bindings.repositorySearch.selected.tool.name, 'GitHub.search');
assert.equal(bindings.bindings.repositoryRead.selected.tool.name, 'GitHub.fetch_file');
assert.equal(bindings.bindings.archiveRead.selected.tool.name, 'container.exec');
assert.equal(bindings.bindings.images.selected.tool.name, 'container.open_image');
assert.equal(bindings.bindings.remoteWriteAvailable.selected.tool.name, 'GitHub.update_file');
assert.notEqual(bindings.bindings.repositorySearch.selected.tool.name, 'web.search');

const plan = planPortableHostAction({
  tools,
  action: 'repository-schema-resolution',
  request: {
    schemaId: 'tiinex.experimental.v1',
    repository: 'Tiinex/docs',
    ref: 'master',
    searchQueries: ['tiinex.experimental.v1.schema.md'],
    nextOperation: 'resolve-schema-material'
  }
});
assert.equal(plan.status, 'ready');
assert.equal(plan.steps.length, 2);
assert.equal(plan.steps[0].tool.name, 'GitHub.search');
assert.equal(plan.steps[1].tool.name, 'GitHub.fetch_file');
assert.equal(plan.continuation.operation, 'resolve-schema-material');
assert.equal(plan.receiptContract.actionId, plan.actionId);

const receipt = {
  schema: PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,
  actionId: plan.actionId,
  action: plan.action,
  steps: [
    {
      stepId: plan.steps[0].stepId,
      toolId: plan.steps[0].tool.id,
      status: 'completed',
      normalized: { paths: ['.topics/.schemas/experimental/tiinex.experimental.v1.schema.md'], repository: 'Tiinex/docs', ref: 'master' }
    },
    {
      stepId: plan.steps[1].stepId,
      toolId: plan.steps[1].tool.id,
      status: 'completed',
      normalized: {
        files: [{
          path: '.topics/.schemas/experimental/tiinex.experimental.v1.schema.md',
          content: '# Continuity Context\n\n- Current\n  - Current Schema: tiinex.experimental.v1\n\n---\n\n# Experimental',
          source: {
            repository: 'Tiinex/docs',
            ref: 'master',
            commit: 'abc123',
            path: '.topics/.schemas/experimental/tiinex.experimental.v1.schema.md',
            authority: 'canonical-core',
            permalink: 'https://evidence.example/Tiinex/docs/abc123/tiinex.experimental.v1.schema.md'
          }
        }]
      }
    }
  ]
};
const accepted = acceptPortableHostActionReceipt({ plan, receipt });
assert.equal(accepted.status, 'accepted');
assert.equal(accepted.providerResponses.length, 1);
assert.equal(accepted.providerResponses[0].files[0].source.repository, 'Tiinex/docs');
assert.equal(accepted.providerResponses[0].files[0].source.commit, 'abc123');
assert.equal(accepted.providerResponses[0].files[0].source.provenanceQualification, 'accepted-host-repository-pinned');
assert.equal(accepted.providerResponses[0].files[0].source.receiptQualification, 'accepted-host-repository-read');
assert.equal(accepted.providerResponses[0].files[0].source.permalink, 'https://evidence.example/Tiinex/docs/abc123/tiinex.experimental.v1.schema.md');
assert.equal(accepted.material.files.length, 0);

const movingReceipt = {
  ...receipt,
  steps: receipt.steps.map((step) => step.capability ? step : step),
};
movingReceipt.steps = receipt.steps.map((step) => {
  if (step.stepId !== plan.steps[1].stepId) return step;
  return {
    ...step,
    normalized: {
      files: [{
        path: 'moving/project.trace.md',
        content: '# moving',
        source: {
          repository: 'Tiinex/business',
          ref: 'main',
          path: 'moving/project.trace.md',
          authority: 'canonical-core'
        }
      }]
    }
  };
});
const acceptedMoving = acceptPortableHostActionReceipt({ plan, receipt: movingReceipt });
assert.equal(acceptedMoving.status, 'accepted');
assert.equal(acceptedMoving.providerResponses[0].files[0].source.commit, '');
assert.equal(acceptedMoving.providerResponses[0].files[0].source.authority, 'remote-repository-unpinned');
assert.equal(acceptedMoving.providerResponses[0].files[0].source.provenanceQualification, 'accepted-host-repository-moving-ref');

const localPlan = planPortableHostAction({ tools, action: 'archive-read', request: { archivePath: '/tmp/package.zip', entryPath: 'asset.png' } });
const localReceipt = {
  schema: PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,
  actionId: localPlan.actionId,
  action: localPlan.action,
  steps: [{
    stepId: localPlan.steps[0].stepId,
    toolId: localPlan.steps[0].tool.id,
    status: 'completed',
    normalized: {
      files: [{
        path: 'asset.png',
        locator: { kind: 'zip-entry', archivePath: '/tmp/package.zip', entryPath: 'asset.png' },
        source: { repository: 'wrong/guess' }
      }]
    }
  }]
};
const acceptedLocal = acceptPortableHostActionReceipt({ plan: localPlan, receipt: localReceipt });
assert.equal(acceptedLocal.status, 'accepted');
assert.equal(acceptedLocal.material.files[0].source, null);
assert.equal(acceptedLocal.findings.some((finding) => finding.code === 'portable.host-receipt.local-source.stripped'), true);

const imagePlan = planPortableHostAction({ tools, action: 'image-analysis', request: { asset: { path: 'images/evidence.png' } } });
const imageReceipt = {
  schema: PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,
  actionId: imagePlan.actionId,
  action: imagePlan.action,
  steps: [{
    stepId: imagePlan.steps[0].stepId,
    toolId: imagePlan.steps[0].tool.id,
    status: 'completed',
    normalized: { assetPath: 'images/evidence.png', description: 'A generated description.', observations: ['Visible UI state.'] }
  }]
};
const acceptedImage = acceptPortableHostActionReceipt({ plan: imagePlan, receipt: imageReceipt });
assert.equal(acceptedImage.status, 'accepted');
assert.equal(acceptedImage.interpretations[0].qualification.generatedInterpretation, true);
assert.equal(acceptedImage.interpretations[0].qualification.analysisIsNotSourceMaterial, true);

const remotePlan = planPortableHostAction({ tools, action: 'remote-write' });
assert.equal(remotePlan.status, 'authorization-required');

console.log('✓ portable concrete tool binding, host action planning, and explicit receipt normalization passed');
