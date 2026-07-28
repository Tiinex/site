import assert from 'node:assert/strict';
import { buildGovernanceBoundaryForSource, buildWorkspaceGovernanceSummary, governanceBoundaryFromRootFiles, governanceFindingForBoundary, isGovernancePolicyPath } from './governance.boundary.js';

assert.equal(isGovernancePolicyPath('LICENSE'), true);
assert.equal(isGovernancePolicyPath('.topics/LICENSE'), false, 'only origin root files define governance boundary');
assert.equal(isGovernancePolicyPath('README.md'), false, 'README is not a governance fallback');

const lineage = governanceBoundaryFromRootFiles({ repo: 'Tiinex/docs', ref: 'master' }, [{ path: 'LINEAGE_POLICY.md', text: 'rules' }, { path: 'LICENSE', text: 'license' }, { path: 'NOTICE', text: 'notice' }], { rootChecked: true, discoveredFrom: 'repo-mirror' });
assert.equal(lineage.status, 'found');
assert.equal(lineage.policy.kind, 'LINEAGE_POLICY.md');
assert.equal(lineage.notice.status, 'found');
assert.equal(lineage.boundary.includes('README'), true);

const fallback = governanceBoundaryFromRootFiles({ repo: 'Tiinex/docs', ref: 'master' }, [{ path: 'LICENSE', text: 'license' }], { rootChecked: true });
assert.equal(fallback.status, 'origin-fallback');
assert.equal(fallback.policy.kind, 'LICENSE');

const missing = governanceBoundaryFromRootFiles({ repo: 'Tiinex/docs', ref: 'master' }, [], { rootChecked: true });
assert.equal(missing.status, 'missing');
assert.equal(governanceFindingForBoundary(missing).code, 'governance.boundary.missing');

const unknown = buildGovernanceBoundaryForSource({ repo: 'Tiinex/docs', ref: 'master' }, { records: [{ path: '.topics/topic.md', markdown: '# Topic' }] });
assert.equal(unknown.status, 'unknown');
assert.equal(governanceFindingForBoundary(unknown).severity, 'info');

const summary = buildWorkspaceGovernanceSummary({
  sources: [{ id: 'gh', adapterId: 'github', repo: 'Tiinex/docs', ref: 'master', governanceBoundary: fallback }],
  records: []
});
assert.equal(summary.status, 'ready');
assert.equal(summary.counts.originFallback, 1);

console.log('governance.boundary: ok');
